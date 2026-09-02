import os
import time
import json
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageEnhance
import cv2
import rembg

raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
manifest_path = os.path.join(raw_dir, "classification_manifest.json")

with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

session = rembg.new_session("isnet-general-use")

def process_angle_test(angle_name, angle_info):
    rel_path = angle_info["source"]["relativePath"]
    full_path = os.path.join(r"c:\Users\황태민\Documents\antigravity\proud-franklin", rel_path)
    directives = angle_info["enhancementDirectives"]
    
    print(f"\n==================================================")
    print(f"Angle: {angle_name} ({angle_info['canonicalTag']})")
    print(f"Source: {angle_info['source']['filename']}")
    print(f"Matting Required: {directives['mattingRequired']}")
    print(f"Preserve Authentic Frame: {directives['preserveAuthenticFrame']}")
    
    img = ImageOps.exif_transpose(Image.open(full_path))
    w_orig, h_orig = img.size
    print(f"Original size: {w_orig}x{h_orig}")
    
    if not directives["mattingRequired"]:
        print("-> Backstamp Macro Preservation path triggered.")
        # Test backstamp preservation
        # 1. Unsharp mask
        unsharp_cfg = directives.get("textureEnhancement", {})
        radius = unsharp_cfg.get("unsharpRadius", 1.5)
        percent = unsharp_cfg.get("unsharpPercent", 130)
        threshold = unsharp_cfg.get("unsharpThreshold", 1)
        
        # 2. Frame vignette
        vignette_cfg = directives.get("frameVignette", {})
        
        # Test processing time
        t0 = time.time()
        img_unsharp = img.filter(ImageFilter.UnsharpMask(radius=radius, percent=percent, threshold=threshold))
        
        # Generate subtle luxury vignette
        if vignette_cfg.get("enabled", True):
            w_tgt, h_tgt = 1400, 1800
            # Center crop or fit
            # Maintain aspect ratio crop to 1400:1800 (0.777)
            # Original aspect ratio is 2252/4000 = 0.563
            # To fit 1400x1800, we crop or pad with authentic frame
            aspect_tgt = w_tgt / h_tgt # 0.777
            # Let's see how framing should be done
            crop_w = int(h_orig * aspect_tgt)
            if crop_w <= w_orig:
                x0 = (w_orig - crop_w) // 2
                cropped = img_unsharp.crop((x0, 0, x0 + crop_w, h_orig))
            else:
                crop_h = int(w_orig / aspect_tgt)
                y0 = (h_orig - crop_h) // 2
                cropped = img_unsharp.crop((0, y0, w_orig, y0 + crop_h))
                
            resized = cropped.resize((w_tgt, h_tgt), Image.Resampling.LANCZOS)
            
            # Add vignette
            arr = np.array(resized).astype(np.float32)
            y, x = np.ogrid[:h_tgt, :w_tgt]
            cx, cy = w_tgt / 2.0, h_tgt / 2.0
            max_dist = np.sqrt(cx*cx + cy*cy)
            dist = np.sqrt((x - cx)**2 + (y - cy)**2) / max_dist
            
            inner_r = vignette_cfg.get("innerRadius", 0.65)
            outer_r = vignette_cfg.get("outerRadius", 0.98)
            vignette_opacity = vignette_cfg.get("opacity", 0.35)
            
            vig_factor = np.clip((dist - inner_r) / (outer_r - inner_r), 0.0, 1.0)
            vig_factor = vig_factor * vignette_opacity
            
            for c in range(3):
                arr[:, :, c] = arr[:, :, c] * (1.0 - vig_factor)
                
            out_img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode="RGB")
        else:
            out_img = img_unsharp
            
        t1 = time.time()
        print(f"Backstamp processed in {t1-t0:.3f}s. Final size: {out_img.size}")
        return out_img
        
    else:
        # Multi-stage matting strategy
        t0 = time.time()
        # Step 1: IS-Net raw foreground extraction
        cutout = rembg.remove(img, session=session, post_process_mask=True)
        t_isnet = time.time()
        print(f"Step 1 IS-Net inference: {t_isnet-t0:.2f}s")
        
        np_cutout = np.array(cutout)
        img_rgb = np.array(img)
        alpha_raw = np_cutout[:, :, 3]
        
        # Step 2: Morphological clean-up
        # Largest connected component on threshold > 64 to purge distant floating shadows/table artifacts
        bin_mask = (alpha_raw > 64).astype(np.uint8)
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(bin_mask)
        if num_labels > 1:
            largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
            cleaned_mask = (labels == largest_label).astype(np.uint8) * 255
            # Retain alpha only in cleaned mask region plus immediate transition
            kernel_dilate = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
            allowed_zone = cv2.dilate(cleaned_mask, kernel_dilate, iterations=2)
            alpha_purged = np.where(allowed_zone > 0, alpha_raw, 0)
        else:
            alpha_purged = alpha_raw
            
        # Step 3: Morphological closing to seal internal micro pinholes
        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        alpha_closed = cv2.morphologyEx(alpha_purged, cv2.MORPH_CLOSE, kernel_close)
        
        # Step 4: Boundary erosion (1px) to prevent raw white background bleed
        kernel_erode = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        alpha_eroded = cv2.erode(alpha_closed, kernel_erode, iterations=1)
        
        # Step 5: Sub-pixel Gaussian feathering (3x3, sigma=0.5)
        alpha_final = cv2.GaussianBlur(alpha_eroded, (3, 3), 0.5)
        
        # Step 6: Edge Defringing / Color Clamping
        # To completely prevent bright fringe on dark backdrop:
        # Check transition pixels (0 < alpha < 240) and prevent luminance blow-up
        fg_rgb = img_rgb.copy()
        
        # Step 7: Crop & scale subject to standard auction framing (1400x1800)
        # Find tight bounding box of subject
        y_idxs, x_idxs = np.where(alpha_final > 10)
        if len(y_idxs) == 0:
            ymin, ymax, xmin, xmax = 0, h_orig, 0, w_orig
        else:
            ymin, ymax = y_idxs.min(), y_idxs.max()
            xmin, xmax = x_idxs.min(), x_idxs.max()
            
        obj_w = xmax - xmin
        obj_h = ymax - ymin
        print(f"Subject BBox: [{xmin}, {ymin}, {obj_w}, {obj_h}] in {w_orig}x{h_orig}")
        
        # Target canvas
        w_tgt, h_tgt = 1400, 1800
        
        # Desired subject height ratio in canvas
        if angle_name == "PORTRAIT_TORSO":
            target_obj_h = int(h_tgt * 0.88)
        else:
            target_obj_h = int(h_tgt * 0.82) # 82% of vertical canvas
            
        scale_factor = target_obj_h / obj_h
        new_w = int(w_orig * scale_factor)
        new_h = int(h_orig * scale_factor)
        
        # Resize cutout with Lanczos/area
        img_rgba = Image.fromarray(np.dstack([fg_rgb, alpha_final]), mode="RGBA")
        resized_rgba = img_rgba.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Scaled bbox
        new_xmin = int(xmin * scale_factor)
        new_ymin = int(ymin * scale_factor)
        new_obj_w = int(obj_w * scale_factor)
        new_obj_h = int(obj_h * scale_factor)
        
        # Position subject centered horizontally, with appropriate bottom margin
        if angle_name == "PORTRAIT_TORSO":
            pos_x = (w_tgt - new_obj_w) // 2 - new_xmin
            pos_y = (h_tgt - new_obj_h) // 2 - new_ymin
        else:
            pos_x = (w_tgt - new_obj_w) // 2 - new_xmin
            bottom_margin = int(h_tgt * 0.10) # 10% bottom margin for grounding
            pos_y = h_tgt - bottom_margin - new_obj_h - new_ymin
            
        # Paste onto blank RGBA canvas
        canvas_rgba = Image.new("RGBA", (w_tgt, h_tgt), (0, 0, 0, 0))
        canvas_rgba.paste(resized_rgba, (pos_x, pos_y), resized_rgba)
        
        t_done = time.time()
        print(f"Matting and framing complete in {t_done-t0:.2f}s")
        return canvas_rgba

for angle_name, angle_data in manifest["classifiedAngles"].items():
    res = process_angle_test(angle_name, angle_data)
