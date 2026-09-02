import os
from PIL import Image

src_path = r"C:\Users\황태민\.gemini\antigravity\brain\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\elemental_app_icon_1786962763593.jpg"
img = Image.open(src_path).convert("RGBA")

# Public icons
img.save(r"public\app-icon.png", "PNG")
img.resize((192, 192), Image.Resampling.LANCZOS).save(r"public\icon-192.png", "PNG")
img.resize((512, 512), Image.Resampling.LANCZOS).save(r"public\icon-512.png", "PNG")

# Android mipmaps
sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

base_res = r"android\app\src\main\res"
for folder, sz in sizes.items():
    folder_path = os.path.join(base_res, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    resized = img.resize((sz, sz), Image.Resampling.LANCZOS)
    resized.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
    resized.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
    
    # Foreground icon for adaptive icon (scaled to 108x108 base ratio with padding)
    fg_size = int(sz * 1.5)
    fg_img = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
    paste_pos = ((fg_size - sz) // 2, (fg_size - sz) // 2)
    fg_img.paste(resized, paste_pos)
    fg_img.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")

print("All icons successfully converted to valid PNGs!")
