import os, glob
import cv2
import numpy as np
from PIL import Image
import rembg

def test_human_seg():
    session_human = rembg.new_session("u2net_human_seg")
    photo_files = sorted(glob.glob("photos_oriented/*.jpg"))
    
    for idx in [1, 2, 3, 4, 5, 6, 7, 8]:
        p = photo_files[idx]
        img = Image.open(p)
        res = rembg.remove(img, session=session_human, only_mask=True)
        res.save(f"test_human_mask_{idx:02d}.png")
        print(f"Saved human mask for {idx}: {p}")

if __name__ == "__main__":
    test_human_seg()
