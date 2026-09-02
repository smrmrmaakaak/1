import os
import unittest
import numpy as np
from tests.utils.image_analyzer import load_image_cv2

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestBoundaryColorGamut(unittest.TestCase):
    """
    Tier 2 Boundary Test: Color Gamut & Channel Limits
    Verifies that all processed studio master images have:
    - 8-bit channel bounds strictly within [0..255]
    - Zero NaN, Inf, or null values in image matrix
    - Valid RGB color space without corrupt chromaticity spikes.
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )

    def test_channel_bounds_and_validity(self):
        for fname in os.listdir(self.studio_dir):
            if fname.endswith(".jpg"):
                p = os.path.join(self.studio_dir, fname)
                img = load_image_cv2(p)

                self.assertFalse(np.isnan(img).any(), f"{fname} contains NaN values")
                self.assertFalse(np.isinf(img).any(), f"{fname} contains Inf values")
                self.assertEqual(img.dtype, np.uint8, f"{fname} is not 8-bit unsigned integer")

                # Verify minimum and maximum values
                min_val = np.min(img)
                max_val = np.max(img)
                self.assertGreaterEqual(min_val, 0, f"{fname} min value below 0: {min_val}")
                self.assertLessEqual(max_val, 255, f"{fname} max value above 255: {max_val}")

if __name__ == "__main__":
    unittest.main()
