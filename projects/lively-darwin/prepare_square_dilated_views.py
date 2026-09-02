import os
import numpy as np
import scipy.ndimage as ndi
from PIL import Image

def process_view(in_path, out_path, size=2048):
    img = Image.open(in_path)
    # Fit into size x size with aspect ratio preserved
    w, h = img.size
    scale = (size * 0.88) / max(w, h)
    new_w, new_h = int(w * scale), int(h * scale)
    img_resized = img.resize((new_w, new_h), Image.LANCZOS)
    
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad_x = (size - new_w) // 2
    pad_y = (size - new_h) // 2
    canvas.paste(img_resized, (pad_x, pad_y))
    
    rgba = np.array(canvas).astype(np.float32) / 255.0
    rgb = rgba[:, :, :3]
    alpha = rgba[:, :, 3]
    valid_mask = (alpha > 0.05).astype(np.uint8)
    
    # Distance transform dilation to fill entire canvas with matching border colors
    dist, indices = ndi.distance_transform_edt(1 - valid_mask, return_indices=True)
    dilated_rgb = rgb[indices[0], indices[1]]
    
    out_img = Image.fromarray((dilated_rgb * 255.0).clip(0, 255).astype(np.uint8))
    out_img.save(out_path)
    print(f"Saved solid dilated square view: {out_path}")

in_dir = "multiview_clean"
out_dir = "multiview_square"
os.makedirs(out_dir, exist_ok=True)

views = [
    ("20260829_115307_clean.png", "front_square.png"),
    ("20260829_115346_clean.png", "right_square.png"),
    ("20260829_115417_clean.png", "back_square.png"),
    ("20260829_115408_clean.png", "left_square.png"),
    ("20260829_115334_clean.png", "front_right_square.png"),
    ("20260829_115401_clean.png", "front_left_square.png"),
]

for in_f, out_f in views:
    process_view(os.path.join(in_dir, in_f), os.path.join(out_dir, out_f))
print("All views prepared successfully!")
