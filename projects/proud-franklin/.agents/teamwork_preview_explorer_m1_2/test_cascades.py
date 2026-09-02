import cv2
import os
from PIL import Image, ImageOps
import numpy as np

def test_haar_cascades():
    cascade_dir = cv2.data.haarcascades
    face_cascade_path = os.path.join(cascade_dir, 'haarcascade_frontalface_default.xml')
    profile_cascade_path = os.path.join(cascade_dir, 'haarcascade_profileface.xml')
    print("Face cascade:", face_cascade_path, os.path.exists(face_cascade_path))
    print("Profile cascade:", profile_cascade_path, os.path.exists(profile_cascade_path))

test_haar_cascades()
