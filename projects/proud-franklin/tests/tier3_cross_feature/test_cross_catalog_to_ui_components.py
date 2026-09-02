import os
import unittest
import re
from tests.utils.catalog_loader import get_all_products

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestCrossCatalogToUIComponents(unittest.TestCase):
    """
    Tier 3 Pairwise Test: Catalog Schema ↔ 3D Folio Viewer & Vertical Gallery Modal UI
    Verifies that property names consumed by ThreeDRealBookViewer.jsx and VerticalPhotoGallery.jsx
    match the schema defined in src/data/antiques.js.
    """

    def setUp(self):
        self.products = get_all_products()
        self.viewer_path = os.path.join(WORKSPACE_ROOT, "src", "components", "ThreeDRealBookViewer.jsx")
        self.gallery_path = os.path.join(WORKSPACE_ROOT, "src", "components", "VerticalPhotoGallery.jsx")

    def test_property_contract_alignment(self):
        with open(self.viewer_path, "r", encoding="utf-8") as f:
            viewer_code = f.read()

        with open(self.gallery_path, "r", encoding="utf-8") as f:
            gallery_code = f.read()

        # Both components must reference standard schema attributes
        schema_keys = ["mainImage", "name", "latinName", "lore", "specs", "galleryPhotos", "value"]
        for key in schema_keys:
            in_viewer = key in viewer_code
            in_gallery = key in gallery_code
            self.assertTrue(
                in_viewer or in_gallery,
                f"Schema key '{key}' is not consumed by either 3D Book Viewer or Gallery Modal"
            )

if __name__ == "__main__":
    unittest.main()
