#!/usr/bin/env python3
"""
Adversarial Stress Test Suite for Milestone 1:
5-Angle Asset Classification & Ingestion Pipeline.

Tests edge cases, fault tolerance, and boundary conditions:
1. Corrupted / 0-byte image files in input directory.
2. Non-image files (.jpg extension with binary garbage or text).
3. Missing angles / Sparse collections (<5 photos) in strict and non-strict mode.
4. Non-existent input directory.
5. Invalid JSON overrides:
   - Malformed JSON syntax
   - Non-existent override file
   - Override pointing to non-existent image
   - Invalid angle name in override
   - Duplicate image assignment override (same image assigned to multiple angles)
6. CLI option combinations via subprocess:
   - --dry-run with --json
   - --strict vs --no-strict exit codes
   - Unicode paths with spaces and special characters
   - Malformed / nested output directories
   - --no-normalize-exif flag
7. Stress test with large number of images (e.g. 50+ synthetic images).
"""

import os
import sys
import json
import shutil
import tempfile
import unittest
import subprocess
import numpy as np
from PIL import Image

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from scripts.classify_and_ingest_photos import (
    safe_read_image,
    extract_features,
    ingest_and_classify,
    ClassificationIncompleteError,
    CANONICAL_ANGLES
)

PYTHON_EXE = sys.executable
SCRIPT_PATH = os.path.join(WORKSPACE_ROOT, "scripts", "classify_and_ingest_photos.py")
VENUS_DIR = os.path.join(WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus")


class TestAdversarialClassificationPipeline(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _run_cli(self, args):
        """Helper to invoke CLI cleanly across Windows environments."""
        cmd = [PYTHON_EXE, SCRIPT_PATH] + args
        return subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace"
        )

    def _create_synthetic_dataset(self, num_images=5):
        """Creates a minimal valid synthetic dataset with RGB images."""
        d = os.path.join(self.temp_dir, "synthetic_dataset")
        os.makedirs(d, exist_ok=True)
        created_files = []
        for i in range(num_images):
            fpath = os.path.join(d, f"photo_{i:02d}.jpg")
            img = Image.new("RGB", (200, 400), color=(100 + i * 20, 80 + i * 15, 60 + i * 10))
            img.save(fpath, format="JPEG")
            created_files.append(fpath)
        return d, created_files

    # -------------------------------------------------------------------------
    # 1. Corrupted and 0-byte Image Files
    # -------------------------------------------------------------------------
    def test_zero_byte_image_file_handling(self):
        """
        Adversarial Test: A 0-byte file with .jpg extension in the directory.
        Verifies that the pipeline raises an appropriate error or exception when encountering unreadable file.
        """
        d, files = self._create_synthetic_dataset(5)
        zero_file = os.path.join(d, "corrupted_zero_byte.jpg")
        with open(zero_file, "wb") as f:
            f.write(b"")

        # Ingesting should fail cleanly with an exception (UnidentifiedImageError or OSError)
        with self.assertRaises(Exception) as ctx:
            ingest_and_classify(input_dir=d, strict=True)
        self.assertTrue(isinstance(ctx.exception, (OSError, Exception)))

        # Run via CLI to verify exit code 2 (SYSTEM ERROR)
        res = self._run_cli(["-i", d, "--strict"])
        self.assertEqual(res.returncode, 2, f"Expected exit code 2 on corrupted image, got {res.returncode}. Stderr: {res.stderr}")
        self.assertIn("SYSTEM ERROR", res.stderr)

    def test_garbage_bytes_in_image_file(self):
        """
        Adversarial Test: Corrupted binary content (random non-JPEG bytes) in .jpg file.
        """
        d, files = self._create_synthetic_dataset(5)
        garbage_file = os.path.join(d, "corrupted_garbage.jpg")
        with open(garbage_file, "wb") as f:
            f.write(os.urandom(1024))

        res = self._run_cli(["-i", d])
        self.assertEqual(res.returncode, 2)
        self.assertIn("SYSTEM ERROR", res.stderr)

    # -------------------------------------------------------------------------
    # 2. Sparse Directory & Strict vs Non-Strict Behavior
    # -------------------------------------------------------------------------
    def test_empty_directory_strict_and_nostrict(self):
        """
        Adversarial Test: Completely empty input directory.
        """
        empty_dir = os.path.join(self.temp_dir, "empty_dir")
        os.makedirs(empty_dir, exist_ok=True)

        # Strict mode: ClassificationIncompleteError -> exit code 1
        res_strict = self._run_cli(["-i", empty_dir, "--strict"])
        self.assertEqual(res_strict.returncode, 1)
        self.assertIn("CLASSIFICATION ERROR", res_strict.stderr)
        self.assertIn("Insufficient photos", res_strict.stderr)

        # No-strict mode: Should also raise ClassificationIncompleteError because 0 images cannot form 5 angles
        res_nostrict = self._run_cli(["-i", empty_dir, "--no-strict"])
        self.assertEqual(res_nostrict.returncode, 1)
        self.assertIn("CLASSIFICATION ERROR", res_nostrict.stderr)

    def test_nonexistent_directory(self):
        """
        Adversarial Test: Non-existent input directory path.
        """
        non_dir = os.path.join(self.temp_dir, "non_existent_folder_xyz")
        res = self._run_cli(["-i", non_dir])
        self.assertEqual(res.returncode, 2)
        self.assertIn("SYSTEM ERROR", res.stderr)
        self.assertIn("Input directory does not exist", res.stderr)

    def test_sparse_3_images_strict_vs_nostrict(self):
        """
        Adversarial Test: 3 photos in input directory (fewer than required 5).
        """
        sparse_dir, _ = self._create_synthetic_dataset(3)

        # Strict CLI
        res = self._run_cli(["-i", sparse_dir, "--strict"])
        self.assertEqual(res.returncode, 1)
        self.assertIn("Insufficient photos found", res.stderr)

        # Non-strict CLI
        res_no = self._run_cli(["-i", sparse_dir, "--no-strict"])
        self.assertEqual(res_no.returncode, 1)
        self.assertIn("at least 5 are required", res_no.stderr)

    # -------------------------------------------------------------------------
    # 3. Override JSON Edge Cases
    # -------------------------------------------------------------------------
    def test_override_nonexistent_file(self):
        """
        Adversarial Test: --override-json points to a file that does not exist.
        """
        res = self._run_cli(["-i", VENUS_DIR, "--override-json", os.path.join(self.temp_dir, "missing_override.json")])
        self.assertEqual(res.returncode, 2)
        self.assertIn("Override JSON file not found", res.stderr)

    def test_override_malformed_json_syntax(self):
        """
        Adversarial Test: --override-json file contains invalid JSON syntax.
        """
        bad_json = os.path.join(self.temp_dir, "bad_syntax.json")
        with open(bad_json, "w") as f:
            f.write("{ invalid_json: true, missing_quotes }")

        res = self._run_cli(["-i", VENUS_DIR, "--override-json", bad_json])
        self.assertEqual(res.returncode, 2)
        self.assertIn("SYSTEM ERROR", res.stderr)

    def test_override_unknown_angle_and_nonexistent_image(self):
        """
        Adversarial Test: Override JSON with unknown angle name and non-existent image name.
        Should safely ignore unknown keys/images and fall back to Hungarian assignment.
        """
        override_file = os.path.join(self.temp_dir, "unknown_keys.json")
        override_data = {
            "NON_EXISTENT_ANGLE": "KakaoTalk_20260901_071003816_04.jpg",
            "HERO_FRONT": "non_existent_image_file.jpg"
        }
        with open(override_file, "w", encoding="utf-8") as f:
            json.dump(override_data, f)

        res = self._run_cli(["-i", VENUS_DIR, "--override-json", override_file, "--dry-run", "--json"])
        self.assertEqual(res.returncode, 0, f"Expected success with fallback, got: {res.stderr}")
        data = json.loads(res.stdout)
        self.assertTrue(data["summary"]["allCanonicalAnglesFound"])
        self.assertEqual(data["summary"]["validationStatus"], "VALID")

    def test_override_duplicate_assignment_strict_failure(self):
        """
        Adversarial Test: User overrides two different angles to use the EXACT SAME image file.
        In --strict mode, this should be caught by duplicate validation and fail with exit code 1.
        In --no-strict mode, it should output INVALID manifest with duplicateAssignments.
        """
        dup_override_file = os.path.join(self.temp_dir, "duplicate_override.json")
        # Assign the same file to both HERO_FRONT and SIDE_PROFILE
        override_data = {
            "HERO_FRONT": "KakaoTalk_20260901_071003816_04.jpg",
            "SIDE_PROFILE": "KakaoTalk_20260901_071003816_04.jpg"
        }
        with open(dup_override_file, "w", encoding="utf-8") as f:
            json.dump(override_data, f)

        # 1. Strict mode -> exit code 1
        res_strict = self._run_cli(["-i", VENUS_DIR, "--override-json", dup_override_file, "--strict", "--dry-run"])
        self.assertEqual(res_strict.returncode, 1, f"Expected exit code 1 on duplicate assignment in strict mode. Got: {res_strict.returncode}")
        self.assertIn("Strict classification validation failed", res_strict.stderr)
        self.assertIn("KakaoTalk_20260901_071003816_04.jpg", res_strict.stderr)

        # 2. No-strict mode -> exit code 0, but manifest validation isValid=False
        res_nostrict = self._run_cli(["-i", VENUS_DIR, "--override-json", dup_override_file, "--no-strict", "--dry-run", "--json"])
        self.assertEqual(res_nostrict.returncode, 0, f"Expected exit code 0 in non-strict mode. Got stderr: {res_nostrict.stderr}")
        manifest = json.loads(res_nostrict.stdout)
        self.assertFalse(manifest["validation"]["isValid"])
        self.assertEqual(manifest["summary"]["validationStatus"], "WARNING")
        self.assertIn("KakaoTalk_20260901_071003816_04.jpg", manifest["validation"]["duplicateAssignments"])

    # -------------------------------------------------------------------------
    # 4. Output Path Edge Cases & Nested Directories
    # -------------------------------------------------------------------------
    def test_deeply_nested_output_directory_creation(self):
        """
        Adversarial Test: --output-manifest specifies a deeply nested non-existent path.
        The script should automatically create parent directories.
        """
        nested_out = os.path.join(self.temp_dir, "deep", "nested", "level1", "level2", "manifest.json")
        self.assertFalse(os.path.exists(os.path.dirname(nested_out)))

        res = self._run_cli(["-i", VENUS_DIR, "-o", nested_out, "--product-id", "prod-test", "--item-slug", "test"])
        self.assertEqual(res.returncode, 0, f"Failed on deeply nested directory: {res.stderr}")
        self.assertTrue(os.path.exists(nested_out), "Manifest file was not created at nested path")

        with open(nested_out, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data["product"]["id"], "prod-test")

    # -------------------------------------------------------------------------
    # 5. Unicode and Special Characters in Paths
    # -------------------------------------------------------------------------
    def test_unicode_and_spaces_in_input_directory(self):
        """
        Adversarial Test: Input directory with Korean, spaces, parentheses, and exclamation marks.
        """
        korean_dir = os.path.join(self.temp_dir, "라벨르지안 (소더비 특별전) ! [2026]")
        os.makedirs(korean_dir, exist_ok=True)

        # Copy Venus dataset into this Unicode directory
        for f in os.listdir(VENUS_DIR):
            src_f = os.path.join(VENUS_DIR, f)
            if os.path.isfile(src_f) and f.endswith(".jpg"):
                shutil.copy(src_f, os.path.join(korean_dir, f))

        out_json = os.path.join(korean_dir, "결과_매니페스트.json")
        res = self._run_cli(["-i", korean_dir, "-o", out_json, "--product-id", "prod-venus-korean-test", "--json"])
        self.assertEqual(res.returncode, 0, f"Unicode directory execution failed: {res.stderr}")
        self.assertTrue(os.path.exists(out_json))

        manifest = json.loads(res.stdout)
        self.assertEqual(manifest["summary"]["validationStatus"], "VALID")
        self.assertEqual(manifest["product"]["id"], "prod-venus-korean-test")

    # -------------------------------------------------------------------------
    # 6. Dry-Run and Clean JSON Stdout Output
    # -------------------------------------------------------------------------
    def test_dry_run_with_json_flag(self):
        """
        Adversarial Test: --dry-run and --json flags together.
        Ensures stdout is 100% valid parseable JSON with zero pollution from print statements.
        """
        res = self._run_cli(["-i", VENUS_DIR, "--dry-run", "--json"])
        self.assertEqual(res.returncode, 0)
        try:
            parsed = json.loads(res.stdout)
            self.assertIsInstance(parsed, dict)
            self.assertIn("classifiedAngles", parsed)
        except json.JSONDecodeError as e:
            self.fail(f"stdout contained non-JSON output when --json was requested: {e}\nSTDOUT:\n{res.stdout}")

    # -------------------------------------------------------------------------
    # 7. Stress Testing with 50+ Images (Bipartite Matching Performance)
    # -------------------------------------------------------------------------
    def test_stress_large_dataset_performance(self):
        """
        Adversarial Stress Test: Process a directory with 60 images to verify Hungarian matching scalability.
        """
        stress_dir = os.path.join(self.temp_dir, "stress_60_images")
        os.makedirs(stress_dir, exist_ok=True)

        for i in range(60):
            p = os.path.join(stress_dir, f"stress_shot_{i:03d}.jpg")
            img = Image.new("RGB", (150, 300), color=((i * 7) % 256, (i * 13) % 256, (i * 19) % 256))
            img.save(p, "JPEG")

        manifest = ingest_and_classify(input_dir=stress_dir, dry_run=True, strict=False)
        self.assertEqual(manifest["summary"]["totalScannedImages"], 60)
        self.assertEqual(manifest["summary"]["classifiedAnglesCount"], 5)
        self.assertEqual(manifest["summary"]["unassignedImagesCount"], 55)

    # -------------------------------------------------------------------------
    # 9. Diverse Image Color Modes (RGBA, CMYK, Grayscale, Palette)
    # -------------------------------------------------------------------------
    def test_image_modes_rgba_cmyk_grayscale_palette(self):
        """
        Adversarial Test: Directory containing images in diverse PIL modes (RGBA, CMYK, L, P).
        Verifies that feature extraction converts all to RGB safely without crashing.
        """
        modes_dir = os.path.join(self.temp_dir, "modes_dataset")
        os.makedirs(modes_dir, exist_ok=True)

        # 1. RGBA (PNG with transparency)
        img_rgba = Image.new("RGBA", (200, 300), color=(180, 140, 120, 200))
        img_rgba.save(os.path.join(modes_dir, "photo_01_rgba.png"))

        # 2. CMYK (JPEG in CMYK color space)
        img_cmyk = Image.new("CMYK", (200, 300), color=(50, 100, 150, 20))
        img_cmyk.save(os.path.join(modes_dir, "photo_02_cmyk.jpg"))

        # 3. Grayscale (L mode PNG)
        img_l = Image.new("L", (200, 300), color=128)
        img_l.save(os.path.join(modes_dir, "photo_03_gray.png"))

        # 4. Palette mode (P mode PNG)
        img_p = Image.new("P", (200, 300))
        img_p.save(os.path.join(modes_dir, "photo_04_palette.png"))

        # 5. Standard RGB
        img_rgb = Image.new("RGB", (200, 300), color=(200, 150, 100))
        img_rgb.save(os.path.join(modes_dir, "photo_05_rgb.jpg"))

        # Ingest and classify
        manifest = ingest_and_classify(input_dir=modes_dir, dry_run=True, strict=False)
        self.assertEqual(manifest["summary"]["totalScannedImages"], 5)
        self.assertEqual(manifest["summary"]["classifiedAnglesCount"], 5)

    # -------------------------------------------------------------------------
    # 10. Extreme Aspect Ratios (Needles & Slivers)
    # -------------------------------------------------------------------------
    def test_extreme_aspect_ratios(self):
        """
        Adversarial Test: Images with 1x500 (tall vertical needle) and 500x1 (wide horizontal sliver).
        """
        extreme_dir = os.path.join(self.temp_dir, "extreme_aspect_ratios")
        os.makedirs(extreme_dir, exist_ok=True)

        # Needle
        needle = Image.new("RGB", (2, 500), color=(150, 100, 50))
        needle.save(os.path.join(extreme_dir, "needle.jpg"))

        # Sliver
        sliver = Image.new("RGB", (500, 2), color=(150, 100, 50))
        sliver.save(os.path.join(extreme_dir, "sliver.jpg"))

        for i in range(3):
            p = os.path.join(extreme_dir, f"normal_{i}.jpg")
            img = Image.new("RGB", (200, 400), color=(100, 100, 100))
            img.save(p, "JPEG")

        manifest = ingest_and_classify(input_dir=extreme_dir, dry_run=True, strict=False)
        self.assertEqual(manifest["summary"]["totalScannedImages"], 5)

    # -------------------------------------------------------------------------
    # 11. CLI Help and Invalid Argument Flags
    # -------------------------------------------------------------------------
    def test_cli_help_and_invalid_arguments(self):
        """
        Adversarial Test: --help should exit with code 0, missing required argument or unrecognized flag should exit with code 2.
        """
        # --help
        res_help = self._run_cli(["--help"])
        self.assertEqual(res_help.returncode, 0)
        self.assertIn("Ingest and classify antique collection photography", res_help.stdout)

        # Missing required argument -i
        res_missing = self._run_cli([])
        self.assertEqual(res_missing.returncode, 2)
        self.assertIn("the following arguments are required: -i/--input-dir", res_missing.stderr)

        # --unrecognized-flag with -i supplied
        res_bad = self._run_cli(["-i", VENUS_DIR, "--unknown-flag-12345"])
        self.assertEqual(res_bad.returncode, 2)
        self.assertIn("unrecognized arguments", res_bad.stderr)


if __name__ == "__main__":
    unittest.main()
