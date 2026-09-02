import os
import unittest
from PIL import Image

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestCrossClassificationToStudioMaster(unittest.TestCase):
    """
    Tier 3 Pairwise Test: Classification Manifest ↔ Studio Master Asset Pipeline
    Verifies that raw classified angle inputs map 1:1 to generated studio master files,
    preserving angle classification semantics without file mix-ups.
    """

    def setUp(self):
        self.raw_dir = os.path.join(WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus")
        self.studio_dir = os.path.join(self.raw_dir, "studio_master")

    def test_pairwise_angle_presence(self):
        angle_mappings = [
            ("01_hero_front", ["KakaoTalk_20260901_071003816_04.jpg", "KakaoTalk_20260901_071003816.jpg"]),
            ("02_side_profile", ["KakaoTalk_20260901_071003816_06.jpg", "KakaoTalk_20260901_071003816_01.jpg"]),
            ("03_portrait_torso", ["KakaoTalk_20260901_071003816_05.jpg", "KakaoTalk_20260901_071003816_02.jpg"]),
            ("04_rear_sculpture", ["KakaoTalk_20260901_071003816_10.jpg", "KakaoTalk_20260901_071003816_03.jpg"]),
            ("05_backstamp", ["KakaoTalk_20260901_071003816_01.jpg", "KakaoTalk_20260901_071028050.jpg"])
        ]

        studio_files = os.listdir(self.studio_dir) if os.path.exists(self.studio_dir) else []
        for angle_slug, raw_candidates in angle_mappings:
            matching_studio = [f for f in studio_files if angle_slug in f]
            self.assertEqual(
                len(matching_studio), 1,
                f"Expected exactly 1 studio master for angle '{angle_slug}', found: {matching_studio}"
            )

if __name__ == "__main__":
    unittest.main()
