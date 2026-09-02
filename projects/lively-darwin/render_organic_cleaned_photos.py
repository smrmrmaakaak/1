import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg
import torch
import json

def generate_organic_clean_dataset():
    os.makedirs("depth_2_5d", exist_ok=True)
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    session = rembg.new_session("u2net")
    
    target_w, target_h = 1536, 2048
    
    for i, raw_path in enumerate(raw_files):
        print(f"\n[Organic Clean] Processing Photo {i:02d}: {raw_path}")
        
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
        
        # Exact human skin discriminator
        is_human_skin = (rf > 105) & (gf > 65) & (bf > 45) & \
                        (gf / (rf + 1e-5) >= 0.52) & (bf / (rf + 1e-5) >= 0.42) & \
                        (rf > gf) & (gf >= bf)
                        
        # Figurine's own face & chest hands zone to protect
        fig_face_hands = np.zeros((target_h, target_w), dtype=bool)
        fig_face_hands[150:1150, 420:1120] = True
        
        # Real human skin to remove
        external_skin = is_human_skin & (~fig_face_hands) & (a > 0)
        
        # Dilate skin mask by 5px so all finger borders are cleanly removed
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        external_skin_dilated = cv2.dilate(external_skin.astype(np.uint8), kernel, iterations=2) > 0
        
        if i == 0:
            # Pristine
            pass
            
        elif i == 1:
            # Back View: Lock-centered mirrored trunk
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
            # Clean outside trunk
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
            # Right side view: Only remove skin pixels behind coat & trunk
            a[external_skin_dilated] = 0
            
        elif i == 4:
            # Front-left view: Remove external skin and bracelet
            a[external_skin_dilated] = 0
            # Bracelet & arm below left hip
            arm_skin = (np.arange(target_w)[None, :] < 360) & (np.arange(target_h)[:, None] > 1450) & (a > 0)
            a[arm_skin] = 0
            
        elif i == 5:
            # Left 45 angle: Remove external skin
            a[external_skin_dilated] = 0
            
        elif i == 6:
            # Back view: Remove external skin
            a[external_skin_dilated] = 0
            
        elif i == 7:
            # Rear 225: Remove external skin & outside trunk corner
            a[external_skin_dilated] = 0
            a[1050:, 1040:] = 0 # outside trunk right edge
            
        elif i == 8:
            # Left side: Remove external skin & outside trunk corner
            a[external_skin_dilated] = 0
            a[1050:, :380] = 0 # outside trunk left edge
            
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

        # Soft edge blur for smooth anti-aliased edges
        a = cv2.GaussianBlur(a, (3, 3), 0)
        
        b_final, g_final, r_final = cv2.split(bgr)
        final_rgba = cv2.merge([r_final, g_final, b_final, a])
        out_path = f"depth_2_5d/rgba_{i:02d}.png"
        Image.fromarray(final_rgba).save(out_path)
        print(f"Saved organic clean RGBA: {out_path}")

if __name__ == "__main__":
    generate_organic_clean_dataset()
