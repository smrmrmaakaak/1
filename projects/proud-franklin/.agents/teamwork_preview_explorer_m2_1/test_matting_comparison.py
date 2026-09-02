import os
import time
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import cv2
import rembg

raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
profile_path = os.path.join(raw_dir, "KakaoTalk_20260901_071003816_06.jpg")
front_path = os.path.join(raw_dir, "KakaoTalk_20260901_071003816_04.jpg")

img_profile = ImageOps.exif_transpose(Image.open(profile_path))
img_front = ImageOps.exif_transpose(Image.open(front_path))

session = rembg.new_session("isnet-general-use")

def test_matting_methods(img, name):
    print(f"\n================ TESTING {name} ================")
    w, h = img.size
    img_rgb = np.array(img)
    
    # 1. Raw IS-Net
    t0 = time.time()
    cutout = rembg.remove(img, session=session)
    t1 = time.time()
    print(f"IS-Net inference time: {t1-t0:.2f}s")
    
    cutout_np = np.array(cutout)
    alpha = cutout_np[:, :, 3]
    
    # Analyze alpha histogram
    hist, bins = np.histogram(alpha, bins=[0, 1, 20, 50, 100, 150, 200, 240, 255, 256])
    print("Alpha distribution:")
    for b_low, b_high, count in zip(bins[:-1], bins[1:], hist):
        print(f"  [{b_low:3d}, {b_high:3d}): {count:8d} ({count/(w*h)*100:.2f}%)")
        
    # Test Dark Background Composite
    # Luxury dark slate background
    bg_color = np.array([26, 29, 32], dtype=np.float32) # #1A1D20
    
    # Method A: Naive blend
    alpha_norm = (alpha.astype(np.float32) / 255.0)[:, :, np.newaxis]
    comp_naive = (img_rgb.astype(np.float32) * alpha_norm + bg_color * (1.0 - alpha_norm)).astype(np.uint8)
    
    # Check edge halo in naive blend: Look at pixels where alpha in [10, 200]
    edge_mask = (alpha >= 10) & (alpha <= 200)
    if np.any(edge_mask):
        edge_rgb = comp_naive[edge_mask]
        edge_lum = 0.299 * edge_rgb[:, 0] + 0.587 * edge_rgb[:, 1] + 0.114 * edge_rgb[:, 2]
        bg_lum = 0.299 * 26 + 0.587 * 29 + 0.114 * 32
        print(f"Naive Edge luminance: mean={edge_lum.mean():.1f}, max={edge_lum.max():.1f}, bg_lum={bg_lum:.1f}")
        brighter_than_bg = (edge_lum > bg_lum + 30).mean() * 100
        print(f"Fraction of edge pixels significantly brighter than bg: {brighter_than_bg:.1f}%")
        
    # Method B: Morphological refinement (Closing + Erode 1px + Gaussian 3x3 sigma=0.5)
    kernel3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    # Close to fill holes
    alpha_closed = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel3)
    # Erode slightly (1px)
    alpha_eroded = cv2.erode(alpha_closed, kernel3, iterations=1)
    # Soft feather
    alpha_feathered = cv2.GaussianBlur(alpha_eroded, (3, 3), 0.5)
    
    alpha_morph_norm = (alpha_feathered.astype(np.float32) / 255.0)[:, :, np.newaxis]
    comp_morph = (img_rgb.astype(np.float32) * alpha_morph_norm + bg_color * (1.0 - alpha_morph_norm)).astype(np.uint8)
    edge_mask_morph = (alpha_feathered >= 10) & (alpha_feathered <= 200)
    if np.any(edge_mask_morph):
        edge_lum_m = 0.299 * comp_morph[edge_mask_morph, 0] + 0.587 * comp_morph[edge_mask_morph, 1] + 0.114 * comp_morph[edge_mask_morph, 2]
        print(f"Morph Edge luminance: mean={edge_lum_m.mean():.1f}, max={edge_lum_m.max():.1f}")
        print(f"Brighter than bg fraction: {(edge_lum_m > bg_lum + 30).mean() * 100:.1f}%")
        
    # Method C: Color Decontamination / Defringing via Inpainting / Foreground Color Bleed
    # Expand interior foreground color into transition zone to eliminate background color bleeding
    core_mask = (alpha > 240).astype(np.uint8) * 255
    # Inpaint only into the transition zone (alpha between 1 and 240)
    inpaint_mask = ((alpha > 0) & (alpha <= 240)).astype(np.uint8) * 255
    
    # Inpaint using cv2.inpaint (Telea or Navier-Stokes)
    t_inp0 = time.time()
    decontaminated_rgb = cv2.inpaint(img_rgb, inpaint_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    t_inp1 = time.time()
    print(f"Color decontamination time: {t_inp1-t_inp0:.2f}s")
    
    comp_decontam = (decontaminated_rgb.astype(np.float32) * alpha_morph_norm + bg_color * (1.0 - alpha_morph_norm)).astype(np.uint8)
    if np.any(edge_mask_morph):
        edge_lum_d = 0.299 * comp_decontam[edge_mask_morph, 0] + 0.587 * comp_decontam[edge_mask_morph, 1] + 0.114 * comp_decontam[edge_mask_morph, 2]
        print(f"Decontam Edge luminance: mean={edge_lum_d.mean():.1f}, max={edge_lum_d.max():.1f}")
        print(f"Brighter than bg fraction: {(edge_lum_d > bg_lum + 30).mean() * 100:.1f}%")

test_matting_methods(img_profile, "SIDE_PROFILE")
test_matting_methods(img_front, "HERO_FRONT")
