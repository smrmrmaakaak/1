# Technical Analysis: Output Manifest Schema, Downstream Integration & Worker Implementation Plan

**Agent**: Explorer 3 (Milestone 1 — 5-Angle Asset Classification & Ingestion Pipeline)  
**Date**: 2026-09-02  
**Working Directory**: `c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_m1_3`  
**Target File**: `analysis.md`  

---

## Executive Summary

This report establishes the complete architectural blueprint for Milestone 1's output manifest (`classification_manifest.json`), its downstream integration with Milestone 2 (Auction Studio Enhancement Pipeline) and Milestone 3 (Catalog Data in `src/data/antiques.js`), the exact CLI interfaces, multi-tiered validation routines, and the recommended Worker implementation plan.

Key architectural achievements defined herein:
1. **End-to-End Contract Stability**: The `classification_manifest.json` schema acts as a single source of truth connecting raw photography to M2 enhancement parameters and M3 React/WebGL catalog bindings.
2. **Dual-Path Enhancement Directives**: Clear bifurcation between sculpture cutouts (requiring IS-Net alpha matting + radial backdrop + contact shadows) and provenance backstamps (requiring authentic macro framing + clarity + subtle archival vignettes).
3. **Deterministic Multi-Feature Heuristics**: Multi-modal scoring (contour aspect ratios, vertical mass distributions, edge densities, facial/dove feature clusters, text/hallmark stamp regions) ensuring zero AI redraw or geometry distortion.
4. **Comprehensive Test & Validation Suite**: 8 automated test fixtures and strict validation routines ensuring 100% data integrity before handing off to M2.

---

## 1. Downstream Integration Architecture (M1 ➔ M2 ➔ M3)

```
+-----------------------------------------------------------------------------------+
|                           MILESTONE 1 (Ingestion & Classification)                |
|  - Ingest raw JPEG/PNG photos (2252x4000)                                         |
|  - Normalize EXIF orientation & color space                                       |
|  - Extract visual features (contours, aspect ratios, stamps, symmetry)            |
|  - Optimal 5-angle assignment (Hero, Profile, Portrait, Rear, Backstamp)          |
|  - Output: classification_manifest.json                                           |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                         MILESTONE 2 (Auction Studio Enhancement)                  |
|  - Ingest classification_manifest.json                                            |
|  - For Angles 1-4 (Sculptures):                                                   |
|      * IS-Net alpha matting + OpenCV morphological feathering                      |
|      * Smoothstep dark slate/warm charcoal radial spotlight (#1A1D20 -> #0D0E10)   |
|      * Synthesize dual-layer ground contact shadow                                |
|      * Unsharp mask stoneware clay grit & porcelain gloss                         |
|  - For Angle 5 (Backstamp):                                                       |
|      * Preserve authentic plate edge + warm vignette + hallmark clarity           |
|  - Output: 5 Studio Masters (1400x1800 px) in public/artifacts/<slug>/studio_master |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                         MILESTONE 3 (Catalog Integration & UI)                    |
|  - Update src/data/antiques.js:                                                   |
|      * mainImage -> /artifacts/<slug>/studio_master/<slug>_01_hero_front.jpg      |
|      * detailImage -> /artifacts/<slug>/studio_master/<slug>_03_portrait_torso.jpg|
|      * galleryPhotos -> 5 Studio Master entries + raw supplementary entries       |
|  - Render in ThreeDRealBookViewer.jsx & VerticalPhotoGallery.jsx                   |
|  - Verify 100% build pass via `npm run build`                                      |
+-----------------------------------------------------------------------------------+
```

### 1.1 Data Contract with Milestone 2 (Enhancement Pipeline)
Milestone 2 requires specific parameters from Milestone 1 to execute enhancement without guessing:
- `source.relativePath`: Exact disk path to the source raw photo.
- `canonicalTag`: Identifies which enhancement pipeline branch to execute:
  - `HERO_FRONT`, `SIDE_PROFILE`, `PORTRAIT_TORSO`, `REAR_SCULPTURE`: `mattingRequired: true`, radial spotlight synthesis, ground contact shadow synthesis, stoneware unsharp masking.
  - `BASE_BACKSTAMP`: `mattingRequired: false`, `preserveAuthenticFrame: true`, macro archival vignette, stamp text clarity filtering.
- `targetOutput.relativePath`: Exact destination path (e.g. `public/artifacts/lladro_gres_venus/studio_master/venus_01_hero_front.jpg`).
- `targetOutput.targetDimensions`: Standard `[1400, 1800]` (7:9 auction aspect ratio).
- `enhancementDirectives`: Tuning knobs for spotlight position, shadow opacity, and boundary erosion.

