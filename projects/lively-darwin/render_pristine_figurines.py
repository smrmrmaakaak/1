import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg
import torch

def render_pristine_figurines():
    os.makedirs("depth_2_5d", exist_ok=True)
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    session = rembg.new_session("u2net")
    
    target_w, target_h = 1536, 2048
    
    for i, raw_path in enumerate(raw_files):
        print(f"\n==========================================")
        print(f"[Pristine Figurine] Processing Photo {i:02d}: {raw_path}")
        print(f"==========================================")
        
        img_raw = cv2.imread(raw_path)
        img_resized = cv2.resize(img_raw, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        
        pil_resized = Image.fromarray(cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB))
        rgba_pil = rembg.remove(pil_resized, session=session)
        rgba = np.array(rgba_pil)
        
        r_c, g_c, b_c, a = cv2.split(rgba)
        bgr = cv2.merge([b_c, g_c, r_c])
        
        # Skin detector
        rf = r_c.astype(float)
        gf = g_c.astype(float)
        bf = b_c.astype(float)
        is_skin = (rf > 105) & (gf > 65) & (bf > 45) & \
                  (gf / (rf + 1e-5) >= 0.52) & (bf / (rf + 1e-5) >= 0.42) & \
                  (rf > gf) & (gf >= bf)
        
        if i == 0:
            pass # 100% pristine
            
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
            # Right side view: ONLY remove skin in the specific hand zone behind coat/boot
            hand_zone = (np.arange(target_h)[:, None] > 1550) & (np.arange(target_w)[None, :] > 700) & (np.arange(target_w)[None, :] < 880)
            a[is_skin & hand_zone] = 0
            
        elif i == 4:
            # Front-left view: ONLY remove skin in the left hip / arm zone
            hand_zone = (np.arange(target_w)[None, :] < 360) & (np.arange(target_h)[:, None] > 1000)
            a[is_skin & hand_zone] = 0
            # Remove lower arm/bracelet
            a[1480:, :340] = 0
            # Remove skin between boots
            between_boots = (np.arange(target_w)[None, :] > 550) & (np.arange(target_w)[None, :] < 750) & (np.arange(target_h)[:, None] > 1550)
            a[is_skin & between_boots] = 0
            
        elif i == 5:
            # Left 45 angle: ONLY remove skin on lower-left trunk corner
            hand_zone = (np.arange(target_w)[None, :] < 240) & (np.arange(target_h)[:, None] > 1400)
            a[is_skin & hand_zone] = 0
            a[1550:, :200] = 0
            
        elif i == 6:
            # Back view 2: ONLY remove skin on lower-right trunk corner
            hand_zone = (np.arange(target_w)[None, :] > 1250) & (np.arange(target_h)[:, None] > 1400)
            a[is_skin & hand_zone] = 0
            a[1550:, 1280:] = 0
            
        elif i == 7:
            # Rear-right 135: Cut cleanly outside the right vertical trunk post (x > 1030)
            a[1050:, 1030:] = 0
            # Remove skin behind coat elbow
            elbow_skin = (np.arange(target_w)[None, :] > 560) & (np.arange(target_w)[None, :] < 660) & (np.arange(target_h)[:, None] > 480) & (np.arange(target_h)[:, None] < 620)
            a[is_skin & elbow_skin] = 0
            
        elif i == 8:
            # Left side: Cut cleanly outside the left vertical trunk post (x < 380)
            a[1050:, :380] = 0
            between_boots = (np.arange(target_w)[None, :] > 420) & (np.arange(target_w)[None, :] < 680) & (np.arange(target_h)[:, None] > 1550)
            a[is_skin & between_boots] = 0
            
        elif i in [9, 10, 11, 12, 13]:
            # 100% pristine macros & top view
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

if __name__ == "__main__":
    render_pristine_figurines()
