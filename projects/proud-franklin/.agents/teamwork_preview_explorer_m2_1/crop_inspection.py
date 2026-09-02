import os
import numpy as np
from PIL import Image, ImageOps
import cv2

raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
profile_path = os.path.join(raw_dir, "KakaoTalk_20260901_071003816_06.jpg")
img_profile = ImageOps.exif_transpose(Image.open(profile_path))

# Let's inspect the crop at Y=2300:3600, X=300:1200
crop_region = img_profile.crop((300, 2300, 1200, 3600))
print("Crop size:", crop_region.size)
# Save preview crop to inspect
crop_region.save(r"c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_m2_1\inspect_crop_profile_lower_left.jpg")
print("Saved crop preview to .agents/teamwork_preview_explorer_m2_1/inspect_crop_profile_lower_left.jpg")
