import sys
import os

print("Python version:", sys.version)

for pkg in ['PIL', 'cv2', 'numpy', 'scipy', 'sklearn', 'torch', 'torchvision', 'timm', 'rembg']:
    try:
        m = __import__(pkg)
        v = getattr(m, '__version__', 'installed')
        print(f"  [OK] {pkg}: {v}")
    except ImportError:
        print(f"  [--] {pkg}: not installed")
    except Exception as e:
        print(f"  [ERR] {pkg}: {e}")
