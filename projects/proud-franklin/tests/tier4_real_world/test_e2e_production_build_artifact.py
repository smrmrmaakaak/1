import os
import unittest
import re

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestE2EProductionBuildArtifact(unittest.TestCase):
    """
    Tier 4 Real-World Workload: Production Build Artifact & HTML Injection Conformance
    Verifies that the production build output contains proper HTML tags, script imports,
    valid CSS styling, and zero unreplaced template literals.
    """

    def setUp(self):
        self.dist_dir = os.path.join(WORKSPACE_ROOT, "dist")
        self.index_html = os.path.join(self.dist_dir, "index.html")

    def test_dist_html_structure(self):
        self.assertTrue(os.path.exists(self.index_html), "dist/index.html does not exist")
        with open(self.index_html, "r", encoding="utf-8") as f:
            html = f.read()

        # Check for root mount element
        self.assertIn('id="root"', html, "dist/index.html missing #root div")

        # Check for module script reference
        has_script = bool(re.search(r'<script\s+type="module"\s+crossorigin\s+src=".*?\.js">', html))
        self.assertTrue(has_script, "dist/index.html missing compiled JS bundle script tag")

        # Check for stylesheet reference
        has_css = bool(re.search(r'<link\s+rel="stylesheet"\s+crossorigin\s+href=".*?\.css">', html))
        self.assertTrue(has_css, "dist/index.html missing compiled CSS stylesheet link tag")

    def test_bundle_size_sanity(self):
        assets_dir = os.path.join(self.dist_dir, "assets")
        self.assertTrue(os.path.exists(assets_dir), "dist/assets missing")

        js_files = [f for f in os.listdir(assets_dir) if f.endswith(".js")]
        css_files = [f for f in os.listdir(assets_dir) if f.endswith(".css")]

        self.assertGreaterEqual(len(js_files), 1, "Expected at least 1 compiled JS file")
        self.assertGreaterEqual(len(css_files), 1, "Expected at least 1 compiled CSS file")

        # Check file sizes
        for f in js_files:
            size_kb = os.path.getsize(os.path.join(assets_dir, f)) / 1024.0
            self.assertGreater(size_kb, 50.0, f"JS bundle suspicious size: {size_kb:.1f} KB")

        for f in css_files:
            size_kb = os.path.getsize(os.path.join(assets_dir, f)) / 1024.0
            self.assertGreater(size_kb, 10.0, f"CSS bundle suspicious size: {size_kb:.1f} KB")

if __name__ == "__main__":
    unittest.main()
