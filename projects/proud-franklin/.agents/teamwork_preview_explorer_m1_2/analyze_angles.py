import os
import cv2
import numpy as np
from PIL import Image, ImageOps

def analyze_photo(fpath):
    # 1. Safe PIL open + EXIF transpose
    with Image.open(fpath) as pil_img:
        transposed = ImageOps.exif_transpose(pil_img)
        w, h = transposed.size
        rgb = np.array(transposed.convert('RGB'))
        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_HSV2BGR) # wait, BGR2HSV
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    
    # 2. Foreground segmentation via Otsu on blurred image
    blurred = cv2.GaussianBlur(gray, (25, 25), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # Check borders
    border = np.concatenate([thresh[0, :], thresh[-1, :], thresh[:, 0], thresh[:, -1]])
    if np.mean(border) > 128:
        thresh = cv2.bitwise_not(thresh)
        
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        # filter out small noise
        valid_contours = [c for c in contours if cv2.contourArea(c) > (w * h * 0.01)]
        if valid_contours:
            # Combine all valid contours into overall bounding box
            all_pts = np.concatenate(valid_contours)
            bx, by, bw, bh = cv2.boundingRect(all_pts)
            total_fg_area = sum(cv2.contourArea(c) for c in valid_contours)
        else:
            bx, by, bw, bh = 0, 0, w, h
            total_fg_area = w * h
    else:
        bx, by, bw, bh = 0, 0, w, h
        total_fg_area = w * h
        
    area_ratio = total_fg_area / (w * h)
    top_norm = by / h
    bot_norm = (by + bh) / h
    height_norm = bh / h
    width_norm = bw / w
    center_y = (by + bh / 2) / h
    
    # 3. Text / Backstamp Detection Heuristics
    # Underside backstamp: high contrast text strokes, blue ink / dark ink on beige/white porcelain base
    # Check blue ink (Lladró bellflower) in center area
    center_roi_hsv = hsv[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]
    blue_mask = cv2.inRange(center_roi_hsv, np.array([95, 50, 40]), np.array([135, 255, 255]))
    blue_count = np.sum(blue_mask > 0)
    
    # High frequency stroke variance in center
    center_roi_gray = gray[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]
    center_lap = cv2.Laplacian(center_roi_gray, cv2.CV_64F).var()
    
    # 4. Aspect ratio of foreground object
    fg_aspect = bh / max(bw, 1) # height / width ratio of the object
    
    # 5. Upper 1/3 vs Lower 1/3 mass distribution
    # In full body standing sculpture: object is narrower at head, wider at dress/pedestal
    # In torso/portrait: head/shoulders occupy large width in upper half
    upper_fg = np.sum(thresh[by:int(by+bh*0.33), bx:bx+bw] > 0)
    lower_fg = np.sum(thresh[int(by+bh*0.66):by+bh, bx:bx+bw] > 0)
    mass_ratio = upper_fg / max(lower_fg, 1) # upper mass / lower mass
    
    return {
        "res": f"{w}x{h}",
        "aspect": f"{w/h:.2f}",
        "top": round(top_norm, 3),
        "bot": round(bot_norm, 3),
        "height_norm": round(height_norm, 3),
        "width_norm": round(width_norm, 3),
        "fg_aspect": round(fg_aspect, 2),
        "area_ratio": round(area_ratio, 3),
        "mass_ratio": round(mass_ratio, 3),
        "blue_count": int(blue_count),
        "center_lap": round(center_lap, 1)
    }

venus_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
files = sorted([f for f in os.listdir(venus_dir) if f.endswith(('.jpg', '.jpeg', '.png')) and not os.path.isdir(os.path.join(venus_dir, f))])

for idx, f in enumerate(files):
    fpath = os.path.join(venus_dir, f)
    stats = analyze_photo(fpath)
    print(f"[{idx+1:02d}] {f}")
    for k, v in stats.items():
        print(f"    {k}: {v}")
