import os
import sys
import json
import shutil
import tempfile
import unittest
import numpy as np
from PIL import Image

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from scripts.classify_and_ingest_photos import (
    safe_read_image,
    compute_file_sha256,
    extract_features,
    score_image_for_angles,
    resolve_angle_assignments,
    ingest_and_classify,
    build_manifest,
    ClassificationIncompleteError,
    CANONICAL_ANGLES
)


class TestClassifyAndIngest(unittest.TestCase):
    """
    Unit and integration test suite for Milestone 1:
    5-Angle Asset Classification & Ingestion Pipeline.
    """

    @classmethod
    def setUpClass(cls):
        cls.venus_dir = os.path.join(WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus")

    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_safe_image_reading_and_unicode_handling(self):
        """
        Verifies that safe_read_image safely opens images with Unicode characters in paths.
        """
        unicode_subdir = os.path.join(self.temp_dir, "라벨르지안_앤틱_도감_테스트")
        os.makedirs(unicode_subdir, exist_ok=True)
        img_path = os.path.join(unicode_subdir, "비너스_원본_샘플.png")

        # Create synthetic RGB PNG in Unicode path
        synth_img = Image.new("RGB", (100, 200), color=(180, 140, 120))
        synth_img.save(img_path, format="PNG")

        pil_img, rgb_arr, w, h = safe_read_image(img_path)
        self.assertEqual(w, 100)
        self.assertEqual(h, 200)
        self.assertEqual(rgb_arr.shape, (200, 100, 3))
        self.assertEqual(tuple(rgb_arr[50, 50]), (180, 140, 120))

    def test_exif_normalization(self):
        """
        Verifies that images with EXIF orientation (e.g. 6 = 90 deg CW) are transposed upright.
        """
        img_path = os.path.join(self.temp_dir, "exif_rotated.jpg")
        # Create a 300x100 landscape image
        img = Image.new("RGB", (300, 100), color=(200, 100, 50))
        exif = img.getexif()
        exif[0x0112] = 6  # Orientation: rotate 90 CW (transposed becomes 100x300 portrait)
        img.save(img_path, format="JPEG", exif=exif)

        pil_img, rgb_arr, w, h = safe_read_image(img_path, normalize_exif=True)
        self.assertEqual((w, h), (100, 300))
        self.assertEqual(rgb_arr.shape, (300, 100, 3))

    def test_backstamp_detection(self):
        """
        Verifies that an underside base photo with blue hallmark ink and stamped text
        is accurately identified as BASE_BACKSTAMP with mattingRequired == False.
        """
        stamp_file = os.path.join(self.venus_dir, "KakaoTalk_20260901_071003816_01.jpg")
        self.assertTrue(os.path.exists(stamp_file), f"Source file missing: {stamp_file}")

        feat = extract_features(stamp_file)
        scored = score_image_for_angles(feat)

        stamp_score, sub_scores, rule = scored["BASE_BACKSTAMP"]
        self.assertGreaterEqual(stamp_score, 0.90, f"Expected high backstamp score, got {stamp_score}")
        self.assertEqual(rule, "underside_base_stamp_and_hallmark_text")

    def test_hero_vs_portrait_discrimination(self):
        """
        Verifies that a full-body standing photo scores highest on HERO_FRONT
        while a zoomed upper-body photo scores highest on PORTRAIT_TORSO.
        """
        hero_file = os.path.join(self.venus_dir, "KakaoTalk_20260901_071003816_04.jpg")
        torso_file = os.path.join(self.venus_dir, "KakaoTalk_20260901_071003816_05.jpg")

        feat_hero = extract_features(hero_file)
        feat_torso = extract_features(torso_file)

        hero_scored = score_image_for_angles(feat_hero)
        torso_scored = score_image_for_angles(feat_torso)

        # Hero photo must have high full body height and centered framing
        self.assertGreaterEqual(hero_scored["HERO_FRONT"][0], 0.90)
        # Torso photo must score high on PORTRAIT_TORSO due to top crop and macro zoom
        self.assertGreaterEqual(torso_scored["PORTRAIT_TORSO"][0], 0.90)

    def test_profile_vs_rear_discrimination(self):
        """
        Verifies differentiation between 3/4 side profile (amphora silhouette)
        and rear view (uniform hair cascade & drapery folds).
        """
        profile_file = os.path.join(self.venus_dir, "KakaoTalk_20260901_071003816_06.jpg")
        rear_file = os.path.join(self.venus_dir, "KakaoTalk_20260901_071003816_10.jpg")

        feat_profile = extract_features(profile_file)
        feat_rear = extract_features(rear_file)

        profile_scored = score_image_for_angles(feat_profile)
        rear_scored = score_image_for_angles(feat_rear)

        self.assertGreaterEqual(profile_scored["SIDE_PROFILE"][0], 0.90)
        self.assertGreaterEqual(rear_scored["REAR_SCULPTURE"][0], 0.90)

    def test_venus_dataset_end_to_end(self):
        """
        Executes end-to-end classification on the actual Lladró Gres Venus collection
        and asserts 100% accurate canonical 5-angle mapping.
        """
        out_manifest_path = os.path.join(self.temp_dir, "venus_manifest.json")
        manifest = ingest_and_classify(
            input_dir=self.venus_dir,
            output_manifest=out_manifest_path,
            product_id="prod-lladro-gres-2256-venus",
            item_slug="venus",
            strict=True
        )

        self.assertTrue(manifest["summary"]["allCanonicalAnglesFound"])
        self.assertEqual(manifest["summary"]["classifiedAnglesCount"], 5)
        self.assertEqual(manifest["summary"]["totalScannedImages"], 13)
        self.assertEqual(manifest["summary"]["unassignedImagesCount"], 8)
        self.assertEqual(manifest["summary"]["validationStatus"], "VALID")

        # Verify assignments
        angles = manifest["classifiedAngles"]
        self.assertEqual(angles["HERO_FRONT"]["source"]["filename"], "KakaoTalk_20260901_071003816_04.jpg")
        self.assertEqual(angles["SIDE_PROFILE"]["source"]["filename"], "KakaoTalk_20260901_071003816_06.jpg")
        self.assertEqual(angles["PORTRAIT_TORSO"]["source"]["filename"], "KakaoTalk_20260901_071003816_05.jpg")
        self.assertEqual(angles["REAR_SCULPTURE"]["source"]["filename"], "KakaoTalk_20260901_071003816_10.jpg")
        self.assertEqual(angles["BASE_BACKSTAMP"]["source"]["filename"], "KakaoTalk_20260901_071003816_01.jpg")

    def test_manifest_schema_conformance(self):
        """
        Validates that generated manifest conforms strictly to Explorer 3's schema contract.
        """
        out_manifest_path = os.path.join(self.temp_dir, "schema_test_manifest.json")
        manifest = ingest_and_classify(
            input_dir=self.venus_dir,
            output_manifest=out_manifest_path,
            product_id="prod-lladro-gres-2256-venus",
            item_slug="venus"
        )

        # Top-level keys
        required_top_keys = [
            "$schema", "version", "generatedAt", "pipeline", "product",
            "directories", "summary", "classifiedAngles", "unassignedPhotos", "validation"
        ]
        for k in required_top_keys:
            self.assertIn(k, manifest, f"Missing top-level manifest key: {k}")

        # Pipeline
        self.assertEqual(manifest["pipeline"]["name"], "antique-5angle-classifier")

        # Product
        self.assertEqual(manifest["product"]["id"], "prod-lladro-gres-2256-venus")
        self.assertEqual(manifest["product"]["brand"], "Lladró")

        # 5 Angles presence and contracts
        for tag in CANONICAL_ANGLES:
            self.assertIn(tag, manifest["classifiedAngles"])
            angle_doc = manifest["classifiedAngles"][tag]
            self.assertIn("angleIndex", angle_doc)
            self.assertIn("canonicalTag", angle_doc)
            self.assertIn("angleTag", angle_doc)
            self.assertIn("macroRatio", angle_doc)
            self.assertIn("defaultCaption", angle_doc)
            self.assertIn("source", angle_doc)
            self.assertIn("targetOutput", angle_doc)
            self.assertIn("classification", angle_doc)
            self.assertIn("enhancementDirectives", angle_doc)

            # Check target dimensions
            self.assertEqual(angle_doc["targetOutput"]["targetDimensions"], [1400, 1800])

            # Check matting directives
            directives = angle_doc["enhancementDirectives"]
            if tag == "BASE_BACKSTAMP":
                self.assertFalse(directives["mattingRequired"])
                self.assertTrue(directives["preserveAuthenticFrame"])
                self.assertIn("frameVignette", directives)
            else:
                self.assertTrue(directives["mattingRequired"])
                self.assertFalse(directives["preserveAuthenticFrame"])
                self.assertIn("backdrop", directives)

    def test_manual_override(self):
        """
        Verifies that providing an override JSON forces assignment of specified angle.
        """
        override_file = os.path.join(self.temp_dir, "overrides.json")
        override_data = {
            "HERO_FRONT": "KakaoTalk_20260901_071003816_03.jpg"
        }
        with open(override_file, "w", encoding="utf-8") as f:
            json.dump(override_data, f)

        manifest = ingest_and_classify(
            input_dir=self.venus_dir,
            override_json=override_file,
            dry_run=True
        )

        angles = manifest["classifiedAngles"]
        self.assertEqual(angles["HERO_FRONT"]["source"]["filename"], "KakaoTalk_20260901_071003816_03.jpg")
        self.assertEqual(angles["HERO_FRONT"]["classification"]["confidence"], 1.0)
        self.assertIn("manual_override", angles["HERO_FRONT"]["classification"]["matchedRule"])
        self.assertEqual(manifest["pipeline"]["executionMode"], "manual-override-v1")

    def test_strict_mode_missing_angle(self):
        """
        Verifies that strict mode raises ClassificationIncompleteError when folder has < 5 photos.
        """
        sparse_dir = os.path.join(self.temp_dir, "sparse_collection")
        os.makedirs(sparse_dir, exist_ok=True)
        # Create only 2 synthetic photos
        for i in range(2):
            p = os.path.join(sparse_dir, f"sparse_{i}.jpg")
            img = Image.new("RGB", (100, 200), color=(100 * i, 100, 100))
            img.save(p, "JPEG")

        with self.assertRaises(ClassificationIncompleteError):
            ingest_and_classify(input_dir=sparse_dir, strict=True)

    def test_dry_run_option(self):
        """
        Verifies that dry_run=True returns valid manifest without writing file to disk.
        """
        target_path = os.path.join(self.temp_dir, "dry_run_manifest.json")
        manifest = ingest_and_classify(
            input_dir=self.venus_dir,
            output_manifest=target_path,
            dry_run=True
        )
        self.assertFalse(os.path.exists(target_path), "Dry run must not create output file on disk")
        self.assertEqual(manifest["summary"]["classifiedAnglesCount"], 5)


if __name__ == "__main__":
    unittest.main()
