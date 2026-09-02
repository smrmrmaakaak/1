import os
from PIL import Image

entic_dir = r"c:\Users\황태민\Documents\엔틱"
new_photos = [f for f in sorted(os.listdir(entic_dir)) if f.startswith("KakaoTalk_20260902") and f.endswith(".jpg")]

print(f"=== New Raw Photos in Documents/엔틱 ({len(new_photos)} files) ===")
for np_file in new_photos:
    p = os.path.join(entic_dir, np_file)
    with Image.open(p) as img:
        w, h = img.size
        print(f"{np_file}: {w}x{h} ({w/h:.3f}), {os.path.getsize(p)/1024:.1f} KB, format: {img.format}, mode: {img.mode}")
