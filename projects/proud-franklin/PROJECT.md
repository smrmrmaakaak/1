# Project: Antique Studio Photo Processing, 5-Angle Precision Classification & Catalog Integration

## Architecture
- **Raw Asset Ingestion & Classification Layer**: Scans raw collection photography (e.g. 2252x4000 JPEG), parses EXIF/orientation metadata, and classifies shots into 5 canonical Sotheby's/Christie's auction appraisal angles:
  1. `HERO_FRONT` (전신 전면 마스터)
  2. `SIDE_PROFILE` (3/4 측면 프로필)
  3. `PORTRAIT_TORSO` (상체 및 마크로 디테일)
  4. `REAR_SCULPTURE` (후면 조형미 및 드레이퍼리)
  5. `BASE_BACKSTAMP` (하단 백스탬프 / 각인 / 보증 번호)
- **Studio Enhancement Pipeline Layer (Python / CUDA GPU Accelerated)**:
  - High-precision boundary extraction & alpha matting (IS-Net / PyMatting / OpenCV morphological contour refinement) preserving 100% authentic physical shape (0% AI hallucination / 0% generative geometry alteration).
  - Luxury auction backdrop synthesis: Dark slate & warm charcoal radial spotlight gradient (`#1A1D20` -> `#0D0E10`) with cosine smoothstep falloff to eliminate banding.
  - Realistic multi-tier contact floor shadows (sharp ambient occlusion contact line + soft diffuse perspective projection shadow).
  - Unsharp mask stoneware texture enhancement highlighting matte terracotta clay grit, glazed wavy hair highlights, and stamped incised numbers without edge haloing.
  - Authentic backstamp preservation: macro framing with subtle warm vignette and unsharp clarity rather than artificial object cutouts.
- **Catalog Integration & Data Layer (`src/data/antiques.js`)**:
  - Structured antique models grouped into master brand books (`LIBER I` to `LIBER VIII`).
  - Standardized 5-angle studio gallery schema with `angleTag`, `macroRatio`, physical dimensions, provenance, and appraisals.
  - Data integrity maintenance across all 25+ antique products.
- **UI & 3D Interactive Presentation Layer (`src/components/`)**:
  - `ThreeDRealBookViewer.jsx`: WebGL canvas-generated parchment folios rendering authentic antique lore, specs, and dynamic studio master texture maps.
  - `VerticalPhotoGallery.jsx`: Modal stream for high-res 5-angle inspection with 3D chiseled debossed gold foil appraisal pricing.
  - `MobileSinglePageReader.jsx`: Responsive layout optimization for touch devices.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Raw Photo Ingestion & Metadata Normalization | Ingest raw high-res photos (2252x4000), correct orientation/EXIF, and organize input directory structure. | M1 | Survey (Explorer 1) |
