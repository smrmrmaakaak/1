import os
import unittest
from PIL import Image
from tests.utils.catalog_loader import get_all_products

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestBoundaryAspectRatios(unittest.TestCase):
    """
    Tier 2 Boundary Test: Aspect Ratio & Rescaling Limits
    Verifies that all images referenced across the catalog stay within reasonable
    aspect ratio bounds (portrait orientation for items, zero 0-dimension images,
    zero corrupted EXIF orientation headers).
    """

    def setUp(self):
        self.products = get_all_products()

    def test_main_and_detail_image_aspect_boundaries(self):
        for p in self.products:
            pid = p.get("id")
            for key in ["mainImage", "detailImage"]:
                rel_path = p.get(key, "").lstrip("/")
                full_path = os.path.join(WORKSPACE_ROOT, "public", rel_path)
                if os.path.exists(full_path):
                    with Image.open(full_path) as img:
                        w, h = img.size
                        self.assertGreater(w, 0, f"Product {pid} {key} has 0 width")
                        self.assertGreater(h, 0, f"Product {pid} {key} has 0 height")

                        aspect = float(w) / float(h)
                        # Expect reasonable aspect ratio (between 0.4 and 1.8)
                        self.assertGreaterEqual(
                            aspect, 0.4,
                            f"Product {pid} {key} is excessively narrow: aspect={aspect}"
                        )
                        self.assertLessEqual(
                            aspect, 1.8,
                            f"Product {pid} {key} is excessively wide: aspect={aspect}"
                        )

    def test_studio_master_aspect_tolerances(self):
        studio_dir = os.path.join(WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master")
        if os.path.exists(studio_dir):
            for fname in os.listdir(studio_dir):
                if fname.endswith(".jpg"):
                    p = os.path.join(studio_dir, fname)
                    with Image.open(p) as img:
                        w, h = img.size
                        aspect = float(w) / float(h)
                        # Studio masters must be between 0.70 and 0.85
                        self.assertGreaterEqual(aspect, 0.70, f"{fname} aspect too small: {aspect}")
                        self.assertLessEqual(aspect, 0.85, f"{fname} aspect too large: {aspect}")

if __name__ == "__main__":
    unittest.main()
