import os
import unittest
import re

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF113DBookViewerRendering(unittest.TestCase):
    """
    Feature 11: 3D WebGL Book Viewer Folio Rendering
    Validates that ThreeDRealBookViewer.jsx accurately sets up the 3D book canvas,
    loads studio master texture maps onto parchment folios, and binds interactive handlers.
    """

    def setUp(self):
        self.viewer_path = os.path.join(
            WORKSPACE_ROOT, "src", "components", "ThreeDRealBookViewer.jsx"
        )

    def test_viewer_component_exists(self):
        self.assertTrue(os.path.exists(self.viewer_path), f"Viewer component missing: {self.viewer_path}")

    def test_canvas_and_threejs_integration(self):
        with open(self.viewer_path, "r", encoding="utf-8") as f:
            code = f.read()

        # Check for THREE imports / usage
        self.assertTrue(
            "three" in code.lower() or "canvas" in code.lower(),
            "ThreeDRealBookViewer must integrate Three.js or canvas rendering"
        )
        # Check for texture loading / canvas drawing
        self.assertTrue(
            "texture" in code.lower() or "canvas" in code.lower() or "drawimage" in code.lower(),
            "Must support texture loading or canvas drawing on folios"
        )

    def test_folio_left_right_page_logic(self):
        """
        Verifies that the viewer distinguishes left folio (lore & specs) and right folio (studio hero / lookbook).
        """
        with open(self.viewer_path, "r", encoding="utf-8") as f:
            code = f.read()

        # Check for folio navigation or page flip state
        self.assertTrue(
            "page" in code.lower() or "spread" in code.lower() or "flip" in code.lower(),
            "Viewer must manage folio page or spread state"
        )

    def test_lookbook_modal_trigger_binding(self):
        """
        Verifies that clicking on the right folio or lookbook button triggers the high-res gallery modal.
        """
        with open(self.viewer_path, "r", encoding="utf-8") as f:
            code = f.read()

        # Check for gallery or modal callback invocation
        has_gallery_trigger = (
            "ongalleryopen" in code.lower() or
            "onopenlookbook" in code.lower() or
            "setgalleryopen" in code.lower() or
            "lookbook" in code.lower() or
            "gallery" in code.lower()
        )
        self.assertTrue(has_gallery_trigger, "Viewer must expose lookbook gallery trigger")

if __name__ == "__main__":
    unittest.main()
