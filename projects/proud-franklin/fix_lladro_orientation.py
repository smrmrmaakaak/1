import os
from PIL import Image

dest_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro"

for i in range(1, 13):
    img_path = os.path.join(dest_dir, f"lladro_{i:02d}.jpg")
    if not os.path.exists(img_path):
        continue
    with Image.open(img_path) as img:
        w, h = img.size
        # If landscape (width > height), rotate 270 degrees (which is 90 deg CCW) so head is on top
        if w > h:
            rotated = img.rotate(270, expand=True)
            rotated.save(img_path, quality=94, optimize=True)
            print(f"[+] Rotated lladro_{i:02d}.jpg from {w}x{h} to {rotated.size}")
        else:
            print(f"[-] lladro_{i:02d}.jpg is already portrait: {w}x{h}")

print("\nDone adjusting orientations!")
