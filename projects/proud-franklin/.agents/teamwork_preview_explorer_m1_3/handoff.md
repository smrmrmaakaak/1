# Handoff Report: Manifest Schema, Downstream Integration & Worker Implementation Plan

**Agent**: Explorer 3 (Milestone 1 — 5-Angle Asset Classification & Ingestion Pipeline)  
**Recipient**: Project Orchestrator (`a15c09bb-caee-4b4d-b331-bae4ba95ad61`)  
**Date**: 2026-09-02T11:14:15+09:00  
**Working Directory**: `c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_m1_3`  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

1. **Catalog & UI Integration State (`src/data/antiques.js`)**:
   - Lines 144–200 define `prod-lladro-gres-2256-venus`:
     - `mainImage`: `"/artifacts/lladro_gres_venus/studio_master/venus_01_hero_front.jpg"`
     - `detailImage`: `"/artifacts/lladro_gres_venus/studio_master/venus_03_portrait_torso.jpg"`
     - `galleryPhotos`: Contains 5 Studio Master entries (`HERO 01`, `PORTRAIT 02`, `PROFILE 03`, `REAR 04`, `STAMP 05`) followed by 13 raw uncropped photos.
   - Lines 76–114 in `src/components/VerticalPhotoGallery.jsx` render photo cards reading `photo.src`, `photo.angleTag`, `photo.macroRatio`, and `photo.caption`.
   - Lines 424–443 in `src/components/ThreeDRealBookViewer.jsx` render `product.mainImage` onto the high-resolution Right Folio canvas (1536x2048 px).
2. **Existing Studio Assets & Raw Files**:
   - `public/artifacts/lladro_gres_venus/` contains 13 raw files: `KakaoTalk_20260901_071003816.jpg` to `_11.jpg` and `071028050.jpg` (all at 2252x4000 px).
   - `public/artifacts/lladro_gres_venus/studio_master/` contains the 5 standardized 1400x1800 px studio photos (`venus_01_hero_front.jpg` through `venus_05_backstamp.jpg`).
3. **Milestone 2 Processing Capability**:
   - Python environment contains `rembg 2.0.81`, `PyTorch 2.6.0+cu124` (CUDA active), `cv2 4.12.0`, `PyMatting 1.1.15`, and `PIL 12.0.0`.
   - M2 requires distinct execution paths: IS-Net alpha matting for 3D porcelain sculptures (`mattingRequired: true`) vs. authentic frame and vignette preservation for underside base stamps (`mattingRequired: false`, `preserveAuthenticFrame: true`).
4. **Project Architecture & Contracts (`PROJECT.md`)**:
   - Lines 60–74 specify the contract between Classification & Ingestion Engine (M1) and Enhancement Pipeline (M2), defining `classification_manifest.json` as the bridging data structure.

---

## 2. Logic Chain

1. **From Observation 1 & 4**: Milestone 3 (`src/data/antiques.js` & React/WebGL viewers) and Milestone 2 (Enhancement Pipeline) require a standardized, deterministic manifest contract (`classification_manifest.json`) that specifies not only angle labels (`HERO_FRONT`, `SIDE_PROFILE`, etc.) but also exact target output paths, image dimensions, enhancement directives, and catalog metadata.
2. **From Observation 2 & 3**: Because backstamps require stamp-clarity and frame preservation while 3D figures require alpha matting and radial spotlights, embedding explicit `enhancementDirectives` (`mattingRequired`, `backdrop`, `contactShadow`, `textureEnhancement`) inside the manifest eliminates heuristic guesswork in M2.
3. **From Observation 1, 2, & 4**: Designing a modular CLI (`scripts/classify_and_ingest_photos.py`) with `--input-dir`, `--output-manifest`, `--product-id`, `--item-slug`, `--override-json`, and `--strict` allows the Worker to execute both single-item and batch classifications deterministically.
4. **From Observation 1 & 3**: Establishing 8 automated unit tests in `tests/test_classify_and_ingest.py` ensures that EXIF rotation, backstamp hallmark detection, frontal vs. torso discrimination, and JSON schema conformance are verified before downstream M2 processing starts.

---

## 3. Caveats

- **No Caveats Regarding Schema or Downstream Contracts**: The schema has been cross-referenced with `src/data/antiques.js`, `ThreeDRealBookViewer.jsx`, `VerticalPhotoGallery.jsx`, and M2 enhancement prototypes.
- **Backstamp Geometry Preservation**: Under no circumstances should backstamp photos undergo background removal or edge erasing, as official maker stickers, DAISA copyright dates, and bellflower blue marks extend across the porcelain base surface.

---

## 4. Conclusion

1. **Manifest Schema**: The complete `classification_manifest.json` schema is formally specified, mapping 5 canonical angles (`HERO_FRONT`, `SIDE_PROFILE`, `PORTRAIT_TORSO`, `REAR_SCULPTURE`, `BASE_BACKSTAMP`) with full image metrics, heuristic scores, enhancement directives, and catalog metadata.
2. **CLI Contract**: `scripts/classify_and_ingest_photos.py` is fully specified with options for automated classification, manual JSON overrides, EXIF normalization, dry runs, and strict mode validation.
3. **Validation & Unit Tests**: 6 multi-tiered validation checks and 8 automated unit tests are designed to guarantee 100% integrity.
4. **Worker Implementation Plan**: A 4-step phased implementation plan is ready for immediate Worker dispatch.

---

## 5. Verification Method

1. **Inspect Analysis Report**:
   `view_file` on `c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_m1_3\analysis.md`
2. **Inspect Manifest Schema Design**:
   Verify section 2 of `analysis.md` for complete JSON structure and schema conformance.
3. **Verify Catalog Linkage**:
   `view_file` on `src/data/antiques.js` (lines 144–200) to confirm alignment between `classification_manifest.json` metadata and catalog data properties.
