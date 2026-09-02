# Comprehensive Technical Analysis: Processing Pipeline & Build Tooling

**Explorer**: Explorer 3 (Processing Pipeline & Build Tooling Explorer)  
**Date & Time**: 2026-09-02T11:11:30+09:00  
**Working Directory**: `c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_survey_3`  
**Reference Request**: `ORIGINAL_REQUEST.md`

---

## 1. Executive Summary

This investigation assessed the project's build tooling, web stack, Python runtime environment, image processing libraries, and algorithmic pipeline capabilities for Sotheby's/Christie's auction-grade antique studio asset generation.

Key Findings:
1. **Frontend & Build Tooling**: Modern React 19 + Three.js 0.185 + Vite 7.3.6 stack. `npm run build` executes cleanly in **3.86s**, generating optimized distribution artifacts in `dist/`.
2. **Image Processing Environment**: System Python 3.13.7 possesses a state-of-the-art computer vision and machine learning toolkit (`Pillow 12.0.0`, `OpenCV 4.12.0`, `rembg 2.0.81`, `PyMatting 1.1.15`, `NumPy 2.2.6`, `SciPy 1.16.3`, `scikit-image 0.26.0`, `PyTorch 2.6.0+cu124` with **CUDA GPU Acceleration Enabled**).
3. **Pipeline Benchmark & Feasibility**: A dedicated multi-stage pipeline prototype was executed on raw porcelain photography. High-precision alpha matting (`isnet-general-use`), luxury radial spotlight synthesis (`#1A1D20` -> `#0D0E10`), dual-layer realistic contact shadow generation, and authentic stoneware unsharp texture enhancement completed in **5.56s** total, with 100% physical geometry preservation (zero AI redrawing).
4. **Catalog Integration Status**: `src/data/antiques.js` contains **29 antique pieces** across 8 collections. `prod-lladro-gres-2256-venus` has established the benchmark 5-angle studio master layout (`HERO 01`, `PROFILE 02`, `PORTRAIT 03`, `REAR 04`, `STAMP 05`).

---

## 2. Build Tooling & Dependency Architecture

### 2.1 Web Application Stack (`package.json` & `vite.config.js`)
- **Package Name**: `arcana-antiqua` (v1.0.0)
- **Node.js Runtime**: `v22.19.0`
- **Package Manager**: `npm v11.x`
- **Core Dependencies**:
  - `react`: `^19.2.0` (installed `19.2.8`)
  - `react-dom`: `^19.2.0` (installed `19.2.8`)
  - `three`: `^0.185.1` (installed `0.185.1`) — Powers the 3D book folio and catalog viewer
  - `lucide-react`: `^1.16.0` (installed `1.35.0`)
  - `@tosspayments/payment-sdk`: `^1.9.3`
- **Build System**:
  - `vite`: `^7.3.1` (installed `7.3.6`)
  - `@vitejs/plugin-react`: `^5.1.1` (installed `5.2.0`)
- **Node Image Libraries**:
  - `sharp`: Not installed
  - `jimp`: Not installed
  - `canvas`: Not installed
  - *Recommendation*: Python CLI/scripts are the vastly superior and primary choice for heavy image processing in this environment due to full CUDA acceleration and native `rembg`/`cv2`/`PyMatting` capabilities.

### 2.2 Production Build Verification (`npm run build`)
```text
> arcana-antiqua@1.0.0 build
> vite build

vite v7.3.6 building client environment for production...
transforming...
✓ 46 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.37 kB │ gzip:   0.82 kB
dist/assets/index-DaigEk6r.css  109.73 kB │ gzip:  21.59 kB
dist/assets/index-DlD5FAAu.js   925.60 kB │ gzip: 241.22 kB
✓ built in 3.86s
```

---

## 3. Image Processing Runtime & Capability Analysis

### 3.1 Python Environment Specifications
- **Python Version**: `3.13.7 (AMD64)`
- **PyTorch**: `2.6.0+cu124` (**CUDA Acceleration: Active**)
- **Pillow**: `12.0.0`
- **OpenCV**: `4.12.0.88` (`cv2`)
- **rembg**: `2.0.81` (ONNX / Torch backend)
- **PyMatting**: `1.1.15`
- **NumPy**: `2.2.6`
- **SciPy**: `1.16.3`
- **scikit-image**: `0.26.0`
- **Playwright**: `1.61.0` (for browser QA automation)

### 3.2 4-Stage Image Processing Pipeline Architecture

