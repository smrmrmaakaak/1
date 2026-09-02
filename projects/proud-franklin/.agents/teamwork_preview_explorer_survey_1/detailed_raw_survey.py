import os
from PIL import Image, ImageFilter
import numpy as np

raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
files = sorted([f for f in os.listdir(raw_dir) if f.startswith("KakaoTalk") and f.endswith(".jpg")])

print("Detailed Breakdown of 13 Raw Photos for Lladro Gres Venus #2256:\n")

for idx, fname in enumerate(files):
    fpath = os.path.join(raw_dir, fname)
    with Image.open(fpath) as img:
        w, h = img.size
        # Extract color statistics of central subject vs background
        rgb = img.convert('RGB')
        arr = np.array(rgb)
        
        # Center crop (subject core)
        center = arr[int(h*0.3):int(h*0.7), int(w*0.3):int(w*0.7)]
        c_mean = np.mean(center, axis=(0,1))
        
        # Background corners
        tl = arr[0:50, 0:50]
        tr = arr[0:50, w-50:w]
        bl = arr[h-50:h, 0:50]
        br = arr[h-50:h, w-50:w]
        bg_mean = (np.mean(tl, axis=(0,1)) + np.mean(tr, axis=(0,1)) + np.mean(bl, axis=(0,1)) + np.mean(br, axis=(0,1))) / 4.0
        
        # Upper crop (head/face/torso or top of item)
        upper = arr[int(h*0.05):int(h*0.3), int(w*0.25):int(w*0.75)]
        u_mean = np.mean(upper, axis=(0,1))
        
        # Lower crop (base/legs/pedestal/backstamp)
        lower = arr[int(h*0.7):int(h*0.95), int(w*0.25):int(w*0.75)]
        l_mean = np.mean(lower, axis=(0,1))
        
        print(f"[{idx+1:02d}] {fname}")
        print(f"     Resolution: {w}x{h} ({w/h:.3f}) | Size: {os.path.getsize(fpath)/1024:.1f} KB")
        print(f"     Center RGB: {c_mean.astype(int)} | BG RGB: {bg_mean.astype(int)}")
        print(f"     Upper RGB: {u_mean.astype(int)} | Lower RGB: {l_mean.astype(int)}")