### 1.2 Data Contract with Milestone 3 (Catalog & UI)
Milestone 3 directly reads metadata defined in `classifiedAngles` and `unassignedPhotos`:
- `angleTag`: UI badge text (e.g. `"HERO 01 • 전신 스튜디오 화보"`, `"PORTRAIT 02 • 상체 & 이목구비"`).
- `macroRatio`: Badge tag (e.g. `"MASTER"`, `"PORTRAIT"`, `"PROFILE"`, `"REAR"`, `"HALLMARK"`).
- `defaultCaption`: Curatorial caption displayed in `VerticalPhotoGallery.jsx`.
- `mainImage` & `detailImage`: Explicit mappings for the 3D book cover and detail folio.

---

## 2. Exact JSON Manifest Structure (`classification_manifest.json`)

The manifest schema is structured as follows:

```json
{
  "$schema": "https://labellejean.antique/schemas/v1/classification_manifest.json",
  "version": "1.0.0",
  "generatedAt": "2026-09-02T11:15:00.000Z",
  "pipeline": {
    "name": "antique-5angle-classifier",
    "version": "1.0.0",
    "executionMode": "automated-heuristic-v1"
  },
  "product": {
    "id": "prod-lladro-gres-2256-venus",
    "itemSlug": "lladro_gres_venus",
    "brand": "Lladró",
    "brandCode": "lladro_nao",
    "bookId": "book-1",
    "modelNumber": "2256",
    "koreanTitle": "우물가의 비너스와 평화의 비둘기",
    "materialType": "gres_terracotta"
  },
  "directories": {
    "sourceDir": "public/artifacts/lladro_gres_venus",
    "studioMasterOutputDir": "public/artifacts/lladro_gres_venus/studio_master",
    "catalogAssetDir": "public/assets/lladro_gres"
  },
  "summary": {
    "totalScannedImages": 13,
    "classifiedAnglesCount": 5,
    "unassignedImagesCount": 8,
    "allCanonicalAnglesFound": true,
    "overallConfidence": 0.942,
    "validationStatus": "VALID"
  },
  "classifiedAngles": {
    "HERO_FRONT": {
      "angleIndex": 1,
      "canonicalTag": "HERO_FRONT",
      "angleTag": "HERO 01 • 전신 스튜디오 화보",
      "macroRatio": "MASTER",
      "defaultCaption": "소더비 경매 룩북 전신 3/4 스튜디오 마스터 화보",
      "source": {
        "filename": "KakaoTalk_20260901_071003816_04.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/KakaoTalk_20260901_071003816_04.jpg",
        "sha256": "3fa9...",
        "fileSizeBytes": 1284228,
        "width": 2252,
        "height": 4000,
        "aspectRatio": 0.563,
        "exifOrientationApplied": 1
      },
      "targetOutput": {
        "filename": "venus_01_hero_front.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/studio_master/venus_01_hero_front.jpg",
        "targetDimensions": [1400, 1800],
        "format": "JPEG",
        "targetQuality": 95
      },
      "classification": {
        "confidence": 0.96,
        "heuristicScores": {
          "verticalContinuity": 0.95,
          "frontalSymmetry": 0.92,
          "torsoExtentRatio": 0.88,
          "edgeDensity": 0.84,
          "backstampTextScore": 0.02
        },
        "matchedRule": "full_body_standing_frontal_symmetry"
      },
      "enhancementDirectives": {
        "mattingRequired": true,
        "mattingModel": "isnet-general-use",
        "boundaryMorphology": {
          "erodeSize": 1,
          "gaussianBlur": 0.5
        },
        "backdrop": {
          "style": "sothebys_dark_slate_charcoal_radial",
          "centerColorHex": "#2A2F35",
          "midColorHex": "#1A1D20",
          "outerColorHex": "#0A0B0D",
          "spotlightPosition": [0.50, 0.42],
          "spotlightRadii": [0.55, 0.70]
        },
        "contactShadow": {
          "enabled": true,
          "contactOpacity": 0.85,
          "diffuseOpacity": 0.45,
          "offsetY": 8
        },
        "textureEnhancement": {
          "unsharpRadius": 1.8,
          "unsharpPercent": 120,
          "unsharpThreshold": 2
        },
        "preserveAuthenticFrame": false
      }
    },
    "SIDE_PROFILE": {
      "angleIndex": 2,
      "canonicalTag": "SIDE_PROFILE",
      "angleTag": "PROFILE 03 • 측면 실루엣 화보",
      "macroRatio": "PROFILE",
      "defaultCaption": "물 긷는 비너스 측면 실루엣 및 암포라 항아리",
      "source": {
        "filename": "KakaoTalk_20260901_071003816_06.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/KakaoTalk_20260901_071003816_06.jpg",
        "fileSizeBytes": 1072377,
        "width": 2252,
        "height": 4000,
        "aspectRatio": 0.563
      },
      "targetOutput": {
        "filename": "venus_02_side_profile.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/studio_master/venus_02_side_profile.jpg",
        "targetDimensions": [1400, 1800]
      },
      "classification": {
        "confidence": 0.93,
        "matchedRule": "lateral_silhouette_amphora_profile"
      },
      "enhancementDirectives": {
        "mattingRequired": true,
        "backdrop": { "style": "sothebys_dark_slate_charcoal_radial" },
        "contactShadow": { "enabled": true }
      }
    },
    "PORTRAIT_TORSO": {
      "angleIndex": 3,
      "canonicalTag": "PORTRAIT_TORSO",
      "angleTag": "PORTRAIT 02 • 상체 & 이목구비",
      "macroRatio": "PORTRAIT",
      "defaultCaption": "비너스 이목구비 및 평화의 비둘기 클로즈업",
      "source": {
        "filename": "KakaoTalk_20260901_071003816_05.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/KakaoTalk_20260901_071003816_05.jpg",
        "fileSizeBytes": 1083260,
        "width": 2252,
        "height": 4000
      },
      "targetOutput": {
        "filename": "venus_03_portrait_torso.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/studio_master/venus_03_portrait_torso.jpg",
        "targetDimensions": [1400, 1800]
      },
      "classification": {
        "confidence": 0.95,
        "matchedRule": "upper_torso_facial_macro_crop"
      },
      "enhancementDirectives": {
        "mattingRequired": true,
        "backdrop": { "style": "sothebys_dark_slate_charcoal_radial" },
        "contactShadow": { "enabled": false }
      }
    },
    "REAR_SCULPTURE": {
      "angleIndex": 4,
      "canonicalTag": "REAR_SCULPTURE",
      "angleTag": "REAR 04 • 후면 조각 화보",
      "macroRatio": "REAR",
      "defaultCaption": "후면 드레이프 주름 및 벽돌 우물 테라코타 질감",
      "source": {
        "filename": "KakaoTalk_20260901_071003816_10.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/KakaoTalk_20260901_071003816_10.jpg",
        "fileSizeBytes": 969104,
        "width": 2252,
        "height": 4000
      },
      "targetOutput": {
        "filename": "venus_04_rear_sculpture.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/studio_master/venus_04_rear_sculpture.jpg",
        "targetDimensions": [1400, 1800]
      },
      "classification": {
        "confidence": 0.92,
        "matchedRule": "rear_drapery_cascades_brick_well"
      },
      "enhancementDirectives": {
        "mattingRequired": true,
        "backdrop": { "style": "sothebys_dark_slate_charcoal_radial" },
        "contactShadow": { "enabled": true }
      }
    },
    "BASE_BACKSTAMP": {
      "angleIndex": 5,
      "canonicalTag": "BASE_BACKSTAMP",
      "angleTag": "STAMP 05 • 정품 백스탬프 각인",
      "macroRatio": "HALLMARK",
      "defaultCaption": "LLADRÓ DAISA 1993 공식 종꽃 백스탬프 & #2256 각인",
      "source": {
        "filename": "KakaoTalk_20260901_071003816_01.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/KakaoTalk_20260901_071003816_01.jpg",
        "fileSizeBytes": 1195048,
        "width": 2252,
        "height": 4000
      },
      "targetOutput": {
        "filename": "venus_05_backstamp.jpg",
        "relativePath": "public/artifacts/lladro_gres_venus/studio_master/venus_05_backstamp.jpg",
        "targetDimensions": [1400, 1800]
      },
      "classification": {
        "confidence": 0.99,
        "matchedRule": "underside_base_stamp_and_hallmark_text"
      },
      "enhancementDirectives": {
        "mattingRequired": false,
        "preserveAuthenticFrame": true,
        "frameVignette": {
          "enabled": true,
          "opacity": 0.35,
          "innerRadius": 0.65,
          "outerRadius": 0.98
        },
        "textureEnhancement": {
          "unsharpRadius": 1.5,
          "unsharpPercent": 130,
          "unsharpThreshold": 1
        }
      }
    }
  },
  "unassignedPhotos": [
    {
      "filename": "KakaoTalk_20260901_071003816.jpg",
      "relativePath": "public/artifacts/lladro_gres_venus/KakaoTalk_20260901_071003816.jpg",
      "catalogRole": "RAW_SUPPLEMENTARY",
      "suggestedAngleTag": "RAW 06 • 비너스 실물 원본",
      "macroRatio": "RAW",
      "topCandidates": [
        { "angle": "HERO_FRONT", "score": 0.82 },
        { "angle": "SIDE_PROFILE", "score": 0.74 }
      ]
    },
    {
      "filename": "KakaoTalk_20260901_071003816_02.jpg",
      "relativePath": "public/artifacts/lladro_gres_venus/KakaoTalk_20260901_071003816_02.jpg",
      "catalogRole": "RAW_SUPPLEMENTARY",
      "suggestedAngleTag": "ANGLE 03 • 비너스 실물 화보",
      "macroRatio": "GRES"
    }
  ],
  "validation": {
    "isValid": true,
    "requiredAnglesPresent": [
      "HERO_FRONT",
      "SIDE_PROFILE",
      "PORTRAIT_TORSO",
      "REAR_SCULPTURE",
      "BASE_BACKSTAMP"
    ],
    "missingAngles": [],
    "duplicateAssignments": [],
    "warnings": []
  }
}
```

