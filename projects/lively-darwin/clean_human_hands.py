import os, glob
import cv2
import numpy as np
from PIL import Image

def remove_human_hands_and_reprocess():
    os.makedirs("depth_2_5d_cleaned", exist_ok=True)
    
    # We will process each rgba_xx.png
    for i in range(14):
        src_path = f"depth_2_5d/rgba_{i:02d}.png"
        if not os.path.exists(src_path):
            continue
        
        img = cv2.imread(src_path, cv2.IMREAD_UNCHANGED)
        h, w, c = img.shape
        b, g, r, a = cv2.split(img)
        
        # Create a modification mask for hand areas (1 = keep, 0 = remove)
        hand_mask = np.ones((h, w), dtype=np.uint8)
        
        # Skin color detector in YCrCb and HSV
        img_rgb = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2RGB)
        img_ycrcb = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2YCrCb)
        img_hsv = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2HSV)
        
        # Typical human skin mask in YCrCb: Cr in [133, 173], Cb in [77, 127]
        skin_ycrcb = cv2.inRange(img_ycrcb, np.array([0, 133, 77]), np.array([255, 175, 127]))
        # In HSV: H in [0, 25], S in [30, 200], V in [60, 255]
        skin_hsv = cv2.inRange(img_hsv, np.array([0, 30, 60]), np.array([25, 200, 255]))
        skin_combined = cv2.bitwise_and(skin_ycrcb, skin_hsv)
        
        # Specific hand removal regions per image (preserving figurine face & hands)
        if i == 0:
            pass # clean
        elif i == 1:
            # Lower left arm under trunk: y > 1600, x < 650
            roi = (img[:, :, 3] > 0)
            roi_y = np.zeros_like(roi)
            roi_y[1600:, :650] = True
            hand_mask[roi_y] = 0
        elif i == 2:
            # Photo 02: Figurine held upside down showing backstamp
            # Hand holding at bottom: y > 1150
            # Also keep the two boots if possible, but the fingers covering them:
            # Let's mask out all skin at y > 1150
            roi_skin = (skin_combined > 0) & (np.arange(h)[:, None] > 1100)
            # Also mask out the palm/fingers region below y > 1550
            hand_mask[1600:, :] = 0
            hand_mask[1100:, :300] = 0 # left thumb
            hand_mask[1100:, 800:] = 0 # right fingers
            hand_mask[roi_skin] = 0
        elif i == 3:
            # Lower middle fingers behind bottom: y > 1450, 650 < x < 950
            roi_skin = (skin_combined > 0) & (np.arange(h)[:, None] > 1400) & (np.arange(w)[None, :] > 600) & (np.arange(w)[None, :] < 1000)
            hand_mask[roi_skin] = 0
            # Also remove any hanging skin below trunk
            hand_mask[1550:1850, 700:850] = 0
        elif i == 4:
            # Left arm with gold bracelet: x < 500, y > 1000
            roi = (np.arange(w)[None, :] < 480) & (np.arange(h)[:, None] > 980)
            hand_mask[roi] = 0
        elif i == 5:
            # Lower left fingertips: x < 280, y > 1450
            roi = (np.arange(w)[None, :] < 280) & (np.arange(h)[:, None] > 1450)
            hand_mask[roi] = 0
        elif i == 6:
            # Lower right fingertips: x > 1250, y > 1500
            roi = (np.arange(w)[None, :] > 1250) & (np.arange(h)[:, None] > 1500)
            hand_mask[roi] = 0
        elif i == 7:
            # Right side hand/fingers with nail art: x > 1050, y > 1050
            roi = (np.arange(w)[None, :] > 1050) & (np.arange(h)[:, None] > 1050)
            hand_mask[roi] = 0
        elif i == 8:
            # Left side hand with bracelet: x < 450, y > 1100
            roi = (np.arange(w)[None, :] < 450) & (np.arange(h)[:, None] > 1100)
            hand_mask[roi] = 0
        elif i == 9:
            pass # clean
        elif i == 10:
            pass # clean
        elif i == 11:
            pass # clean
        elif i == 12:
            pass # clean
        elif i == 13:
            pass # clean
            
        # Apply mask to alpha channel
        new_a = (a * hand_mask).astype(np.uint8)
        
        # Smooth alpha border slightly for anti-aliasing
        cleaned_rgba = cv2.merge([b, g, r, new_a])
        
        out_path = f"depth_2_5d/rgba_{i:02d}.png"
        cv2.imwrite(out_path, cleaned_rgba)
        print(f"Cleaned and saved {out_path}")

if __name__ == "__main__":
    remove_human_hands_and_reprocess()
