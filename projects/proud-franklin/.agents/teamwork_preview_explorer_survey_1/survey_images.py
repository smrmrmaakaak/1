import os
import sys
import json
import glob
from PIL import Image, ImageStat

def analyze_image(path):
    try:
        file_size = os.path.getsize(path)
        with Image.open(path) as img:
            w, h = img.size
            format_name = img.format
            mode = img.mode
            
            # Fast thumbnail for color/brightness stats
            thumb = img.copy()
            thumb.thumbnail((120, 120))
            thumb_rgb = thumb.convert('RGB')
            tw, th = thumb_rgb.size
            
            stat = ImageStat.Stat(thumb_rgb)
            mean_rgb = stat.mean
            brightness = 0.299 * mean_rgb[0] + 0.587 * mean_rgb[1] + 0.114 * mean_rgb[2]
            
            # Sample corners
            corners = [
                thumb_rgb.getpixel((0, 0)),
                thumb_rgb.getpixel((tw - 1, 0)),
                thumb_rgb.getpixel((0, th - 1)),
                thumb_rgb.getpixel((tw - 1, th - 1))
            ]
            bg_r = sum(c[0] for c in corners) / 4.0
            bg_g = sum(c[1] for c in corners) / 4.0
            bg_b = sum(c[2] for c in corners) / 4.0
            bg_brightness = 0.299 * bg_r + 0.587 * bg_g + 0.114 * bg_b
            
            ratio_val = w / h if h != 0 else 0
            
            # Aspect classification
            if abs(ratio_val - 1.0) < 0.05:
                ratio_desc = "1:1 (Square)"
            elif abs(ratio_val - 0.75) < 0.05:
                ratio_desc = "3:4 (Portrait)"
            elif abs(ratio_val - 0.667) < 0.05:
                ratio_desc = "2:3 (Portrait)"
            elif abs(ratio_val - 0.5625) < 0.05:
                ratio_desc = "9:16 (Portrait)"
            elif abs(ratio_val - 1.333) < 0.05:
                ratio_desc = "4:3 (Landscape)"
            elif abs(ratio_val - 1.5) < 0.05:
                ratio_desc = "3:2 (Landscape)"
            elif abs(ratio_val - 1.777) < 0.05:
                ratio_desc = "16:9 (Landscape)"
            else:
                ratio_desc = f"Custom ({ratio_val:.2f}:1)"
                
            return {
                "filename": os.path.basename(path),
                "path": path,
                "file_size_bytes": file_size,
                "file_size_kb": round(file_size / 1024, 1),
                "file_size_mb": round(file_size / (1024 * 1024), 2),
                "width": w,
                "height": h,
                "orientation": "Portrait" if h > w else ("Landscape" if w > h else "Square"),
                "aspect_ratio_val": round(ratio_val, 3),
                "aspect_ratio_desc": ratio_desc,
                "format": format_name,
                "mode": mode,
                "brightness": round(brightness, 1),
                "bg_brightness": round(bg_brightness, 1),
                "bg_avg_rgb": [round(bg_r, 1), round(bg_g, 1), round(bg_b, 1)]
            }
    except Exception as e:
        return {
            "filename": os.path.basename(path),
            "path": path,
            "error": str(e)
        }

workspace_root = r"c:\Users\황태민\Documents\antigravity\proud-franklin"
external_root = r"c:\Users\황태민\Documents\엔틱"

dirs_to_scan = [
    os.path.join(workspace_root, "public", "artifacts"),
    os.path.join(workspace_root, "public", "assets"),
    external_root
]

results = {}
total_count = 0

for scan_dir in dirs_to_scan:
    print(f"Scanning {scan_dir}...", flush=True)
    if not os.path.exists(scan_dir):
        print(f"Directory not found: {scan_dir}", flush=True)
        continue
    for root, dirs, files in os.walk(scan_dir):
        image_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.avif'))]
        if image_files:
            results[root] = []
            for f in sorted(image_files):
                full_p = os.path.join(root, f)
                info = analyze_image(full_p)
                results[root].append(info)
                total_count += 1
            print(f"  Processed {len(image_files)} images in {root}", flush=True)

out_json = os.path.join(os.path.dirname(__file__), "image_inventory.json")
with open(out_json, "w", encoding="utf-8") as fp:
    json.dump(results, fp, indent=2, ensure_ascii=False)

print(f"\nSurvey complete! Analyzed {total_count} images across {len(results)} directories.", flush=True)
