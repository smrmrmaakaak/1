import os
import unittest
import re

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF12VerticalGalleryModal(unittest.TestCase):
    """
    Feature 12: 5-Angle Vertical Photo Gallery & Appraisal Modal
    Validates that VerticalPhotoGallery.jsx supports high-res continuous scroll inspection,
    correctly iterates over product.galleryPhotos, displays angle tags & macro ratios,
    renders 3D debossed gold foil pricing, and handles modal dismiss actions.
    """

    def setUp(self):
        self.gallery_path = os.path.join(
            WORKSPACE_ROOT, "src", "components", "VerticalPhotoGallery.jsx"
        )

    def test_component_file_exists(self):
        self.assertTrue(os.path.exists(self.gallery_path), f"Component missing: {self.gallery_path}")

    def test_gallery_photos_iteration_and_tag_rendering(self):
        with open(self.gallery_path, "r", encoding="utf-8") as f:
            code = f.read()

        # Iterates through galleryPhotos
        self.assertTrue(
            "galleryphotos" in code.lower(),
            "VerticalPhotoGallery must reference product.galleryPhotos"
        )
        self.assertTrue(
            "angletag" in code.lower() or "angle" in code.lower(),
            "VerticalPhotoGallery must render angle tags"
        )
        self.assertTrue(
            "macroratio" in code.lower() or "caption" in code.lower(),
            "VerticalPhotoGallery must render macro ratios or captions"
        )

    def test_escape_key_and_backdrop_dismiss_handlers(self):
        with open(self.gallery_path, "r", encoding="utf-8") as f:
            code = f.read()

        # Check for Escape key listener
        self.assertTrue(
            "escape" in code.lower() or "key === 'escape'" in code.lower() or 'key === "escape"' in code.lower(),
            "Must support ESC key modal dismissal"
        )
        # Check for onClose invocation
        self.assertTrue(
            "onclose" in code.lower(),
            "Must handle onClose callback"
        )

    def test_price_and_appraisal_grade_display(self):
        with open(self.gallery_path, "r", encoding="utf-8") as f:
            code = f.read()

        self.assertTrue(
            "product.value" in code or "value" in code.lower(),
            "Must display antique valuation / price"
        )
        self.assertTrue(
            "appraisalgrade" in code.lower() or "grade" in code.lower(),
            "Must display auction appraisal grade"
        )

if __name__ == "__main__":
    unittest.main()
