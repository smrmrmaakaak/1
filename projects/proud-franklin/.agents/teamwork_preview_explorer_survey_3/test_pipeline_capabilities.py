import time
import os
import numpy as np
from PIL import Image, ImageFilter, ImageOps
import cv2
import rembg

def create_radial_spotlight_backdrop(width, height, center_x=0.5, center_y=0.42, radius=0.75,
                                    inner_color=(38, 43, 48), mid_color=(26, 29, 32), outer_color=(13, 14, 16)):
    """
    Synthesizes luxury dark slate & warm charcoal radial spotlight backdrop
    Inner: #262B30 (warm studio key light)
    Mid: #1A1D20 (slate body)
    Outer: #0D0E10 (deep charcoal vignette edge)
    """
    y, x = np.ogrid[:height, :width]
    cx, cy = center_x * width, center_y * height
    # Normalized Euclidean distance
    max_dim = np.hypot(max(cx, width - cx), max(cy, height - cy)) * radius
    dist = np.hypot(x - cx, y - cy) / max_dim
    dist = np.clip(dist, 0.0, 1.0)
    
    # 3-stop smooth interpolation
    backdrop = np.zeros((height, width, 3), dtype=np.uint8)
    for i in range(3):
        # 0.0 -> 0.5: inner to mid
        # 0.5 -> 1.0: mid to outer
        mask_inner = dist < 0.5
        t1 = dist[mask_inner] * 2.0
        val1 = inner_color[i] * (1.0 - t1) + mid_color[i] * t1
        
        mask_outer = dist >= 0.5
        t2 = (dist[mask_outer] - 0.5) * 2.0
        val2 = mid_color[i] * (1.0 - t2) + outer_color[i] * t2
        
        c_channel = np.zeros((height, width), dtype=np.float32)
        c_channel[mask_inner] = val1
        c_channel[mask_outer] = val2
        backdrop[:, :, i] = np.clip(c_channel, 0, 255).astype(np.uint8)
        
    return Image.fromarray(backdrop, mode='RGB')

def synthesize_contact_shadow(alpha_channel, target_size, offset_y=15, blur_radius=25, opacity=0.65, squash_y=0.22):
    """
    Synthesizes realistic directional diffuse floor drop shadow from subject's bottom alpha footprint.
    """
    w, h = target_size
    alpha_np = np.array(alpha_channel)
    
    # Find bounding box of subject
    ys, xs = np.where(alpha_np > 10)
    if len(ys) == 0:
        return Image.new('RGBA', target_size, (0, 0, 0, 0))
    
    min_y, max_y = ys.min(), ys.max()
    min_x, max_x = xs.min(), xs.max()
    
    # Extract bottom portion for ground contact shadow
    bottom_cut = int(max_y - (max_y - min_y) * 0.4)
    contact_alpha = alpha_np.copy()
    contact_alpha[:bottom_cut, :] = 0
    
    # Create squashed shadow
    shadow_img = Image.fromarray(contact_alpha, mode='L')
    shadow_w = max_x - min_x
    shadow_h = max_y - bottom_cut
    
    # Resize shadow with vertical squashing
    squashed_h = max(int(shadow_h * squash_y), 4)
    squashed = shadow_img.crop((min_x, bottom_cut, max_x, max_y)).resize((int(shadow_w * 1.15), squashed_h), Image.Resampling.BICUBIC)
    
    # Place on shadow canvas
    shadow_canvas = Image.new('L', (w, h), 0)
    pos_x = int(min_x - (shadow_w * 0.075))
    pos_y = int(max_y - (squashed_h * 0.4) + offset_y)
    shadow_canvas.paste(squashed, (pos_x, pos_y))
    
    # Dual blur: sharp contact shadow + broad ambient diffuse shadow
    sharp_shadow = shadow_canvas.filter(ImageFilter.GaussianBlur(radius=int(blur_radius * 0.3)))
    diffuse_shadow = shadow_canvas.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    
    combined_shadow = np.clip(np.array(sharp_shadow) * 0.6 + np.array(diffuse_shadow) * 0.4, 0, 255).astype(np.uint8)
    combined_shadow = (combined_shadow.astype(np.float32) * opacity).astype(np.uint8)
    
    shadow_rgba = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    shadow_rgba.putalpha(Image.fromarray(combined_shadow, mode='L'))
    return shadow_rgba

