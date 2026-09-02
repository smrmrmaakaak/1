import os
import time
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import cv2
import rembg

def refine_alpha_edges(cutout_img, erode_size=1, blur_size=1):
    """
    Refines alpha channel using morphological operations to remove microscopic fringe/fringing
    while strictly preserving delicate ceramic contours (fingers, wings, drapery folds).
    """
    img_np = np.array(cutout_img)
    if img_np.shape[2] < 4:
        return cutout_img
        
    alpha = img_np[:, :, 3]
    
    # Slight morphological closing to fill tiny pinholes within the subject
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha_closed = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel)
    
    # Soft feathering at the boundary
    alpha_refined = cv2.GaussianBlur(alpha_closed, (3, 3), 0.5)
    
    img_np[:, :, 3] = alpha_refined
    return Image.fromarray(img_np, mode='RGBA')

def generate_studio_auction_backdrop(width, height, spot_x=0.5, spot_y=0.42, 
                                     spot_radius_x=0.55, spot_radius_y=0.70,
                                     c_center=(42, 47, 53), c_mid=(26, 29, 32), c_outer=(10, 11, 13)):
    """
    Creates an elliptical Sotheby's studio spotlight gradient with subtle natural dithering to prevent banding.
    """
    y, x = np.ogrid[:height, :width]
    dx = (x - spot_x * width) / (spot_radius_x * width)
    dy = (y - spot_y * height) / (spot_radius_y * height)
    dist = np.sqrt(dx*dx + dy*dy)
    dist = np.clip(dist, 0.0, 1.0)
    
    # Cosine smoothstep for studio falloff
    smooth_dist = 0.5 - 0.5 * np.cos(dist * np.pi)
    
    backdrop = np.zeros((height, width, 3), dtype=np.float32)
    for i in range(3):
        # 0.0 -> 0.5: c_center -> c_mid
        # 0.5 -> 1.0: c_mid -> c_outer
        mask_inner = smooth_dist < 0.5
        t1 = smooth_dist[mask_inner] * 2.0
        val1 = c_center[i] * (1.0 - t1) + c_mid[i] * t1
        
        mask_outer = smooth_dist >= 0.5
        t2 = (smooth_dist[mask_outer] - 0.5) * 2.0
        val2 = c_mid[i] * (1.0 - t2) + c_outer[i] * t2
        
        c_ch = np.zeros((height, width), dtype=np.float32)
        c_ch[mask_inner] = val1
        c_ch[mask_outer] = val2
        backdrop[:, :, i] = c_ch
        
    # Add subtle triangular dither noise (+/- 0.5 LSB) to eliminate 8-bit banding
    dither = np.random.uniform(-0.5, 0.5, (height, width, 3))
    backdrop_final = np.clip(backdrop + dither, 0, 255).astype(np.uint8)
    return Image.fromarray(backdrop_final, mode='RGB')

def synthesize_dual_contact_shadow(alpha_channel, target_size, y_bottom_anchor, contact_width, 
                                  offset_y=8, opacity_contact=0.85, opacity_diffuse=0.45):
    """
    Creates dual-layer floor contact shadow (tight occluded base shadow + wide soft floor wash).
    """
    w, h = target_size
    shadow_layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    
    # 1. Direct Contact Shadow (dense, narrow oval right under the footprint)
    contact_w = int(contact_width * 1.05)
    contact_h = max(int(contact_w * 0.16), 10)
    
    contact_oval = Image.new('L', (contact_w, contact_h), 0)
    # Draw solid ellipse
    cv_oval = np.zeros((contact_h, contact_w), dtype=np.uint8)
    cv2.ellipse(cv_oval, (contact_w // 2, contact_h // 2), (contact_w // 2 - 4, contact_h // 2 - 2), 0, 0, 360, 255, -1)
    contact_oval = Image.fromarray(cv_oval, mode='L')
    contact_oval_blur = contact_oval.filter(ImageFilter.GaussianBlur(radius=6))
    
    # 2. Diffuse Ambient Wash (wide, soft oval)
    diffuse_w = int(contact_width * 1.6)
    diffuse_h = max(int(diffuse_w * 0.25), 20)
    cv_diffuse = np.zeros((diffuse_h, diffuse_w), dtype=np.uint8)
    cv2.ellipse(cv_diffuse, (diffuse_w // 2, diffuse_h // 2), (diffuse_w // 2 - 10, diffuse_h // 2 - 4), 0, 0, 360, 255, -1)
    diffuse_oval = Image.fromarray(cv_diffuse, mode='L').filter(ImageFilter.GaussianBlur(radius=28))
    
    # Composite onto shadow canvas
    pos_contact_x = (w - contact_w) // 2
    pos_contact_y = y_bottom_anchor - (contact_h // 2) + offset_y
    
    pos_diffuse_x = (w - diffuse_w) // 2
    pos_diffuse_y = y_bottom_anchor - (diffuse_h // 2) + offset_y + 12
    
    diffuse_canvas = Image.new('L', (w, h), 0)
    diffuse_canvas.paste(diffuse_oval, (pos_diffuse_x, pos_diffuse_y))
    diffuse_np = (np.array(diffuse_canvas).astype(np.float32) * opacity_diffuse).astype(np.uint8)
    
    contact_canvas = Image.new('L', (w, h), 0)
    contact_canvas.paste(contact_oval_blur, (pos_contact_x, pos_contact_y))
    contact_np = (np.array(contact_canvas).astype(np.float32) * opacity_contact).astype(np.uint8)
    
    combined = np.clip(diffuse_np.astype(np.uint16) + contact_np.astype(np.uint16), 0, 255).astype(np.uint8)
    
    shadow_rgba = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    shadow_rgba.putalpha(Image.fromarray(combined, mode='L'))
    return shadow_rgba

print("Refined studio pipeline module loaded successfully!")
