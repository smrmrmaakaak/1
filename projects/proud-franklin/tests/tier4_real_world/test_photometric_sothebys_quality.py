import os
import unittest
import numpy as np
from tests.utils.image_analyzer import analyze_backdrop_corners_and_center, measure_laplacian_variance

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestPhotometricSothebysQuality(unittest.TestCase):
    """
    Tier 4 Real-World Workload: Photometric Sotheby's/Christie's Auction Grade Verification
    Validates end-to-end visual colorimetry, lighting falloff, and texture clarity across
    all studio master deliverables.
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )

    def test_all_five_studio_masters_photometric_grade(self):
        files = [
            "venus_01_hero_front.jpg",
            "venus_02_side_profile.jpg",
            "venus_03_portrait_torso.jpg",
            "venus_04_rear_sculpture.jpg",
            "venus_05_backstamp.jpg"
        ]

        for fname in files:
            p = os.path.join(self.studio_dir, fname)
            metrics = analyze_backdrop_corners_and_center(p)

            # Check corner slate color
            self.assertLessEqual(
                metrics["corner_luminance"], 25.0,
                f"{fname} corner luminance too bright: {metrics['corner_luminance']}"
            )
            self.assertGreaterEqual(
                metrics["corner_luminance"], 5.0,
                f"{fname} corner crushed black: {metrics['corner_luminance']}"
            )

            # Check spotlight presence
            self.assertGreater(
                metrics["center_luminance"], 45.0,
                f"{fname} center spotlight insufficient: {metrics['center_luminance']}"
            )

            # Check sharpness
            var = measure_laplacian_variance(p)
            self.assertGreater(
                var, 25.0,
                f"{fname} Laplacian variance too low: {var}"
            )

if __name__ == "__main__":
    unittest.main()
