import os
import json
import numpy as np
from PIL import Image, ImageOps
import cv2

manifest_path = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus\classification_manifest.json"
with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

print("=== MANIFEST PRODUCT SUMMARY ===")
print("Product:", manifest["product"]["id"], "-", manifest["product"]["koreanTitle"])
print("Material:", manifest["product"]["materialType"])

for angle_name, angle_data in manifest["classifiedAngles"].items():
    rel_path = angle_data["source"]["relativePath"]
    full_path = os.path.join(r"c:\Users\황태민\Documents\antigravity\proud-franklin", rel_path)
    img = Image.open(full_path)
    img_exif = ImageOps.exif_transpose(img)
    arr = np.array(img_exif)
    
    print(f"\n--- {angle_name} ---")
    print(f"Source file: {angle_data['source']['filename']}")
    print(f"Dimensions: {arr.shape[1]}x{arr.shape[0]}, Channels: {arr.shape[2] if len(arr.shape) > 2 else 1}")
    print(f"Matting Required: {angle_data['enhancementDirectives']['mattingRequired']}")
    print(f"Preserve Authentic Frame: {angle_data['enhancementDirectives']['preserveAuthenticFrame']}")
    
    # Analyze background corners (top-left, top-right, bottom-left, bottom-right)
    h, w = arr.shape[:2]
    tl = arr[0:50, 0:50].mean(axis=(0, 1))
    tr = arr[0:50, w-50:w].mean(axis=(0, 1))
    bl = arr[h-50:h, 0:50].mean(axis=(0, 1))
    br = arr[h-50:h, w-50:w].mean(axis=(0, 1))
    center = arr[h//3:2*h//3, w//3:2*w//3].mean(axis=(0, 1))
    
    print(f"Corner Colors (RGB): TL={tl.round(1)}, TR={tr.round(1)}, BL={bl.round(1)}, BR={br.round(1)}")
    print(f"Center Color (RGB): {center.round(1)}")
