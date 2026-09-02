import os
from PIL import Image

raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
studio_dir = os.path.join(raw_dir, "studio_master")

# Let's inspect the 13 files and the 5 studio files
files = [
    "KakaoTalk_20260901_071003816.jpg",
    "KakaoTalk_20260901_071003816_01.jpg",
    "KakaoTalk_20260901_071003816_02.jpg",
    "KakaoTalk_20260901_071003816_03.jpg",
    "KakaoTalk_20260901_071003816_04.jpg",
    "KakaoTalk_20260901_071003816_05.jpg",
    "KakaoTalk_20260901_071003816_06.jpg",
    "KakaoTalk_20260901_071003816_07.jpg",
    "KakaoTalk_20260901_071003816_08.jpg",
    "KakaoTalk_20260901_071003816_09.jpg",
    "KakaoTalk_20260901_071003816_10.jpg",
    "KakaoTalk_20260901_071003816_11.jpg",
    "KakaoTalk_20260901_071028050.jpg"
]

# Let's test crop comparison between studio files and raw files to determine exact source mappings
import numpy as np

def find_best_match(studio_img_path, raw_paths):
    with Image.open(studio_img_path) as s_img:
        s_thumb = s_img.convert('RGB').resize((100, 100))
        s_arr = np.array(s_thumb, dtype=np.float32)
        
        best_diff = float('inf')
        best_rf = None
        
        for rf in raw_paths:
            with Image.open(rf) as r_img:
                # Raw images are 2252x4000. Let's resize raw to 100x100 and compare edge/structure
                r_thumb = r_img.convert('RGB').resize((100, 100))
                r_arr = np.array(r_thumb, dtype=np.float32)
                diff = np.mean(np.abs(s_arr - r_arr))
                # Also check normalized cross-correlation or color hist
                # Let's print diffs
                if diff < best_diff:
                    best_diff = diff
                    best_rf = rf
        return best_rf, best_diff

studio_files = [
    "venus_01_hero_front.jpg",
    "venus_02_side_profile.jpg",
    "venus_03_portrait_torso.jpg",
    "venus_04_rear_sculpture.jpg",
    "venus_05_backstamp.jpg"
]

print("=== Direct Studio to Raw source mapping analysis ===")
raw_full_paths = [os.path.join(raw_dir, f) for f in files]
for sf in studio_files:
    sp = os.path.join(studio_dir, sf)
    match, diff = find_best_match(sp, raw_full_paths)
    print(f"Studio: {sf} -> Best raw match: {os.path.basename(match)} (diff: {diff:.2f})")
