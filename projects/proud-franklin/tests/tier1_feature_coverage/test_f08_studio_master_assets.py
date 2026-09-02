import os
import unittest
from PIL import Image

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF08StudioMasterAssets(unittest.TestCase):
    """
    Feature 8: Standardized Studio Master Asset Generation
    Verifies that all exported studio master assets meet standardized auction lookbook
    specifications (1400x1800 portrait aspect, valid RGB JPEG format, file size limits).
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )
        self.expected_angles = [
            "venus_01_hero_front.jpg",
            "venus_02_side_profile.jpg",
            "venus_03_portrait_torso.jpg",
            "venus_04_rear_sculpture.jpg",
            "venus_05_backstamp.jpg"
        ]

    def test_all_five_studio_masters_exist(self):
        for f in self.expected_angles:
            p = os.path.join(self.studio_dir, f)
            self.assertTrue(os.path.exists(p), f"Missing studio master file: {p}")

    def test_resolution_and_aspect_ratio_standardization(self):
        """
        Validates that files adhere to ~1400x1800 resolution and ~0.77 portrait aspect ratio.
        """
        for f in self.expected_angles:
            p = os.path.join(self.studio_dir, f)
            with Image.open(p) as img:
                w, h = img.size
                self.assertGreaterEqual(w, 1200, f"{f} width too low: {w}")
                self.assertGreaterEqual(h, 1600, f"{f} height too low: {h}")

                aspect = float(w) / float(h)
                # Aspect ratio should be roughly 7:9 (0.70 to 0.85)
                self.assertGreaterEqual(aspect, 0.70, f"{f} aspect ratio out of bounds: {aspect}")
                self.assertLessEqual(aspect, 0.85, f"{f} aspect ratio out of bounds: {aspect}")
                self.assertEqual(img.mode, "RGB", f"{f} must be RGB mode")

    def test_file_size_optimization(self):
        """
        Studio masters should be high quality while remaining optimized for web loading (< 3MB).
        """
        for f in self.expected_angles:
            p = os.path.join(self.studio_dir, f)
            size_bytes = os.path.getsize(p)
            size_mb = size_bytes / (1024 * 1024)
            self.assertGreater(size_mb, 0.1, f"{f} file suspiciously small ({size_mb:.2f}MB)")
            self.assertLess(size_mb, 3.0, f"{f} file exceeds 3.0MB web limit ({size_mb:.2f}MB)")

if __name__ == "__main__":
    unittest.main()
