import os
import numpy as np
from PIL import Image, ImageOps
import cv2
import rembg

raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
profile_path = os.path.join(raw_dir, "KakaoTalk_20260901_071003816_06.jpg")
img_profile = ImageOps.exif_transpose(Image.open(profile_path))
session = rembg.new_session("isnet-general-use")
cutout = rembg.remove(img_profile, session=session)

alpha = np.array(cutout)[:, :, 3]
img_rgb = np.array(img_profile)

# Let's inspect the transition region
mask_trans = (alpha >= 10) & (alpha <= 128)
rgb_trans = img_rgb[mask_trans]

print(f"Transition RGB mean: {rgb_trans.mean(axis=0)}")
print(f"Transition RGB min: {rgb_trans.min(axis=0)}, max: {rgb_trans.max(axis=0)}")

# Check core RGB
mask_core = alpha > 200
rgb_core = img_rgb[mask_core]
print(f"Core RGB mean: {rgb_core.mean(axis=0)}")

# Check pure background RGB (alpha == 0)
mask_bg = alpha == 0
rgb_bg = img_rgb[mask_bg]
print(f"Background RGB mean: {rgb_bg.mean(axis=0)}")

# Where is the transition region spatially?
# Let's see how wide the transition band is across the perimeter
# Using distance transform from core
core_bin = (alpha > 128).astype(np.uint8)
dist_from_core = cv2.distanceTransform(1 - core_bin, cv2.DIST_L2, 5)
dist_trans = dist_from_core[mask_trans]
print(f"Distance from core for transition pixels: mean={dist_trans.mean():.1f}px, max={dist_trans.max():.1f}px, median={np.median(dist_trans):.1f}px")
print(f"90th percentile distance: {np.percentile(dist_trans, 90):.1f}px")
print(f"95th percentile distance: {np.percentile(dist_trans, 95):.1f}px")
print(f"99th percentile distance: {np.percentile(dist_trans, 99):.1f}px")

# Let's check where the very large distance transition pixels are located!
dist_large_mask = mask_trans & (dist_from_core > 30)
if np.any(dist_large_mask):
    y_lg, x_lg = np.where(dist_large_mask)
    print(f"Large distance (>30px) transition pixels: count={len(y_lg)}")
    print(f"Large distance Y range: {y_lg.min()} to {y_lg.max()}, X range: {x_lg.min()} to {x_lg.max()}")
    print(f"Large distance mean alpha: {alpha[dist_large_mask].mean():.1f}")
    print(f"Large distance mean RGB: {img_rgb[dist_large_mask].mean(axis=0)}")
