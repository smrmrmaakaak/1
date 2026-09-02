import os
import unittest
import cv2
import numpy as np
from tests.utils.image_analyzer import load_image_cv2, analyze_backdrop_corners_and_center

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestCrossMattingToBackdropComposite(unittest.TestCase):
    """
    Tier 3 Pairwise Test: Alpha Matting ↔ Radial Backdrop ↔ Shadow Compositing
    Verifies that foreground porcelain, background smoothstep radial lighting,
    and ground contact shadows blend seamlessly without hard boundary seams or discoloration.
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )
        self.hero_path = os.path.join(self.studio_dir, "venus_01_hero_front.jpg")

    def test_composite_edge_gradient_continuity(self):
        """
        Verifies that transitioning from dark background to porcelain foreground is smooth
        and has no 1-pixel transparent or artifact gaps.
        """
        img = load_image_cv2(self.hero_path)
        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Gradient magnitude of the entire composite image
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        grad_mag = np.sqrt(sobelx**2 + sobely**2)

        # There should be no impossible edge gradients (> 1200)
        max_grad = np.max(grad_mag)
        self.assertLess(
            max_grad, 1200.0,
            f"Excessive edge discontinuity spike in compositing: {max_grad}"
        )

    def test_pairwise_backdrop_and_shadow_integration(self):
        """
        Verifies that bottom floor shadows blend into the radial spotlight backdrop corners.
        """
        metrics = analyze_backdrop_corners_and_center(self.hero_path)
        corner_lum = metrics["corner_luminance"]

        # Corner luminance is consistent with dark slate
        self.assertLessEqual(corner_lum, 25.0)
        self.assertGreaterEqual(corner_lum, 5.0)

if __name__ == "__main__":
    unittest.main()
