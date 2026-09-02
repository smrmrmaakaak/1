import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg
import torch
import json

def build_flawless_dataset():
    os.makedirs("depth_2_5d", exist_ok=True)
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    session = rembg.new_session("u2net")
    
    target_w, target_h = 1536, 2048
    
    # Process all 14 photos cleanly
    for i, raw_path in enumerate(raw_files):
        print(f"\n==========================================")
        print(f"[Flawless] Processing Photo {i:02d}: {raw_path}")
        print(f"==========================================")
        
        img_raw = cv2.imread(raw_path)
        img_resized = cv2.resize(img_raw, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        
        pil_resized = Image.fromarray(cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB))
        rgba_pil = rembg.remove(pil_resized, session=session)
        rgba = np.array(rgba_pil)
        
        r, g, b, a = cv2.split(rgba)
        bgr = cv2.merge([b, g, r])
        
        if i == 0:
            # Pristine Front table shot
            pass
            
        elif i == 1:
            # Back View: Mirror entire right trunk to left trunk below coat (y > 1170)
            lock_x = 642
            trunk_top_y = 1170
            trunk_bot_y = 1835
            
            # Create mirrored left trunk
            for y_k in range(trunk_top_y, trunk_bot_y):
                for dx in range(0, 520):
                    rx = lock_x + dx
                    lx = lock_x - dx
                    if rx < target_w and lx >= 0:
                        bgr[y_k, lx] = bgr[y_k, rx]
                        a[y_k, lx] = a[y_k, rx]
                        
            # Clean outside trunk boundaries
            a[trunk_top_y:, :lock_x - 510] = 0
            a[trunk_top_y:, lock_x + 510:] = 0
            a[trunk_bot_y:, :] = 0
            
        elif i == 2:
            # Hallmark Plaque: extract, rotate 180, center
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
            # Right 60 view: Remove fingers behind coat & boots
            a[1480:1900, 680:850] = 0
            # Remove hand at lower left trunk
            a[1550:, :250] = 0
            
        elif i == 4:
            # Front-left view: Hand on left side holding waist/trunk
            # Inpaint the left coat margin
            # Left coat is between y: 950~1450, x: 260~380
            # Zero out the hand/wrist at x < 380, y > 950
            a[1480:, :380] = 0
            a[1550:, 520:780] = 0
            # Smooth left coat edge
            coat_mask = np.zeros((target_h, target_w), dtype=np.uint8)
            coat_mask[950:1450, 240:370] = 255
            # We remove hand skin
            rf = bgr[:,:,2].astype(float)
            gf = bgr[:,:,1].astype(float)
            bf = bgr[:,:,0].astype(float)
            is_skin = (rf > 110) & (gf > 75) & (bf > 55) & (gf / (rf + 1e-5) >= 0.55) & (bf / (rf + 1e-5) >= 0.45)
            a[is_skin & (coat_mask > 0)] = 0
            
        elif i == 5:
            # Left 45 view: Remove fingertips at lower-left trunk
            a[1450:, :240] = 0
            
        elif i == 6:
            # Back view: Remove fingertips at lower-right trunk
            a[1450:, 1220:] = 0
            
        elif i == 7:
            # Rear-right 135 view: Remove right hand at trunk corner
            a[1050:, 1000:] = 0
            
        elif i == 8:
            # Left 30 view: Remove left hand holding trunk
            a[1050:, :400] = 0
            a[1550:, 420:700] = 0
            
        elif i in [9, 10, 11, 12, 13]:
            # Pristine macros & high angle
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
        
        b_c, g_c, r_c = cv2.split(bgr)
        final_rgba = cv2.merge([r_c, g_c, b_c, a])
        out_path = f"depth_2_5d/rgba_{i:02d}.png"
        Image.fromarray(final_rgba).save(out_path)
        print(f"Saved pristine RGBA: {out_path}")

if __name__ == "__main__":
    build_flawless_dataset()
