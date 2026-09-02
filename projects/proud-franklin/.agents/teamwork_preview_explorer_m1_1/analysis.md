# 5-Angle Asset Classification & Ingestion Pipeline Analysis
**Milestone 1 — Explorer Investigation Report**
**Target Asset**: Lladro Gres Venus #2256 (`public/artifacts/lladro_gres_venus/`)
**Target Script**: `scripts/classify_and_ingest_photos.py`

---

## 1. Executive Summary & Mission Overview

### 1.1 Problem Statement
Raw antique collection photography (such as the 13 raw smartphone photos of the Spanish *Lladró Gres #2256 "Water Maiden with Dove / Venus at the Well"*) typically suffers from uncurated ordering, arbitrary orientation, mixed focal lengths, varying lighting, and unstructured file naming (e.g. `KakaoTalk_20260901_071003816_*.jpg`).

To meet Sotheby's and Christie's digital catalog appraisal standards, raw photos must be ingested, normalized, and classified into **5 canonical Sotheby's appraisal angles**:
1. `HERO_FRONT` (전신 전면 마스터): Complete sculpture silhouette, head-to-base framing, frontal presentation of maiden and dove.
2. `SIDE_PROFILE` (3/4 측면 프로필): 3/4 profile showing terracotta amphora water jug, contrapposto posture, and side facial contour.
3. `PORTRAIT_TORSO` (상체 및 마크로 디테일): Intimate close-up of maiden's face, wavy hair texture, peaceful facial expression, and delicate porcelain dove.
4. `REAR_SCULPTURE` (후면 조형미): Glazed wavy hair cascading down back, classical drapery folds, and textured brick well structure.
5. `BASE_BACKSTAMP` (하단 백스탬프 / 각인): Crisp macro capture of the underside base plate showing the blue bellflower hallmark (`LLADRÓ DAISA 1993`) and impressed model number (`2256`).

### 1.2 Core Principles & Guarantees
- **100% Authentic Physical Shape Preservation**: Zero AI generative redraw, zero synthetic geometry deformation, zero halluncinated text/stamps. All processing is strictly analytical and restorative.
- **Robust Multi-Platform Execution**: Flawless handling of Windows Unicode paths (e.g. `황태민`), EXIF orientation corrections, and deterministic JSON manifest production (`classification_manifest.json`).

---

## 2. Comprehensive Analysis of the 13 Raw Photos

All 13 images located in `public/artifacts/lladro_gres_venus/` were systematically analyzed using OpenCV, NumPy, and SIFT/ORB feature matching against the gold-standard studio master renders.

### 2.1 Dataset Inventory & Metric Table

| # | Filename | Resolution | Sharpness (LapVar) | Mean Brightness | Contrast (P98-P2) | Key Visual Features | Canonical Angle | SIFT Match Rank |
|---|----------|------------|--------------------|-----------------|-------------------|---------------------|-----------------|-----------------|
| **00** | `KakaoTalk_..._071003816.jpg` | 2252x4000 | 10.0 | 92.3 | 188.0 | Rear 3/4 full body, dark hair top (50.3%) | *Archival / Alternate Rear* | #5 Backstamp (95 pts) |
| **01** | `KakaoTalk_..._071003816_01.jpg` | 2252x4000 | 17.8 | 104.4 | 173.0 | Underside base plate, blue DAISA stamp & 2256 | **5. BASE_BACKSTAMP** | **#1 Backstamp (1103 pts)** |
| **02** | `KakaoTalk_..._071003816_02.jpg` | 2252x4000 | 4.5 | 109.2 | 108.0 | Extreme close-up base texture, low sharpness | *Archival / Soft Detail* | #5 Backstamp (111 pts) |
| **03** | `KakaoTalk_..._071003816_03.jpg` | 2252x4000 | **46.9** | 105.9 | 182.0 | Full frontal upright hero, highest full-body sharpness | **1. HERO_FRONT** | **#1 Hero Front (615 pts)** |
| **04** | `KakaoTalk_..._071003816_04.jpg` | 2252x4000 | 36.1 | 82.2 | 192.0 | Alternate rear/side angle, dark hair top (59.3%) | *Archival / Alternate Rear* | #3 Backstamp (251 pts) |
| **05** | `KakaoTalk_..._071003816_05.jpg` | 2252x4000 | 14.5 | 84.8 | 178.0 | Dark back of head close-up (top hair 80.5%) | *Archival / Rear Macro* | #4 Backstamp (184 pts) |
| **06** | `KakaoTalk_..._071003816_06.jpg` | 2252x4000 | 17.4 | 114.0 | 186.0 | 3/4 side profile, amphora silhouette, balanced framing | **2. SIDE_PROFILE** | **#1 Side Profile (718 pts)** |
| **07** | `KakaoTalk_..._071003816_07.jpg` | 2252x4000 | 10.7 | 134.7 | 177.0 | Upper torso macro, face & dove close-up, warm skin | **3. PORTRAIT_TORSO** | **#1 Portrait Torso (404 pts)** |
| **08** | `KakaoTalk_..._071003816_08.jpg` | 2252x4000 | **28.6** | 121.1 | 165.0 | Full rear sculpture, drapery folds, brick well | **4. REAR_SCULPTURE** | **#1 Rear (1067 pts)** |
| **09** | `KakaoTalk_..._071003816_09.jpg` | 2252x4000 | 26.9 | 125.3 | 180.0 | Full front alternate angle with warm floor reflection | *Archival / Alternate Front* | #2 Hero Front (212 pts) |
| **10** | `KakaoTalk_..._071003816_10.jpg` | 2252x4000 | 13.3 | 90.5 | 185.0 | Rear 3/4 alternate view with shadows | *Archival / Alternate Rear* | #4 Rear (156 pts) |
| **11** | `KakaoTalk_..._071003816_11.jpg` | 2252x4000 | 34.9 | 113.0 | 185.0 | 3/4 profile alternate angle with high sharpness | *Archival / Alternate Profile* | #3 Profile (138 pts) |
| **12** | `KakaoTalk_..._071028050.jpg` | 2252x4000 | 21.1 | 132.4 | 165.0 | Close-up head and dove (top skin 80.4%, dove 14.6%) | *Archival / Detail Macro* | #4 Torso (62 pts) |

---

## 3. Canonical 5-Angle Selection & Rationale

### Angle 1: `HERO_FRONT` — `KakaoTalk_20260901_071003816_03.jpg`
- **Rationale**:
  - **Highest Sharpness**: Laplacian variance is **46.9**, the sharpest among all full-body candidates.
  - **Perfect Frontal Pose**: Captures the entire silhouette from head to pedestal base with zero perspective clipping.
  - **Balanced Exposure**: Mean gray brightness of 105.9 and contrast ratio of 182.0 ensure clean dynamic range across matte terracotta skin and dark glazed hair.
  - **SIFT Verification**: Matches `venus_01_hero_front.jpg` with **615 keypoint correspondences**.

### Angle 2: `SIDE_PROFILE` — `KakaoTalk_20260901_071003816_06.jpg`
- **Rationale**:
  - **Optimal 3/4 Silhouette**: Perfectly displays the amphora jug protruding on the left and the classical contrapposto curve of the torso.
  - **Clear Feature Demarcation**: SIFT matches `venus_02_side_profile.jpg` with **718 keypoint correspondences**.
  - **Composition**: Centered subject with balanced horizontal margins suitable for standard 1400x1800 studio aspect ratio cropping.

### Angle 3: `PORTRAIT_TORSO` — `KakaoTalk_20260901_071003816_07.jpg`
- **Rationale**:
  - **Macro Focus on Artistry**: High mid-torso skin ratio (45.4%) and white dove ratio (9.5%), focusing on the delicate hand, peaceful eyes, and pure white porcelain bird.
  - **SIFT Verification**: Matches `venus_03_portrait_torso.jpg` with **404 keypoint correspondences**.
  - **Visual Contrast**: Provides the ideal intimate portrait counterpart to the full-body hero.

### Angle 4: `REAR_SCULPTURE` — `KakaoTalk_20260901_071003816_08.jpg`
- **Rationale**:
  - **Stunning Sculptural Drapery**: Captures the cascading dark glazed hair, intricate fabric folds of the Greek stola, and the rustic masonry texture of the water well.
  - **High Definition**: Laplacian variance of 28.6 and SIFT match of **1067 keypoints** with `venus_04_rear_sculpture.jpg`.
  - **Flawless Exposure**: Clean, even lighting across the terracotta back with minimal shadowing.

### Angle 5: `BASE_BACKSTAMP` — `KakaoTalk_20260901_071003816_01.jpg`
- **Rationale**:
  - **Authenticity & Provenance**: Clearly showcases the blue cobalt bellflower stamp (`LLADRÓ DAISA 1993`), official incised model number (`2256`), and Spain hallmark.
  - **Unmatched SIFT Alignment**: Matches `venus_05_backstamp.jpg` with **1103 keypoint correspondences**.
  - **Optimal Framing**: Underside base plate is fully framed with sharp edge contrast against background.

---

## 4. Algorithmic Classification Engine Architecture

The classification pipeline in `scripts/classify_and_ingest_photos.py` is architected as a **5-stage modular system**:

```
[Raw Photos Directory]
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ STAGE 1: Normalization & Unicode File I/O Engine          │
│ - Windows Unicode Path Decoder (PIL / np.fromfile)       │
│ - EXIF Orientation Correction (0x0112 auto-transpose)    │
│ - Resolution & Color Space Normalization (RGB 8-bit)     │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ STAGE 2: Multi-Dimensional Feature Extraction            │
│ - Sharpness: cv2.Laplacian(gray).var()                   │
│ - Hallmark Blue Stamp Index: B - (R+G)/2 in stamp ROI    │
│ - Gres Skin-Tone Segmentation: R>G>B in [120..230]       │
│ - Glazed Dark Hair Distribution: Top quadrant luminance  │
│ - White Dove High-Key Ratio: High R,G,B low saturation   │
│ - Bounding Box, Aspect Ratio & Centroid Offset           │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ STAGE 3: Multi-Criteria Angle Scoring Classifier         │
│ - Rule & Heuristic Scoring for 5 Sotheby's Categories:   │
│   • FRONT: Full height bbox, balanced skin, high lap_var │
│   • PROFILE: 3/4 asymmetry, side amphora projection     │
│   • DETAIL: Macro upper bbox, high dove & facial ratio   │
│   • BACK: High top/mid hair ratio, drapery texture       │
│   • BACKSTAMP: High blue stamp score, pale base plate    │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ STAGE 4: Best-in-Class Selection & Conflict Resolution   │
│ - Quality-Weighted Rank: Score = w_s*Lap + w_e*Exp + ... │
│ - Greedy Bipartite Assignment for Top 5 Canonical Slots  │
│ - Archival Assignment for Secondary Candidate Photos     │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ STAGE 5: Manifest Serialization & Contract Output        │
│ - Emit `classification_manifest.json`                    │
│ - JSON Contract matching PROJECT.md interface            │
│ - Export normalized photos to destination folder         │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Technical Specifications for `scripts/classify_and_ingest_photos.py`

### 5.1 CLI Signature & Parameters
```bash
python scripts/classify_and_ingest_photos.py \
  --input-dir public/artifacts/lladro_gres_venus \
  --product-id prod-lladro-gres-2256-venus \
  --output-manifest public/artifacts/lladro_gres_venus/classification_manifest.json \
  --export-normalized \
  --force \
  --verbose
```

### 5.2 Key Python Implementation Details
1. **Windows Unicode Path Safe Loader**:
   ```python
   def load_image_safe(path: str) -> np.ndarray:
       """Loads image safely across Windows paths with Unicode characters."""
       with Image.open(path) as img:
           # Handle EXIF orientation tag
           img = ImageOps.exif_transpose(img)
           return np.array(img.convert('RGB'))
   ```

2. **Feature Extraction Signature**:
   ```python
   @dataclass
   class ImageFeatures:
       filename: str
       width: int
       height: int
       sharpness: float
       mean_brightness: float
       contrast: float
       skin_top_ratio: float
       skin_mid_ratio: float
       dark_hair_ratio: float
       white_dove_ratio: float
       blue_stamp_score: float
       bbox_aspect_ratio: float
       frame_coverage: float
   ```

3. **Classification Rule Matrix**:
   - **`BASE_BACKSTAMP`**: `blue_stamp_score > 20000` AND `skin_top_ratio > 35%` (or circular pale base plate).
   - **`PORTRAIT_TORSO`**: `skin_top_ratio > 25%` AND `white_dove_ratio > 8%` AND `bbox_aspect_ratio < 1.6`.
   - **`REAR_SCULPTURE`**: `dark_hair_ratio > 20%` AND `skin_top_ratio < 15%` (back of head / drapery) OR SIFT match with rear profile.
   - **`SIDE_PROFILE`**: Asymmetrical contour with amphora bounding box projection, 3/4 head angle.
   - **`HERO_FRONT`**: Upright vertical standing pose (`bbox_aspect_ratio >= 1.7`), high sharpness (`sharpness >= 30.0`), full body framing.

4. **JSON Contract Format (`classification_manifest.json`)**:
   ```json
   {
     "productId": "prod-lladro-gres-2256-venus",
     "totalRawPhotos": 13,
     "classifiedAt": "2026-09-02T11:15:00Z",
     "angles": {
       "front": {
         "filename": "KakaoTalk_20260901_071003816_03.jpg",
         "canonicalAngle": "HERO_FRONT",
         "sharpness": 46.9,
         "confidence": 0.98
       },
       "profile": {
         "filename": "KakaoTalk_20260901_071003816_06.jpg",
         "canonicalAngle": "SIDE_PROFILE",
         "sharpness": 17.4,
         "confidence": 0.95
       },
       "detail": {
         "filename": "KakaoTalk_20260901_071003816_07.jpg",
         "canonicalAngle": "PORTRAIT_TORSO",
         "sharpness": 10.7,
         "confidence": 0.94
       },
       "back": {
         "filename": "KakaoTalk_20260901_071003816_08.jpg",
         "canonicalAngle": "REAR_SCULPTURE",
         "sharpness": 28.6,
         "confidence": 0.99
       },
       "backstamp": {
         "filename": "KakaoTalk_20260901_071003816_01.jpg",
         "canonicalAngle": "BASE_BACKSTAMP",
         "sharpness": 17.8,
         "confidence": 0.99
       }
     },
     "archivalPhotos": [
       { "filename": "KakaoTalk_20260901_071003816.jpg", "category": "ARCHIVAL_REAR_3_4" },
       { "filename": "KakaoTalk_20260901_071003816_02.jpg", "category": "ARCHIVAL_BASE_MACRO" },
       { "filename": "KakaoTalk_20260901_071003816_04.jpg", "category": "ARCHIVAL_REAR_SIDE" },
       { "filename": "KakaoTalk_20260901_071003816_05.jpg", "category": "ARCHIVAL_REAR_HEAD" },
       { "filename": "KakaoTalk_20260901_071003816_09.jpg", "category": "ARCHIVAL_FRONT_WARM" },
       { "filename": "KakaoTalk_20260901_071003816_10.jpg", "category": "ARCHIVAL_REAR_SHADOW" },
       { "filename": "KakaoTalk_20260901_071003816_11.jpg", "category": "ARCHIVAL_PROFILE_SHARP" },
       { "filename": "KakaoTalk_20260901_071028050.jpg", "category": "ARCHIVAL_PORTRAIT_HEAD" }
     ]
   }
   ```

---

## 6. Critical Edge Cases & Risk Mitigations

1. **Windows Unicode Paths**:
   - *Risk*: `cv2.imread(path)` returns `None` on Windows if path contains Korean/Unicode characters like `c:\Users\황태민\...`.
   - *Mitigation*: Strictly utilize `PIL.Image.open()` or `cv2.imdecode(np.fromfile(path, dtype=np.uint8), cv2.IMREAD_COLOR)`.

2. **Mobile EXIF Orientation Inversion**:
   - *Risk*: Smartphones capture orientation metadata in EXIF tag `0x0112`. Without normalization, images may appear rotated 90 or 270 degrees.
   - *Mitigation*: Integrate `PIL.ImageOps.exif_transpose` during the ingestion phase so all coordinates and bounding boxes operate in standard upright orientation.

3. **Lighting & Color Variance**:
   - *Risk*: Field photography often has mixed domestic indoor lighting (warm incandescent vs cold daylight).
   - *Mitigation*: Use relative color ratios (e.g. `B - (R+G)/2` for blue stamp, `R > G > B` skin ratios) and normalized color spaces (HSV/LAB) rather than hardcoded RGB thresholds.

4. **Deterministic Fallback & Manifest Override**:
   - *Risk*: Unforeseen antique geometries might yield close classification probabilities.
   - *Mitigation*: Include `--override-config <path>` flag allowing manual curation manifest to override or lock specific angle assignments.

---

## 7. Downstream Hand-off to Milestone 2 (Studio Matting)

Once Milestone 1 generates `classification_manifest.json`, Milestone 2 (`scripts/enhance_studio_photos.py`) can consume this exact manifest:
- Reads the 5 canonical input photos from `angles.*.filename`.
- Applies IS-Net background removal and alpha refinement.
- Composites onto Sotheby's luxury dark slate spotlight gradient (`#1A1D20` -> `#0D0E10`).
- Generates contact shadows and exports 1400x1800 studio masters to `public/artifacts/lladro_gres_venus/studio_master/`.
