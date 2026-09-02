import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg

def fix_all_seams_and_hands():
    os.makedirs("depth_2_5d", exist_ok=True)
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    session = rembg.new_session("u2net")
    
    target_w, target_h = 1536, 2048
    
    for i, raw_path in enumerate(raw_files):
        print(f"\nFixing photo {i:02d}: {raw_path}")
        
        img_raw = cv2.imread(raw_path)
        img_resized = cv2.resize(img_raw, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        
        pil_resized = Image.fromarray(cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB))
        rgba_pil = rembg.remove(pil_resized, session=session)
        rgba = np.array(rgba_pil)
        
        r, g, b, a = cv2.split(rgba)
        bgr = cv2.merge([b, g, r])
        
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
        
        # Human skin detector
        skin_ycrcb = cv2.inRange(ycrcb, np.array([50, 133, 75]), np.array([255, 175, 128]))
        skin_hsv = cv2.inRange(hsv, np.array([0, 20, 50]), np.array([28, 200, 255]))
        skin = cv2.bitwise_and(skin_ycrcb, skin_hsv)
        
        fig_face_hands = np.zeros((target_h, target_w), dtype=bool)
        fig_face_hands[150:1150, 450:1100] = True
        
        human_skin = skin & (~fig_face_hands) & (a > 0)
        kernel_skin = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
        human_skin_dilated = cv2.dilate(human_skin.astype(np.uint8), kernel_skin, iterations=3)
        
        if i == 0:
            pass # 100% pristine
            
        elif i == 1:
            # Back view: Perfect trunk reconstruction around the lock center!
            # Let's find lock center in the trunk: lock is at y: 1200~1500
            # Center of the back trunk is x = 650
            lock_x = 650
            # We mirror the right side of the trunk (x > lock_x) to the left side (x < lock_x) below the coat line (y > 1150)
            for y_k in range(1150, 1850):
                for dx in range(1, 550):
                    rx = lock_x + dx
                    lx = lock_x - dx
                    if rx < target_w and lx >= 0:
                        if a[y_k, rx] > 200:
                            # Only overwrite if left side is missing or was arm
                            if a[y_k, lx] < 200 or lx < 380:
                                bgr[y_k, lx] = bgr[y_k, rx]
                                a[y_k, lx] = a[y_k, rx]
            # Zero out any stray arm on far left
            a[1450:, :150] = 0
            
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
            # Right side view: Remove finger behind coat bottom
            a[human_skin_dilated > 0] = 0
            a[1500:1900, 680:850] = 0
            # Inpaint the coat edge if needed
            
        elif i == 4:
            # Front view 2: Remove left hand holding waist/trunk and inpaint coat curve
            a[human_skin_dilated > 0] = 0
            a[1500:, :400] = 0
            a[1550:, 520:780] = 0 # between boots
            # Smooth left coat: inpaint any small missing coat margin
            coat_inpaint_mask = np.zeros((target_h, target_w), dtype=np.uint8)
            coat_inpaint_mask[950:1450, 280:380] = 255
            coat_inpaint_mask = coat_inpaint_mask & (a == 0)
            if np.sum(coat_inpaint_mask) > 0:
                # Inpaint red coat texture
                bgr = cv2.inpaint(bgr, coat_inpaint_mask, 5, cv2.INPAINT_TELEA)
                a[coat_inpaint_mask > 0] = 255
                
        elif i == 5:
            # Left 45 angle: Remove left fingertips
            a[human_skin_dilated > 0] = 0
            a[1450:1900, :220] = 0
            
        elif i == 6:
            # Back view 2: Remove right fingertips
            a[human_skin_dilated > 0] = 0
            a[1450:1900, 1250:] = 0
            
        elif i == 7:
            # Rear 225: Clean right hand, nails, and floating speckles
            a[human_skin_dilated > 0] = 0
            a[1050:, 1050:] = 0
            
        elif i == 8:
            # Left side: Clean left hand and floating speckles
            a[human_skin_dilated > 0] = 0
            a[1050:, :420] = 0
            a[1550:, 420:700] = 0
            
        # Clean small noise islands in alpha
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats((a > 50).astype(np.uint8))
        if num_labels > 1:
            cleaned_alpha = np.zeros_like(a)
            for l in range(1, num_labels):
                if stats[l, cv2.CC_STAT_AREA] > 3000:
                    cleaned_alpha[labels == l] = a[labels == l]
            a = cleaned_alpha

        # Smooth edges with bilateral filter for ultra-crisp porcelain rim
        a = cv2.GaussianBlur(a, (3, 3), 0)
        
        b, g, r = cv2.split(bgr)
        final_rgba = cv2.merge([r, g, b, a])
        out_path = f"depth_2_5d/rgba_{i:02d}.png"
        Image.fromarray(final_rgba).save(out_path)
        print(f"Saved pristine RGBA: {out_path}")

if __name__ == "__main__":
    fix_all_seams_and_hands()
