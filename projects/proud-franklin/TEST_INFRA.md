# E2E Test Infrastructure & Verification Architecture

## 1. Overview & Quality Objectives
This document specifies the end-to-end testing infrastructure and quality assurance matrix for the **Antique Studio Photo Processing, 5-Angle Precision Classification & Catalog Integration Pipeline** (`Arcana Antiqua`).

The test suite enforces:
1. **100% Authentic Physical Shape Preservation**: Zero AI hallucination, zero redrawing, exact boundary fidelity.
2. **Sotheby's / Christie's Auction-Grade Aesthetics**: Precision alpha matting, smoothstep radial spotlight backdrop (`#1A1D20` -> `#0D0E10`), dual-layer contact and diffuse drop shadows, high-frequency stoneware unsharp mask texture preservation, and macro hallmark preservation.
3. **Data Schema & Lore Conformance**: 100% schema compliance across all 8 master brand tomes (`LIBER I` to `LIBER VIII`) and 29 cataloged antique collection pieces in `src/data/antiques.js`.
4. **Interactive UI & 3D Folio Viewer Synchronization**: Flawless texture mapping, modal state transitions, responsive rendering, and clean production build compilation (`npm run build`).

---

## 2. 4-Tier Test Architecture

```
+-------------------------------------------------------------------------------+
|                       TIER 4: REAL-WORLD SYSTEM WORKLOAD                      |
|  - Full Catalog 8 Books / 29 Products Batch Integrity                         |
|  - Photometric Sotheby's / Christie's Colorimetric & Contrast Quality         |
|  - Production Vite Bundle & Asset Distribution Conformance                    |
+-------------------------------------------------------------------------------+
                                       ▲
+-------------------------------------------------------------------------------+
|                   TIER 3: CROSS-FEATURE PAIRWISE INTEGRATION                  |
|  - Classification Manifest ↔ Studio Master Asset Generation                   |
|  - Alpha Matting ↔ Backdrop Synthesis ↔ Contact Shadow Compositing            |
|  - Studio Master Assets ↔ Catalog Data Synchronization                        |
|  - Catalog Data ↔ 3D Real Book Folio Viewer & Vertical Modal UI               |
+-------------------------------------------------------------------------------+
                                       ▲
+-------------------------------------------------------------------------------+
|                       TIER 2: BOUNDARY & CORNER CASES                         |
|  - Extreme Aspect Ratios & Rescaling Tolerances                               |
|  - RGB Gamut Clamping & Smoothstep Falloff Limits                             |
|  - Corrupted Manifests & Missing Photo Fallbacks                              |
|  - Schema Edge Cases (Empty Fields, Unicode/Special Characters, Sold Out)     |
|  - Shadow Intensity Clipping & Ambient Occlusion Thresholds                   |
+-------------------------------------------------------------------------------+
                                       ▲
+-------------------------------------------------------------------------------+
|                         TIER 1: FEATURE COVERAGE (F01-F14)                    |
|  - F01: Raw Ingestion & Metadata   | F08: Studio Master Generation            |
|  - F02: 5-Angle Classification    | F09: Catalog Schema Conformance          |
|  - F03: Alpha Matting Integrity   | F10: Lore & Dimension Quality            |
|  - F04: Radial Backdrop Gradient  | F11: 3D Book Viewer Folio Rendering      |
|  - F05: Contact Shadow Synthesis  | F12: Vertical Lookbook Modal Gallery     |
|  - F06: Stoneware Unsharp Masking | F13: E2E Test Runner Self-Coverage       |
|  - F07: Backstamp Macro Framing   | F14: Vite Production Build Verification  |
+-------------------------------------------------------------------------------+
```

---

## 3. Feature-to-Test Mapping Matrix

