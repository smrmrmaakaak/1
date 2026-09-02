import os
from PIL import Image, ImageStat
import numpy as np

entic_dir = r"c:\Users\황태민\Documents\엔틱"
new_photos = [f for f in sorted(os.listdir(entic_dir)) if f.startswith("KakaoTalk_20260902") and f.endswith(".jpg")]

# Group by timestamp prefix
batches = {}
for p in new_photos:
    prefix = p.split("_")[1] + "_" + p.split("_")[2].split(".")[0]
    batches.setdefault(prefix, []).append(p)

print("=== New Photo Batches in Documents/엔틱 ===")
for prefix, plist in batches.items():
    print(f"\nBatch {prefix} ({len(plist)} photos):")
    for f in plist:
        fp = os.path.join(entic_dir, f)
        with Image.open(fp) as img:
            w, h = img.size
            # get average color and orientation
            thumb = img.copy()
            thumb.thumbnail((100, 100))
            stat = ImageStat.Stat(thumb)
            mean_rgb = [round(x, 1) for x in stat.mean]
            print(f"  - {f}: {w}x{h}, Mean RGB: {mean_rgb}")