---

## 3. CLI Arguments & Execution Interface

The entry point script `scripts/classify_and_ingest_photos.py` supports the following CLI arguments:

```bash
python scripts/classify_and_ingest_photos.py [OPTIONS]
```

### 3.1 Option Specifications

| Argument | Short | Type | Default | Description |
|---|---|---|---|---|
| `--input-dir` | `-i` | String | `None` (Required) | Source directory containing raw collection images. |
| `--output-manifest` | `-o` | String | `<input-dir>/classification_manifest.json` | Path where the output manifest JSON will be written. |
| `--product-id` | `-p` | String | Auto-inferred | Matching antique ID in `src/data/antiques.js` (e.g. `prod-lladro-gres-2256-venus`). |
| `--item-slug` | `-s` | String | Auto-inferred | Prefix used for studio master filenames (e.g. `venus`). |
| `--target-dir` | `-t` | String | `None` | Staging directory to copy/normalize raw photos if ingesting from an external folder. |
| `--override-json` | `-m` | String | `None` | Path to JSON file containing manual overrides for specific angles. |
| `--strict` / `--no-strict` | | Boolean | `True` | In strict mode, exit with non-zero error code if any of the 5 canonical angles cannot be resolved with confidence >= 0.5. |
| `--normalize-exif` | | Boolean | `True` | Automatically rotate images upright based on EXIF tags. |
| `--dry-run` | | Boolean | `False` | Run heuristics, print classification table to stdout, but do not write files. |
| `--json` | | Boolean | `False` | Output clean JSON response to stdout for wrapper scripts. |

