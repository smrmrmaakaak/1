import os
import time
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import cv2
import rembg
import pymatting

print("rembg version:", rembg.__version__)

# Test image: HERO_FRONT and SIDE_PROFILE
raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
front_path = os.path.join(raw_dir, "KakaoTalk_20260901_071003816_04.jpg")
profile_path = os.path.join(raw_dir, "KakaoTalk_20260901_071003816_06.jpg")

img_front = ImageOps.exif_transpose(Image.open(front_path))
img_profile = ImageOps.exif_transpose(Image.open(profile_path))

# Create IS-Net session
session_isnet = rembg.new_session("isnet-general-use")
print("IS-Net session created successfully.")

# Run raw rembg on front
t0 = time.time()
cutout_front = rembg.remove(img_front, session=session_isnet)
t1 = time.time()
print(f"Front cutout generated in {t1-t0:.2f}s, size={cutout_front.size}")

# Analyze alpha channel
np_front = np.array(cutout_front)
alpha_front = np_front[:, :, 3]

print(f"Alpha min={alpha_front.min()}, max={alpha_front.max()}, mean={alpha_front.mean():.1f}")
print(f"Fraction > 0: {(alpha_front > 0).mean():.3f}")
print(f"Fraction > 250: {(alpha_front > 250).mean():.3f}")
print(f"Fraction in (0, 250) (transition zone): {((alpha_front > 0) & (alpha_front <= 250)).mean():.4f}")

# Check profile cutout
t0 = time.time()
cutout_profile = rembg.remove(img_profile, session=session_isnet)
t1 = time.time()
print(f"Profile cutout generated in {t1-t0:.2f}s, size={cutout_profile.size}")
np_profile = np.array(cutout_profile)
alpha_profile = np_profile[:, :, 3]
print(f"Profile transition zone: {((alpha_profile > 0) & (alpha_profile <= 250)).mean():.4f}")
