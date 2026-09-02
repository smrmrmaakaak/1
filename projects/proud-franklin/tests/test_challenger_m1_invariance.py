import os
import sys
import json
import shutil
import tempfile
import unittest
import numpy as np
from PIL import Image, ImageOps

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


class TestChallengerM1Invariance(unittest.TestCase):
    """
    Adversarial & Empirical Invariance Test Suite by Challenger 2 (Milestone 1).
    Stress-tests:
    1. Unicode paths, spaces, Korean Hangul, special symbols.
    2. EXIF Orientations 1, 3, 6, 8 normalization & classification invariance.
    3. Image Scaling Invariance across multiple resolutions (0.25x to 1.5x).
    4. Edge case file handling (mixed extensions, non-image files, zero-byte files).
    """

    @classmethod
    def setUpClass(cls):
        cls.venus_dir = os.path.join(WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus")
        cls.ground_truth = {
            "HERO_FRONT": "KakaoTalk_20260901_071003816_04.jpg",
            "SIDE_PROFILE": "KakaoTalk_20260901_071003816_06.jpg",
            "PORTRAIT_TORSO": "KakaoTalk_20260901_071003816_05.jpg",
            "REAR_SCULPTURE": "KakaoTalk_20260901_071003816_10.jpg",
            "BASE_BACKSTAMP": "KakaoTalk_20260901_071003816_01.jpg"
        }

    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir, ignore_errors=True)

    # =========================================================================
    # Test 1: Path Handling with Unicode, Korean Hangul, Spaces, and Symbols
    # =========================================================================
    def test_path_handling_korean_unicode_and_special_symbols(self):
        """
        Stress-tests ingestion and manifest writing in paths containing Korean Hangul,
        spaces, brackets, exclamation marks, hashes, pluses, commas, and dots.
        """
        complex_input_dir = os.path.join(
            self.temp_dir,
            "라벨르지안 앤틱 [Master Vol.1] !@#&()+, -.~",
            "비너스 #2256 (소더비 옥션 감정)"
        )
        complex_output_dir = os.path.join(
            self.temp_dir,
            "결과 보고서 (출력 디렉터리)",
            "매니페스트 v1.0 [최종]"
        )
        os.makedirs(complex_input_dir, exist_ok=True)
        os.makedirs(complex_output_dir, exist_ok=True)

        # Copy all 13 Venus images into the complex directory
        for fname in os.listdir(self.venus_dir):
            if fname.lower().endswith((".jpg", ".jpeg", ".png")):
                src_p = os.path.join(self.venus_dir, fname)
                dst_p = os.path.join(complex_input_dir, fname)
                shutil.copy2(src_p, dst_p)

        manifest_path = os.path.join(complex_output_dir, "classification_manifest.json")

        # Ingest and classify
        manifest = ingest_and_classify(
            input_dir=complex_input_dir,
            output_manifest=manifest_path,
            product_id="prod-lladro-gres-2256-venus",
            item_slug="venus",
            strict=True
        )

        self.assertTrue(os.path.exists(manifest_path), "Manifest file should be created on disk")
        self.assertEqual(manifest["summary"]["validationStatus"], "VALID")
        self.assertEqual(manifest["summary"]["classifiedAnglesCount"], 5)
        self.assertEqual(manifest["summary"]["totalScannedImages"], 13)

        # Verify all 5 angles match ground truth
        for angle, expected_file in self.ground_truth.items():
            assigned_file = manifest["classifiedAngles"][angle]["source"]["filename"]
            self.assertEqual(
                assigned_file, expected_file,
                f"Mismatch for {angle}: expected {expected_file}, got {assigned_file}"
            )

        # Verify manifest is valid JSON and readable
        with open(manifest_path, "r", encoding="utf-8") as f:
            loaded_json = json.load(f)
        self.assertEqual(loaded_json["product"]["id"], "prod-lladro-gres-2256-venus")

    # =========================================================================
    # Test 2: EXIF Orientation Handling (Orientations 1, 3, 6, 8)
    # =========================================================================
    def test_exif_orientation_normalization_invariance(self):
        """
        Applies EXIF orientations (1=normal, 3=180 deg, 6=90 deg CW, 8=270 deg CW)
        to all 13 images and verifies that with normalize_exif=True,
        the classification results are 100% invariant across all orientations.
        """
        # EXIF orientation standard transforms:
        # EXIF 1: No rotation needed
        # EXIF 3: 180 deg inverted in camera -> Transpose ROTATE_180
        # EXIF 6: 90 deg CCW stored in camera -> Transpose ROTATE_90 (so exif_transpose ROTATE_270 restores it)
        # EXIF 8: 90 deg CW stored in camera -> Transpose ROTATE_270 (so exif_transpose ROTATE_90 restores it)
        exif_configs = [
            (1, None),
            (3, Image.Transpose.ROTATE_180),
            (6, Image.Transpose.ROTATE_90),
            (8, Image.Transpose.ROTATE_270),
        ]

        for exif_tag, pil_transform in exif_configs:
            sub_dir = os.path.join(self.temp_dir, f"exif_test_orientation_{exif_tag}")
            os.makedirs(sub_dir, exist_ok=True)

            for fname in os.listdir(self.venus_dir):
                if fname.lower().endswith((".jpg", ".jpeg", ".png")):
                    src_p = os.path.join(self.venus_dir, fname)
                    with Image.open(src_p) as img:
                        if pil_transform is not None:
                            rotated_img = img.transpose(pil_transform)
                        else:
                            rotated_img = img.copy()

                        # Attach EXIF tag
                        exif = rotated_img.getexif()
                        exif[0x0112] = exif_tag

                        dst_p = os.path.join(sub_dir, fname)
                        rotated_img.save(dst_p, format="JPEG", exif=exif, quality=95)

            # Ingest with normalize_exif=True
            manifest = ingest_and_classify(
                input_dir=sub_dir,
                product_id="prod-lladro-gres-2256-venus",
                item_slug="venus",
                normalize_exif=True,
                dry_run=True,
                strict=True
            )

            self.assertEqual(
                manifest["summary"]["validationStatus"], "VALID",
                f"Failed validation status for EXIF orientation {exif_tag}"
            )

            for angle, expected_file in self.ground_truth.items():
                assigned_file = manifest["classifiedAngles"][angle]["source"]["filename"]
                self.assertEqual(
                    assigned_file, expected_file,
                    f"EXIF orientation {exif_tag} broke assignment for {angle}: got {assigned_file} vs {expected_file}"
                )

    # =========================================================================
    # Test 3: Resolution & Scaling Invariance
    # =========================================================================
    def test_image_scaling_invariance_analysis(self):
        """
        Evaluates heuristic scores and angle assignments across multiple resolution scales:
        1.0x (2252x4000), 0.75x (1689x3000), 0.50x (1126x2000), 0.35x (788x1400), 0.25x (563x1000).
        Empirically demonstrates scaling invariance on geometric/color features,
        while highlighting the absolute pixel count vulnerability on backstamp hallmark detection.
        """
        scales = [1.0, 0.75, 0.50, 0.35, 0.25]
        scale_results = {}

        for scale in scales:
            sub_dir = os.path.join(self.temp_dir, f"scale_{int(scale*100)}")
            os.makedirs(sub_dir, exist_ok=True)

            for fname in os.listdir(self.venus_dir):
                if fname.lower().endswith((".jpg", ".jpeg", ".png")):
                    src_p = os.path.join(self.venus_dir, fname)
                    with Image.open(src_p) as img:
                        w, h = img.size
                        new_w = max(10, int(w * scale))
                        new_h = max(10, int(h * scale))
                        resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                        dst_p = os.path.join(sub_dir, fname)
                        resized.save(dst_p, format="JPEG", quality=90)

            # Extract features for stamp photo specifically
            stamp_path = os.path.join(sub_dir, self.ground_truth["BASE_BACKSTAMP"])
            stamp_feat = extract_features(stamp_path)
            stamp_scores = score_image_for_angles(stamp_feat)

            # Run full ingestion
            try:
                manifest = ingest_and_classify(
                    input_dir=sub_dir,
                    product_id="prod-lladro-gres-2256-venus",
                    item_slug="venus",
                    strict=False,
                    dry_run=True
                )
                assignments = {
                    ang: manifest["classifiedAngles"].get(ang, {}).get("source", {}).get("filename")
                    for ang in CANONICAL_ANGLES
                }
                status = manifest["summary"]["validationStatus"]
            except Exception as e:
                assignments = {}
                status = f"ERROR: {e}"

            scale_results[scale] = {
                "stamp_blue_pixels": stamp_feat["hallmark_blue_pixels"],
                "stamp_edge_pixels": stamp_feat["hallmark_edge_pixels"],
                "total_blue_pixels": stamp_feat["blue_pixels"],
                "backstamp_score": stamp_scores["BASE_BACKSTAMP"][0],
                "backstamp_rule": stamp_scores["BASE_BACKSTAMP"][2],
                "assignments": assignments,
                "status": status
            }

        # Print detailed scale results for challenger empirical documentation
        print("\n--- Empirical Image Scaling Robustness Analysis ---")
        for sc, res in scale_results.items():
            print(f"Scale {sc:4.2f}x: Stamp Blue={res['stamp_blue_pixels']:5d}, Stamp Edges={res['stamp_edge_pixels']:5d}, Total Blue={res['total_blue_pixels']:5d} -> Backstamp Score={res['backstamp_score']:.3f} ({res['backstamp_rule']}) -> Status={res['status']}")
            print(f"   Assignments: {res['assignments']}")

        # Scale 1.0x (full production resolution) must be 100% correct
        self.assertEqual(scale_results[1.0]["assignments"], self.ground_truth)

    # =========================================================================
    # Test 4: Edge Cases - Non-image files, Mixed Case Extensions
    # =========================================================================
    def test_non_image_files_and_case_insensitive_extensions(self):
        """
        Verifies that non-image files (.txt, .DS_Store, .json) are ignored safely
        and uppercase extensions (.JPG, .PNG, .JPEG) are ingested properly.
        """
        sub_dir = os.path.join(self.temp_dir, "mixed_files_test")
        os.makedirs(sub_dir, exist_ok=True)

        idx = 0
        for fname in os.listdir(self.venus_dir):
            if fname.lower().endswith((".jpg", ".jpeg", ".png")):
                src_p = os.path.join(self.venus_dir, fname)
                base, ext = os.path.splitext(fname)
                new_ext = ext.upper() if (idx % 2 == 0) else ext.lower()
                dst_p = os.path.join(sub_dir, f"{base}{new_ext}")
                shutil.copy2(src_p, dst_p)
                idx += 1

        # Add junk files
        with open(os.path.join(sub_dir, ".DS_Store"), "wb") as f:
            f.write(b"\x00\x00\x00\x01junk")
        with open(os.path.join(sub_dir, "notes.txt"), "w", encoding="utf-8") as f:
            f.write("Some notes about antiques")
        with open(os.path.join(sub_dir, "manifest.json"), "w", encoding="utf-8") as f:
            f.write("{}")

        manifest = ingest_and_classify(
            input_dir=sub_dir,
            product_id="prod-lladro-gres-2256-venus",
            item_slug="venus",
            strict=True,
            dry_run=True
        )

        self.assertEqual(manifest["summary"]["totalScannedImages"], 13)
        self.assertEqual(manifest["summary"]["classifiedAnglesCount"], 5)
        self.assertEqual(manifest["summary"]["validationStatus"], "VALID")


if __name__ == "__main__":
    unittest.main()
