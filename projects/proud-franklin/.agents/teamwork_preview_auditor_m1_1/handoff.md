# Forensic Audit Report — Milestone 1 (5-Angle Asset Classification & Ingestion Pipeline)

**Work Product**: `scripts/classify_and_ingest_photos.py`, `tests/test_classify_and_ingest.py`, `public/artifacts/lladro_gres_venus/classification_manifest.json`  
**Profile**: General Project (Forensic Integrity)  
**Verdict**: **CLEAN**  
**Auditor**: Forensic Integrity Auditor (`teamwork_preview_auditor_m1_1`)  
**Date**: 2026-09-02T11:26:00+09:00  

---

## 1. Observation

### 1.1 Source Code Forensic Analysis (`scripts/classify_and_ingest_photos.py`)
- **Total Lines**: 875 lines of genuine algorithmic Python code.
- **Hardcoded Filename Check**:
  - Exact search for source filenames (e.g., `KakaoTalk`) yielded **0 matches**.
  - Search for image extensions (`.jpg`, `.png`) revealed only output suffix definitions (lines 46, 67, 81, 95, 109: `"01_hero_front.jpg"`, etc.) and allowed extension filtering (`valid_exts = {".jpg", ...}`), with **0 hardcoded angle mappings**.
- **Computer Vision Pipeline Implementation**:
  - **I/O & Normalization** (lines 128–156): Robust Windows Unicode file reading via binary buffer decoding (`open(image_path, "rb")` + `PIL.Image.open()`) with EXIF orientation tag 0x0112 transposition (`ImageOps.exif_transpose`).
  - **Hashing** (lines 159–165): Authentic chunked SHA-256 computation (`hashlib.sha256()`).
  - **Feature Extraction** (lines 168–290):
    - Laplacian variance sharpness: `cv2.Laplacian(gray_arr, cv2.CV_64F).var()` (line 182).
    - Hallmark center ROI Canny edge detection: `cv2.Canny(hallmark_roi, 50, 150)` (line 200).
    - Lladró cobalt blue stamp HSV segmentation: `cv2.inRange(center_hsv, np.array([95, 50, 40]), np.array([135, 255, 255]))` (line 193).
    - Adaptive Gaussian thresholding for incised marks: `cv2.adaptiveThreshold(..., cv2.ADAPTIVE_THRESH_GAUSSIAN_C, ...)` (line 204).
    - Foreground segmentation: Gaussian blur + Otsu's thresholding + contour analysis + bounding box normalization (`top_norm`, `bot_norm`, `height_norm`, `width_norm`) (lines 211–232).
    - Centroid moments & lateral contour asymmetry: `cv2.moments(thresh)` and horizontal mask symmetry difference (lines 234–247).
    - Semantic HSV color masks: Terracotta skin (`[0, 15, 60]` to `[25, 160, 240]`), dark glazed hair (`[0, 0, 0]` to `[180, 255, 55]`), and gloss white dove highlights (`[0, 0, 220]` to `[180, 30, 255]`) (lines 250–262).
  - **Optimal Angle Assignment** (lines 448–566): Implements Hungarian bipartite maximum weight matching via `scipy.optimize.linear_sum_assignment(-sub_matrix)` with deterministic greedy fallback.

### 1.2 Test Suite Forensic Analysis (`tests/test_classify_and_ingest.py`)
- **Total Lines**: 265 lines across 10 distinct test methods.
- **Genuine vs. Dummy Verification**:
  - `test_safe_image_reading_and_unicode_handling`: Generates synthetic RGB images in Korean Unicode directories (`라벨르지안_앤틱_도감_테스트/비너스_원본_샘플.png`) and asserts shape/pixel array integrity.
  - `test_exif_normalization`: Creates programmatic JPEG with EXIF orientation 6 and asserts automatic rotation from landscape (300x100) to portrait (100x300).
  - `test_backstamp_detection`, `test_hero_vs_portrait_discrimination`, `test_profile_vs_rear_discrimination`: Invokes `extract_features` and `score_image_for_angles`, validating quantitative heuristic bounds (e.g. `>= 0.90`) and rule outputs without mocking.
  - `test_manual_override`: Verifies explicit override dispatch with `executionMode == "manual-override-v1"`.
  - `test_strict_mode_missing_angle`: Verifies `ClassificationIncompleteError` exception trigger when `< 5` images are present.
  - `test_dry_run_option`: Confirms disk-isolation when dry-run is requested.

