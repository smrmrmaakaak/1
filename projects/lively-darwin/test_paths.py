import os, glob
import cv2
import numpy as np
from PIL import Image

def test_photo(idx):
    raw_path = f"photos_oriented/{sorted(os.listdir('photos_oriented'))[idx]}"
    img = cv2.imread(raw_path)
    h, w, _ = img.shape
    print(f"Testing Photo {idx}: {raw_path}, size: {w}x{h}")

for i in range(14):
    test_photo(i)
