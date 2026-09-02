import os
import shutil

src_dir = r"C:\Users\황태민\.gemini\antigravity\brain\1f09cebe-5429-4ca2-82ed-3a8981220b8f"
dest_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro"

os.makedirs(dest_dir, exist_ok=True)

files = [
    ("lladro_01_front_1788180923757.jpg", "lladro_studio_01.jpg"),
    ("lladro_02_threequarter_1788180955266.jpg", "lladro_studio_02.jpg"),
    ("lladro_03_profile_1788180989047.jpg", "lladro_studio_03.jpg"),
    ("lladro_04_back_1788181032027.jpg", "lladro_studio_04.jpg"),
    ("lladro_05_salon_1788181060402.jpg", "lladro_studio_05.jpg")
]

for src_name, dest_name in files:
    src_path = os.path.join(src_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
        print(f"[+] Copied {src_name} -> {dest_path}")
    else:
        print(f"[!] File not found: {src_path}")

print("Done copying studio assets!")
