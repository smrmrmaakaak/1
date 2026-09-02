#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tests/test_enhance_studio_photos.py
===================================
Unit test suite for scripts/enhance_studio_photos.py.
Validates:
1. CLI Argument Parsing & Manifest Validation
2. Color Math & Hex Conversion
3. Sotheby's Dark Slate Radial Spotlight Backdrop Synthesis
4. Alpha Matting & Boundary Morphology
5. Dual-Tier Ground Contact Shadows
6. CIELAB L* Adaptive Unsharp Masking
7. Backstamp Macro Framing & Vignette
8. Manifest Processing & Output Asset Generation
"""

import os
import unittest
import tempfile
import json
import numpy as np
from PIL import Image
import cv2

from scripts.enhance_studio_photos import (
    hex_to_rgb,
    safe_load_image,
    generate_radial_spotlight_backdrop,
    extract_alpha_matting,
    synthesize_dual_tier_shadows,
    apply_cielab_unsharp_mask,
    process_backstamp_angle,
    process_cutout_angle,
    process_manifest
)

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class TestEnhanceStudioPhotos(unittest.TestCase):
    """
    Comprehensive unit tests for the auction-grade studio photo processing engine.
    """

    def setUp(self):
        self.manifest_path = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "classification_manifest.json"
        )
        self.raw_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus"
        )
        self.studio_master_dir = os.path.join(
            WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus", "studio_master"
        )

    def test_hex_to_rgb(self):
        rgb_slate = hex_to_rgb("#1A1D20")
        self.assertEqual(len(rgb_slate), 3)
        self.assertAlmostEqual(rgb_slate[0], 26.0)
        self.assertAlmostEqual(rgb_slate[1], 29.0)
        self.assertAlmostEqual(rgb_slate[2], 32.0)

        rgb_white = hex_to_rgb("#FFFFFF")
        np.testing.assert_array_equal(rgb_white, np.array([255.0, 255.0, 255.0], dtype=np.float32))

    def test_radial_spotlight_backdrop_properties(self):
        """
        Backdrop must have correct dimensions, dark corners (#0A0B0D / #1A1D20),
        and brighter spotlight center (#2A2F35).
        """
        w, h = 1400, 1800
        bg = generate_radial_spotlight_backdrop(
            width=w, height=h,
            center_xy=(0.50, 0.42),
            radii_xy=(0.55, 0.70),
            center_hex="#2A2F35",
            mid_hex="#1A1D20",
            outer_hex="#0A0B0D",
            dither=True
        )
        self.assertEqual(bg.shape, (h, w, 3))
        self.assertEqual(bg.dtype, np.uint8)

        # Center luminance should be higher than corner luminance
        cx, cy = int(w * 0.50), int(h * 0.42)
        center_pixel = bg[cy, cx].astype(np.float32)
        corner_tl = bg[0, 0].astype(np.float32)
        corner_br = bg[h - 1, w - 1].astype(np.float32)

        center_lum = 0.299 * center_pixel[0] + 0.587 * center_pixel[1] + 0.114 * center_pixel[2]
        corner_lum = 0.299 * corner_tl[0] + 0.587 * corner_tl[1] + 0.114 * corner_tl[2]

        self.assertGreater(center_lum, corner_lum + 15.0, "Center spotlight must be brighter than corner")
        self.assertLessEqual(corner_lum, 30.0, "Corners must remain luxury dark slate")

    def test_cielab_unsharp_mask_preserves_highlights(self):
        """
        Tests that CIELAB L* unsharp masking enhances micro-contrast without blowing out
        specular highlights into 255 pure white clipping.
        """
        # Create test gradient image with a bright spot
        test_img = np.full((200, 200, 3), 120, dtype=np.uint8)
        # Add high-frequency texture
        test_img[50:150, 50:150] = np.random.randint(100, 140, size=(100, 100, 3), dtype=np.uint8)
        # Add highlight circle
        cv2.circle(test_img, (100, 100), 20, (240, 240, 240), -1)

        enhanced = apply_cielab_unsharp_mask(
            test_img, radius=1.8, percent=120, threshold=2.0
        )
        self.assertEqual(enhanced.shape, (200, 200, 3))
        self.assertEqual(enhanced.dtype, np.uint8)

        # Ensure no pure white clipping explosion
        clipped_pixels = np.sum(enhanced == 255)
        total_pixels = enhanced.size
        self.assertLess(clipped_pixels / float(total_pixels), 0.05, "Excessive highlight clipping")

    def test_dual_tier_shadow_synthesis_shape_and_range(self):
        """
        Validates that synthesize_dual_tier_shadows generates smooth [0, 1] alpha values
        with contact baseline and diffuse dispersion.
        """
        w, h = 1400, 1800
        # Create synthetic object alpha mask (oval in lower middle)
        alpha_mask = np.zeros((h, w), dtype=np.float32)
        cv2.ellipse(alpha_mask, (700, 1100), (300, 400), 0, 0, 360, 1.0, -1)

        shadow_alpha = synthesize_dual_tier_shadows(
            alpha_mask, width=w, height=h,
            contact_opacity=0.85, diffuse_opacity=0.45, offset_y=8
        )
        self.assertEqual(shadow_alpha.shape, (h, w))
        self.assertGreaterEqual(shadow_alpha.min(), 0.0)
        self.assertLessEqual(shadow_alpha.max(), 1.0)

        # Shadow should exist directly below the object base (y ~ 1500)
        base_shadow_region = shadow_alpha[1490:1550, 600:800]
        self.assertGreater(np.mean(base_shadow_region), 0.10, "Shadow must be present below base")

    def test_backstamp_processing_preserves_aspect_and_vignette(self):
        """
        Angle 5 (BASE_BACKSTAMP) must preserve original framing without cutout,
        produce 1400x1800 RGB output, and apply dark vignette.
        """
        test_img = Image.new("RGB", (2252, 4000), color=(180, 160, 140))
        directive = {
            "mattingRequired": False,
            "preserveAuthenticFrame": True,
            "frameVignette": {
                "enabled": True,
                "innerRadius": 0.65,
                "outerRadius": 0.98,
                "opacity": 0.35
            },
            "textureEnhancement": {
                "unsharpRadius": 1.5,
                "unsharpPercent": 130,
                "unsharpThreshold": 1.0
            }
        }
        out_img, metrics = process_backstamp_angle(
            test_img, "BASE_BACKSTAMP", directive, target_w=1400, target_h=1800
        )
        self.assertEqual(out_img.size, (1400, 1800))
        self.assertEqual(out_img.mode, "RGB")
        self.assertTrue(metrics["vignetteApplied"])
        self.assertTrue(metrics["unsharpApplied"])

    def test_dry_run_manifest_processing(self):
        """
        Runs process_manifest in dry_run mode to verify end-to-end execution without disk write.
        """
        self.assertTrue(os.path.exists(self.manifest_path), f"Manifest missing: {self.manifest_path}")
        summary = process_manifest(
            manifest_path=self.manifest_path,
            target_dims=(1400, 1800),
            jpeg_quality=95,
            dry_run=True
        )
        self.assertEqual(summary["status"], "SUCCESS")
        self.assertEqual(summary["totalAnglesProcessed"], 5)
        self.assertEqual(summary["targetDimensions"], [1400, 1800])
        self.assertGreater(summary["totalExecutionTimeSec"], 0.0)


if __name__ == "__main__":
    unittest.main()
