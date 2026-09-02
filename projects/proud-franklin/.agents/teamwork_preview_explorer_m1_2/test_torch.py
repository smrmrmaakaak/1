import os
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image, ImageOps
import numpy as np

print("CUDA available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("Device name:", torch.cuda.get_device_name(0))

# Check torchvision / timm
try:
    import timm
    print("Timm version:", timm.__version__)
except Exception as e:
    print("Timm error:", e)
