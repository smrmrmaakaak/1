import os
from PIL import Image, ImageChops, ImageFilter
import numpy as np

raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
studio_dir = os.path.join(raw_dir, "studio_master")

raw_files = sorted([f for f in os.listdir(raw_dir) if f.startswith("KakaoTalk") and f.endswith(".jpg")])
studio_files = sorted([f for f in os.listdir(studio_dir) if f.endswith(".jpg")])

print(f"Raw files count: {len(raw_files)}")
print(f"Studio files count: {len(studio_files)}")

# Let's inspect each raw image and understand what it contains
# By looking at color regions, object positioning, etc.
for rf in raw_files:
    rp = os.path.join(raw_dir, rf)
    with Image.open(rp) as rimg:
        # get aspect ratio and general color in 3 vertical bands (top=head/upper, mid=torso/hand, bottom=base/backstamp)
        w, h = rimg.size
        rimg_rgb = rimg.convert('RGB')
        top_band = rimg_rgb.crop((w*0.2, 0, w*0.8, h*0.33))
        mid_band = rimg_rgb.crop((w*0.2, h*0.33, w*0.8, h*0.66))
        bot_band = rimg_rgb.crop((w*0.2, h*0.66, w*0.8, h))
        
        t_mean = np.mean(np.array(top_band), axis=(0,1))
        m_mean = np.mean(np.array(mid_band), axis=(0,1))
        b_mean = np.mean(np.array(bot_band), axis=(0,1))
        
        print(f"Raw: {rf} | Top RGB: {t_mean.astype(int)}, Mid RGB: {m_mean.astype(int)}, Bot RGB: {b_mean.astype(int)}")

print("\n--- Studio files ---")
for sf in studio_files:
    sp = os.path.join(studio_dir, sf)
    with Image.open(sp) as simg:
        w, h = simg.size
        print(f"Studio: {sf} -> {w}x{h}")
