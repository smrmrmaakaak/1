import os
import unittest
from tests.utils.catalog_loader import get_product_by_id

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestCrossStudioToCatalogSync(unittest.TestCase):
    """
    Tier 3 Pairwise Test: Studio Master Assets ↔ Catalog Data Synchronization
    Verifies that all 5 generated studio master images are accurately linked
    in src/data/antiques.js with corresponding angleTag and macroRatio properties.
    """

    def setUp(self):
        self.venus = get_product_by_id("prod-lladro-gres-2256-venus")
        self.studio_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )

    def test_main_and_detail_image_links(self):
        self.assertEqual(
            self.venus.get("mainImage"),
            "/artifacts/lladro_gres_venus/studio_master/venus_01_hero_front.jpg"
        )
        self.assertEqual(
            self.venus.get("detailImage"),
            "/artifacts/lladro_gres_venus/studio_master/venus_03_portrait_torso.jpg"
        )

    def test_gallery_photos_angle_tag_and_macro_ratio_sync(self):
        gallery = self.venus.get("galleryPhotos", [])
        expected_mappings = [
            ("venus_01_hero_front.jpg", "HERO", "MASTER"),
            ("venus_03_portrait_torso.jpg", "PORTRAIT", "PORTRAIT"),
            ("venus_02_side_profile.jpg", "PROFILE", "PROFILE"),
            ("venus_04_rear_sculpture.jpg", "REAR", "REAR"),
            ("venus_05_backstamp.jpg", "STAMP", "HALLMARK")
        ]

        for filename, expected_tag, expected_macro in expected_mappings:
            matching_photos = [
                p for p in gallery
                if filename in p.get("src", "")
            ]
            self.assertEqual(
                len(matching_photos), 1,
                f"Expected exactly 1 gallery photo entry for {filename}, got: {len(matching_photos)}"
            )
            photo = matching_photos[0]
            self.assertIn(
                expected_tag, photo.get("angleTag", ""),
                f"Photo {filename} angleTag mismatch: '{photo.get('angleTag')}'"
            )
            self.assertIn(
                expected_macro, photo.get("macroRatio", ""),
                f"Photo {filename} macroRatio mismatch: '{photo.get('macroRatio')}'"
            )

if __name__ == "__main__":
    unittest.main()
