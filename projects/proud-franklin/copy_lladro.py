import os
import shutil
from PIL import Image

src_dir = r"c:\Users\황태민\Documents\엔틱\스페인 야드로 나오"
dest_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro"

os.makedirs(dest_dir, exist_ok=True)

files = sorted([f for f in os.listdir(src_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

print(f"Found {len(files)} image files in {src_dir}:")
for idx, f in enumerate(files):
    full_path = os.path.join(src_dir, f)
    with Image.open(full_path) as img:
        print(f"[{idx+1}] {f} - Size: {img.size}, Mode: {img.mode}")
        # Save optimized copy into public/artifacts/lladro
        dest_filename = f"lladro_{idx+1:02d}.jpg"
        dest_path = os.path.join(dest_dir, dest_filename)
        # Convert RGBA to RGB if needed
        rgb_img = img.convert('RGB')
        rgb_img.save(dest_path, quality=92, optimize=True)
        print(f"    -> Copied to {dest_filename}")

print("\nDone copying all lladro images!")
