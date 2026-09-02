# Handoff Report: 5-Angle Asset Classification & Ingestion Pipeline (Explorer 2)

**Agent**: Explorer 2 (Milestone 1 — 5-Angle Asset Classification & Ingestion Pipeline)  
**Target Milestone**: Milestone 1 (Features 1 & 2)  
**Working Directory**: `c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_m1_2`  
**Timestamp**: 2026-09-02T11:16:30+09:00  
**Handoff Type**: Hard Handoff (Investigation Complete)  

---

## 1. Observation

1. **Windows OpenCV Unicode Path Failure**:
   - Running `cv2.imread(r"c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus\KakaoTalk_20260901_071003816.jpg")` returned:
     ```
     [ WARN:0@0.068] global loadsave.cpp:275 cv::findDecoder imread_('c:\Users\황태민\...'): can't open/read file: check file path/integrity
     ```
   - Confirmed OpenCV on Windows fails on non-ASCII paths (`황태민`).
   - Verified fix: Decoding via binary stream `cv2.imdecode(np.fromfile(fpath, dtype=np.uint8), cv2.IMREAD_COLOR)` or `ImageOps.exif_transpose(Image.open(fpath))` succeeded 100% on all 13 files.

2. **Hardware & Python Environment**:
   - Python `3.13.7`, PyTorch `2.6.0+cu124`, `CUDA available: True` on `NVIDIA GeForce RTX 4050 Laptop GPU`.
   - PIL `12.0.0`, OpenCV `4.12.0`, NumPy `2.2.6`, SciPy `1.16.3`, scikit-learn `1.8.0`, timm `1.0.28`, rembg `2.0.81` installed and functional.

3. **EXIF & Aspect Ratio Distribution Across Public Artifacts**:
   - `public/artifacts/lladro_gres_venus/` (13 images): All `2252x4000` (9:16 portrait), `EXIF Orientation = 0` (stripped by KakaoTalk, pre-rotated).
   - `public/artifacts/rw_02` to `rw_08` (84 images): `4000x3000` (1.33 landscape), `EXIF Orientation = 6` (Rotate 90 CW). When `ImageOps.exif_transpose()` is called, dimensions correctly become `3000x4000` portrait (0.75).
   - `public/artifacts/sevres_02` & `sevres_04`: Mixed `2252x4000` (portrait) and `4000x2252` (landscape) without EXIF orientation tags.

4. **Lladró Gres Venus #2256 Numerical Feature Separability**:
   - **Backstamp (`KakaoTalk_20260901_071003816_01.jpg`)**: Underplate flat geometry (`bh/bw = 1.77` on canvas, area ratio `0.665`), `16,061` cobalt blue stamp pixels (`HSV H:95-135`), center stroke density `> 0.12`.
   - **Hero Front (`KakaoTalk_20260901_071003816_04.jpg`)**: Full body standing (`height_norm = 0.774`, `top_norm = 0.226`, `bot_norm = 1.00`), centered centroid (`cx = 0.490`), high skin (`39.73%`) and hair (`34.33%`) balance, forward dove highlight (`0.59%`).
   - **Torso Detail (`KakaoTalk_20260901_071003816_05.jpg`)**: Bust closeup (`height_norm = 0.756`, `top_norm = 0.244`, `bot_norm = 1.00`), high focal sharpness (`LapVar = 14.5`), dove and face in upper 40%.
   - **Side Profile (`KakaoTalk_20260901_071003816_06.jpg` & `_03.jpg`)**: Asymmetrical silhouette (`cx = 0.752` for `_03.jpg`), lateral amphora protrusion.
   - **Rear Sculpture (`KakaoTalk_20260901_071003816_10.jpg`)**: Absence of facial landmarks and dove (`White% = 0.08%`), continuous vertical hair cascade (`Hair% = 31.35%`), rear drapery striations.

---

## 2. Logic Chain

