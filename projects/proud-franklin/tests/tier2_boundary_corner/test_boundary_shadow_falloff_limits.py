import os
import unittest
import numpy as np
from tests.utils.image_analyzer import load_image_cv2, analyze_shadow_profile

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestBoundaryShadowFalloffLimits(unittest.TestCase):
    """
    Tier 2 Boundary Test: Shadow Intensity & Gradient Falloff Thresholds
    Verifies that floor contact shadows and ambient occlusion values
    never clip into unnatural pitch-black artifacts or bleed into the statue.
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )
        self.hero_path = os.path.join(self.studio_dir, "venus_01_hero_front.jpg")

    def test_shadow_profile_clipping_bounds(self):
        metrics = analyze_shadow_profile(self.hero_path)
        # Verify floor standard deviation does not indicate extreme hard-edge rectangle
        self.assertLess(
            metrics["bottom_std_lum"], 60.0,
            f"Shadow floor standard deviation too high (indicates harsh hard-box cutout): {metrics['bottom_std_lum']}"
        )
        self.assertGreater(
            metrics["bottom_std_lum"], 5.0,
            f"Shadow floor standard deviation too flat: {metrics['bottom_std_lum']}"
        )

    def test_pedestal_contact_zone_continuity(self):
        img = load_image_cv2(self.hero_path)
        h, w = img.shape[:2]

        # Pedestal baseline around 80% to 88% height
        base_zone = img[int(h * 0.82):int(h * 0.88), int(w * 0.35):int(w * 0.65)]
        mean_lum = np.mean(base_zone)

        # Baseline must be darker than average backdrop spotlight
        self.assertLess(mean_lum, 80.0, f"Pedestal base region not properly shadowed: {mean_lum}")

if __name__ == "__main__":
    unittest.main()