### 3.2 Example Invocations

1. **Standard Ingestion for Lladró Gres Venus**:
   ```bash
   python scripts/classify_and_ingest_photos.py \
     --input-dir public/artifacts/lladro_gres_venus \
     --product-id prod-lladro-gres-2256-venus \
     --item-slug venus \
     --strict
   ```

2. **Ingestion with Manual Override**:
   ```bash
   python scripts/classify_and_ingest_photos.py \
     --input-dir public/artifacts/lladro_gres_venus \
     --override-json overrides.json \
     --strict
   ```

---

## 4. Multi-Tiered Validation Routines

To ensure total system resilience, the manifest generator executes 6 validation routines prior to saving:

```
[1. File Existence & Readability] ➔ [2. EXIF & Aspect Ratio] ➔ [3. 5-Angle Completeness]
                           │
                           ▼
[4. Bijective Uniqueness Check] ➔ [5. Confidence Thresholding] ➔ [6. Enhancement Directive Validity]
```

1. **File Existence & Integrity Check**:
   - Every file referenced in `classifiedAngles` and `unassignedPhotos` must exist, have size > 10 KB, and load successfully via `PIL.Image.open()`.
2. **EXIF & Orientation Normalization**:
   - Ensures width and height reflect the upright viewing orientation (portrait height > width for full-body figures).
