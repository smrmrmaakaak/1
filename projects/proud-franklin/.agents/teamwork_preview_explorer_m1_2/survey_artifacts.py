import os
from PIL import Image, ImageOps

artifacts_root = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts"
subdirs = [d for d in os.listdir(artifacts_root) if os.path.isdir(os.path.join(artifacts_root, d))]

print(f"Inspecting {len(subdirs)} subdirectories in public/artifacts:\n")

summary = {}

for d in sorted(subdirs):
    dir_path = os.path.join(artifacts_root, d)
    files = [f for f in os.listdir(dir_path) if f.lower().endswith(('.jpg', '.jpeg', '.png')) and not os.path.isdir(os.path.join(dir_path, f))]
    if not files:
        # check sub-subdirs e.g. studio_master
        continue
    
    orientations = {}
    resolutions = {}
    ratios = {}
    
    for f in files:
        fpath = os.path.join(dir_path, f)
        try:
            with Image.open(fpath) as img:
                w, h = img.size
                exif = img.getexif()
                orient = exif.get(0x0112, 1)
                orientations[orient] = orientations.get(orient, 0) + 1
                resolutions[f"{w}x{h}"] = resolutions.get(f"{w}x{h}", 0) + 1
                ratio_str = f"{w/h:.2f}"
                ratios[ratio_str] = ratios.get(ratio_str, 0) + 1
        except Exception as e:
            print(f"Error reading {fpath}: {e}")
            
    summary[d] = {
        "file_count": len(files),
        "resolutions": resolutions,
        "orientations": orientations,
        "ratios": ratios,
        "sample_files": files[:3]
    }

for d, info in summary.items():
    print(f"Folder: {d} ({info['file_count']} images)")
    print(f"  Resolutions: {info['resolutions']}")
    print(f"  EXIF Orientations: {info['orientations']}")
    print(f"  Aspect Ratios: {info['ratios']}")
    print(f"  Samples: {info['sample_files']}")
    print("-" * 50)