| Feature ID | Feature Name | Test Suite Path | Verification Focus |
|:-----------|:-------------|:----------------|:-------------------|
| **F01** | Raw Photo Ingestion & Metadata Normalization | `tests/tier1_feature_coverage/test_f01_raw_ingestion.py` | Ingests 2252x4000 raw JPEGs, validates dimensions, channels, and EXIF orientation normalization. |
| **F02** | 5-Angle Precision Classification | `tests/tier1_feature_coverage/test_f02_five_angle_classification.py` | Classifies photos into `HERO_FRONT`, `SIDE_PROFILE`, `PORTRAIT_TORSO`, `REAR_SCULPTURE`, `BASE_BACKSTAMP`. |
| **F03** | 100% Authentic Shape Preservation Alpha Matting | `tests/tier1_feature_coverage/test_f03_shape_preservation_matting.py` | Verifies zero AI hallucination/redraw, strict boundary contour preservation, zero halo artifacts. |
| **F04** | Luxury Radial Backdrop Synthesis | `tests/tier1_feature_coverage/test_f04_radial_backdrop_synthesis.py` | Validates `#1A1D20` -> `#0D0E10` smoothstep cosine falloff, radial center brightness vs corner darkness. |
| **F05** | Ground Contact Shadow Synthesis | `tests/tier1_feature_coverage/test_f05_ground_contact_shadows.py` | Verifies dual-tier shadow (sharp contact AO line + soft perspective drop shadow) grounding the object. |
| **F06** | Stoneware Texture & Unsharp Masking | `tests/tier1_feature_coverage/test_f06_stoneware_unsharp_mask.py` | Measures high-frequency Laplacian variance and local edge contrast without halo ringing. |
| **F07** | Specialized Backstamp Macro Preservation | `tests/tier1_feature_coverage/test_f07_backstamp_macro_preservation.py` | Verifies full rectangular macro frame with vignette and sharpness preserving maker hallmarks. |
| **F08** | Standardized Studio Master Asset Generation | `tests/tier1_feature_coverage/test_f08_studio_master_assets.py` | Verifies 1400x1800 aspect ratio, resolution standards, JPEG quality, and output naming conventions. |
| **F09** | Catalog Schema Conformance (`antiques.js`) | `tests/tier1_feature_coverage/test_f09_catalog_schema_integrity.py` | Validates complete schema contracts, 5-angle gallery tags, asset URLs, and spec arrays. |
| **F10** | Catalog Lore Polish & Dimension Verification | `tests/tier1_feature_coverage/test_f10_catalog_lore_polish.py` | Eliminates placeholder text, validates Korean/Latin terminology, and checks physical measurement units. |
| **F11** | 3D WebGL Book Viewer Folio Rendering | `tests/tier1_feature_coverage/test_f11_3d_book_viewer_rendering.py` | Tests `ThreeDRealBookViewer.jsx` canvas bindings, texture mapping, and page navigation interfaces. |
| **F12** | 5-Angle Vertical Photo Gallery & Appraisal Modal | `tests/tier1_feature_coverage/test_f12_vertical_gallery_modal.py` | Tests `VerticalPhotoGallery.jsx` high-res photo stream, debossed gold foil pricing, and angle tags. |
| **F13** | E2E Test Suite Self-Coverage & Discovery | `tests/tier1_feature_coverage/test_f13_test_suite_coverage.py` | Verifies 100% test case registration and coverage reporting across all 4 tiers. |
| **F14** | Production Build & Adversarial Hardening | `tests/tier1_feature_coverage/test_f14_build_verification.py` | Executes clean `npm run build` and verifies bundle asset output integrity. |

---

## 4. Test Directory Layout

```
tests/
├── tier1_feature_coverage/
│   ├── test_f01_raw_ingestion.py
│   ├── test_f02_five_angle_classification.py
│   ├── test_f03_shape_preservation_matting.py
│   ├── test_f04_radial_backdrop_synthesis.py
│   ├── test_f05_ground_contact_shadows.py
│   ├── test_f06_stoneware_unsharp_mask.py
│   ├── test_f07_backstamp_macro_preservation.py
│   ├── test_f08_studio_master_assets.py
│   ├── test_f09_catalog_schema_integrity.py
│   ├── test_f10_catalog_lore_polish.py
│   ├── test_f11_3d_book_viewer_rendering.py
│   ├── test_f12_vertical_gallery_modal.py
│   ├── test_f13_test_suite_coverage.py
│   └── test_f14_build_verification.py
├── tier2_boundary_corner/
│   ├── test_boundary_aspect_ratios.py
│   ├── test_boundary_color_gamut.py
│   ├── test_boundary_corrupt_manifest.py
│   ├── test_boundary_schema_edge_cases.py
│   └── test_boundary_shadow_falloff_limits.py
├── tier3_cross_feature/
│   ├── test_cross_classification_to_studio_master.py
│   ├── test_cross_matting_to_backdrop_composite.py
│   ├── test_cross_studio_to_catalog_sync.py
│   └── test_cross_catalog_to_ui_components.py
├── tier4_real_world/
│   ├── test_full_catalog_29_products_integrity.py
│   ├── test_photometric_sothebys_quality.py
│   └── test_e2e_production_build_artifact.py
├── utils/
│   ├── __init__.py
│   ├── catalog_loader.py
│   └── image_analyzer.py
└── run_all_e2e_tests.py
```

---

## 5. Execution Protocol

### Single Command Master Execution:
```bash
python tests/run_all_e2e_tests.py
```

### Exit Code Contract:
- **`0`**: 100% of test cases in all 4 tiers passed successfully.
- **`1`**: One or more test assertions failed or errors occurred. Diagnostic logs with failed assertion details will be output to stderr/stdout.

---

## 6. Authoritative Expected Output Derivation & Verification Rules
1. **Opaque-Box Independence**: Tests inspect physical image files, raw data structures, build artifacts, and component source code contracts directly without relying on internal helper mocks.
2. **Physical Metric Verification**:
   - Aspect ratio tolerances: $\pm 1\%$
   - Backdrop corner hex color tolerance: $\Delta E < 3.0$ around `#0D0E10` ($[13, 14, 16] \pm 5$)
   - Center spotlight luminance: $L_{center} > L_{corner} + 50$
   - Laplacian texture variance: $\sigma^2 > 100$ on stoneware surface regions
   - Contour IoU between raw and extracted foreground mask: $\text{IoU} \ge 0.96$
3. **No Facade Tests**: Every test assertion performs real arithmetic, file I/O, regex parsing, or computer vision calculations.
