# Milestone 2 Technical Analysis & Architecture Specification
**Authentic Alpha Matting, Luxury Studio Backdrop Synthesis & Stoneware Texture Enhancement**

- **Author**: Explorer 3 (Milestone 2 Specialist)
- **Target Component**: `scripts/enhance_studio_photos.py` & `tests/test_enhance_studio_photos.py`
- **Target Artifacts**: `public/artifacts/lladro_gres_venus/studio_master/` & `public/assets/lladro_gres/`
- **Input Manifest**: `public/artifacts/lladro_gres_venus/classification_manifest.json`
- **Date**: 2026-09-02

---

## 1. Executive Summary & Problem Boundary

Milestone 2 delivers the core auction-grade photo enhancement engine for Arcana Antiqua's antique collection catalog. Building upon the 5-angle classification manifest generated in Milestone 1 (`classification_manifest.json`), this subsystem converts raw, unevenly lit photography (2252x4000 JPEG) into standardized, Sotheby's/Christie's auction-quality studio master assets (1400x1800 JPEG @ Q=95) and synchronized lookbook assets (`public/assets/lladro_gres/`).

### Core Engineering Requirements:
1. **100% Authentic Physical Geometry Preservation**: 0% generative AI hallucination, 0% geometric alteration, and 0% redrawing of porcelain contours or hallmarks.
2. **Sub-Pixel Alpha Matting**: Clean boundary extraction using IS-Net (`isnet-general-use`) / morphological refinement (1px erosion + 0.5px Gaussian feathering) to eliminate edge fringing.
3. **Sotheby's Dark Slate Radial Spotlight Backdrop**: Smoothstep radial illumination (`#2A2F35` center $\rightarrow$ `#1A1D20` mid $\rightarrow$ `#0A0B0D` outer) without 8-bit banding artifacts.
4. **Dual-Tier Realistic Ground Contact Shadows**: Crisp ambient occlusion contact baseline + soft perspective-diffused ground shadow grounding the sculpture in 3D studio space.
5. **Stoneware Texture & Micro-Detail Enhancement**: Halo-free unsharp masking accentuating porous matte terracotta clay grit, glazed dark wavy hair locks, specular white dove highlights, and incised numeral marks.
6. **Archival Backstamp Macro Preservation**: Full rectangular plate preservation with subtle warm vignette and micro-clarity rather than artificial cutouts.

---

## 2. Stoneware Texture Enhancement & Halo-Free Unsharp Masking Investigation

