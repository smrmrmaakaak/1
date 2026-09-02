import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import math
import os

def create_photorealistic_parchment(width=2048, height=2048, output_path="public/assets/textures/parchment_clean.jpg"):
    print(f"[+] Generating high-contrast photorealistic antique parchment ({width}x{height})...")
    np.random.seed(1337)

    # 1. Warm Antique Parchment Palette (Base Ochre / Honey / Sepia)
    # Warm base gradient (brighter center, darker aged edges)
    y, x = np.ogrid[:height, :width]
    cx, cy = width / 2.0, height / 2.0
    rad = np.sqrt(((x - cx) / (width * 0.55))**2 + ((y - cy) / (height * 0.55))**2)
    rad_clamped = np.clip(rad, 0.0, 1.4)

    # Center: #f6ecdc (246, 236, 220), Edge: #d4ba8a (212, 186, 138)
    base_r = 246.0 - rad_clamped * 36.0
    base_g = 236.0 - rad_clamped * 48.0
    base_b = 218.0 - rad_clamped * 75.0

    # 2. Multi-scale Organic Weathered Aging & Mottled Water Stains
    def smooth_noise(scale, octaves=3):
        h_s = max(2, height // scale)
        w_s = max(2, width // scale)
        n = np.random.uniform(-1.0, 1.0, (h_s, w_s)).astype(np.float32)
        im = Image.fromarray(n, mode='F')
        im = im.resize((width, height), Image.Resampling.BICUBIC)
        return np.array(im, dtype=np.float32)

    stain1 = smooth_noise(12) * 26.0
    stain2 = smooth_noise(6) * 16.0
    stain3 = smooth_noise(3) * 8.0
    total_stain = stain1 + stain2 + stain3

    base_r += total_stain * 0.95
    base_g += total_stain * 0.80
    base_b += total_stain * 0.50

    # 3. Rich Papyrus & Linen Cross-Weave Fibers
    h_fibers = np.zeros((height, width), dtype=np.float32)
    for _ in range(7000):
        fy = np.random.randint(0, height)
        fx = np.random.randint(0, width - 200)
        flen = np.random.randint(50, 260)
        fthick = np.random.randint(1, 4)
        intensity = np.random.uniform(8.0, 24.0)
        h_fibers[fy:fy+fthick, fx:min(width, fx+flen)] -= intensity

    v_fibers = np.zeros((height, width), dtype=np.float32)
    for _ in range(5000):
        fx = np.random.randint(0, width)
        fy = np.random.randint(0, height - 200)
        flen = np.random.randint(40, 200)
        fthick = np.random.randint(1, 3)
        intensity = np.random.uniform(6.0, 18.0)
        v_fibers[fy:min(height, fy+flen), fx:fx+fthick] -= intensity

    # Fine pulp speckles
    pulp = np.random.normal(0, 6.0, (height, width)).astype(np.float32)

    fibers = h_fibers + v_fibers + pulp
    base_r += fibers * 0.75
    base_g += fibers * 0.65
    base_b += fibers * 0.45

    # 4. Burned Edge Perimeter Vignette
    edge_vignette = (rad_clamped ** 2) * 22.0
    base_r -= edge_vignette * 0.8
    base_g -= edge_vignette * 1.0
    base_b -= edge_vignette * 1.3

    r = np.clip(base_r, 0, 255).astype(np.uint8)
    g = np.clip(base_g, 0, 255).astype(np.uint8)
    b = np.clip(base_b, 0, 255).astype(np.uint8)

    rgb = np.stack([r, g, b], axis=2)
    img = Image.fromarray(rgb, mode='RGB')

    # Sharpen for crisp papyrus texture
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.6)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, quality=96)
    print(f"[+] Successfully saved rich antique parchment texture to {output_path}!")

if __name__ == "__main__":
    create_photorealistic_parchment()
