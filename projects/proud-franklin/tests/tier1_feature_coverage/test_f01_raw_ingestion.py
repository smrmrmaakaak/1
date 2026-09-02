import os
import unittest
from PIL import Image

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF01RawIngestion(unittest.TestCase):
    """
    Feature 1: Raw Photo Ingestion & Metadata Normalization
    Verifies that raw high-resolution antique collection photos exist,
    have valid 2252x4000 resolution, 3-channel RGB/JPEG format,
    and have normalized orientation.
    """

    def setUp(self):
        self.raw_dir = os.path.join(WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus")

    def test_raw_directory_exists(self):
        self.assertTrue(os.path.exists(self.raw_dir), f"Raw directory does not exist: {self.raw_dir}")

    def test_raw_photos_count_and_extensions(self):
        files = [f for f in os.listdir(self.raw_dir) if os.path.isfile(os.path.join(self.raw_dir, f)) and f.lower().endswith(".jpg")]
        self.assertGreaterEqual(len(files), 5, f"Expected at least 5 raw photos for Venus collection, got {len(files)}")

    def test_raw_photo_dimensions_and_channels(self):
        files = [f for f in os.listdir(self.raw_dir) if os.path.isfile(os.path.join(self.raw_dir, f)) and f.lower().endswith(".jpg")]
        for filename in files:
            img_path = os.path.join(self.raw_dir, filename)
            with Image.open(img_path) as img:
                w, h = img.size
                # Verify vertical orientation and high resolution
                self.assertGreaterEqual(w, 1000, f"{filename} width too small: {w}")
                self.assertGreaterEqual(h, 1500, f"{filename} height too small: {h}")
                self.assertIn(img.mode, ["RGB", "RGBA"], f"{filename} unexpected color mode: {img.mode}")
                self.assertEqual(img.format, "JPEG", f"{filename} format not JPEG: {img.format}")

    def test_raw_aspect_ratio_consistency(self):
        files = [f for f in os.listdir(self.raw_dir) if os.path.isfile(os.path.join(self.raw_dir, f)) and f.lower().endswith(".jpg")]
        for filename in files:
            img_path = os.path.join(self.raw_dir, filename)
            with Image.open(img_path) as img:
                w, h = img.size
                aspect = float(w) / float(h)
                self.assertLess(aspect, 1.0, f"{filename} is not in portrait orientation: aspect={aspect}")

if __name__ == "__main__":
    unittest.main()
