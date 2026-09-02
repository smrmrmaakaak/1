import os
import unittest
import cv2
import numpy as np
from tests.utils.image_analyzer import load_image_cv2, measure_laplacian_variance

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF07BackstampMacroPreservation(unittest.TestCase):
    """
    Feature 7: Specialized Backstamp Macro Preservation
    Validates authentic backstamp macro framing:
    - Retains full macro rectangular plate without artificial object cutouts
    - Applies subtle warm luxury vignette border
    - Applies clarity filtering to preserve incised numbers (#2256) and official hallmarks (DAISA 1993).
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )
        self.stamp_path = os.path.join(self.studio_dir, "venus_05_backstamp.jpg")

    def test_backstamp_file_exists_and_high_res(self):
        self.assertTrue(os.path.exists(self.stamp_path), f"Backstamp asset missing: {self.stamp_path}")
        img = load_image_cv2(self.stamp_path)
        h, w = img.shape[:2]
        self.assertGreaterEqual(w, 1200, f"Backstamp width too small: {w}")
        self.assertGreaterEqual(h, 1600, f"Backstamp height too small: {h}")

    def test_backstamp_hallmark_clarity_and_laplacian(self):
        """
        Ensures hallmark lettering and stamped engravings are razor sharp.
        """
        var = measure_laplacian_variance(self.stamp_path)
        self.assertGreater(
            var, 40.0,
            f"Backstamp sharpness too low for archival hallmark reading: {var}"
        )

    def test_vignette_border_and_central_illumination(self):
        """
        Verifies that the backstamp has a darkened border vignette framing the bright central mark.
        """
        img = load_image_cv2(self.stamp_path)
        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Sample 4 corners
        s = 40
        corners = [
            np.mean(gray[:s, :s]),
            np.mean(gray[:s, -s:]),
            np.mean(gray[-s:, :s]),
            np.mean(gray[-s:, -s:])
        ]
        avg_corner = np.mean(corners)

        # Sample center hallmark zone
        center_hallmark = np.mean(gray[h//4:3*h//4, w//4:3*w//4])

        # Center should be substantially brighter than the dark vignette border
        self.assertGreater(
            center_hallmark, avg_corner + 30.0,
            f"Insufficient vignette contrast between center ({center_hallmark}) and border ({avg_corner})"
        )

if __name__ == "__main__":
    unittest.main()
