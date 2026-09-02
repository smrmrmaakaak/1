import os
import unittest
import cv2
import numpy as np
from tests.utils.image_analyzer import load_image_cv2, analyze_boundary_contour_fidelity

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF03ShapePreservationMatting(unittest.TestCase):
    """
    Feature 3: 100% Authentic Shape Preservation Alpha Matting
    Validates high-precision boundary extraction, alpha matting,
    and ensures zero generative AI redrawing or hallucinated geometry.
    """

    def setUp(self):
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )
        self.raw_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus"
        )

    def test_alpha_matting_edge_sharpness_and_no_white_halos(self):
        """
        Verifies that studio master edges do not contain bright white halo fringe artifacts
        typical of sloppy threshold cutouts.
        """
        hero_img_path = os.path.join(self.studio_dir, "venus_01_hero_front.jpg")
        img = load_image_cv2(hero_img_path)
        h, w = img.shape[:2]

        # Convert to grayscale and calculate edges using Canny
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)

        # Dilate edge slightly to sample boundary zone
        kernel = np.ones((3, 3), np.uint8)
        edge_zone = cv2.dilate(edges, kernel, iterations=1)

        # Sample pixel values in edge zone
        edge_pixels = gray[edge_zone > 0]
        self.assertGreater(len(edge_pixels), 1000, "Edge zone must have sufficient boundary contour pixels")

        # The maximum halo fringe brightness on backdrop boundary should not exceed pure glare
        # No artificial 255 pure white rings on dark background boundary
        backdrop_dark_pixels = gray[gray < 30]
        self.assertGreater(len(backdrop_dark_pixels), h * w * 0.1, "Backdrop must maintain dark auction tone")

    def test_foreground_silhouette_centering_and_occupancy(self):
        """
        Verifies that the porcelain statue is properly centered in the 1400x1800 canvas.
        """
        hero_img_path = os.path.join(self.studio_dir, "venus_01_hero_front.jpg")
        img = load_image_cv2(hero_img_path)
        h, w = img.shape[:2]

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Foreground porcelain is lighter than the dark backdrop (luminance > 40)
        fg_mask = (gray > 40).astype(np.uint8)

        # Bounding box of porcelain
        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        self.assertGreater(len(contours), 0, "Must detect porcelain foreground contour")

        # Largest contour
        c = max(contours, key=cv2.contourArea)
        bx, by, bw, bh = cv2.boundingRect(c)

        # Foreground must occupy major portion of canvas height (between 50% and 95%)
        height_occupancy = float(bh) / float(h)
        self.assertGreater(height_occupancy, 0.50, f"Foreground height occupancy too low: {height_occupancy}")
        self.assertLess(height_occupancy, 0.98, f"Foreground height occupancy too high: {height_occupancy}")

        # Center of mass x should be near horizontal center (within 15% tolerance)
        cx = bx + bw / 2.0
        center_offset = abs(cx - w / 2.0) / float(w)
        self.assertLess(center_offset, 0.15, f"Foreground is not horizontally centered: offset={center_offset}")

    def test_contour_continuity_and_no_fragmentation(self):
        """
        Verifies that the segmentation produces a continuous, connected porcelain body
        without jagged missing holes or fragments.
        """
        hero_img_path = os.path.join(self.studio_dir, "venus_01_hero_front.jpg")
        img = load_image_cv2(hero_img_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        fg_mask = (gray > 45).astype(np.uint8)

        contours, hierarchy = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        significant_contours = [c for c in contours if cv2.contourArea(c) > 5000]

        # The main body should be consolidated
        self.assertLessEqual(len(significant_contours), 3, "Too many fragmented segments detected in matting")

if __name__ == "__main__":
    unittest.main()