### 2.1 Material Photometry & Mixed-Surface Physics of Lladró Gres #2256
The subject piece (*Lladró Gres Venus #2256 / "우물가의 비너스와 평화의 비둘기"*) is composed of heterogeneous ceramic finishes fired at high stoneware temperatures (approx. 1300°C):
- **Matte Terracotta Clay Body (Gres)**: Low-sheen, porous, earth-toned ceramic surface exhibiting micro-grit texture and subtle drapery folds. Reflected light is predominantly Lambertian diffuse.
- **Glazed Dark Wavy Hair**: Semi-gloss finish with high curvature curls, creating sharp directional specular highlights adjacent to deep shadows ($V < 55$).
- **Porcelain White Dove**: Smooth glazed porcelain with high luminance ($V > 220, S < 30$), subtle feather relief, and delicate beak/tail geometry.
- **Base Plate Inscriptions & Bellflower Hallmark**: Raw stoneware underside stamped with cobalt blue hallmark ink (`DAISA 1993`) and sharp incised model numerals (`#2256`).

```
+---------------------------------------------------------------------------------------+
|                                 LLADRÓ GRES MATERIAL ZONES                           |
+--------------------------+----------------------------+-------------------------------+
| Zone                     | Photometric Characteristic | Unsharp Masking Risk          |
+--------------------------+----------------------------+-------------------------------+
| Terracotta Body & Well   | Low-contrast, high-freq grit| Smearing or noisy speckling   |
| Glazed Dark Hair         | High-contrast step edges   | White border halo ringing     |
| Glossy White Dove        | High luminance highlights  | Pure white (255) blowout/clip |
| Underside Base Hallmark  | Incised grooves & ink      | Inscription blurring/smudging |
+--------------------------+----------------------------+-------------------------------+
```

### 2.2 Mathematical Formulation of Halo Artifacts & Adaptive Unsharp Masking
Standard Gaussian unsharp masking is expressed as:
$$I_{\text{sharp}}(x, y) = I(x, y) + k \cdot \big(I(x, y) - G_\sigma * I(x, y)\big)$$
Where $G_\sigma$ is a Gaussian blur kernel with standard deviation $\sigma = \text{radius}$, and $k = \frac{\text{percent}}{100}$ is the sharpening strength.

#### Causes of Halo Ringing:
1. **Overshoot at High-Contrast Step Edges**: When $|I(x, y) - G_\sigma * I(x, y)|$ is large (e.g. hair against bright skin or white dove against dark backdrop), multiplying by $k > 1.0$ causes pixel values to exceed $[0, 255]$, resulting in unnatural luminous halos or pitch-black fringe rings.
2. **Sensor Noise Amplification**: Uniform smooth regions (e.g. backdrop or soft skin) have low-amplitude high-frequency noise. Unsharp masking without a dead-zone threshold amplifies this into grainy noise.

#### Halo-Free Adaptive Algorithm Formulation:
To achieve pristine texture enhancement without halos, the pipeline implements **Luminance-Guided Adaptive CIELAB Sharpening with Soft Highlight Rolloff**:

1. **Color Space Conversion**: Convert image from $sRGB$ to $CIELAB$ space. Apply sharpening **strictly to the Lightness channel ($L^*$)**, preserving $a^*$ and $b^*$ chromaticity:
   $$L^*_{\text{orig}} \in [0, 100]$$
2. **High-Pass Difference Signal**:
   $$D(x, y) = L^*_{\text{orig}}(x, y) - \big(G_\sigma * L^*_{\text{orig}}\big)(x, y)$$
3. **Threshold Gate Function**:
   $$D_{\text{gated}}(x, y) = \begin{cases} 
   0 & \text{if } |D(x, y)| < \tau \\
   D(x, y) - \text{sgn}\big(D(x, y)\big) \cdot \tau & \text{if } |D(x, y)| \ge \tau
   \end{cases}$$
4. **Soft-Knee Highlight & Shadow Attenuation Weight $w(x, y)$**:
   $$w_{\text{high}}(x, y) = \text{clip}\left(\frac{100.0 - L^*_{\text{orig}}(x, y)}{15.0}, 0.0, 1.0\right)$$
   $$w_{\text{edge}}(x, y) = \frac{1.0}{1.0 + \left(\frac{|D(x, y)|}{\Delta_{\text{max}}}\right)^2}$$
   $$w(x, y) = w_{\text{high}}(x, y) \cdot w_{\text{edge}}(x, y)$$
5. **Recombined Sharp Lightness**:
   $$L^*_{\text{enhanced}}(x, y) = \text{clip}\big(L^*_{\text{orig}}(x, y) + k \cdot w(x, y) \cdot D_{\text{gated}}(x, y), 0.0, 100.0\big)$$
6. **Alpha-Matte Bounding**: Sharpening is constrained to the interior of the foreground silhouette using the eroded alpha mask $M_{\text{alpha}} \otimes E_{1\text{px}}$ so no halo leaks across the dark slate backdrop boundary.

### 2.3 Optimized Parameter Matrix by Angle & Material
Based on experimental validation against the 4000x2252 raw images rescaled to 1400x1800 master resolution:

| Angle Tag | Target Focus | Radius $\sigma$ (px) | Percent $k$ (%) | Threshold $\tau$ (L*) | Highlight Limit |
|---|---|---|---|---|---|
| `HERO_FRONT` | Full-body standing master | 1.8 | 120% | 2.0 | Rolloff $L^* > 92$ |
| `SIDE_PROFILE` | Lateral silhouette & jar | 1.8 | 120% | 2.0 | Rolloff $L^* > 92$ |
| `PORTRAIT_TORSO` | Facial features & dove macro | 1.8 | 120% | 2.0 | Rolloff $L^* > 90$ |
| `REAR_SCULPTURE` | Hair cascade & well brickwork | 1.8 | 120% | 2.0 | Rolloff $L^* > 92$ |
| `BASE_BACKSTAMP` | Stamped ink & incised numerals | 1.5 | 130% | 1.0 | None (Macro Plate) |

---

## 3. End-to-End Architecture Design for `scripts/enhance_studio_photos.py`

```
                                      ARCHITECTURE DATA FLOW
                                      
  +-----------------------------------+
  |  classification_manifest.json     |
  +-----------------+-----------------+
                    |
                    v
  +-----------------------------------+        +-----------------------------------+
  | 1. Manifest Ingestion & Contract  |        | 2. Raw Photo Ingestion &          |
  |    Validation (Schema & Hashes)   | <----> |    EXIF Upright Normalization     |
  +-----------------+-----------------+        +-----------------------------------+
                    |
                    +--------------------------------+
                    |                                |
  [For Angles 1-4: Cutout Required]                  [For Angle 5: BASE_BACKSTAMP]
                    |                                |
                    v                                v
  +-----------------------------------+        +-----------------------------------+
  | 3. Authentic Alpha Matting        |        | 7. Archival Macro Plate           |
  |    (IS-Net / Morphological Feather)        |    Preservation & Warm Vignette   |
  +-----------------+-----------------+        +-----------------+-----------------+
                    |                                            |
                    v                                            |
  +-----------------------------------+                          |
  | 4. Canvas Normalization & Framing |                          |
  |    (1400x1800, Height 75-85%)     |                          |
  +-----------------+-----------------+                          |
                    |                                            |
                    v                                            |
  +-----------------------------------+                          |
  | 5. Luxury Radial Spotlight        |                          |
  |    Backdrop Synthesis (#1A1D20)   |                          |
  +-----------------+-----------------+                          |
                    |                                            |
                    v                                            |
  +-----------------------------------+                          |
  | 6. Dual-Tier Ground Contact       |                          |
  |    Shadow Synthesis (AO + Diffuse)|                          |
  +-----------------+-----------------+                          |
                    |                                            |
                    v                                            |
  +-----------------------------------+                          |
  | 8. Stoneware Texture Enhancement  |                          |
  |    (Adaptive CIELAB USM Sharpen)  |<-------------------------+
  +-----------------+-----------------+
                    |
                    v
  +---------------------------------------------------------------------------------+
  | 9. Multi-Target Export & Synchronization Engine                                 |
  |    - Studio Masters: public/artifacts/lladro_gres_venus/studio_master/ (*.jpg)  |
  |    - Lookbook Assets: public/assets/lladro_gres/ (*.jpg)                        |
  +---------------------------------------------------------------------------------+
```

### 3.1 Step-by-Step Algorithmic Specification

#### Step 1: Manifest Ingestion & Validation
- Loads `classification_manifest.json` and parses `product.id`, `product.itemSlug`, `classifiedAngles`, `enhancementDirectives`, and `directories`.
- Validates that all 5 canonical angles (`HERO_FRONT`, `SIDE_PROFILE`, `PORTRAIT_TORSO`, `REAR_SCULPTURE`, `BASE_BACKSTAMP`) are mapped to existing source files with matching SHA-256 hashes.

#### Step 2: Safe Image Loading & Orientation
- Opens image via binary buffer + `cv2.imdecode` (Windows Unicode path safe).
- Automatically applies EXIF rotation transpose (`ImageOps.exif_transpose`).

#### Step 3: Authentic Alpha Matting (Zero Geometry Alteration)
- Model: `isnet-general-use` via `rembg` session (with fallback to PyMatting / OpenCV GrabCut).
- Alpha post-processing:
  1. Alpha boundary morphological erosion ($1\text{ px}$) to eliminate background fringing.
  2. Gaussian feathering ($\sigma = 0.5\text{ px}$) along transition contour.
  3. Strict verification: Bounding contour and silhouette area match raw foreground within $0.5\%$ tolerance.

#### Step 4: Canvas Placement & Framing (1400x1800)
- Canvas Dimensions: $W = 1400\text{ px}, H = 1800\text{ px}$ (Aspect Ratio $7:9 \approx 0.778$).
- Target Occupancy:
  - `HERO_FRONT`, `SIDE_PROFILE`, `REAR_SCULPTURE`: Scale image preserving aspect ratio so porcelain bounding box height occupies $78\% \pm 3\%$ ($H_{\text{occupancy}} \approx 1400\text{ px}$). Centered horizontally ($C_x = 700\text{ px}$), grounded at bottom baseline $Y_{\text{base}} \approx 1520\text{ px}$.
  - `PORTRAIT_TORSO`: Focused macro crop of upper bust, head, and dove ($H_{\text{occupancy}} \approx 85\%$, top margin $\approx 8\%$).

#### Step 5: Sotheby's Dark Slate Radial Spotlight Backdrop Synthesis
Backdrop is synthesized mathematically on a $1400 \times 1800$ canvas:
- Center Spotlight RGB: `#2A2F35` $\rightarrow (42, 47, 53)$
- Mid Spotlight RGB: `#1A1D20` $\rightarrow (26, 29, 32)$
- Outer Corner Slate RGB: `#0A0B0D` $\rightarrow (10, 11, 13)$
- Spotlight Center: $C = (x_0, y_0) = (1400 \times 0.50, 1800 \times 0.42) = (700, 756)$
- Elliptical Radii: $R_x = 1400 \times 0.55 = 770\text{ px}, R_y = 1800 \times 0.70 = 1260\text{ px}$
- Normalized Radial Distance:
  $$d(x, y) = \sqrt{\left(\frac{x - x_0}{R_x}\right)^2 + \left(\frac{y - y_0}{R_y}\right)^2}$$
- Smoothstep Interpolation:
  $$\text{smoothstep}(a, b, t) = s^2 (3 - 2s) \quad \text{where } s = \text{clip}\left(\frac{t - a}{b - a}, 0, 1\right)$$
  $$I_{\text{backdrop}}(x, y) = \big(1 - s_1(d)\big) \cdot C_{\text{center}} + s_1(d) \cdot \Big(\big(1 - s_2(d)\big) \cdot C_{\text{mid}} + s_2(d) \cdot C_{\text{outer}}\Big)$$
- High-frequency subtle dithering ($\pm 0.4\text{ LSB}$) is injected to guarantee zero 8-bit banding in dark auction viewing folios.

#### Step 6: Dual-Tier Ground Contact Shadow Synthesis
Ground contact shadows ground the sculpture naturally in 3D studio space:
1. **Tier 1: Sharp Ambient Occlusion Line**:
   - Extract bottom $10\%$ silhouette of porcelain base.
   - Squeeze vertically by factor $0.15$, blur with Gaussian kernel $\sigma = 4\text{ px}$.
   - Position at $Y_{\text{base}} + 4\text{ px}$ with peak opacity $\alpha = 0.85$.
2. **Tier 2: Soft Diffuse Perspective Shadow**:
   - Project full foreground silhouette downward with perspective squashing (vertical scale $0.35$, lateral scale $1.20$).
   - Apply Gaussian dispersion blur $\sigma = 32\text{ px}$.
   - Position at $Y_{\text{base}} + 22\text{ px}$ with peak opacity $\alpha = 0.45$.
3. **Compositing**:
   $$I_{\text{comp}}(x, y) = I_{\text{backdrop}}(x, y) \cdot (1 - \alpha_{\text{shadow}}) + I_{\text{shadow}} \cdot \alpha_{\text{shadow}}$$
   $$I_{\text{final}}(x, y) = I_{\text{comp}}(x, y) \cdot (1 - \alpha_{\text{fg}}) + I_{\text{fg}}(x, y) \cdot \alpha_{\text{fg}}$$

#### Step 7: Angle 5 Specialized Backstamp Macro Preservation
For `BASE_BACKSTAMP`:
- `mattingRequired = false`, `preserveAuthenticFrame = true`.
- Retains full photographic rectangular base plate.
- Applies subtle dark warm vignette border:
  $$v(x, y) = 1.0 - 0.35 \cdot \text{smoothstep}\big(0.65, 0.98, d_{\text{center}}(x, y)\big)$$
- Precision unsharp masking ($\sigma = 1.5, k = 130\%, \tau = 1.0$) enhancing incised `#2256` and blue `DAISA 1993` lettering.

#### Step 8: Standardized Export & Multi-Target Lookbook Sync
- Saves 5 studio master files: `venus_01_hero_front.jpg` ... `venus_05_backstamp.jpg` to `public/artifacts/lladro_gres_venus/studio_master/` ($1400 \times 1800$, JPEG quality $95$, optimized Huffman tables).
- Synchronizes lookbook assets to `public/assets/lladro_gres/` (e.g. `gres_01_hero.jpg`, `gres_02_perspective.jpg`, etc.) ensuring identical photometric grade across all catalog components.

### 3.2 CLI Interface Specification
```bash
python scripts/enhance_studio_photos.py \
  --manifest public/artifacts/lladro_gres_venus/classification_manifest.json \
  --output-dir public/artifacts/lladro_gres_venus/studio_master \
  --catalog-dir public/assets/lladro_gres \
  --device auto \
  --target-dims 1400 1800 \
  --jpeg-quality 95 \
  --json
```

#### CLI Parameters:
| Option | Short | Type | Default | Description |
|---|---|---|---|---|
| `--manifest` | `-m` | String | `None` (Required) | Path to `classification_manifest.json` |
| `--output-dir` | `-o` | String | `None` (From manifest) | Studio master output directory |
| `--catalog-dir`| `-c` | String | `None` (From manifest) | Lookbook assets directory |
| `--target-dims`| `-d` | Int Int| `1400 1800` | Canvas width and height in pixels |
| `--jpeg-quality`| `-q` | Int | `95` | JPEG export compression quality |
| `--device` | | String | `auto` | Acceleration device (`cuda`, `cpu`, `auto`) |
| `--dry-run` | | Flag | `False` | Simulate pipeline without writing files |
| `--json` | | Flag | `False` | Output machine-readable JSON status report |
| `--force` | `-f` | Flag | `False` | Overwrite existing output files |

---

## 4. Automated Unit Test Suite Design (`tests/test_enhance_studio_photos.py`)

A comprehensive unit test suite ensures all pipeline functions execute deterministically:

```python
class TestEnhanceStudioPhotos(unittest.TestCase):
    """
    Unit test suite for scripts/enhance_studio_photos.py.
    """
    
    # 1. CLI & Argument Validation
    def test_cli_missing_manifest_raises_error(self): ...
    def test_cli_dry_run_does_not_modify_disk(self): ...
    def test_cli_json_output_conforms_to_schema(self): ...

    # 2. Backdrop Synthesis
    def test_backdrop_corner_gamut_sothebys_slate(self): ...
    def test_backdrop_center_spotlight_luminance_delta(self): ...
    def test_backdrop_smoothstep_monotonic_decay(self): ...
    def test_backdrop_no_nan_or_inf_channels(self): ...

    # 3. Ground Contact Shadow Synthesis
    def test_contact_shadow_tier1_ambient_occlusion_darkness(self): ...
    def test_contact_shadow_tier2_diffuse_dispersion(self): ...
    def test_contact_shadow_lateral_symmetry(self): ...

    # 4. Stoneware Unsharp Masking & Halo Prevention
    def test_unsharp_mask_laplacian_variance_increase(self): ...
    def test_unsharp_mask_no_highlight_blowout_clipping(self): ...
    def test_unsharp_mask_alpha_boundary_confinement(self): ...

    # 5. Backstamp Archival Preservation
    def test_backstamp_retains_full_macro_plate(self): ...
    def test_backstamp_vignette_gradient_contrast(self): ...
    def test_backstamp_hallmark_clarity_score(self): ...

    # 6. End-to-End Execution on Manifest
    def test_e2e_enhancement_generates_all_5_studio_masters(self): ...
    def test_e2e_lookbook_assets_synchronized(self): ...
    def test_e2e_dimensions_aspect_and_file_sizes(self): ...
```

---

## 5. Milestone 2 Worker Implementation Plan

### 5.1 Deliverable File List
1. **Core Pipeline Script**: `scripts/enhance_studio_photos.py`
2. **Dedicated Unit Test Suite**: `tests/test_enhance_studio_photos.py`
3. **Studio Master Assets**:
   - `public/artifacts/lladro_gres_venus/studio_master/venus_01_hero_front.jpg`
   - `public/artifacts/lladro_gres_venus/studio_master/venus_02_side_profile.jpg`
   - `public/artifacts/lladro_gres_venus/studio_master/venus_03_portrait_torso.jpg`
   - `public/artifacts/lladro_gres_venus/studio_master/venus_04_rear_sculpture.jpg`
   - `public/artifacts/lladro_gres_venus/studio_master/venus_05_backstamp.jpg`
4. **Synchronized Lookbook Assets**:
   - `public/assets/lladro_gres/gres_01_hero.jpg` ... `gres_05_backstamp.jpg`

### 5.2 Step-by-Step Execution Sequence for Worker
- **Step 1**: Implement `scripts/enhance_studio_photos.py` with full modular architecture:
  - `generate_sothebys_backdrop()`
  - `generate_contact_shadows()`
  - `apply_stoneware_unsharp_mask()`
  - `apply_backstamp_macro_vignette()`
  - `extract_foreground_alpha()`
  - `composite_studio_master()`
  - `enhance_all_angles()`
- **Step 2**: Implement `tests/test_enhance_studio_photos.py`.
- **Step 3**: Run `python scripts/enhance_studio_photos.py --manifest public/artifacts/lladro_gres_venus/classification_manifest.json` and generate studio masters.
- **Step 4**: Run unit tests `python -m unittest tests/test_enhance_studio_photos.py`.
- **Step 5**: Run master test suite `python tests/run_all_e2e_tests.py` and verify 100% pass across all 4 tiers.
- **Step 6**: Execute `npm run build` to confirm production asset bundling.

---

## 6. Verification Method

To verify the Milestone 2 implementation independently:

1. **Unit Test Execution**:
   ```bash
   python -m unittest tests/test_enhance_studio_photos.py
   ```
2. **Milestone 2 Tier 1 Feature Verification**:
   ```bash
   python -m unittest tests/tier1_feature_coverage/test_f03_shape_preservation_matting.py
   python -m unittest tests/tier1_feature_coverage/test_f04_radial_backdrop_synthesis.py
   python -m unittest tests/tier1_feature_coverage/test_f05_ground_contact_shadows.py
   python -m unittest tests/tier1_feature_coverage/test_f06_stoneware_unsharp_mask.py
   python -m unittest tests/tier1_feature_coverage/test_f07_backstamp_macro_preservation.py
   python -m unittest tests/tier1_feature_coverage/test_f08_studio_master_assets.py
   ```
3. **Master E2E 4-Tier Test Runner**:
   ```bash
   python tests/run_all_e2e_tests.py
   ```
4. **Vite Production Build Verification**:
   ```bash
   npm run build
   ```