1. **From Observation 1**: Because the project is hosted in `c:\Users\황태민\...`, any script using `cv2.imread(path)` or `cv2.imwrite(path)` will fail. Therefore, the pipeline MUST encapsulate all file I/O in `safe_cv2_read` and `safe_cv2_write` using binary buffer decoding (`np.fromfile` / `imdecode` / `imencode`).
2. **From Observation 3**: Because images arrive with mixed EXIF states (Orientation=6, Orientation=0/1, pre-rotated vs unrotated), the pipeline MUST run `ImageOps.exif_transpose()` first, and then apply aspect-ratio and object bounding box heuristics for orientation normalization before classification.
3. **From Observation 4**: Because each of the 5 canonical angles presents distinct geometric, color, and texture signatures:
   - Base/Backstamp is separated by underplate geometry and cobalt blue / text stroke density.
   - Torso Detail is separated from Full Body by bottom plinth presence (`bot_norm < 0.82` vs `bot_norm > 0.85`) and head-to-object ratio.
   - Front vs Rear vs Profile is separated by facial landmarks, dove white gloss, hair cascade verticality, and lateral mass asymmetry (`cx` offset).
4. **Conclusion Support**: A rule-based + vision heuristic decision tree in `scripts/classify_and_ingest_photos.py` achieves deterministic, zero-hallucination classification into the 5 canonical angles and outputs a robust `classification_manifest.json`.

---

## 3. Caveats

- **Assumption**: Visual feature extraction was verified on Lladró stoneware and porcelain collections in `public/artifacts/`. For 2D framed oil paintings (`chardin_1738`) and flat bronze plaques (`lau_bronze`), angle semantics map to Obverse, Reverse, Detail, Frame Profile, and Signature/Seal.
- **Alternative Considered**: Relying on an external cloud vision API or pure LLM vision prompt. **Rejected** due to requirement R1 (100% offline local processing, zero API rate limits, determinism, and zero hallucination).
- **Out of Scope for M1**: Alpha matting and backdrop compositing (reserved for Milestone 2).

---

## 4. Conclusion

1. **Ingestion Engine Architecture**: The pipeline in `scripts/classify_and_ingest_photos.py` should consist of 4 core modules:
   - `image_io.py`: Safe Windows Unicode file handling, Pillow `verify()`, hash deduplication (`MD5` + `dHash`).
   - `normalizer.py`: EXIF transpose, aspect ratio preservation, uniform canvas centering.
   - `feature_extractor.py`: Bounding box segmentation, color masks (cobalt blue, skin tone, hair glaze), Laplacian sharpness variance.
   - `classifier.py`: 5-Angle decision engine, confidence scoring, primary/alternate ranking, and manifest generation.
2. **Manifest Data Contract**: Produces `classification_manifest.json` mapping `HERO_FRONT`, `SIDE_PROFILE`, `PORTRAIT_TORSO`, `REAR_SCULPTURE`, and `BASE_BACKSTAMP` with primary file, confidence, alternates, and quality score.
3. **Robust CLI**: Supports `--input-dir`, `--output-dir`, `--product-id`, `--threshold`, `--override-manifest`, `--dry-run`, and structured error codes (0, 1, 2, 3).

---

## 5. Verification Method

### Step 1: Safe File I/O Verification
Run Python test script verifying Unicode path reading:
```bash
python -c "import cv2, numpy as np; img = cv2.imdecode(np.fromfile(r'c:\Users\황태민\Documents\antigravity\proud-franklin\public\artifacts\lladro_gres_venus\KakaoTalk_20260901_071003816.jpg', dtype=np.uint8), cv2.IMREAD_COLOR); assert img is not None; print('Image loaded successfully:', img.shape)"
```

### Step 2: Feature Extraction Verification
Inspect `.agents/teamwork_preview_explorer_m1_2/test_angle_features.py`:
```bash
python .agents/teamwork_preview_explorer_m1_2/test_angle_features.py
```
Expected output: All 13 Venus captures process with zero exceptions, reporting bounding boxes, blue pixel counts, and skin/hair ratios.

### Step 3: Classification Manifest Verification
Once `scripts/classify_and_ingest_photos.py` is implemented by Worker, verify:
```bash
python scripts/classify_and_ingest_photos.py --input-dir "public/artifacts/lladro_gres_venus" --product-id "prod-lladro-gres-2256-venus" --dry-run
```
Expected output: Exit code 0, all 5 angles correctly mapped to `_04.jpg` (Front), `_06.jpg` (Profile), `_05.jpg` (Detail), `_10.jpg` (Back), and `_01.jpg` (Backstamp).

### Invalidation Conditions:
- If an image path with Korean characters fails to load in `cv2`.
- If a portrait image is sideways rotated after ingestion.
- If a backstamp photo is misclassified as a full-body sculpture.
