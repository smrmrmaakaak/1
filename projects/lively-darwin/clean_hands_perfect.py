import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg

def process_all_clean():
    os.makedirs("depth_2_5d", exist_ok=True)
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    session = rembg.new_session("u2net")
    
    for i, raw_path in enumerate(raw_files):
        print(f"\n==========================================")
        print(f"Processing Photo {i:02d}: {raw_path}")
        print(f"==========================================")
        
        img_raw = cv2.imread(raw_path)
        h_raw, w_raw, _ = img_raw.shape
        
        # Standardize size: 1536 x 2048
        target_w, target_h = 1536, 2048
        img_resized = cv2.resize(img_raw, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        
        # Run rembg
        pil_resized = Image.fromarray(cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB))
        rgba_pil = rembg.remove(pil_resized, session=session)
        rgba_np = np.array(rgba_pil)
        
        r, g, b, a = cv2.split(rgba_np)
        bgr = cv2.merge([b, g, r])
        
        # Skin mask for precision detection
        img_ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
        img_hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        
        # Human skin range
        skin_ycrcb = cv2.inRange(img_ycrcb, np.array([0, 133, 77]), np.array([255, 173, 127]))
        skin_hsv = cv2.inRange(img_hsv, np.array([0, 20, 45]), np.array([25, 230, 255]))
        skin_mask = cv2.bitwise_and(skin_ycrcb, skin_hsv)
        
        # Mask of pixels to remove (1 = remove, 0 = keep)
        remove_mask = np.zeros((target_h, target_w), dtype=np.uint8)
        
        # Inpaint mask for restoring figurine parts covered by fingers
        inpaint_mask = np.zeros((target_h, target_w), dtype=np.uint8)
        
        if i == 0:
            pass # clean
            
        elif i == 1:
            # Lower left arm under trunk: x < 580, y > 1550
            roi_arm = (np.arange(target_w)[None, :] < 580) & (np.arange(target_h)[:, None] > 1550)
            remove_mask[roi_arm & (a > 0)] = 1
            
            # Reconstruct lower left trunk bottom edge
            # Trunk bottom is at y=1775, x from 250 to 1100
            # Let's ensure trunk lower-left corner is square
            # Inpaint lower-left corner of trunk if needed
            
        elif i == 2:
            # Backstamp photo: isolate the white rectangular base plaque!
            # The plaque is roughly y: 440 to 1180, x: 0 to 1150
            # Everything else (legs, fingers) should be removed!
            remove_mask[1200:, :] = 1
            remove_mask[:420, :] = 1
            remove_mask[:, 1180:] = 1
            
        elif i == 3:
            # Bottom center fingers behind trunk: y > 1520, 680 < x < 900
            roi = (skin_mask > 0) & (np.arange(target_h)[:, None] > 1500) & (np.arange(target_w)[None, :] > 650) & (np.arange(target_w)[None, :] < 920)
            remove_mask[roi] = 1
            remove_mask[1560:1900, 720:860] = 1
            
        elif i == 4:
            # Photo 04: Human hand on left with gold bracelet
            # Arm/wrist at bottom left: x < 400, y > 1500
            roi_arm = (np.arange(target_w)[None, :] < 400) & (np.arange(target_h)[:, None] > 1500)
            remove_mask[roi_arm] = 1
            # Fingers on left side of coat: x < 380, y between 1000 and 1400
            roi_fingers = (skin_mask > 0) & (np.arange(target_w)[None, :] < 420) & (np.arange(target_h)[:, None] > 980)
            remove_mask[roi_fingers] = 1
            # Gold bracelet: yellow shiny pixels at x < 400, y > 1700
            remove_mask[1750:, :450] = 1
            # Background skin between legs: 550 < x < 750, y > 1650
            roi_bg_skin = (skin_mask > 0) & (np.arange(target_w)[None, :] > 520) & (np.arange(target_w)[None, :] < 780) & (np.arange(target_h)[:, None] > 1600)
            remove_mask[roi_bg_skin] = 1
            
        elif i == 5:
            # Lower left fingertips: x < 260, y > 1400
            roi = (skin_mask > 0) & (np.arange(target_w)[None, :] < 280) & (np.arange(target_h)[:, None] > 1400)
            remove_mask[roi] = 1
            remove_mask[1480:1950, :220] = 1
            
        elif i == 6:
            # Lower right fingertips: x > 1250, y > 1450
            roi = (skin_mask > 0) & (np.arange(target_w)[None, :] > 1250) & (np.arange(target_h)[:, None] > 1450)
            remove_mask[roi] = 1
            remove_mask[1480:1950, 1280:] = 1
            
        elif i == 7:
            # Right side fingers holding trunk handle: x > 980, y > 1050
            roi_fingers = (skin_mask > 0) & (np.arange(target_w)[None, :] > 980) & (np.arange(target_h)[:, None] > 1000)
            remove_mask[roi_fingers] = 1
            # Also the thumb/palm on right side
            remove_mask[1200:1900, 1100:] = 1
            # Inpaint the covered right trunk handle/border
            inpaint_mask[1250:1800, 1050:1220] = 1
            
        elif i == 8:
            # Left side hand holding trunk: x < 420, y > 1080
            roi_fingers = (skin_mask > 0) & (np.arange(target_w)[None, :] < 420) & (np.arange(target_h)[:, None] > 1050)
            remove_mask[roi_fingers] = 1
            remove_mask[1150:1950, :380] = 1
            
        elif i in [9, 10, 11, 12, 13]:
            pass # clean
            
        # Apply removal mask to alpha
        new_a = a.copy()
        new_a[remove_mask == 1] = 0
        
        # If inpaint is needed, inpaint on BGR then restore alpha
        if np.sum(inpaint_mask) > 0:
            # Only inpaint where remove_mask removed pixels inside the trunk bounding box
            inpaint_target = (inpaint_mask == 1) & (remove_mask == 1)
            if np.sum(inpaint_target) > 0:
                bgr = cv2.inpaint(bgr, inpaint_target.astype(np.uint8) * 255, 7, cv2.INPAINT_TELEA)
                # Keep new_a clean
                
        # Morphological smoothing of alpha edge
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        new_a = cv2.morphologyEx(new_a, cv2.MORPH_CLOSE, kernel)
        
        # Save cleaned RGBA
        cleaned_bgr = bgr
        cleaned_b, cleaned_g, cleaned_r = cv2.split(cleaned_bgr)
        final_rgba = cv2.merge([cleaned_r, cleaned_g, cleaned_b, new_a])
        
        out_rgba_path = f"depth_2_5d/rgba_{i:02d}.png"
        Image.fromarray(final_rgba).save(out_rgba_path)
        print(f"Wrote cleaned RGBA to {out_rgba_path}")

if __name__ == "__main__":
    process_all_clean()
