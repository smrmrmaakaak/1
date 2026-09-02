import os
import cv2
import numpy as np
from PIL import Image, ImageOps

def extract_angle_features(fpath):
    with Image.open(fpath) as pil_img:
        img_trans = ImageOps.exif_transpose(pil_img)
        w, h = img_trans.size
        rgb = np.array(img_trans.convert('RGB'))
        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

    # 1. Base / Backstamp scoring:
    # Check for blue ink hallmark (Lladró bellflower)
    # Check for text-like edges in center region
    center_roi = gray[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]
    center_hsv = hsv[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]
    
    # Lladró blue mark HSV
    blue_mask = cv2.inRange(center_hsv, np.array([95, 50, 40]), np.array([135, 255, 255]))
    blue_pixels = np.sum(blue_mask > 0)
    
    # Adaptive threshold for text / stamp strokes
    thresh_center = cv2.adaptiveThreshold(center_roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 5)
    stroke_density = np.sum(thresh_center > 0) / (thresh_center.shape[0] * thresh_center.shape[1])
    
    # Base shape: check if center ROI has oval/circular unglazed background with low gradient variance outside marks
    center_lap_var = cv2.Laplacian(center_roi, cv2.CV_64F).var()

    # 2. Foreground segmentation
    blurred = cv2.GaussianBlur(gray, (25, 25), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    border = np.concatenate([thresh[0, :], thresh[-1, :], thresh[:, 0], thresh[:, -1]])
    if np.mean(border) > 128:
        thresh = cv2.bitwise_not(thresh)
        
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        valid_c = [c for c in contours if cv2.contourArea(c) > (w * h * 0.02)]
        if valid_c:
            all_pts = np.concatenate(valid_c)
            bx, by, bw, bh = cv2.boundingRect(all_pts)
        else:
            bx, by, bw, bh = 0, 0, w, h
    else:
        bx, by, bw, bh = 0, 0, w, h

    top_norm = by / h
    bot_norm = (by + bh) / h
    height_norm = bh / h
    width_norm = bw / w
    
    # 3. Torso Detail vs Full Body scoring:
    # Full body covers top to bottom (> 75% height) and reaches near bottom (bot_norm > 0.82)
    is_full_body = (height_norm > 0.70) and (bot_norm > 0.80) and (top_norm < 0.25)
    
    # Detail / Close-up: focuses on upper half or specific region, or top_norm is significant, or bot_norm doesn't reach bottom
    is_close_up = (not is_full_body) or (height_norm < 0.65) or (top_norm > 0.20 and bot_norm > 0.90)

    # 4. Color & Texture asymmetry (Front vs Back vs Profile):
    # In Venus:
    # Front has face (skin tone) + white dove + dark glazed hair highlights + terracotta amphora
    # Back has massive dark brown hair cascade + uniform rear drapery folds + brick well
    # Profile has prominent amphora jar on one lateral side
    
    # Skin tone mask in HSV: H in [0, 25], S in [20, 150], V in [80, 240]
    skin_mask = cv2.inRange(hsv, np.array([0, 15, 60]), np.array([25, 160, 240]))
    skin_ratio = np.sum(skin_mask > 0) / (w * h)
    
    # Dark glazed hair mask: V < 50
    hair_mask = cv2.inRange(hsv, np.array([0, 0, 0]), np.array([180, 255, 55]))
    hair_ratio = np.sum(hair_mask > 0) / (w * h)
    
    # Pure white (dove / gloss highlight): S < 25, V > 220
    white_mask = cv2.inRange(hsv, np.array([0, 0, 220]), np.array([180, 30, 255]))
    white_ratio = np.sum(white_mask > 0) / (w * h)

    # Lateral centroid offset (asymmetry for profile)
    M = cv2.moments(thresh)
    if M["m00"] > 0:
        cx_norm = (M["m10"] / M["m00"]) / w
    else:
        cx_norm = 0.5

    return {
        "file": os.path.basename(fpath),
        "is_full_body": is_full_body,
        "is_close_up": is_close_up,
        "height_norm": round(height_norm, 3),
        "top_norm": round(top_norm, 3),
        "bot_norm": round(bot_norm, 3),
        "blue_pixels": int(blue_pixels),
        "stroke_density": round(stroke_density, 3),
        "center_lap": round(center_lap_var, 1),
        "skin_ratio": round(skin_ratio * 100, 2),
        "hair_ratio": round(hair_ratio * 100, 2),
        "white_ratio": round(white_ratio * 100, 2),
        "cx_norm": round(cx_norm, 3)
    }

venus_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
files = sorted([f for f in os.listdir(venus_dir) if f.endswith(('.jpg', '.jpeg', '.png')) and not os.path.isdir(os.path.join(venus_dir, f))])

print(f"{'File':<36} | {'Full?':<5} | {'H_norm':<6} | {'Top':<5} | {'Bot':<5} | {'BluePx':<7} | {'Skin%':<6} | {'Hair%':<6} | {'White%':<6} | {'Cx':<5}")
print("-" * 110)

for f in files:
    fpath = os.path.join(venus_dir, f)
    st = extract_angle_features(fpath)
    print(f"{st['file']:<36} | {str(st['is_full_body']):<5} | {st['height_norm']:<6} | {st['top_norm']:<5} | {st['bot_norm']:<5} | {st['blue_pixels']:<7} | {st['skin%'] if 'skin%' in st else st['skin_ratio']:<6} | {st['hair_ratio']:<6} | {st['white_ratio']:<6} | {st['cx_norm']:<5}")