| 2 | 5-Angle Precision Classification | Classify collection photography into 5 standard angles: Front, Profile, Detail, Back, and Backstamp. | M1 | Survey (Explorer 1) |
| 3 | 100% Authentic Shape Preservation Alpha Matting | Perform fine boundary segmentation using IS-Net and alpha feathering with zero geometry modification. | M2 | Survey (Explorer 3) |
| 4 | Luxury Dark Slate & Warm Charcoal Backdrop Synthesis | Generate smoothstep radial spotlight gradient (`#1A1D20` -> `#0D0E10`) matching Sotheby's/Christie's lighting. | M2 | Survey (Explorer 3) |
| 5 | Realistic Ground Contact Shadow Synthesis | Composite dual-layer contact and diffuse drop shadows grounding porcelain in 3D studio space. | M2 | Survey (Explorer 3) |
| 6 | Stoneware Texture & Micro-Detail Unsharp Masking | Enhance matte terracotta grit, porcelain gloss contrasts, and incised hallmarks without halo artifacts. | M2 | Survey (Explorer 3) |
| 7 | Specialized Backstamp Macro Preservation | Preserve underside base plates with vignette borders and clarity filtering to safeguard provenance labels. | M2 | Survey (Explorer 3) |
| 8 | Standardized Studio Master Asset Generation | Export standardized auction lookbook assets (1400x1800 & 1200x1600 Web/JPEGs) to `public/artifacts/` & `public/assets/`. | M2 | Survey (Explorer 1, 3) |
| 9 | Catalog Data Schema Integration (`src/data/antiques.js`) | Map 5-angle studio photos, macro ratios, dimensions, materials, and descriptions into `src/data/antiques.js`. | M3 | Survey (Explorer 2) |
| 10 | Catalog Data Quality & Lore Polish | Correct copy-pasted non-porcelain material strings (embroidery/painting) and verify physical dimensions. | M3 | Survey (Explorer 2) |
| 11 | 3D WebGL Book Viewer Folio Rendering | Ensure Left/Right folio canvases render studio master images, CTA ribbons, and specs without texture distortion. | M3 | Survey (Explorer 2) |
| 12 | 5-Angle Vertical Photo Gallery & Appraisal Modal | Verify high-res vertical inspection stream, angle tags, and 3D debossed gold foil price rendering. | M3 | Survey (Explorer 2) |
| 13 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test suite validating classification, matting integrity, schema conformance, and UI. | E2E-Track | Orchestration Pattern |
| 14 | Build Verification & Adversarial Coverage Hardening | Run clean `npm run build` and adversarial Tier 5 tests to ensure zero regressions and robust production deployment. | M4 | Survey (Explorer 2, 3) |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | 5-Angle Asset Classification & Ingestion Pipeline | Build and execute automated classification & preprocessing script for raw photography (Features 1, 2) | none | DONE |
| M2 | Authentic Alpha Matting & Luxury Studio Backdrop Synthesis | Build and execute the full auction-grade enhancement pipeline (Features 3, 4, 5, 6, 7, 8) | M1 | DONE |
| M3 | Catalog Data Integration & UI Viewer Synchronization | Update `src/data/antiques.js`, fix data inconsistencies, verify 3D book viewer and 5-angle gallery rendering (Features 9, 10, 11, 12) | M2 | DONE |
| M4 | Final Milestone: 100% E2E Verification & Adversarial Hardening | Pass 100% of E2E test suite (Tiers 1-4), execute `npm run build`, adversarial coverage hardening (Feature 14) | M3, E2E-Track | DONE |
| E2E | E2E Testing Track | Independent opaque-box test runner and 4-tier test suite covering Features 1-14 (67/67 tests passing) | none (parallel) | DONE |

---

## Interface Contracts

### Classification & Ingestion Engine ↔ Enhancement Pipeline
- **Input**: Raw directory containing JPEG/PNG collection photos (e.g. `public/artifacts/lladro_gres_venus/`).
- **Output JSON**: `classification_manifest.json` mapping each file to its classified angle:
  ```json
  {
    "productId": "prod-lladro-gres-2256-venus",
    "angles": {
      "front": "KakaoTalk_..._04.jpg",
      "profile": "KakaoTalk_..._06.jpg",
      "detail": "KakaoTalk_..._05.jpg",
      "back": "KakaoTalk_..._10.jpg",
      "backstamp": "KakaoTalk_..._01.jpg"
    }
  }
  ```

### Enhancement Pipeline ↔ Catalog Data & Web Assets
- **Outputs**:
  - `public/artifacts/<item_slug>/studio_master/<item>_01_hero_front.jpg` (1400x1800)
  - `public/artifacts/<item_slug>/studio_master/<item>_02_side_profile.jpg` (1400x1800)
  - `public/artifacts/<item_slug>/studio_master/<item>_03_portrait_torso.jpg` (1400x1800)
  - `public/artifacts/<item_slug>/studio_master/<item>_04_rear_sculpture.jpg` (1400x1800)
  - `public/artifacts/<item_slug>/studio_master/<item>_05_backstamp.jpg` (1400x1800)
- **Data Contract (`src/data/antiques.js`)**:
  ```javascript
  {
    id: "prod-lladro-gres-2256-venus",
    mainImage: "/artifacts/lladro_gres_venus/studio_master/venus_01_hero_front.jpg",
    detailImage: "/artifacts/lladro_gres_venus/studio_master/venus_03_portrait_torso.jpg",
    galleryPhotos: [
      {
        url: "/artifacts/lladro_gres_venus/studio_master/venus_01_hero_front.jpg",
        caption: "...",
        angleTag: "HERO 01",
        macroRatio: "전신 전면 (Full Frontal Hero)"
      },
      // ... 02 to 05 studio masters ...
    ]
  }
  ```

---

## Code Layout
- `src/data/antiques.js` — Core catalog dataset (8 books, 25+ products).
- `src/components/ThreeDRealBookViewer.jsx` — 3D WebGL book folio rendering engine.
- `src/components/VerticalPhotoGallery.jsx` — 5-Angle high-res inspection gallery modal.
- `src/components/MobileSinglePageReader.jsx` — Mobile responsive view.
- `public/artifacts/` — Raw photo archives and processed studio master images.
- `public/assets/` — Standard resolution catalog assets.
- `scripts/` — Pipeline execution scripts for classification, matting, backdrop, and test suites.
- `tests/` — E2E test suites and runner scripts.
