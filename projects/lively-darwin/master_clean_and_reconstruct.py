import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg
import torch

def master_clean_and_reconstruct():
    os.makedirs("depth_2_5d", exist_ok=True)
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    session = rembg.new_session("u2net")
    
    target_w, target_h = 1536, 2048
    
    for i, raw_path in enumerate(raw_files):
        print(f"\n==========================================")
        print(f"Master Cleaning Photo {i:02d}: {raw_path}")
        print(f"==========================================")
        
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
        
        # Accurate human skin mask (excludes porcelain red coat, black hat/boots, and yellow brass)
        skin_ycrcb = cv2.inRange(ycrcb, np.array([50, 133, 75]), np.array([255, 175, 128]))
        skin_hsv = cv2.inRange(hsv, np.array([0, 20, 50]), np.array([28, 200, 255]))
        skin = cv2.bitwise_and(skin_ycrcb, skin_hsv)
        
        # Only consider skin OUTSIDE the figurine's face & chest hands
        # The figurine's face is inside x: 500~1050, y: 150~650
        # The figurine's hands holding the bugle are at x: 450~1100, y: 650~1150
        fig_face_hands = np.zeros((target_h, target_w), dtype=bool)
        fig_face_hands[150:1150, 450:1100] = True
        
        # Skin to remove is skin outside figurine face/hands
        human_skin = skin & (~fig_face_hands) & (a > 0)
        
        # Smooth and dilate human skin slightly to catch finger boundaries & bracelets
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        human_skin_dilated = cv2.dilate(human_skin.astype(np.uint8), kernel, iterations=2)
        
        # Specific image corrections
        if i == 0:
            # Pristine
            pass
            
        elif i == 1:
            # Back view: lower left arm under trunk
            arm_mask = (np.arange(target_w)[None, :] < 520) & (np.arange(target_h)[:, None] > 1520) & (a > 0)
            a[arm_mask] = 0
            
            # Reconstruct the lower left trunk edge cleanly by mirroring the right side of the trunk
            # Trunk right edge is at x ~ 1130. Trunk center is at x ~ 745.
            # Mirror the right bottom corner (x: 745 to 1140, y: 1450 to 1800) to the left side
            center_x = 745
            for y_k in range(1450, 1820):
                for x_offset in range(0, 390):
                    rx = center_x + x_offset
                    lx = center_x - x_offset
                    if rx < target_w and lx >= 0:
                        if a[y_k, rx] > 200 and a[y_k, lx] < 50:
                            bgr[y_k, lx] = bgr[y_k, rx]
                            a[y_k, lx] = a[y_k, rx]
                            
        elif i == 2:
            # Photo 02: Backstamp plaque!
            # Crop to the rectangular white plaque and rotate 180 degrees so the hallmark is upright!
            # The plaque in raw photo 02 is located at y: 450~1180, x: 0~1150
            # Let's extract the plaque, place it cleanly in the center with a subtle drop shadow
            plaque_mask = np.zeros((target_h, target_w), dtype=np.uint8)
            plaque_mask[460:1160, 40:1140] = 255
            
            # Crop plaque sub-image
            plaque_bgr = bgr[460:1160, 40:1140]
            # Rotate 180 degrees so text is upright
            plaque_rot = cv2.rotate(plaque_bgr, cv2.ROTATE_180)
            ph, pw, _ = plaque_rot.shape
            
            # Create a clean new RGBA canvas with centered plaque
            new_bgr = np.zeros((target_h, target_w, 3), dtype=np.uint8)
            new_a = np.zeros((target_h, target_w), dtype=np.uint8)
            
            sy = (target_h - ph) // 2
            sx = (target_w - pw) // 2
            new_bgr[sy:sy+ph, sx:sx+pw] = plaque_rot
            new_a[sy:sy+ph, sx:sx+pw] = 255
            
            # Soften edges
            new_a = cv2.GaussianBlur(new_a, (5, 5), 0)
            
            bgr = new_bgr
            a = new_a
            
        elif i == 3:
            # Right side view: Remove finger behind coat bottom
            finger_roi = (human_skin_dilated > 0) & (np.arange(target_h)[:, None] > 1450) & (np.arange(target_w)[None, :] > 600) & (np.arange(target_w)[None, :] < 950)
            a[finger_roi] = 0
            
        elif i == 4:
            # Front view 2: Remove left hand & gold bracelet
            # Arm/wrist at bottom left: x < 420, y > 1500
            arm_roi = (np.arange(target_w)[None, :] < 420) & (np.arange(target_h)[:, None] > 1480)
            a[arm_roi] = 0
            # Skin on left side of coat
            left_skin = (human_skin_dilated > 0) & (np.arange(target_w)[None, :] < 420) & (np.arange(target_h)[:, None] > 950)
            a[left_skin] = 0
            # Between legs skin
            bg_skin = (human_skin_dilated > 0) & (np.arange(target_w)[None, :] > 520) & (np.arange(target_w)[None, :] < 780) & (np.arange(target_h)[:, None] > 1550)
            a[bg_skin] = 0
            
        elif i == 5:
            # Left 45 angle: Remove left fingertips
            roi = (human_skin_dilated > 0) & (np.arange(target_w)[None, :] < 280) & (np.arange(target_h)[:, None] > 1400)
            a[roi] = 0
            
        elif i == 6:
            # Back view 2: Remove right fingertips
            roi = (human_skin_dilated > 0) & (np.arange(target_w)[None, :] > 1200) & (np.arange(target_h)[:, None] > 1400)
            a[roi] = 0
            
        elif i == 7:
            # Rear 225: Remove right fingers holding trunk handle
            roi = (human_skin_dilated > 0) & (np.arange(target_w)[None, :] > 980) & (np.arange(target_h)[:, None] > 1050)
            a[roi] = 0
            # Remove anything past right edge of trunk (x > 1150)
            a[1100:1900, 1150:] = 0
            
        elif i == 8:
            # Left side: Remove left hand holding trunk
            roi = (human_skin_dilated > 0) & (np.arange(target_w)[None, :] < 420) & (np.arange(target_h)[:, None] > 1050)
            a[roi] = 0
            # Remove anything past left edge of trunk (x < 380)
            a[1100:1900, :380] = 0
            
        # Refine and smooth alpha borders
        a = cv2.GaussianBlur(a, (3, 3), 0)
        
        # Save RGBA
        b, g, r = cv2.split(bgr)
        final_rgba = cv2.merge([r, g, b, a])
        Image.fromarray(final_rgba).save(f"depth_2_5d/rgba_{i:02d}.png")
        print(f"Saved depth_2_5d/rgba_{i:02d}.png")

if __name__ == "__main__":
    master_clean_and_reconstruct()
