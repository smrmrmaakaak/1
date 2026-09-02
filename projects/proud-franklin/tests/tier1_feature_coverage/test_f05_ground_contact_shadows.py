import os
import unittest
import cv2
import numpy as np
from tests.utils.image_analyzer import analyze_shadow_profile, load_image_cv2

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF05GroundContactShadows(unittest.TestCase):
    """
    Feature 5: Realistic Ground Contact Shadow Synthesis
    Validates dual-tier contact floor shadows:
    - Sharp ambient occlusion contact line at the base
    - Soft diffuse perspective projection shadow
    grounding the porcelain in 3D studio space.
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )
        self.hero_path = os.path.join(self.studio_dir, "venus_01_hero_front.jpg")

    def test_contact_shadow_presence_and_gradient(self):
        """
        Verifies that the bottom grounding plane exhibits contact shadow luminance variation.
        """
        shadow_metrics = analyze_shadow_profile(self.hero_path)
        self.assertTrue(
            shadow_metrics["has_contact_gradient"],
            f"Missing contact shadow gradient in bottom floor region: {shadow_metrics}"
        )
        self.assertLess(
            shadow_metrics["bottom_min_lum"], 15.0,
            f"Ambient occlusion shadow base line not dark enough: {shadow_metrics['bottom_min_lum']}"
        )

    def test_shadow_symmetry_and_soft_dispersion(self):
        """
        Verifies that the shadow smoothly disperses laterally under the pedestal/base.
        """
        img = load_image_cv2(self.hero_path)
        h, w = img.shape[:2]

        # Floor zone between 80% and 95% height
        floor_strip = img[int(h * 0.80):int(h * 0.95), :]
        gray_floor = cv2.cvtColor(floor_strip, cv2.COLOR_BGR2GRAY)

        # Left floor vs Right floor peripheral luminance should be balanced
        left_corner = np.mean(gray_floor[:, :int(w * 0.2)])
        right_corner = np.mean(gray_floor[:, int(w * 0.8):])
        corner_delta = abs(left_corner - right_corner)

        self.assertLess(
            corner_delta, 10.0,
            f"Ground backdrop floor is not laterally balanced: delta={corner_delta}"
        )

if __name__ == "__main__":
    unittest.main()
