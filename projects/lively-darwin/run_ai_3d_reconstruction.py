import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "triposr"))

import time
import torch
import numpy as np
from PIL import Image
import rembg
import trimesh
import xatlas

from tsr.system import TSR
from tsr.utils import remove_background, resize_foreground
from tsr.bake_texture import bake_texture

print("=== STARTING BATCH AI NEURAL 3D RECONSTRUCTION ON RTX 4050 GPU ===")
device = "cuda:0" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")

input_photos = [
    ("front_eye_level", r"C:\Users\황태민\Documents\카카오톡 받은 파일\20260829_115354.jpg"),
    ("hero_3_4", r"C:\Users\황태민\Documents\카카오톡 받은 파일\20260829_115307.jpg"),
    ("angle_45", r"C:\Users\황태민\Documents\카카오톡 받은 파일\20260829_115356.jpg")
]

output_dir = r"c:\Users\황태민\Documents\antigravity\lively-darwin\ai_output"
os.makedirs(output_dir, exist_ok=True)

# 1. Load Model
print("Loading TripoSR Neural 3D Foundation Model...")
model = TSR.from_pretrained(
    "stabilityai/TripoSR",
    config_name="config.yaml",
    weight_name="model.ckpt",
)
model.renderer.set_chunk_size(8192)
model.to(device)
print("Model ready on CUDA.")

rembg_session = rembg.new_session()

for label, img_path in input_photos:
    if not os.path.exists(img_path):
        print(f"Skipping {img_path} (not found)")
        continue
    
    print(f"\n--- Processing: {label} ({img_path}) ---")
    raw_img = Image.open(img_path)
    img_nobg = remove_background(raw_img, rembg_session)
    img_resized = resize_foreground(img_nobg, 0.85)

    img_np = np.array(img_resized).astype(np.float32) / 255.0
    if img_np.shape[-1] == 4:
        img_comp = img_np[:, :, :3] * img_np[:, :, 3:4] + (1.0 - img_np[:, :, 3:4]) * 0.5
    else:
        img_comp = img_np[:, :, :3]

    processed_pil = Image.fromarray((img_comp * 255.0).astype(np.uint8))
    processed_path = os.path.join(output_dir, f"{label}_input.png")
    processed_pil.save(processed_path)

    # Inference
    t0 = time.time()
    with torch.no_grad():
        scene_codes = model([processed_pil], device=device)
    print(f"[{label}] Inferred in {time.time() - t0:.2f}s")

    # Extract mesh
    t1 = time.time()
    meshes = model.extract_mesh(scene_codes, True, resolution=256)
    mesh = meshes[0]
    print(f"[{label}] Mesh extracted in {time.time() - t1:.2f}s ({len(mesh.vertices)} verts, {len(mesh.faces)} faces)")

    # Save vertex colored mesh
    mesh_vc_path = os.path.join(output_dir, f"{label}_mesh.obj")
    mesh.export(mesh_vc_path)
    print(f"Saved: {mesh_vc_path}")

    # Bake Texture Atlas
    try:
        t2 = time.time()
        bake_output = bake_texture(mesh, model, scene_codes[0], texture_resolution=2048)
        
        out_mesh_obj = os.path.join(output_dir, f"{label}_textured.obj")
        out_texture_png = os.path.join(output_dir, f"{label}_texture.png")
        
        xatlas.export(
            out_mesh_obj,
            mesh.vertices[bake_output["vmapping"]],
            bake_output["indices"],
            bake_output["uvs"],
            mesh.vertex_normals[bake_output["vmapping"]]
        )
        Image.fromarray((bake_output["colors"] * 255.0).astype(np.uint8)).transpose(Image.FLIP_TOP_BOTTOM).save(out_texture_png)
        print(f"[{label}] Baked 2048x2048 Texture Atlas in {time.time() - t2:.2f}s: {out_mesh_obj}, {out_texture_png}")
    except Exception as e:
        print(f"[{label}] Texture atlas baking notice: {e}")

print("\n=== ALL AI 3D RECONSTRUCTIONS FINISHED SUCCESSFULLY ===")
