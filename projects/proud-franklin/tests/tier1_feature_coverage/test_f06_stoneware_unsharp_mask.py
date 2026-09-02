import os
import unittest
import cv2
import numpy as np
from tests.utils.image_analyzer import measure_laplacian_variance, load_image_cv2

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF06StonewareUnsharpMask(unittest.TestCase):
    """
    Feature 6: Stoneware Texture & Micro-Detail Unsharp Masking
    Validates high-frequency clarity, matte terracotta grit,
    glazed wavy hair texture, and drapery shadow transitions without halo ringing.
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )
        self.portrait_path = os.path.join(self.studio_dir, "venus_03_portrait_torso.jpg")
        self.hero_path = os.path.join(self.studio_dir, "venus_01_hero_front.jpg")

    def test_portrait_detail_laplacian_sharpness(self):
        """
        The portrait torso detail crop must have high Laplacian variance,
        confirming crisp unsharp mask filter application on facial features & dove feathers.
        """
        var = measure_laplacian_variance(self.portrait_path)
        self.assertGreater(
            var, 40.0,
            f"Laplacian texture sharpness too low for macro portrait: {var}"
        )

    def test_local_contrast_and_matte_grit_texture(self):
        """
        Verifies that stoneware terracotta region has rich micro-texture gradient distribution.
        """
        img = load_image_cv2(self.portrait_path)
        h, w = img.shape[:2]

        # Sample central torso region
        torso = img[int(h*0.3):int(h*0.7), int(w*0.3):int(w*0.7)]
        gray = cv2.cvtColor(torso, cv2.COLOR_BGR2GRAY)

        # Compute Sobel gradients in X and Y
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        grad_mag = np.sqrt(sobelx**2 + sobely**2)

        mean_grad = np.mean(grad_mag)
        self.assertGreater(
            mean_grad, 5.0,
            f"Mean gradient magnitude in stoneware region too low (blurry/flattened): {mean_grad}"
        )

    def test_no_excessive_overshoot_or_clipping(self):
        """
        Verifies that unsharp masking did not cause extreme white pixel blowout or ringing.
        """
        img = load_image_cv2(self.portrait_path)
        pure_white_count = np.sum(img >= 254)
        total_pixels = img.shape[0] * img.shape[1] * img.shape[2]
        blowout_ratio = float(pure_white_count) / float(total_pixels)

        self.assertLess(
            blowout_ratio, 0.05,
            f"Excessive highlight clipping/blowout in stoneware texture: {blowout_ratio:.4f}"
        )

if __name__ == "__main__":
    unittest.main()
