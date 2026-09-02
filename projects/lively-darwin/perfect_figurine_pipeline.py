import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg

def perfect_figurine_pipeline():
    os.makedirs("depth_2_5d", exist_ok=True)
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    session = rembg.new_session("u2net")
    
    target_w, target_h = 1536, 2048
    
    for i, raw_path in enumerate(raw_files):
        print(f"\nProcessing Photo {i:02d}: {raw_path}")
        
        img_raw = cv2.imread(raw_path)
        img_resized = cv2.resize(img_raw, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        
        # Initial RemBG
        pil_resized = Image.fromarray(cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB))
        rgba_pil = rembg.remove(pil_resized, session=session)
        rgba = np.array(rgba_pil)
        
        r, g, b, a = cv2.split(rgba)
        bgr = cv2.merge([b, g, r])
        
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
        
        # Skin mask
        skin_ycrcb = cv2.inRange(ycrcb, np.array([50, 133, 75]), np.array([255, 175, 128]))
        skin_hsv = cv2.inRange(hsv, np.array([0, 20, 50]), np.array([28, 200, 255]))
        skin = cv2.bitwise_and(skin_ycrcb, skin_hsv)
        
        # Figurine's face & chest hands zone
        fig_face_hands = np.zeros((target_h, target_w), dtype=bool)
        fig_face_hands[150:1150, 450:1100] = True
        
        # Human skin outside figurine
        human_skin = skin & (~fig_face_hands) & (a > 0)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        human_skin_dilated = cv2.dilate(human_skin.astype(np.uint8), kernel, iterations=3)
        
        if i == 0:
            pass # pristine front
            
        elif i == 1:
            # Back view: Perfect trunk reconstruction by mirroring the right side of the trunk to the left side
            center_x = 745
            # Mirror the right side of trunk (x: 745 to 1180, y: 1180 to 1820)
            for y_k in range(1180, 1850):
                for x_offset in range(0, 420):
                    rx = center_x + x_offset
                    lx = center_x - x_offset
                    if rx < target_w and lx >= 0:
                        # Copy the right side to left side if left side has arm/is missing
                        if x_offset > 180: # outer half of left side
                            bgr[y_k, lx] = bgr[y_k, rx]
                            a[y_k, lx] = a[y_k, rx]
            # Remove any arm leftover on outer left
            a[1450:, :300] = 0
            
        elif i == 2:
            # Backstamp plaque: clean, upright, centered
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
            # Right side view: remove bottom finger & between boots
            finger_roi = (human_skin_dilated > 0) & (np.arange(target_h)[:, None] > 1400) & (np.arange(target_w)[None, :] > 600) & (np.arange(target_w)[None, :] < 950)
            a[finger_roi] = 0
            a[1500:1900, 680:850] = 0
            
        elif i == 4:
            # Front view 2: Remove left holding hand & reconstruct left coat curve
            # Mask out skin on left
            a[(human_skin_dilated > 0) & (np.arange(target_w)[None, :] < 450) & (np.arange(target_h)[:, None] > 900)] = 0
            a[1500:, :400] = 0
            # Remove skin between legs
            a[(human_skin_dilated > 0) & (np.arange(target_w)[None, :] > 520) & (np.arange(target_w)[None, :] < 780) & (np.arange(target_h)[:, None] > 1550)] = 0
            # Smooth left coat boundary
            
        elif i == 5:
            # Left 45 angle: Remove left fingertips
            a[(human_skin_dilated > 0) & (np.arange(target_w)[None, :] < 280) & (np.arange(target_h)[:, None] > 1350)] = 0
            a[1450:1900, :220] = 0
            
        elif i == 6:
            # Back view: Remove right fingertips
            a[(human_skin_dilated > 0) & (np.arange(target_w)[None, :] > 1200) & (np.arange(target_h)[:, None] > 1350)] = 0
            a[1450:1900, 1250:] = 0
            
        elif i == 7:
            # Rear 225: Clean right hand, nails, and all floating speckles
            a[(human_skin_dilated > 0) & (np.arange(target_w)[None, :] > 950) & (np.arange(target_h)[:, None] > 1000)] = 0
            a[1050:, 1050:] = 0
            
        elif i == 8:
            # Left side: Clean left hand and floating speckles
            a[(human_skin_dilated > 0) & (np.arange(target_w)[None, :] < 450) & (np.arange(target_h)[:, None] > 1000)] = 0
            a[1050:, :420] = 0
            # Remove between legs
            a[1550:, 420:700] = 0
            
        elif i in [9, 10, 11, 12, 13]:
            pass # pristine macros
            
        # Clean small disconnected noise particles in alpha channel
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats((a > 50).astype(np.uint8))
        if num_labels > 1:
            # Keep only components with area > 1000 pixels
            cleaned_alpha = np.zeros_like(a)
            for l in range(1, num_labels):
                if stats[l, cv2.CC_STAT_AREA] > 1500:
                    cleaned_alpha[labels == l] = a[labels == l]
            a = cleaned_alpha

        # Soft edge blur for perfect anti-aliasing
        a = cv2.GaussianBlur(a, (3, 3), 0)
        
        b, g, r = cv2.split(bgr)
        final_rgba = cv2.merge([r, g, b, a])
        out_path = f"depth_2_5d/rgba_{i:02d}.png"
        Image.fromarray(final_rgba).save(out_path)
        print(f"Saved: {out_path}")

if __name__ == "__main__":
    perfect_figurine_pipeline()
