import os
import subprocess
import unittest

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF14BuildVerification(unittest.TestCase):
    """
    Feature 14: Build Verification & Production Compilation
    Verifies that the entire React/Vite application compiles to production bundle
    without errors, warnings breaking compilation, or missing module imports.
    """

    def test_vite_production_build_succeeds(self):
        """
        Executes 'npm run build' and asserts exit code 0 and valid dist output.
        """
        cmd = ["npm.cmd" if os.name == "nt" else "npm", "run", "build"]
        res = subprocess.run(
            cmd,
            cwd=WORKSPACE_ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=60
        )
        self.assertEqual(
            res.returncode, 0,
            f"npm run build failed with exit code {res.returncode}:\nSTDOUT:\n{res.stdout}\nSTDERR:\n{res.stderr}"
        )

        # Verify dist/ directory output
        dist_dir = os.path.join(WORKSPACE_ROOT, "dist")
        self.assertTrue(os.path.exists(dist_dir), "dist/ directory was not generated")

        index_html = os.path.join(dist_dir, "index.html")
        self.assertTrue(os.path.exists(index_html), "dist/index.html missing from build output")

        assets_dir = os.path.join(dist_dir, "assets")
        self.assertTrue(os.path.exists(assets_dir), "dist/assets/ directory missing from build output")

        asset_files = os.listdir(assets_dir)
        has_js = any(f.endswith(".js") for f in asset_files)
        has_css = any(f.endswith(".css") for f in asset_files)
        self.assertTrue(has_js, f"dist/assets/ missing compiled .js file: {asset_files}")
        self.assertTrue(has_css, f"dist/assets/ missing compiled .css file: {asset_files}")

if __name__ == "__main__":
    unittest.main()
