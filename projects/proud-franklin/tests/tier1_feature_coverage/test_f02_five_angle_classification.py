import os
import unittest
from tests.utils.catalog_loader import get_product_by_id

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF02FiveAngleClassification(unittest.TestCase):
    """
    Feature 2: 5-Angle Precision Classification
    Verifies that antique collection photography is classified into the 5 canonical
    auction appraisal angles:
    1. HERO_FRONT (전신 전면 마스터)
    2. SIDE_PROFILE (3/4 측면 프로필)
    3. PORTRAIT_TORSO (상체 및 마크로 디테일)
    4. REAR_SCULPTURE (후면 조형미 및 드레이퍼리)
    5. BASE_BACKSTAMP (하단 백스탬프 / 각인 / 보증 번호)
    """

    def setUp(self):
        self.venus = get_product_by_id("prod-lladro-gres-2256-venus")
        self.studio_master_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )

    def test_venus_product_found(self):
        self.assertIsNotNone(self.venus, "prod-lladro-gres-2256-venus must exist in catalog")

    def test_five_canonical_angles_exist_on_disk(self):
        expected_files = [
            "venus_01_hero_front.jpg",
            "venus_02_side_profile.jpg",
            "venus_03_portrait_torso.jpg",
            "venus_04_rear_sculpture.jpg",
            "venus_05_backstamp.jpg"
        ]
        for f in expected_files:
            file_path = os.path.join(self.studio_master_dir, f)
            self.assertTrue(
                os.path.exists(file_path),
                f"Required classified studio angle asset missing: {file_path}"
            )

    def test_gallery_photos_contain_all_five_angles(self):
        gallery = self.venus.get("galleryPhotos", [])
        self.assertGreaterEqual(len(gallery), 5, "Gallery must contain at least 5 photos")

        # Collect angle tags and macro ratios
        angle_tags = [p.get("angleTag", "") for p in gallery]
        macro_ratios = [p.get("macroRatio", "") for p in gallery]
        srcs = [p.get("src", "") for p in gallery]

        # Verify 5 angle types are represented
        has_hero = any("HERO" in tag or "MASTER" in ratio for tag, ratio in zip(angle_tags, macro_ratios))
        has_profile = any("PROFILE" in tag or "PROFILE" in ratio for tag, ratio in zip(angle_tags, macro_ratios))
        has_portrait = any("PORTRAIT" in tag or "PORTRAIT" in ratio for tag, ratio in zip(angle_tags, macro_ratios))
        has_rear = any("REAR" in tag or "REAR" in ratio for tag, ratio in zip(angle_tags, macro_ratios))
        has_stamp = any("STAMP" in tag or "HALLMARK" in ratio for tag, ratio in zip(angle_tags, macro_ratios))

        self.assertTrue(has_hero, "Missing HERO angle in gallery")
        self.assertTrue(has_profile, "Missing PROFILE angle in gallery")
        self.assertTrue(has_portrait, "Missing PORTRAIT angle in gallery")
        self.assertTrue(has_rear, "Missing REAR angle in gallery")
        self.assertTrue(has_stamp, "Missing STAMP angle in gallery")

    def test_angle_sources_are_distinct(self):
        gallery = self.venus.get("galleryPhotos", [])
        first_5_srcs = [p.get("src") for p in gallery[:5]]
        unique_srcs = set(first_5_srcs)
        self.assertEqual(len(unique_srcs), 5, f"All 5 studio master angles must reference unique source files, got: {first_5_srcs}")

if __name__ == "__main__":
    unittest.main()
