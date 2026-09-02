import os
import sys
import time
import math
import numpy as np
import scipy.ndimage as ndi
from PIL import Image, ImageOps
import rembg
import torch
import xatlas

# Add triposr path
sys.path.append(os.path.join(os.path.dirname(__file__), "triposr"))
from tsr.system import TSR
from tsr.utils import remove_background, resize_foreground
from tsr.bake_texture import bake_texture

print("=== STARTING ULTRA-HIGH FIDELITY PHOTOREALISTIC 3D RECONSTRUCTION ===")
device = "cuda:0" if torch.cuda.is_available() else "cpu"
print(f"Device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")

input_img_path = os.path.join(os.path.dirname(__file__), "photos_oriented", "20260829_115307.jpg")
output_dir = "master_output"
os.makedirs(output_dir, exist_ok=True)

# 1. Clean Background & Center Foreground
print("1. Removing background and optimizing silhouette...")
raw_img = Image.open(input_img_path)
raw_img = ImageOps.exif_transpose(raw_img)

rembg_session = rembg.new_session()
img_nobg = remove_background(raw_img, rembg_session)
img_resized = resize_foreground(img_nobg, 0.88)

# Composite on neutral gray background
img_np = np.array(img_resized).astype(np.float32) / 255.0
if img_np.shape[-1] == 4:
    img_comp = img_np[:, :, :3] * img_np[:, :, 3:4] + (1.0 - img_np[:, :, 3:4]) * 0.5
else:
    img_comp = img_np[:, :, :3]

processed_pil = Image.fromarray((img_comp * 255.0).astype(np.uint8))
processed_path = os.path.join(output_dir, "input_clean.png")
processed_pil.save(processed_path)
print(f"Saved preprocessed image: {processed_path}")

# 2. Neural 3D Field Inference
print("2. Running TripoSR Neural 3D Inference on RTX 4050...")
model = TSR.from_pretrained(
    "stabilityai/TripoSR",
    config_name="config.yaml",
    weight_name="model.ckpt",
)
model.renderer.set_chunk_size(8192)
model.to(device)

t0 = time.time()
with torch.no_grad():
    scene_codes = model([processed_pil], device=device)
print(f"Neural inference completed in {time.time() - t0:.2f}s")

# 3. High-Resolution Surface Extraction (256 Grid)
print("3. Extracting high-resolution continuous surface mesh...")
t1 = time.time()
meshes = model.extract_mesh(scene_codes, True, resolution=256)
mesh = meshes[0]
print(f"Mesh extracted: {len(mesh.vertices)} vertices, {len(mesh.faces)} faces in {time.time() - t1:.2f}s")

# 4. Bake High-Resolution Texture Atlas (4096x4096)
print("4. Baking 4096x4096 PBR Texture Atlas...")
t2 = time.time()
bake_output = bake_texture(mesh, model, scene_codes[0], texture_resolution=4096)

out_mesh_obj = os.path.join(output_dir, "antique_neural.obj")
out_texture_png = os.path.join(output_dir, "antique_neural_diffuse.png")
out_mtl = os.path.join(output_dir, "antique_neural.mtl")

# Margin dilation on raw colors to remove any chart seams
rgba = bake_output["colors"] # (H, W, 4)
rgb = rgba[:, :, :3]
alpha = rgba[:, :, 3]
valid_mask = (alpha > 0.1).astype(np.uint8)

dist, indices = ndi.distance_transform_edt(1 - valid_mask, return_indices=True)
dilated_rgb = rgb[indices[0], indices[1]]

# Save Texture (Flipped as required by xatlas UVs)
tex_img = Image.fromarray((dilated_rgb * 255.0).clip(0, 255).astype(np.uint8)).transpose(Image.FLIP_TOP_BOTTOM)
tex_img.save(out_texture_png)

# Export OBJ using relative path for xatlas Unicode safety
xatlas.export(
    out_mesh_obj,
    mesh.vertices[bake_output["vmapping"]],
    bake_output["indices"],
    bake_output["uvs"],
    mesh.vertex_normals[bake_output["vmapping"]]
)

# Append MTL declaration to OBJ
with open(out_mesh_obj, "r", encoding="utf-8") as f:
    obj_content = f.read()

with open(out_mesh_obj, "w", encoding="utf-8") as f:
    f.write("mtllib antique_neural.mtl\nusemtl Mat_Porcelain\n" + obj_content)

with open(out_mtl, "w", encoding="utf-8") as f:
    f.write("newmtl Mat_Porcelain\nKa 1.0 1.0 1.0\nKd 1.0 1.0 1.0\nmap_Kd antique_neural_diffuse.png\n")

print(f"Bake and xatlas export completed in {time.time() - t2:.2f}s: {out_mesh_obj}")
print("=== NEURAL RECONSTRUCTION STEP COMPLETE ===")
