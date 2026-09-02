import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg

def clean_hands_ultra():
    os.makedirs("depth_2_5d", exist_ok=True)
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    session = rembg.new_session("u2net")
    
    target_w, target_h = 1536, 2048
    
    for i, raw_path in enumerate(raw_files):
        print(f"\n[Clean Ultra] Processing Photo {i:02d}: {raw_path}")
        
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
        is_human_skin = (rf > 110) & (gf > 75) & (bf > 55) & \
                        (gf / (rf + 1e-5) >= 0.55) & (bf / (rf + 1e-5) >= 0.45) & \
                        (rf > gf) & (gf >= bf)
                        
        # Figurine's face & chest hands zone
        fig_face_hands = np.zeros((target_h, target_w), dtype=bool)
        fig_face_hands[150:1150, 450:1100] = True
        
        # Real human skin to eliminate (outside figurine face/hands)
        external_skin = is_human_skin & (~fig_face_hands) & (a > 0)
        
        # Dilate slightly to remove edges and nail polish
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        external_skin_dilated = cv2.dilate(external_skin.astype(np.uint8), kernel, iterations=2) > 0
        
        if i == 0:
            pass # 100% pristine front
            
        elif i == 1:
            # Back view: Perfect trunk reconstruction around the lock center
            lock_x = 642
            # Mirror the right half of trunk to left half below the coat line (y > 1150)
            for y_k in range(1150, 1850):
                for dx in range(1, 550):
                    rx = lock_x + dx
                    lx = lock_x - dx
                    if rx < target_w and lx >= 0:
                        if a[y_k, rx] > 200:
                            # If left side was arm or transparent
                            if a[y_k, lx] < 200 or lx < 400:
                                bgr[y_k, lx] = bgr[y_k, rx]
                                a[y_k, lx] = a[y_k, rx]
            a[1450:, :200] = 0
            
        elif i == 2:
            # Hallmark plaque: centered, upright, pristine
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
            # Right side view: remove bottom finger & behind boots
            a[external_skin_dilated & (np.arange(target_h)[:, None] > 1400)] = 0
            a[1550:1850, 700:850] = 0
            
        elif i == 4:
            # Front view 2: Remove left holding hand & gold bracelet
            a[external_skin_dilated & (np.arange(target_w)[None, :] < 420)] = 0
            a[1480:, :380] = 0
            a[1550:, 520:780] = 0 # between boots
            
        elif i == 5:
            # Left 45 angle: Remove left fingertips
            a[external_skin_dilated & (np.arange(target_w)[None, :] < 280)] = 0
            a[1450:1900, :200] = 0
            
        elif i == 6:
            # Back view: Remove right fingertips
            a[external_skin_dilated & (np.arange(target_w)[None, :] > 1200)] = 0
            a[1450:1900, 1250:] = 0
            
        elif i == 7:
            # Rear 225: Clean right hand, nails
            a[external_skin_dilated & (np.arange(target_w)[None, :] > 950)] = 0
            a[1100:, 1080:] = 0
            
        elif i == 8:
            # Left side: Clean left hand
            a[external_skin_dilated & (np.arange(target_w)[None, :] < 450)] = 0
            a[1100:, :400] = 0
            a[1550:, 420:700] = 0
            
        elif i in [9, 10, 11, 12, 13]:
            pass # pristine macros
            
        # Clean small noise islands in alpha
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats((a > 50).astype(np.uint8))
        if num_labels > 1:
            cleaned_alpha = np.zeros_like(a)
            for l in range(1, num_labels):
                if stats[l, cv2.CC_STAT_AREA] > 3000:
                    cleaned_alpha[labels == l] = a[labels == l]
            a = cleaned_alpha

        # Soft edge blur for anti-aliased silhouette
        a = cv2.GaussianBlur(a, (3, 3), 0)
        
        b, g, r = cv2.split(bgr)
        final_rgba = cv2.merge([r, g, b, a])
        out_path = f"depth_2_5d/rgba_{i:02d}.png"
        Image.fromarray(final_rgba).save(out_path)
        print(f"Saved pristine RGBA: {out_path}")

if __name__ == "__main__":
    clean_hands_ultra()
