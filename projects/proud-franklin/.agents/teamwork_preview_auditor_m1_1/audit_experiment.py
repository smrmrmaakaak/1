import os
import sys
import tempfile
import shutil
import numpy as np
import cv2
from PIL import Image

WORKSPACE_ROOT = r"c:\Users\황태민\Documents\antigravity\proud-franklin"
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from scripts.classify_and_ingest_photos import (
    extract_features,
    score_image_for_angles,
    resolve_angle_assignments,
    ingest_and_classify,
    CANONICAL_ANGLES
)

def run_adversarial_forensics():
    temp_dir = tempfile.mkdtemp(prefix="auditor_cv_stress_")
    print(f"=== FORENSIC STRESS TEST RUNNING IN {temp_dir} ===")
    
    try:
        # 1. Create synthetic images with distinctive visual features under ARBITRARY / RANDOMIZED filenames:
        # Synthetic Backstamp: Gray background with blue hallmark ink & text lines in center (35%-65%)
        backstamp_img = np.full((1000, 600, 3), 160, dtype=np.uint8) # terracotta/gray base
        # Add blue stamp in center
        cv2.circle(backstamp_img, (300, 500), 50, (200, 80, 20), -1) # BGR blue: (200, 80, 20) -> in HSV H~105, S~229, V~200
        # Add high edge text-like strokes
        for y in range(450, 550, 5):
            cv2.line(backstamp_img, (260, y), (340, y), (20, 20, 20), 2)
        
        # Synthetic Hero Front: Full body centered standing figure (height ~85%, centered cx~0.5, terracotta skin + hair)
        hero_img = np.full((1000, 600, 3), 240, dtype=np.uint8) # light backdrop
        # Draw body
        cv2.rectangle(hero_img, (200, 100), (400, 950), (60, 100, 180), -1) # terracotta skin (BGR: B=60, G=100, R=180 -> HSV H~10, S~170, V~180)
        # Draw dark hair on top
        cv2.rectangle(hero_img, (220, 100), (380, 300), (20, 20, 20), -1) # dark hair
        # Draw white dove highlight
        cv2.circle(hero_img, (300, 400), 15, (255, 255, 255), -1)

        # Synthetic Portrait Torso: Zoomed bust (top ~0.25, bot ~1.0, high upper hair & skin)
        torso_img = np.full((1000, 600, 3), 240, dtype=np.uint8)
        cv2.rectangle(torso_img, (150, 250), (450, 1000), (60, 100, 180), -1) # upper body
        cv2.rectangle(torso_img, (180, 250), (420, 550), (20, 20, 20), -1) # hair
        cv2.circle(torso_img, (300, 600), 20, (255, 255, 255), -1) # dove

        # Synthetic Side Profile: Lateral asymmetry (amphora on one side, bot < 0.85, top < 0.12)
        profile_img = np.full((1000, 600, 3), 240, dtype=np.uint8)
        # Asymmetric figure cut off at bottom 750
        pts = np.array([[150, 50], [350, 50], [500, 400], [350, 750], [150, 750]], np.int32)
        cv2.fillPoly(profile_img, [pts], (60, 100, 180))

        # Synthetic Rear: Full body with large dark hair cascade & drapery, NO white highlight, low white dove
        rear_img = np.full((1000, 600, 3), 240, dtype=np.uint8)
        cv2.rectangle(rear_img, (200, 100), (400, 950), (60, 100, 180), -1) # body
        cv2.rectangle(rear_img, (210, 100), (390, 700), (20, 20, 20), -1) # long dark hair cascade covering back

        # Save with completely randomized / obfuscated names
        file_map = {
            "random_hash_9a1.jpg": ("BASE_BACKSTAMP", backstamp_img),
            "random_hash_3f4.jpg": ("HERO_FRONT", hero_img),
            "random_hash_7c2.jpg": ("PORTRAIT_TORSO", torso_img),
            "random_hash_1b8.jpg": ("SIDE_PROFILE", profile_img),
            "random_hash_5e9.jpg": ("REAR_SCULPTURE", rear_img),
        }

        for fname, (expected_angle, img_arr) in file_map.items():
            fpath = os.path.join(temp_dir, fname)
            Image.fromarray(cv2.cvtColor(img_arr, cv2.COLOR_BGR2RGB)).save(fpath, "JPEG")

        print("Testing automated classification on purely synthetic, randomized-filename images...")
        manifest = ingest_and_classify(input_dir=temp_dir, dry_run=True, strict=True)
        
        print("\nClassification results for synthetic test dataset:")
        assigned = manifest["classifiedAngles"]
        all_passed = True
        for fname, (expected_angle, _) in file_map.items():
            assigned_file = assigned[expected_angle]["source"]["filename"]
            conf = assigned[expected_angle]["classification"]["confidence"]
            rule = assigned[expected_angle]["classification"]["matchedRule"]
            match = (assigned_file == fname)
            status = "PASS" if match else "FAIL"
            if not match:
                all_passed = False
            print(f"[{status}] Expected {expected_angle:<16} -> Found: {assigned_file} (Conf: {conf:.2f}, Rule: {rule})")

        print(f"\nSynthetic Feature Independence Verification: {'PASSED' if all_passed else 'FAILED'}")

        # 2. Test SHA-256 integrity on real dataset
        venus_dir = os.path.join(WORKSPACE_ROOT, "public", "artifacts", "lladro_gres_venus")
        manifest_path = os.path.join(venus_dir, "classification_manifest.json")
        import json
        with open(manifest_path, "r", encoding="utf-8") as f:
            real_manifest = json.load(f)

        print("\nVerifying SHA-256 hashes and file metrics against actual disk files:")
        hash_pass = True
        import hashlib
        for angle_name, angle_doc in real_manifest["classifiedAngles"].items():
            src = angle_doc["source"]
            fpath = os.path.join(WORKSPACE_ROOT, src["relativePath"])
            with open(fpath, "rb") as f:
                computed_sha = hashlib.sha256(f.read()).hexdigest()
            computed_size = os.path.getsize(fpath)
            
            sha_match = (computed_sha == src["sha256"])
            size_match = (computed_size == src["fileSizeBytes"])
            if not (sha_match and size_match):
                hash_pass = False
                print(f"[FAIL] {angle_name}: SHA match={sha_match}, Size match={size_match}")
            else:
                print(f"[PASS] {angle_name} ({src['filename']}): SHA-256 verified ({src['sha256'][:12]}...), Size={src['fileSizeBytes']} bytes")

        print(f"\nManifest Real Artifact Integrity Verification: {'PASSED' if hash_pass else 'FAILED'}")

        return all_passed and hash_pass
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    success = run_adversarial_forensics()
    sys.exit(0 if success else 1)