### 1.3 Physical Artifact Verification (`classification_manifest.json`)
- Verified all 5 classified photos against actual disk bytes:
  - `HERO_FRONT`: `KakaoTalk_20260901_071003816_04.jpg` | SHA-256: `d70e477e2351c482e43cc0dcc2c8f73e783c3fe9e03497f17d82b4fd32f1b26c` | Size: `1284228` bytes (Exact Match)
  - `SIDE_PROFILE`: `KakaoTalk_20260901_071003816_06.jpg` | SHA-256: `eaae158cdbf8c955c412c21f88b164d89bd3035d94735ecc52af0ff997c9b74b` | Size: `1072377` bytes (Exact Match)
  - `PORTRAIT_TORSO`: `KakaoTalk_20260901_071003816_05.jpg` | SHA-256: `d63aa061177fce216691a80eaf42db20d59031c8a74fa92835bf4e3c9a832917` | Size: `1083260` bytes (Exact Match)
  - `REAR_SCULPTURE`: `KakaoTalk_20260901_071003816_10.jpg` | SHA-256: `cf4bdbd47b4f2fe53674ed95dfc5a645f2eb98ed8d1223c16f6d122f0c3d68eb` | Size: `969104` bytes (Exact Match)
  - `BASE_BACKSTAMP`: `KakaoTalk_20260901_071003816_01.jpg` | SHA-256: `d14b7bf5bd14c5518e14d81815bc1e1b7bf9a32135e5f20522198f725042a0e1` | Size: `1195048` bytes (Exact Match)
- Zero discrepancies between computed on-disk hashes and manifest metadata.

### 1.4 Independent Adversarial CV Verification
- Created 5 purely synthetic test images with randomized non-descriptive hashes (`random_hash_9a1.jpg`, `random_hash_3f4.jpg`, `random_hash_7c2.jpg`, `random_hash_1b8.jpg`, `random_hash_5e9.jpg`) encoding distinct visual traits.
- Executed `ingest_and_classify` on this randomized synthetic dataset (`audit_experiment.py`).
- **Result**: 100% of synthetic images were accurately classified into their corresponding canonical angles based strictly on physical visual features without reliance on filename or scan order.

### 1.5 Execution Results
- `python -m unittest tests/test_classify_and_ingest.py -v`: Ran 10 tests in 49.16s -> **OK (10 passed, 0 failed)**.
- `python tests/run_all_e2e_tests.py`: Ran 67 tests in 6.57s -> **OK (67 passed, 0 failed across all 4 tiers)**.

---

## 2. Logic Chain

1. **Integrity Rule 1 (No Hardcoded Test Results / Lookups)**:
   Source code analysis confirms zero filename lookups. The classifier computes continuous numerical scores from OpenCV arrays. When fed randomized synthetic image names, the algorithm successfully discriminates and assigns angles based purely on visual features. **PASS**.
2. **Integrity Rule 2 (No Facade / Dummy Implementations)**:
   Every function performs genuine computational operations (Canny edge detection, Otsu thresholding, HSV inRange masking, moments calculation, Hungarian assignment). No mock returns or placeholder stubs exist. **PASS**.
3. **Integrity Rule 3 (No Pre-populated / Fabricated Artifacts)**:
   The manifest file `public/artifacts/lladro_gres_venus/classification_manifest.json` was independently verified: every SHA-256 hash and byte size matches the live filesystem files byte-for-byte. **PASS**.
4. **Integrity Rule 4 (Authentic Physical Preservation Requirement)**:
   In accordance with `ORIGINAL_REQUEST.md` (R1: 100% authentic physical shape preservation), the classification layer establishes accurate boundary metadata and sets `mattingRequired: false` + `preserveAuthenticFrame: true` for `BASE_BACKSTAMP` to safeguard authentic provenance hallmarks. **PASS**.

---

## 3. Caveats

- None. The implementation was verified both statically and dynamically with live executions and synthetic adversarial inputs.

---

## 4. Conclusion

**Verdict: CLEAN**

Milestone 1 deliverable satisfies all integrity, algorithmic, and architectural requirements with zero integrity violations. The implementation is authentic, robust, and fully verified for downstream consumption by Milestone 2.

---

## 5. Verification Method

To reproduce the auditor's verification independently:

1. **Run Unit Tests**:
   ```bash
   python -m unittest tests/test_classify_and_ingest.py -v
   ```
   *Expected*: `Ran 10 tests ... OK`

2. **Run Auditor Adversarial CV Experiment**:
   ```bash
   python .agents/teamwork_preview_auditor_m1_1/audit_experiment.py
   ```
   *Expected*: `Synthetic Feature Independence Verification: PASSED`, `Manifest Real Artifact Integrity Verification: PASSED`

3. **Run Master E2E Suite**:
   ```bash
   python tests/run_all_e2e_tests.py
   ```
   *Expected*: `TOTALS: 67 Tests Run | 67 Passed | 0 Failed`
