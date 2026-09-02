import os
import numpy as np
from PIL import Image

studio_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus\studio_master"
files = [
    "venus_01_hero_front.jpg",
    "venus_02_side_profile.jpg",
    "venus_03_portrait_torso.jpg",
    "venus_04_rear_sculpture.jpg",
    "venus_05_backstamp.jpg"
]

for f in files:
    path = os.path.join(studio_dir, f)
    if os.path.exists(path):
        img = Image.open(path)
        arr = np.array(img)
        print(f"File: {f}")
        print(f"  Dimensions: {img.size} (W x H), Format: {img.format}, Mode: {img.mode}")
        print(f"  Size on disk: {os.path.getsize(path):,} bytes")
        # Check corner colors (backdrop)
        tl = arr[0:20, 0:20].mean(axis=(0, 1))
        center = arr[img.size[1]//2-10:img.size[1]//2+10, img.size[0]//2-10:img.size[0]//2+10].mean(axis=(0, 1))
        print(f"  TL color: {tl.round(1)}, Center color: {center.round(1)}")
    else:
        print(f"File NOT found: {f}")
