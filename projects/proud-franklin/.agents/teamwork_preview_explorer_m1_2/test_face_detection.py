import os
import cv2
import numpy as np
from PIL import Image, ImageOps

cascade_dir = cv2.data.haarcascades
face_cascade = cv2.CascadeClassifier(os.path.join(cascade_dir, 'haarcascade_frontalface_default.xml'))
profile_cascade = cv2.CascadeClassifier(os.path.join(cascade_dir, 'haarcascade_profileface.xml'))

venus_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
files = sorted([f for f in os.listdir(venus_dir) if f.endswith(('.jpg', '.jpeg', '.png')) and not os.path.isdir(os.path.join(venus_dir, f))])

for idx, f in enumerate(files):
    fpath = os.path.join(venus_dir, f)
    with Image.open(fpath) as img:
        img_trans = ImageOps.exif_transpose(img)
        rgb = img_trans.convert('RGB')
        arr = np.array(rgb)
        bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        
        # Resize for faster cascade detection
        scale = 1000 / max(gray.shape)
        small_gray = cv2.resize(gray, (int(gray.shape[1] * scale), int(gray.shape[0] * scale)))
        
        frontal_faces = face_cascade.detectMultiScale(small_gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
        profile_faces = profile_cascade.detectMultiScale(small_gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
        
        # Flipped for profile right/left
        flipped_gray = cv2.flip(small_gray, 1)
        flipped_profiles = profile_cascade.detectMultiScale(flipped_gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
        
        print(f"[{idx+1:02d}] {f}: Frontal={len(frontal_faces)}, Profile={len(profile_faces)}, FlipProfile={len(flipped_profiles)}")
