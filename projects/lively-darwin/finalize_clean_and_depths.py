import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg
import torch
import json
import scipy.ndimage as ndi
from transformers import pipeline

def finalize_dataset():
    os.makedirs("depth_2_5d", exist_ok=True)
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    session = rembg.new_session("u2net")
    
    target_w, target_h = 1536, 2048
    
    # 1. Clean all 14 RGBA photos
    for i, raw_path in enumerate(raw_files):
        print(f"\n[Finalizing RGBA] Photo {i:02d}: {raw_path}")
        
        img_raw = cv2.imread(raw_path)
        img_resized = cv2.resize(img_raw, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        
        pil_resized = Image.fromarray(cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB))
        rgba_pil = rembg.remove(pil_resized, session=session)
        rgba = np.array(rgba_pil)
        
        r_c, g_c, b_c, a = cv2.split(rgba)
        bgr = cv2.merge([b_c, g_c, r_c])
        
        rf = r_c.astype(float)
        gf = g_c.astype(float)
        bf = b_c.astype(float)
        
        # Skin detector
        is_skin = (rf > 105) & (gf > 65) & (bf > 45) & \
                  (gf / (rf + 1e-5) >= 0.52) & (bf / (rf + 1e-5) >= 0.42) & \
                  (rf > gf) & (gf >= bf)
        
        if i == 0:
            pass # pristine front table shot
            
        elif i == 1:
            # Back View: Lock-centered mirrored trunk for complete perfection
            lock_x = 642
            trunk_top_y = 1170
            trunk_bot_y = 1835
            
            for y_k in range(trunk_top_y, trunk_bot_y):
                for dx in range(0, 520):
                    rx = lock_x + dx
                    lx = lock_x - dx
                    if rx < target_w and lx >= 0:
                        bgr[y_k, lx] = bgr[y_k, rx]
                        a[y_k, lx] = a[y_k, rx]
                        
            a[trunk_top_y:, :lock_x - 510] = 0
            a[trunk_top_y:, lock_x + 510:] = 0
            a[trunk_bot_y:, :] = 0
            
        elif i == 2:
            # Hallmark Plaque: rotated 180, centered, upright
            plaque_bgr = bgr[460:1160, 40:1140]
            plaque_rot = cv2.rotate(plaque_bgr, cv2.ROTATE_180)
            ph, pw, _ = plaque_rot.shape
            
            new_bgr = np.zeros((target_h, target_w, 3), dtype=np.uint8)
            new_a = np.zeros((target_h, target_w), dtype=np.uint8)
            
            sy = (target_h - ph) // 2
            sx = (target_w - pw) // 2
            new_bgr[sy:sy+ph, sx:sx+pw] = plaque_rot
            new_a[sy:sy+ph, sx:sx+pw] = 255
            
            bgr = new_bgr
            a = new_a
            
        elif i == 3:
            # Right side view: Remove skin behind coat/boot
            hand_zone = (np.arange(target_h)[:, None] > 1500) & (np.arange(target_w)[None, :] > 650) & (np.arange(target_w)[None, :] < 900)
            a[is_skin & hand_zone] = 0
            
        elif i == 4:
            # Front-left view: Hand on left side & bracelet
            hand_zone = (np.arange(target_w)[None, :] < 360) & (np.arange(target_h)[:, None] > 950)
            a[is_skin & hand_zone] = 0
            a[1450:, :340] = 0
            between_boots = (np.arange(target_w)[None, :] > 520) & (np.arange(target_w)[None, :] < 780) & (np.arange(target_h)[:, None] > 1550)
            a[is_skin & between_boots] = 0
            
        elif i == 5:
            # Left 45 macro: Remove skin at lower-left
            hand_zone = (np.arange(target_w)[None, :] < 200) & (np.arange(target_h)[:, None] > 1450)
            a[is_skin & hand_zone] = 0
            
        elif i == 6:
            # Back macro: Remove skin at lower-right
            hand_zone = (np.arange(target_w)[None, :] > 1250) & (np.arange(target_h)[:, None] > 1450)
            a[is_skin & hand_zone] = 0
            
        elif i == 7:
            # Rear 225: Clean right hand & thumb behind back & bottom finger
            a[1050:, 1030:] = 0
            thumb_zone = (np.arange(target_w)[None, :] > 820) & (np.arange(target_w)[None, :] < 980) & (np.arange(target_h)[:, None] > 950) & (np.arange(target_h)[:, None] < 1250)
            a[is_skin & thumb_zone] = 0
            a[1850:, :] = 0 # bottom finger
            
        elif i == 8:
            # Left side: Clean left hand & bottom
            a[1050:, :380] = 0
            between_boots = (np.arange(target_w)[None, :] > 420) & (np.arange(target_w)[None, :] < 680) & (np.arange(target_h)[:, None] > 1550)
            a[is_skin & between_boots] = 0
            
        elif i in [9, 10, 11, 12, 13]:
            # Pristine macros
            pass
            
        # Clean small noise islands in alpha
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats((a > 50).astype(np.uint8))
        if num_labels > 1:
            cleaned_alpha = np.zeros_like(a)
            for l in range(1, num_labels):
                if stats[l, cv2.CC_STAT_AREA] > 3000:
                    cleaned_alpha[labels == l] = a[labels == l]
            a = cleaned_alpha

        # Soft edge blur
        a = cv2.GaussianBlur(a, (3, 3), 0)
        
        b_final, g_final, r_final = cv2.split(bgr)
        final_rgba = cv2.merge([r_final, g_final, b_final, a])
        out_path = f"depth_2_5d/rgba_{i:02d}.png"
        Image.fromarray(final_rgba).save(out_path)
        print(f"Saved pristine RGBA: {out_path}")

    # 2. Depth Anything V2 via Transformers Pipeline
    print("\n[Depth-Anything-V2] Generating Depth Maps & Normal Maps...")
    device = 0 if torch.cuda.is_available() else -1
    depth_pipe = pipeline(task="depth-estimation", model="depth-anything/Depth-Anything-V2-Base-hf", device=device)
    
    for i in range(len(raw_files)):
        rgba_img = Image.open(f"depth_2_5d/rgba_{i:02d}.png").convert("RGBA")
        rgb_img = rgba_img.convert("RGB")
        alpha = np.array(rgba_img)[:, :, 3]
        
        depth_res = depth_pipe(rgb_img)
        depth_pil = depth_res["depth"]
        depth_np = np.array(depth_pil).astype(np.float32)
        
        # Normalize
        valid_depth = depth_np[alpha > 50]
        if len(valid_depth) > 0:
            d_min = np.percentile(valid_depth, 2)
            d_max = np.percentile(valid_depth, 98)
            depth_norm = np.clip((depth_np - d_min) / (d_max - d_min + 1e-6), 0.0, 1.0)
        else:
            depth_norm = (depth_np - depth_np.min()) / (depth_np.max() - depth_np.min() + 1e-6)
            
        depth_u8 = (depth_norm * 255.0).astype(np.uint8)
        depth_u8[alpha < 30] = 0
        
        # Save depth map
        depth_path = f"depth_2_5d/depth_{i:02d}.png"
        Image.fromarray(depth_u8).save(depth_path)
        
        # Compute Normal Map
        strength = 2.5
        sobel_x = ndi.sobel(depth_norm, axis=1) * strength
        sobel_y = ndi.sobel(depth_norm, axis=0) * strength
        
        nx = -sobel_x
        ny = -sobel_y
        nz = np.ones_like(depth_norm)
        norm = np.sqrt(nx**2 + ny**2 + nz**2) + 1e-6
        nx /= norm
        ny /= norm
        nz /= norm
        
        r = ((nx * 0.5 + 0.5) * 255).astype(np.uint8)
        g = ((ny * 0.5 + 0.5) * 255).astype(np.uint8)
        b = ((nz * 0.5 + 0.5) * 255).astype(np.uint8)
        
        normal_rgb = np.stack([r, g, b], axis=-1)
        normal_rgb[alpha < 30] = [128, 128, 255]
        
        normal_path = f"depth_2_5d/normal_{i:02d}.png"
        Image.fromarray(normal_rgb).save(normal_path)
        print(f"Generated Depth & Normal for view {i:02d}")

    print("\nDataset ready!")

if __name__ == "__main__":
    finalize_dataset()
