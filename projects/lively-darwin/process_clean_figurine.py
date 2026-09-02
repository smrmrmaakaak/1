import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg

def clean_all_photos():
    raw_files = sorted(glob.glob("photos_oriented/*.jpg"))
    os.makedirs("depth_2_5d", exist_ok=True)
    
    # We will use birefnet-general or u2net for initial high-quality silhouette
    session = rembg.new_session("u2net")
    
    for i, raw_path in enumerate(raw_files):
        print(f"\n--- Processing Photo {i:02d}: {raw_path} ---")
        img_pil = Image.open(raw_path).convert("RGBA")
        
        # Base background removal
        rgba_pil = rembg.remove(img_pil, session=session)
        img = np.array(rgba_pil)
        h, w, _ = img.shape
        
        r, g, b, a = cv2.split(img)
        # OpenCV format: BGR
        img_bgr = cv2.merge([b, g, r])
        
        # Mask for removing human hands (0 = transparent/remove)
        keep_mask = np.ones((h, w), dtype=np.uint8)
        
        # Skin detection
        img_ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
        img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        
        skin_ycrcb = cv2.inRange(img_ycrcb, np.array([0, 133, 77]), np.array([255, 173, 127]))
        skin_hsv = cv2.inRange(img_hsv, np.array([0, 20, 50]), np.array([28, 220, 255]))
        skin = cv2.bitwise_and(skin_ycrcb, skin_hsv)
        
        # Refine per photo
        if i == 0:
            pass # clean
        elif i == 1:
            # Lower left arm under trunk: y > 1500, x < 550
            arm_roi = (np.arange(h)[:, None] > 1520) & (np.arange(w)[None, :] < 520)
            keep_mask[arm_roi] = 0
            # Also inpaint the lower left trunk edge cleanly
        elif i == 2:
            # Photo 02: Backstamp rectangular base plaque!
            # The rectangular plaque is at y: 300~1100, x: 50~1480
            # Everything below y > 1150 (the upside down legs and holding hand) should be removed cleanly!
            keep_mask[1130:, :] = 0
            # Remove anything above the plaque
            keep_mask[:250, :] = 0
        elif i == 3:
            # Middle bottom finger: y > 1500, 650 < x < 900
            roi = (skin > 0) & (np.arange(h)[:, None] > 1450) & (np.arange(w)[None, :] > 600) & (np.arange(w)[None, :] < 950)
            keep_mask[roi] = 0
            keep_mask[1550:1850, 720:840] = 0
        elif i == 4:
            # Left side hand and gold bracelet holding trunk: x < 400, y > 980
            roi_hand = (np.arange(w)[None, :] < 380) & (np.arange(h)[:, None] > 980)
            keep_mask[roi_hand] = 0
            # Also skin on left edge
            roi_skin = (skin > 0) & (np.arange(w)[None, :] < 450) & (np.arange(h)[:, None] > 980)
            keep_mask[roi_skin] = 0
        elif i == 5:
            # Left side fingertips: x < 250, y > 1400
            roi = (np.arange(w)[None, :] < 250) & (np.arange(h)[:, None] > 1400)
            keep_mask[roi] = 0
        elif i == 6:
            # Right side fingertips: x > 1250, y > 1450
            roi = (np.arange(w)[None, :] > 1250) & (np.arange(h)[:, None] > 1450)
            keep_mask[roi] = 0
        elif i == 7:
            # Right side fingers holding trunk: x > 1050, y > 1100
            roi = (np.arange(w)[None, :] > 1050) & (np.arange(h)[:, None] > 1100)
            keep_mask[roi] = 0
            roi_skin = (skin > 0) & (np.arange(w)[None, :] > 950) & (np.arange(h)[:, None] > 1100)
            keep_mask[roi_skin] = 0
        elif i == 8:
            # Left side hand with bracelet: x < 380, y > 1100
            roi = (np.arange(w)[None, :] < 380) & (np.arange(h)[:, None] > 1100)
            keep_mask[roi] = 0
            roi_skin = (skin > 0) & (np.arange(w)[None, :] < 450) & (np.arange(h)[:, None] > 1100)
            keep_mask[roi_skin] = 0

        # Update alpha
        final_a = (a * keep_mask).astype(np.uint8)
        
        # Recombine RGBA
        cleaned_rgba = cv2.merge([r, g, b, final_a])
        cleaned_pil = Image.fromarray(cleaned_rgba)
        
        out_path = f"depth_2_5d/rgba_{i:02d}.png"
        cleaned_pil.save(out_path)
        print(f"Saved cleaned RGBA: {out_path}")

if __name__ == "__main__":
    clean_all_photos()