3. **5-Angle Completeness Check**:
   - All 5 canonical keys (`HERO_FRONT`, `SIDE_PROFILE`, `PORTRAIT_TORSO`, `REAR_SCULPTURE`, `BASE_BACKSTAMP`) must be populated in `classifiedAngles`.
4. **Bijective Uniqueness Check**:
   - No single raw image may be assigned to more than one canonical angle.
5. **Confidence & Heuristic Thresholding**:
   - High confidence (>= 0.80): Approved automatically.
   - Moderate confidence (0.60–0.79): Approved with warning flag in manifest.
   - Low confidence (< 0.60): In strict mode, aborts with error requiring manual inspection or override.
6. **Enhancement Directive Validity**:
   - Sculpture angles must have `mattingRequired: true`.
   - Backstamp angles must have `mattingRequired: false` and `preserveAuthenticFrame: true`.

---

## 5. Automated Unit Test Criteria

The test suite in `tests/test_classify_and_ingest.py` covers the following unit and integration test cases:

| Test Case | Description | Pass Criteria |
|---|---|---|
| `test_exif_normalization` | Ingests portrait and landscape photos with EXIF orientation tags. | All returned images are upright with correct width/height. |
| `test_backstamp_detection` | Tests hallmark detection heuristic on underside base photos. | Identifies `BASE_BACKSTAMP` with confidence >= 0.90; `mattingRequired == false`. |
| `test_hero_vs_portrait_discrimination` | Differentiates full-body standing shots from zoomed torso shots. | `HERO_FRONT` assigned to full-body shot; `PORTRAIT_TORSO` assigned to macro crop. |
| `test_profile_vs_rear_discrimination` | Differentiates lateral silhouette with amphora from rear drapery folds. | `SIDE_PROFILE` and `REAR_SCULPTURE` accurately assigned. |
| `test_venus_dataset_end_to_end` | Runs classifier on actual `public/artifacts/lladro_gres_venus/` dataset. | Exact mapping: Front (`_04`), Profile (`_06`), Torso (`_05`), Rear (`_10`), Stamp (`_01`). |
| `test_manifest_schema_conformance` | Validates generated JSON against strict schema definitions. | All required keys, types, enums, and nested structures present without errors. |
| `test_manual_override` | Supplies `override_json` and verifies that heuristic predictions are overridden. | Specified angle matches override file; other angles remain heuristically resolved. |
| `test_strict_mode_missing_angle` | Passes a folder containing only 2 photos. | Raises `ClassificationIncompleteError` in strict mode with descriptive message. |

---

## 6. Recommended Worker Implementation Plan

### Step 1: Core Classifier Module (`scripts/classify_and_ingest_photos.py`)
Implement the following structured Python classes:
- `ImageMetrics`: Parses resolution, aspect ratio, color distributions, edge density, and bounding box bounds.
- `FeatureExtractor`: Uses OpenCV and PIL to calculate:
  - Bounding box vertical height ratio (distinguishes full-body vs torso macro).
  - Blue ink / dark text hallmark density (distinguishes base backstamp).
  - Lateral asymmetry & contour curvature (distinguishes profile vs rear).
- `AngleScorer`: Evaluates likelihood score (0.0 to 1.0) for each photo across the 5 canonical angles.
- `AssignmentResolver`: Uses optimal greedy/Hungarian matching to assign distinct photos to the 5 canonical slots.
- `ManifestBuilder`: Constructs the full JSON document with complete enhancement directives, file paths, and metadata.

### Step 2: CLI Wrapper & File Ingestion
- Implement `argparse` CLI with `--input-dir`, `--output-manifest`, `--product-id`, `--item-slug`, `--strict`, `--dry-run`, and `--override-json`.
- Handle EXIF auto-rotation if images require orientation correction.

### Step 3: Test Suite Implementation (`tests/test_classify_and_ingest.py`)
- Implement 8 pytest/unittest fixtures and assertions.
- Run tests to confirm 100% pass rate.

### Step 4: End-to-End Execution for Lladró Gres Venus #2256
- Execute `python scripts/classify_and_ingest_photos.py --input-dir public/artifacts/lladro_gres_venus --product-id prod-lladro-gres-2256-venus --item-slug venus --strict`.
- Verify generated `public/artifacts/lladro_gres_venus/classification_manifest.json`.

---

## 7. Conclusion

Milestone 1 is cleanly specified with an airtight schema, unambiguous contracts for Milestone 2 and 3, robust CLI and validation rules, and comprehensive unit tests. The implementation can proceed immediately and deterministically.