def apply_stoneware_unsharp_enhancement(img_rgb, radius=2, percent=130, threshold=3):
    """
    Applies authentic unsharp mask to highlight fine stoneware pores, porcelain glaze sheen,
    and crisp backstamp engravings without changing physical contours or generating AI artifacts.
    """
    # PIL unsharp mask
    enhanced = img_rgb.filter(ImageFilter.UnsharpMask(radius=radius, percent=percent, threshold=threshold))
    return enhanced

def run_test():
    print("=== Testing Image Processing Pipeline Capabilities ===")
    t0 = time.time()
    
    sample_path = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus\KakaoTalk_20260901_071003816.jpg"
    out_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_survey_3"
    
    print(f"[1] Loading raw test image: {sample_path}")
    raw_img = Image.open(sample_path)
    print(f"    Raw size: {raw_img.size}, mode: {raw_img.mode}")
    
    # Downsample for preview processing test (e.g. 1400x1800 master canvas)
    target_w, target_h = 1400, 1800
    
    # 1. High-precision alpha matting test
    t_mat_start = time.time()
    session = rembg.new_session('isnet-general-use')
    # Pre-resize maintaining aspect ratio
    raw_img.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
    
    print(f"[2] Running Alpha Matting with isnet-general-use...")
    cutout = rembg.remove(
        raw_img,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=5
    )
    t_mat = time.time() - t_mat_start
    print(f"    Alpha Matting completed in {t_mat:.2f}s, output mode: {cutout.mode}, size: {cutout.size}")
    
    # 2. Radial spotlight backdrop synthesis test
    t_bg_start = time.time()
    print(f"[3] Generating Luxury Slate & Charcoal Radial Spotlight Backdrop ({target_w}x{target_h})...")
    backdrop = create_radial_spotlight_backdrop(target_w, target_h)
    t_bg = time.time() - t_bg_start
    print(f"    Backdrop generated in {t_bg:.2f}s")
    
    # Center cutout onto canvas
    canvas_rgba = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    pos_x = (target_w - cutout.width) // 2
    pos_y = (target_h - cutout.height) // 2 + 30 # slightly lower for realistic ground balance
    canvas_rgba.paste(cutout, (pos_x, pos_y), cutout)
    alpha = canvas_rgba.split()[3]
    
    # 3. Realistic contact shadow synthesis test
    t_shadow_start = time.time()
    print("[4] Synthesizing Realistic Directional Floor Contact Shadow...")
    shadow = synthesize_contact_shadow(alpha, (target_w, target_h))
    t_shadow = time.time() - t_shadow_start
    print(f"    Contact shadow synthesized in {t_shadow:.2f}s")
    
    # 4. Composite subject onto backdrop with shadow
    backdrop_rgba = backdrop.convert('RGBA')
    composite = Image.alpha_composite(backdrop_rgba, shadow)
    composite = Image.alpha_composite(composite, canvas_rgba)
    
    # 5. Unsharp Mask & Stoneware Texture Enhancement test
    t_unsharp_start = time.time()
    print("[5] Applying Unsharp Mask Stoneware Texture Enhancement...")
    final_rgb = composite.convert('RGB')
    final_enhanced = apply_stoneware_unsharp_enhancement(final_rgb, radius=2, percent=120, threshold=2)
    t_unsharp = time.time() - t_unsharp_start
    print(f"    Unsharp mask enhanced in {t_unsharp:.2f}s")
    
    # Save test output
    out_path = os.path.join(out_dir, "test_enhanced_venus_preview.jpg")
    final_enhanced.save(out_path, quality=95, optimize=True)
    total_time = time.time() - t0
    print(f"[+] Pipeline test complete! Saved to {out_path} ({os.path.getsize(out_path)/1024:.1f} KB) in {total_time:.2f}s total.")

if __name__ == '__main__':
    run_test()