| Stage | Goal | Technical Implementation | Execution Speed |
|---|---|---|---|
| **Stage 1: Alpha Matting** | Extract porcelain/stoneware subject without biting edges or leaving white halos | `rembg.new_session('isnet-general-use')` + morphological closing (`cv2.morphologyEx(MORPH_CLOSE)`) + Gaussian feathering (3x3, sigma=0.5). | ~5.07s (initial inference) / <1.5s warm |
| **Stage 2: Auction Spotlight** | Luxury Christie's/Sotheby's radial gradient (#1A1D20 -> #0D0E10) | Cosine smoothstep radial calculation centered at `(0.50, 0.42)` with 3-stop interpolation (`#2A2E34` -> `#1A1D20` -> `#0A0B0D`) + sub-pixel uniform dither noise to prevent 8-bit color banding. | ~0.23s |
| **Stage 3: Contact Shadow** | Natural floor drop shadow grounding the sculpture | Dual-layer shadow synthesis: dense contact ellipse under bottom footprint (85% opacity, blur=6px) + broad ambient diffuse floor wash (45% opacity, blur=28px, squash=0.20). | ~0.12s |
| **Stage 4: Stoneware Unsharp** | Highlight micro clay pores, glaze sheen, stamp engravings | PIL `ImageFilter.UnsharpMask(radius=2, percent=120, threshold=2)`. Strictly 100% authentic physical contour preservation with 0 AI alteration. | ~0.08s |

---

## 4. 5-Angle Classification & Data Modeling Standards

The benchmark standard set in `src/data/antiques.js` for `prod-lladro-gres-2256-venus` dictates a 5-angle professional studio hierarchy:

1. **HERO 01 (`venus_01_hero_front.jpg`)**:
   - *Angle*: 3/4 beauty perspective showing full silhouette, base, and overall posture.
   - *Framing*: Centered, balanced vertical height (1400x1800), grounded with directional floor contact shadow.
2. **PROFILE 02 (`venus_02_side_profile.jpg`)**:
   - *Angle*: 90° lateral profile capturing depth, spine curvature, and amphora jar contours.
3. **PORTRAIT 03 (`venus_03_portrait_torso.jpg`)**:
   - *Angle*: Upper torso, facial expression, hair texture, and perched dove close-up.
4. **REAR 04 (`venus_04_rear_sculpture.jpg`)**:
   - *Angle*: Rear view emphasizing fabric drapery folds, terracotta brick well texture, and back hair curls.
5. **HALLMARK / STAMP 05 (`venus_05_backstamp.jpg`)**:
   - *Angle*: Base underside showing authentic maker marks (`LLADRÓ DAISA 1993` bell-flower logo, engraved `#2256`, serial numbers).
   - *Framing*: Authentic macro framing with subtle vignette border and high-sharpness unsharp mask.

---

## 5. Catalog Assets Inventory & Scope

`src/data/antiques.js` contains **29 antique items** with corresponding raw photographic assets in `public/artifacts/`:

| Collection Category | Key Items | Raw Folder | Studio Master Status |
|---|---|---|---|
| **Lladró & Nao Porcelain** | `prod-lladro-gres-2256-venus` | `public/artifacts/lladro_gres_venus` | ✅ Fully Integrated (`studio_master/`) |
| | `prod-lladro-nao-1429` | `public/artifacts/lladro_nao_1429` | ⏳ Raw Photos Available (12 files) |
| | `prod-lladro-meninas-1812` | `public/artifacts/lladro_1812_meninas` | ⏳ Raw Photos Available (11 files) |
| | `prod-rex-pastor-1029` | `public/artifacts/rex_valencia_1029` | ⏳ Raw Photos Available (7 files) |
| **Royal Doulton** | `prod-rd-jennifer-hn2392` | `public/artifacts/royaldoulton_jennifer` | ⏳ Raw Photos Available (6 files) |
| **Aynsley China** | `prod-aynsley-1`, `prod-aynsley-2` | `public/artifacts/aynsley_01_...`, `aynsley_02_...` | ⏳ Raw Photos Available (14 files) |
| **Sèvres Porcelain** | `prod-sevres-1` to `prod-sevres-8` | `public/artifacts/sevres_01_...` to `sevres_08_...` | ⏳ Raw Photos Available (69 files) |
| **Royal Worcester** | `prod-rw-1` to `prod-rw-8` | `public/artifacts/rw_01_...` to `rw_08_...` | ⏳ Raw Photos Available (96 files) |
| **Rococo & Victorian** | `prod-rococo-1`, `prod-rococo-2`, `prod-emb-1`, `prod-emb-2` | `public/artifacts/rococo_...`, `emb_...` | ⏳ Raw Photos Available (26 files) |
| **Classic Fine Art & Bronze**| `prod-chardin-top-1738`, `prod-lau-bronze-tray` | `public/artifacts/chardin_...`, `lau_bronze` | ⏳ Raw Photos Available (14 files) |

---

## 6. Verification and Integration Recommendations

1. **Pipeline Execution Script**:
   - Standardize `process_studio_collection.py` accepting target folder path and angle mapping configuration.
   - Output directly to `public/artifacts/<collection_id>/studio_master/`.
2. **Quality Assurance Script**:
   - Utilize existing Playwright test harness (`qa_verify_lladro_final.py` / `verify_all_books.py`) to verify in-browser 3D book page flips, lookbook gallery rendering, and image loading.
3. **Build Target**:
   - Run `npm run build` after data updates in `src/data/antiques.js` to ensure zero compilation errors or asset resolution warnings.
