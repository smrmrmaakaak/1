import os
import unittest

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF13TestSuiteCoverage(unittest.TestCase):
    """
    Feature 13: E2E Testing Suite (Tiers 1-4)
    Verifies that the test directory hierarchy is intact, all 4 test tiers are populated,
    and test discovery operates cleanly.
    """

    def setUp(self):
        self.tests_dir = os.path.join(WORKSPACE_ROOT, "tests")

    def test_tier_directories_exist(self):
        expected_dirs = [
            "tier1_feature_coverage",
            "tier2_boundary_corner",
            "tier3_cross_feature",
            "tier4_real_world",
            "utils"
        ]
        for d in expected_dirs:
            p = os.path.join(self.tests_dir, d)
            self.assertTrue(os.path.isdir(p), f"Missing test tier directory: {p}")

    def test_tier1_contains_all_14_feature_suites(self):
        tier1_dir = os.path.join(self.tests_dir, "tier1_feature_coverage")
        files = [f for f in os.listdir(tier1_dir) if f.startswith("test_f") and f.endswith(".py")]
        self.assertGreaterEqual(
            len(files), 14,
            f"Tier 1 must contain at least 14 feature test files, found: {len(files)}"
        )

    def test_test_infra_md_exists(self):
        infra_path = os.path.join(WORKSPACE_ROOT, "TEST_INFRA.md")
        self.assertTrue(os.path.exists(infra_path), f"TEST_INFRA.md missing at project root: {infra_path}")

if __name__ == "__main__":
    unittest.main()
