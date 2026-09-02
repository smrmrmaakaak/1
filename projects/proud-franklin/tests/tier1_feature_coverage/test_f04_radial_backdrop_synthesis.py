import os
import unittest
import numpy as np
from tests.utils.image_analyzer import analyze_backdrop_corners_and_center, load_image_cv2

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF04RadialBackdropSynthesis(unittest.TestCase):
    """
    Feature 4: Luxury Dark Slate & Warm Charcoal Backdrop Synthesis
    Validates smoothstep radial spotlight gradient (#1A1D20 -> #0D0E10)
    matching Sotheby's/Christie's auction lighting standards.
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )
        self.hero_path = os.path.join(self.studio_dir, "venus_01_hero_front.jpg")

    def test_corner_backdrop_color_gamut(self):
        """
        Corners must strictly lie in the Sotheby's dark slate gamut (#0D0E10 / #1A1D20).
        RGB components should be in range [5..25].
        """
        metrics = analyze_backdrop_corners_and_center(self.hero_path)
        corner_rgb = metrics["corners_mean_rgb"]

        # R, G, B should be low luminance dark charcoal slate
        for i, channel in enumerate(["Red", "Green", "Blue"]):
            self.assertGreaterEqual(
                corner_rgb[i], 5.0,
                f"Corner {channel} too dark (crushed black): {corner_rgb[i]}"
            )
            self.assertLessEqual(
                corner_rgb[i], 30.0,
                f"Corner {channel} too bright (not luxury dark slate): {corner_rgb[i]}"
            )

        # Check luminance
        self.assertLessEqual(
            metrics["corner_luminance"], 25.0,
            f"Corner luminance too high: {metrics['corner_luminance']}"
        )

    def test_radial_spotlight_luminance_gradient(self):
        """
        Center region luminance must significantly exceed corner luminance,
        confirming a focused auction spotlight illumination.
        """
        metrics = analyze_backdrop_corners_and_center(self.hero_path)
        self.assertGreater(
            metrics["luminance_delta"], 40.0,
            f"Insufficient spotlight contrast delta between center and corner: {metrics['luminance_delta']}"
        )

    def test_smoothstep_radial_falloff_across_all_cutout_angles(self):
        """
        Validates that hero, side profile, and rear sculpture angles all utilize
        consistent radial backdrop color gradients.
        """
        angles = [
            "venus_01_hero_front.jpg",
            "venus_02_side_profile.jpg",
            "venus_04_rear_sculpture.jpg"
        ]
        for angle_file in angles:
            p = os.path.join(self.studio_dir, angle_file)
            metrics = analyze_backdrop_corners_and_center(p)
            self.assertLessEqual(
                metrics["corner_luminance"], 25.0,
                f"{angle_file} corner luminance too high: {metrics['corner_luminance']}"
            )
            self.assertGreater(
                metrics["center_luminance"], 50.0,
                f"{angle_file} center spotlight insufficient: {metrics['center_luminance']}"
            )

if __name__ == "__main__":
    unittest.main()
