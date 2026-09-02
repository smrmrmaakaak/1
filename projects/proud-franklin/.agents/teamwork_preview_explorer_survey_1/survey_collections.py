import os
import json

entic_root = r"c:\Users\황태민\Documents\엔틱"
artifacts_root = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts"

print("=== Inventory of all 9 Collections in Documents/엔틱 ===")
for folder in sorted(os.listdir(entic_root)):
    fpath = os.path.join(entic_root, folder)
    if os.path.isdir(fpath):
        subdirs = [d for d in os.listdir(fpath) if os.path.isdir(os.path.join(fpath, d))]
        files = [f for f in os.listdir(fpath) if os.path.isfile(os.path.join(fpath, f))]
        print(f"\n[Collection] {folder}")
        if subdirs:
            for sd in sorted(subdirs):
                sd_path = os.path.join(fpath, sd)
                img_count = len([f for f in os.listdir(sd_path) if f.lower().endswith(('.jpg', '.png'))])
                has_txt = os.path.exists(os.path.join(sd_path, "제품설명_감정서.txt"))
                print(f"   ├── {sd} ({img_count} images, appraisal text: {has_txt})")
        else:
            img_count = len([f for f in files if f.lower().endswith(('.jpg', '.png'))])
            print(f"   └── (Direct files: {img_count} images, {len(files)} total files)")

print("\n=== Inventory of public/artifacts ===")
for folder in sorted(os.listdir(artifacts_root)):
    fpath = os.path.join(artifacts_root, folder)
    if os.path.isdir(fpath):
        imgs = [f for f in os.listdir(fpath) if f.lower().endswith(('.jpg', '.png'))]
        subdirs = [d for d in os.listdir(fpath) if os.path.isdir(os.path.join(fpath, d))]
        print(f"public/artifacts/{folder}: {len(imgs)} images, subdirs: {subdirs}")
    elif os.path.isfile(fpath) and fpath.lower().endswith(('.jpg', '.png')):
        print(f"public/artifacts/{folder} (Single Image): {os.path.getsize(fpath)/1024:.1f} KB")
