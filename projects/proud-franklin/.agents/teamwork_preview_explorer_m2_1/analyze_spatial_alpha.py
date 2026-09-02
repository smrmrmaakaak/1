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
h, w = alpha.shape

# Check where alpha is in [10, 150]
low_alpha_mask = (alpha >= 10) & (alpha <= 150)
y_indices, x_indices = np.where(low_alpha_mask)
print(f"Low alpha pixels count: {len(y_indices)}")
print(f"Y-range: {y_indices.min()} to {y_indices.max()} (total h={h})")
print(f"X-range: {x_indices.min()} to {x_indices.max()} (total w={w})")

# Let's see if there are disconnected low alpha floating islands (e.g. background/floor shadows)
# Connected components analysis on (alpha > 10)
binary_fg = (alpha > 10).astype(np.uint8)
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary_fg)
print(f"\nConnected components count (threshold > 10): {num_labels}")
for i in range(1, num_labels):
    area = stats[i, cv2.CC_STAT_AREA]
    left = stats[i, cv2.CC_STAT_LEFT]
    top = stats[i, cv2.CC_STAT_TOP]
    width = stats[i, cv2.CC_STAT_WIDTH]
    height = stats[i, cv2.CC_STAT_HEIGHT]
    print(f"Component {i}: Area={area} ({area/(w*h)*100:.2f}%), BBox=[{left}, {top}, {width}, {height}]")

# What if threshold is higher, e.g. alpha > 128?
binary_core = (alpha > 128).astype(np.uint8)
num_labels_c, labels_c, stats_c, centroids_c = cv2.connectedComponentsWithStats(binary_core)
print(f"\nConnected components count (threshold > 128): {num_labels_c}")
for i in range(1, num_labels_c):
    area = stats_c[i, cv2.CC_STAT_AREA]
    left = stats_c[i, cv2.CC_STAT_LEFT]
    top = stats_c[i, cv2.CC_STAT_TOP]
    width = stats_c[i, cv2.CC_STAT_WIDTH]
    height = stats_c[i, cv2.CC_STAT_HEIGHT]
    print(f"Core Component {i}: Area={area} ({area/(w*h)*100:.2f}%), BBox=[{left}, {top}, {width}, {height}]")
