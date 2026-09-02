import os
import glob
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import torch
import rembg
from transformers import pipeline
import scipy.ndimage as ndi

print("=== STARTING 2.5D HIGH-RESOLUTION DEPTH & NORMAL MAP GENERATION ===")
device = 0 if torch.cuda.is_available() else -1

print("Loading Depth-Anything-V2-Base model...")
pipe = pipeline(task="depth-estimation", model="depth-anything/Depth-Anything-V2-Base-hf", device=device)

in_photos_dir = "photos_oriented"
out_25d_dir = "depth_2_5d"
os.makedirs(out_25d_dir, exist_ok=True)

# Select key photos
photo_files = sorted(glob.glob(os.path.join(in_photos_dir, "*.jpg")))

rembg_session = rembg.new_session()

def compute_normal_from_depth(depth_np, strength=2.0):
    # depth_np is (H, W) float in [0, 1]
    # Sobel gradients
    sobel_x = ndi.sobel(depth_np, axis=1) * strength
    sobel_y = ndi.sobel(depth_np, axis=0) * strength
    
    # Normal vector (-dz/dx, -dz/dy, 1)
    nx = -sobel_x
    ny = -sobel_y
    nz = np.ones_like(depth_np)
    
    norm = np.sqrt(nx**2 + ny**2 + nz**2) + 1e-6
    nx /= norm
    ny /= norm
    nz /= norm
    
    # Map from [-1, 1] to [0, 255]
    r = ((nx * 0.5 + 0.5) * 255).astype(np.uint8)
    g = ((ny * 0.5 + 0.5) * 255).astype(np.uint8)
    b = ((nz * 0.5 + 0.5) * 255).astype(np.uint8)
    
    return np.stack([r, g, b], axis=-1)

items_meta = []

for idx, p_path in enumerate(photo_files):
    basename = os.path.splitext(os.path.basename(p_path))[0]
    print(f"Processing photo {idx+1}/{len(photo_files)}: {basename}...")
    
    # 1. Load raw photo and orient
    raw_img = Image.open(p_path)
    raw_img = ImageOps.exif_transpose(raw_img)
    
    # Resize max dimension to 2048 for silky smooth performance and crisp detail
    w, h = raw_img.size
    max_dim = 2048
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        raw_img = raw_img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    
    # 2. Extract clean alpha mask
    nobg = rembg.remove(raw_img, session=rembg_session)
    alpha = np.array(nobg)[:, :, 3]
    mask = (alpha > 50).astype(np.float32)
    # Smooth mask edges slightly
    mask_blurred = ndi.gaussian_filter(mask, sigma=1.5)
    
    # 3. Depth Estimation with Depth-Anything-V2
    depth_res = pipe(raw_img)
    depth_pil = depth_res["depth"]
    depth_pil = depth_pil.resize(raw_img.size, Image.LANCZOS)
    depth_np = np.array(depth_pil).astype(np.float32)
    
    # Normalize depth so object is in foreground [0.3 ~ 1.0] and background is 0.0
    obj_depth = depth_np * mask_blurred
    if obj_depth.max() > obj_depth.min():
        obj_depth_norm = (obj_depth - obj_depth.min()) / (obj_depth.max() - obj_depth.min() + 1e-6)
    else:
        obj_depth_norm = obj_depth
        
    final_depth = (obj_depth_norm * 0.8 + 0.2) * mask_blurred
    final_depth_img = Image.fromarray((final_depth * 255.0).astype(np.uint8))
    
    # 4. Generate Normal Map from Depth
    normal_np = compute_normal_from_depth(final_depth, strength=4.0)
    normal_img = Image.fromarray(normal_np)
    
    # 5. Save outputs
    out_color = os.path.join(out_25d_dir, f"color_{idx:02d}.png")
    out_depth = os.path.join(out_25d_dir, f"depth_{idx:02d}.png")
    out_normal = os.path.join(out_25d_dir, f"normal_{idx:02d}.png")
    out_rgba = os.path.join(out_25d_dir, f"rgba_{idx:02d}.png")
    
    # Color image
    raw_img.save(out_color, "PNG", optimize=True)
    # Depth image
    final_depth_img.save(out_depth, "PNG")
    # Normal image
    normal_img.save(out_normal, "PNG")
    # Cutout RGBA
    nobg.save(out_rgba, "PNG")
    
    items_meta.append({
        "id": idx,
        "name": basename,
        "color": f"depth_2_5d/color_{idx:02d}.png",
        "depth": f"depth_2_5d/depth_{idx:02d}.png",
        "normal": f"depth_2_5d/normal_{idx:02d}.png",
        "rgba": f"depth_2_5d/rgba_{idx:02d}.png",
        "width": raw_img.width,
        "height": raw_img.height,
    })
    print(f"Generated 2.5D dataset for photo {idx:02d} ({raw_img.width}x{raw_img.height})")

import json
meta_path = os.path.join(out_25d_dir, "manifest.json")
with open(meta_path, "w", encoding="utf-8") as f:
    json.dump(items_meta, f, indent=2)

print(f"=== ALL {len(items_meta)} PHOTOS 2.5D PROCESSED SUCCESSFULLY ===")
