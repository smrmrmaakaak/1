import os
from PIL import Image

raw_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus"
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

print("Visual classification of raw Lladro Gres Venus files:")
# Let's inspect each image's properties, size, and compare with studio_master photos
studio_dir = r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus\studio_master"

for i, fname in enumerate(files):
    fpath = os.path.join(raw_dir, fname)
    with Image.open(fpath) as img:
        w, h = img.size
        print(f"[{i+1}] {fname} -> {w}x{h}, {os.path.getsize(fpath)/1024:.1f} KB")

