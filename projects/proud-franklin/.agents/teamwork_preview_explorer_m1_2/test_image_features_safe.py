import os
import cv2
import numpy as np
from PIL import Image, ImageOps

def read_image_safe(fpath):
    """Safely read image on Windows handling Unicode paths and EXIF rotation."""
    with Image.open(fpath) as img:
        img_transposed = ImageOps.exif_transpose(img)
        rgb = img_transposed.convert('RGB')
        arr = np.array(rgb)
        bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
        return img_transposed, bgr

venus_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
files = sorted([f for f in os.listdir(venus_dir) if f.endswith(('.jpg', '.jpeg', '.png')) and not os.path.isdir(os.path.join(venus_dir, f))])

print(f"Testing safe read on {len(files)} files:")

for idx, f in enumerate(files):
    fpath = os.path.join(venus_dir, f)
    pil_img, bgr_img = read_image_safe(fpath)
    w, h = pil_img.size
    
    gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
    
    # 1. Edge density
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (w * h)
    
    # 2. Laplacian variance (sharpness / texture detail)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # 3. Center crop Laplacian (Backstamp or Macro detail)
    center_crop = gray[int(h*0.25):int(h*0.75), int(w*0.25):int(w*0.75)]
    center_lap_var = cv2.Laplacian(center_crop, cv2.CV_64F).var()
    
    # 4. Color distribution: HSV / LAB
    # Gres terracotta vs white porcelain vs dark hair
    hsv = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2HSV)
    # Check for blue stamp color (Lladró bellflower mark is cobalt blue in Backstamp!)
    # Blue in HSV: H between 95 and 135, S > 50, V > 50
    blue_mask = cv2.inRange(hsv, np.array([95, 50, 50]), np.array([135, 255, 255]))
    blue_pixel_count = np.sum(blue_mask > 0)
    blue_ratio = blue_pixel_count / (w * h)
    
    # 5. Foreground Object Bounding Box
    # Background in photo is warm beige/grey or dark table
    # Let's compute vertical span of non-background
    blurred = cv2.GaussianBlur(gray, (25, 25), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    edge_pixels = np.concatenate([thresh[0, :], thresh[-1, :], thresh[:, 0], thresh[:, -1]])
    if np.mean(edge_pixels) > 128:
        thresh = cv2.bitwise_not(thresh)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest_c = max(contours, key=cv2.contourArea)
        bx, by, bw, bh = cv2.boundingRect(largest_c)
        span_top = by / h
        span_bot = (by + bh) / h
        span_h = bh / h
        span_w = bw / w
    else:
        span_top, span_bot, span_h, span_w = 0, 1, 1, 1

    # 6. Upper vs Lower mass center / vertical symmetry
    # Torso vs Full body:
    # In full body: object spans from near top to near bottom (span_h > 0.80, span_bot > 0.85)
    # In torso detail: object may be zoomed in, span_h > 0.75 but span_bot is cut off at waist, or face is high resolution
    
    print(f"[{idx+1:02d}] {f}")
    print(f"     Size: {w}x{h} | BlueRatio: {blue_ratio*100:.3f}% ({blue_pixel_count} px) | LapVar: {laplacian_var:.1f}")
    print(f"     Span: H={span_h:.2f} (top={span_top:.2f}, bot={span_bot:.2f}), W={span_w:.2f}")
