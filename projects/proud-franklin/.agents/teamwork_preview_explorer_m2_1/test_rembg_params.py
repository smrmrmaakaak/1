import os
import rembg
import numpy as np
from PIL import Image, ImageOps
import cv2

raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
profile_path = os.path.join(raw_dir, "KakaoTalk_20260901_071003816_06.jpg")
img_profile = ImageOps.exif_transpose(Image.open(profile_path))

# Check rembg.remove parameters:
# rembg.remove(image, session=session, post_process_mask=True, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=10, alpha_matting_erode_size=10)

print("Testing rembg with post_process_mask=True...")
session_isnet = rembg.new_session("isnet-general-use")

# 1. Standard isnet
cutout_std = rembg.remove(img_profile, session=session_isnet)
alpha_std = np.array(cutout_std)[:, :, 3]

# 2. isnet with post_process_mask=True
cutout_ppm = rembg.remove(img_profile, session=session_isnet, post_process_mask=True)
alpha_ppm = np.array(cutout_ppm)[:, :, 3]

# 3. isnet with alpha_matting=True
cutout_am = rembg.remove(img_profile, session=session_isnet, alpha_matting=True, 
                         alpha_matting_foreground_threshold=240, 
                         alpha_matting_background_threshold=10, 
                         alpha_matting_erode_size=5)
alpha_am = np.array(cutout_am)[:, :, 3]

print(f"Std Alpha: mean={alpha_std.mean():.1f}, >10: {(alpha_std>10).mean():.3f}, >200: {(alpha_std>200).mean():.3f}")
print(f"PPM Alpha: mean={alpha_ppm.mean():.1f}, >10: {(alpha_ppm>10).mean():.3f}, >200: {(alpha_ppm>200).mean():.3f}")
print(f"AM Alpha: mean={alpha_am.mean():.1f}, >10: {(alpha_am>10).mean():.3f}, >200: {(alpha_am>200).mean():.3f}")
