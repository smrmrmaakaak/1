import os
import cv2
import numpy as np
from PIL import Image, ImageOps, ExifTags

venus_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
files = sorted([f for f in os.listdir(venus_dir) if f.endswith(('.jpg', '.jpeg', '.png')) and not os.path.isdir(os.path.join(venus_dir, f))])

print(f"Found {len(files)} files in {venus_dir}:")

for idx, f in enumerate(files):
    fpath = os.path.join(venus_dir, f)
    # PIL read & EXIF
    with Image.open(fpath) as img:
        w, h = img.size
        exif = img.getexif()
        exif_orientation = exif.get(0x0112, None)
        transposed = ImageOps.exif_transpose(img)
        tw, th = transposed.size
    
    # OpenCV read
    cv_img = cv2.imread(fpath)
    if cv_img is None:
        print(f"[{idx+1}] {f}: FAILED TO READ WITH CV2")
        continue
    
    # Analyze image features:
    # 1. Color stats (mean, std in LAB / HSV)
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    
    # 2. Edge density (Canny)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (w * h)
    
    # 3. Simple thresholding / foreground bounding box
    # Blur and Otsu threshold to separate foreground subject from backdrop
    blurred = cv2.GaussianBlur(gray, (21, 21), 0)
    # Backdrop is generally darker or lighter than object
    # Let's find contours of foreground
    # In studio/room shots, background is often wall or table
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # Invert if edges of image are white
    edge_pixels = np.concatenate([thresh[0, :], thresh[-1, :], thresh[:, 0], thresh[:, -1]])
    if np.mean(edge_pixels) > 128:
        thresh = cv2.bitwise_not(thresh)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest_c = max(contours, key=cv2.contourArea)
        bx, by, bw, bh = cv2.boundingRect(largest_c)
        bbox_height_ratio = bh / h
        bbox_width_ratio = bw / w
        bbox_y_top = by / h
        bbox_y_bottom = (by + bh) / h
    else:
        bx, by, bw, bh = 0, 0, w, h
        bbox_height_ratio, bbox_width_ratio, bbox_y_top, bbox_y_bottom = 1.0, 1.0, 0.0, 1.0

    # 4. Text / High-frequency local contrast detection (Backstamp hallmark indicator)
    # High frequency in center region vs whole image
    center_crop = gray[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]
    laplacian_var = cv2.Laplacian(center_crop, cv2.CV_64F).var()

    print(f"[{idx+1:02d}] {f}")
    print(f"     Size: {w}x{h} (EXIF orient: {exif_orientation}) | EdgeDens: {edge_density*100:.2f}% | LapVar: {laplacian_var:.1f}")
    print(f"     BBox: h_ratio={bbox_height_ratio:.2f}, w_ratio={bbox_width_ratio:.2f}, top={bbox_y_top:.2f}, bot={bbox_y_bottom:.2f}")
