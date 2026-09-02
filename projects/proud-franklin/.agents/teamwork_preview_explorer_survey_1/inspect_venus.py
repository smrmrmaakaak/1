import os
import json
from PIL import Image

venus_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
studio_dir = os.path.join(venus_dir, "studio_master")
assets_gres_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\assets\lladro_gres"
lladro_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro"

def get_file_info(fpath):
    with Image.open(fpath) as img:
        w, h = img.size
        size_bytes = os.path.getsize(fpath)
        return {
            "path": fpath,
            "filename": os.path.basename(fpath),
            "width": w,
            "height": h,
            "aspect": f"{w}x{h} ({w/h:.3f})",
            "size_kb": round(size_bytes / 1024, 1),
            "format": img.format,
            "mode": img.mode
        }

print("=== Raw Lladro Gres Venus Photos in public/artifacts/lladro_gres_venus ===")
for f in sorted(os.listdir(venus_dir)):
    if f.lower().endswith(('.jpg', '.png')):
        fp = os.path.join(venus_dir, f)
        info = get_file_info(fp)
        print(f"{info['filename']}: {info['aspect']}, {info['size_kb']} KB")

print("\n=== Studio Master Photos in public/artifacts/lladro_gres_venus/studio_master ===")
for f in sorted(os.listdir(studio_dir)):
    if f.lower().endswith(('.jpg', '.png')):
        fp = os.path.join(studio_dir, f)
        info = get_file_info(fp)
        print(f"{info['filename']}: {info['aspect']}, {info['size_kb']} KB")

print("\n=== Assets in public/assets/lladro_gres ===")
for f in sorted(os.listdir(assets_gres_dir)):
    if f.lower().endswith(('.jpg', '.png')):
        fp = os.path.join(assets_gres_dir, f)
        info = get_file_info(fp)
        print(f"{info['filename']}: {info['aspect']}, {info['size_kb']} KB")

print("\n=== Artifacts in public/artifacts/lladro ===")
for f in sorted(os.listdir(lladro_dir)):
    if f.lower().endswith(('.jpg', '.png')):
        fp = os.path.join(lladro_dir, f)
        info = get_file_info(fp)
        print(f"{info['filename']}: {info['aspect']}, {info['size_kb']} KB")
