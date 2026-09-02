# Mathematical & Algorithmic Analysis: Auction-Grade Backdrop Synthesis & Ground Contact Shadows (Milestone 2)

**Author**: Explorer 2 (Teamwork Preview Explorer M2_2)  
**Target Milestone**: Milestone 2 — Authentic Alpha Matting & Luxury Studio Backdrop Synthesis  
**Target Output Spec**: 1400x1800 px & 1200x1600 px Master Studio Assets  
**Date**: 2026-09-02  

---

## 1. Executive Summary & Optical Paradigm

In high-end fine art and antique auctions (such as **Sotheby's**, **Christie's**, and **Bonhams**), three-dimensional sculptural artifacts (e.g., Lladró Gres stoneware porcelain, bronzes, terracotta figurines) are photographed under strictly controlled studio cyclorama (infinity cyc) setups. 

The visual master standard requires:
1. **Volumetric Lighting Presence**: A focused, warm-toned key spotlight directed at the artifact's primary center of visual interest (torso/facial features), creating an atmospheric dark slate backdrop that isolates the artifact without harsh geometric borders.
2. **Zero Color Banding (LDR Quantization Protection)**: In 8-bit sRGB color spaces, smooth gradients across narrow luminance spans (such as RGB `26` down to `13`) suffer severe step banding (Mach bands) unless high-precision smoothstep falloff curves and spatial dithering are employed.
3. **Physical Grounding via Dual-Tier Contact Shadows**: Naive drop-shadows create a "floating sticker" or "cardboard cutout" look. In reality, light occlusion under a 3D solid base creates two distinct optical layers:
   - **Tier 1 (Cavity Ambient Occlusion Contact Line)**: A pitch-black, highly concentrated, narrow contact strip directly where the base meets the pedestal floor.
   - **Tier 2 (Diffuse Directional Perspective Penumbra)**: A soft, perspective-projected ground shadow cast downward/forward with progressive penumbra blur and smooth inverse-distance decay.
4. **100% Authentic Shape & Edge Fidelity**: Zero generative deformation, zero edge erosion of authentic porcelain details, and complete elimination of bright background halos.

---

## 2. Auction-Grade Radial Spotlight Backdrop Synthesis

### 2.1 Colorimetry & Palette Specification
The background simulates an infinity studio sweep made of dark textured slate under a warm halogen/tungsten key spotlight.

| Zone | Hex Code | sRGB Integer $[R, G, B]$ | Normalized Float $[r, g, b]$ | Visual Character |
| :--- | :--- | :--- | :--- | :--- |
| **Spotlight Center (Hotspot)** | `#1A1D20` | `[26, 29, 32]` | `[0.10196, 0.11373, 0.12549]` | Luxury Dark Slate with subtle warm charcoal/slate tint |
| **Highlight Zenith (Optional Peak)** | `#2A2F35` | `[42, 47, 53]` | `[0.16471, 0.18431, 0.20784]` | Keylight core highlight behind upper torso |
| **Perimeter & Corners (Periphery)** | `#0D0E10` | `[13, 14, 16]` | `[0.05098, 0.05490, 0.06275]` | Deep Obsidian Slate / Falloff Shadow |

---

### 2.2 Coordinate Geometry & Anisotropic Beam Spread

Let the canvas dimensions be $W \times H$ (e.g., $1400 \times 1800$ pixels, aspect ratio $\mathrm{AR} = W/H \approx 0.7778$).

Let normalized canvas coordinates $(u, v) \in [0.0, 1.0] \times [0.0, 1.0]$ be defined as:
$$u = \frac{x}{W - 1}, \quad v = \frac{y}{H - 1} \quad \text{for } x \in [0, W-1], y \in [0, H-1]$$

#### Center of Illumination $(c_u, c_v)$
To flatter standing classical sculptures (e.g., Lladró Gres Venus #2256), the spotlight center is aligned horizontally ($c_u = 0.50$) and elevated vertically to match the golden ratio of the figure ($c_v \approx 0.42$):
$$(c_u, c_v) = (0.50, 0.42)$$

#### Anisotropic Elliptical Metric
Because the master canvas is portrait ($H > W$), a circular beam in pixel space corresponds to an elliptical beam in normalized $(u, v)$ space:
$$d(u, v) = \sqrt{\left(\frac{u - c_u}{r_u}\right)^2 + \left(\frac{v - c_v}{r_v}\right)^2}$$

Where:
- $r_u = 0.55$: Horizontal beam radius spread parameter.
- $r_v = 0.70$: Vertical beam radius spread parameter.

This ensures the light wash spreads gracefully across the vertical height of the statue while wrapping around the sides.

---

### 2.3 Mathematical Falloff Modeling (Harmonic Cosine Smoothstep)

Standard linear interpolation ($f(t) = 1 - t$) or standard cubic Hermite ($f(t) = 1 - (3t^2 - 2t^3)$) produces noticeable gradient shelf artifacts when mapped across narrow 8-bit dynamic ranges.

To achieve studio-grade optical decay, we utilize **Harmonic Cosine Smoothstep**:

Let normalized radial distance parameter $t(u, v)$ be clamped to the unit interval $[0.0, 1.0]$:
$$t(u, v) = \mathrm{clamp}\left(d(u, v), 0.0, 1.0\right) = \min\left(\max\left(d(u, v), 0.0\right), 1.0\right)$$

The Harmonic Cosine Falloff Transfer Function $f(t)$ is defined as:
$$f(t) = \frac{1 + \cos(\pi \cdot t)}{2} = \cos^2\left(\frac{\pi}{2} \cdot t\right) \quad \text{for } t \in [0.0, 1.0]$$

#### Properties of $f(t)$:
1. **Hotspot Value**: $f(0) = \frac{1 + \cos(0)}{2} = 1.0$ (Exact center color $\mathbf{C}_{\text{center}}$).
2. **Perimeter Value**: $f(1) = \frac{1 + \cos(\pi)}{2} = 0.0$ (Exact edge color $\mathbf{C}_{\text{edge}}$).
3. **Smooth First Derivative (Zero Slope at Boundaries)**:
   $$f'(t) = -\frac{\pi}{2} \sin(\pi t) \implies f'(0) = 0, \quad f'(1) = 0$$
   This guarantees that the gradient has zero derivative at the center (no sharp peak) and zero derivative at the outer boundary (no abrupt junction line).
4. **Curvature Smoothness**: The transition from light to dark is infinitely differentiable ($C^\infty$) and free of inflection jerks.

---

### 2.4 Anti-Banding Dithering Engine (TPDF Noise Injection)

#### Problem Analysis
In the sRGB color channel, the luminance difference between center $[26, 29, 32]$ and edge $[13, 14, 16]$ is only $\Delta = 13$ discrete integer steps. When distributed over a distance of $\approx 900$ pixels, each discrete color step spans $\approx 70$ continuous pixels. In naive 8-bit quantization ($\lfloor C + 0.5 \rfloor$), these 70-pixel bands become visible as concentric rings (Mach banding).

#### Solution: Triangular Probability Density Function (TPDF) Dithering
Before truncating the 32-bit floating point color values $\mathbf{C}_{\text{float}}(x, y)$ to 8-bit integer values $\mathbf{C}_{\text{uint8}}(x, y)$, we inject a high-frequency, zero-mean triangular dither perturbation:

Let $U_1(x, y), U_2(x, y) \sim \mathcal{U}(0, 1)$ be two independent uniform random variables per pixel. The TPDF dither $\delta_{\mathrm{TPDF}}(x, y)$ is:
$$\delta_{\mathrm{TPDF}}(x, y) = \left(U_1(x, y) + U_2(x, y) - 1.0\right) \cdot A_{\mathrm{dither}}$$
Where $A_{\mathrm{dither}} = 0.75$ (noise amplitude).

The resulting discrete 8-bit pixel color is:
$$\mathbf{C}_{\text{uint8}}(x, y) = \mathrm{clip}\left(\left\lfloor \mathbf{C}_{\text{float}}(x, y) + \delta_{\mathrm{TPDF}}(x, y) + 0.5 \right\rfloor, 0, 255\right)$$

This completely eliminates all visible quantization contour bands by decorrelating quantization error into imperceptible high-frequency blue-like noise.

---

## 3. Dual-Tier Ground Contact Floor Shadow Synthesis

```
   ┌────────────────────────────────────────────────────────┐
   │                  PORCELAIN SCULPTURE                   │
   │               (Authentic Foreground Object)             │
   └───────────────────────────┬────────────────────────────┘
                               │ (Base Contact Boundary)
   ════════════════════════════╪════════════════════════════
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  <-- TIER 1: Ambient Occlusion Contact Line
                                                                 (Pitch Black, Tight σ=2.5px, Opacity=0.85)
   ░░▒▒▓▓██████████████████████████████████████████▓▓▒▒░░  <-- TIER 2: Diffuse Perspective Ground Shadow
   ░░░▒▒▓▓████████████████████████████████████████▓▓▒▒░░░        (Perspective Skewed, Soft σ=22px, Opacity=0.45)
   ░░░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒░░░░
   ░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░
```

### 3.1 Tier 1: Primary Ambient Occlusion Contact Line (Cavity / Umbra)

#### Physical Purpose
Where the flat bottom of the porcelain base directly meets the pedestal table, ambient light is completely occluded. This creates a razor-sharp, dense shadow line that prevents the artifact from appearing detached from the floor.

#### Mathematical Algorithm
1. **Base Silhouette Isolation**:
   Let $\alpha_F(x, y) \in [0, 1]$ be the segmented foreground alpha mask.
   Find the vertical bounding range of the object:
   $$y_{\min} = \min \{ y \mid \alpha_F(x, y) > 0.1 \}, \quad y_{\max} = \max \{ y \mid \alpha_F(x, y) > 0.1 \}$$
   $$H_{\mathrm{obj}} = y_{\max} - y_{\min}$$
   Isolate the bottom base slice ($H_{\mathrm{base\_slice}} = \max(20, \lfloor 0.06 \cdot H_{\mathrm{obj}} \rfloor)$):
   $$M_{\mathrm{base}}(x, y) = \begin{cases} \alpha_F(x, y) & \text{if } y \in [y_{\max} - H_{\mathrm{base\_slice}}, y_{\max}] \\ 0 & \text{otherwise} \end{cases}$$

2. **Downward Micro-Displacement & Morphological Structuring**:
   Shift $M_{\mathrm{base}}$ downward by $\Delta y_1 = +3\text{px}$ to establish floor contact:
   $$M_{\mathrm{shifted}}(x, y) = M_{\mathrm{base}}(x, y - \Delta y_1)$$
   Apply horizontal rectangular morphological dilation ($B_{\mathrm{rect}} = 11 \times 3\text{px}$) to bridge microscopic base contours:
   $$M_{\mathrm{dilated}} = M_{\mathrm{shifted}} \oplus B_{\mathrm{rect}}$$

3. **Anisotropic Micro-Blur**:
   Apply tight anisotropic 2D Gaussian blur:
   $$\sigma_{x, \mathrm{AO}} = 4.0\text{px}, \quad \sigma_{y, \mathrm{AO}} = 2.5\text{px}$$
   $$M_{\mathrm{AO\_blurred}}(x, y) = \left( M_{\mathrm{dilated}} * G_{(\sigma_{x, \mathrm{AO}}, \sigma_{y, \mathrm{AO}})} \right)(x, y)$$

4. **Tier 1 Alpha Opacity Multiplier**:
   $$\alpha_{\mathrm{contact}}(x, y) = \mathrm{clip}\left( M_{\mathrm{AO\_blurred}}(x, y) \cdot K_{\mathrm{contact}}, 0.0, K_{\mathrm{contact}} \right)$$
   Where $K_{\mathrm{contact}} = 0.85$ ($85\%$ maximum opacity).

---

### 3.2 Tier 2: Secondary Diffuse Directional Perspective Shadow (Penumbra)

#### Physical Purpose
Light from the overhead/frontal keylight casts a soft ground shadow spreading slightly forward and downward from the base onto the studio floor.

#### Mathematical Algorithm
1. **Lower Body Source Region**:
   Extract the lower $30\%$ of the foreground object mask:
   $$H_{\mathrm{lower}} = \max(40, \lfloor 0.30 \cdot H_{\mathrm{obj}} \rfloor), \quad y_{\mathrm{lower\_start}} = y_{\max} - H_{\mathrm{lower}}$$
   Let the horizontal span of the object base be $[x_{\min}, x_{\max}]$ with width $W_{\mathrm{obj}} = x_{\max} - x_{\min}$.

2. **Perspective Ground Projection Transformation**:
   Define source quadrilateral $P = [P_1, P_2, P_3, P_4]$:
   - $P_1 = (x_{\min}, y_{\mathrm{lower\_start}})$ (Top-left of lower body)
   - $P_2 = (x_{\max}, y_{\mathrm{lower\_start}})$ (Top-right of lower body)
   - $P_3 = (x_{\max}, y_{\max})$ (Bottom-right of base)
   - $P_4 = (x_{\min}, y_{\max})$ (Bottom-left of base)

   Define projected destination quadrilateral on the ground plane $Q = [Q_1, Q_2, Q_3, Q_4]$:
   - Length of shadow projection: $L_{\mathrm{shadow}} = \max(50, \lfloor 0.15 \cdot H_{\mathrm{obj}} \rfloor) \approx 180\text{px}$
   - Base horizontal expansion: $\delta_{\mathrm{base}} = \lfloor 0.04 \cdot W_{\mathrm{obj}} \rfloor \approx 20\text{px}$
   - Tip horizontal expansion: $\delta_{\mathrm{tip}} = \lfloor 0.18 \cdot W_{\mathrm{obj}} \rfloor \approx 90\text{px}$
   - Ground offset: $\Delta y_2 = +8\text{px}$

   Destination Coordinates:
   - $Q_4 = (x_{\min} - \delta_{\mathrm{base}}, y_{\max} + \Delta y_2)$
   - $Q_3 = (x_{\max} + \delta_{\mathrm{base}}, y_{\max} + \Delta y_2)$
   - $Q_2 = (x_{\max} + \delta_{\mathrm{tip}}, y_{\max} + \Delta y_2 + L_{\mathrm{shadow}})$
   - $Q_1 = (x_{\min} - \delta_{\mathrm{tip}}, y_{\max} + \Delta y_2 + L_{\mathrm{shadow}})$

   Compute the $3 \times 3$ Homography / Perspective matrix:
   $$\mathbf{M}_{\mathrm{proj}} = \mathrm{cv2.getPerspectiveTransform}(P, Q)$$
   $$M_{\mathrm{warped}} = \mathrm{cv2.warpPerspective}(M_{\mathrm{lower}}, \mathbf{M}_{\mathrm{proj}}, (W, H), \text{flags}=\mathrm{cv2.INTER\_LINEAR})$$

3. **Progressive Penumbra Gaussian Diffusion**:
   Apply broad anisotropic Gaussian filtering:
   $$\sigma_{x, \mathrm{diffuse}} = 22.0\text{px}, \quad \sigma_{y, \mathrm{diffuse}} = 11.0\text{px}$$
   $$M_{\mathrm{diffuse\_blurred}} = M_{\mathrm{warped}} * G_{(\sigma_{x, \mathrm{diffuse}}, \sigma_{y, \mathrm{diffuse}})}$$

4. **Distance Decay Attenuation**:
   Shadows lose optical intensity as they travel away from the occluder according to the inverse-square law:
   $$s(y) = \mathrm{clip}\left(\frac{y - y_{\max}}{L_{\mathrm{shadow}} + \Delta y_2}, 0.0, 1.0\right)$$
   $$g_{\mathrm{decay}}(y) = (1.0 - s(y))^{1.3} \quad \text{for } y \ge y_{\max}$$

5. **Tier 2 Alpha Opacity Multiplier**:
   $$\alpha_{\mathrm{diffuse}}(x, y) = \mathrm{clip}\left( M_{\mathrm{diffuse\_blurred}}(x, y) \cdot g_{\mathrm{decay}}(y) \cdot K_{\mathrm{diffuse}}, 0.0, K_{\mathrm{diffuse}} \right)$$
   Where $K_{\mathrm{diffuse}} = 0.45$ ($45\%$ maximum opacity).

---

## 4. Multi-Layer Blending & Optical Compositing Model

### 4.1 Layer Stack Architecture

```
Layer 3 (Top):    Foreground Object F(x, y) with Alpha Matte α_F(x, y) (Defringed)
Layer 2:          Tier 1 AO Contact Shadow S_1(x, y) with Alpha α_contact(x, y)
Layer 1:          Tier 2 Diffuse Ground Shadow S_2(x, y) with Alpha α_diffuse(x, y)
Layer 0 (Bottom): Radial Spotlight Backdrop B(x, y)
```

### 4.2 Exact Compositing Equations

#### Step 1: Backdrop Shadow Transmittance (Physical Multiply Attenuation)
Shadows do not add black pigment; rather, they physically absorb and attenuate incident light on the backdrop surface. The combined transmittance $\tau(x, y) \in [0.0, 1.0]$ is:
$$\tau(x, y) = \left(1.0 - \alpha_{\mathrm{contact}}(x, y)\right) \cdot \left(1.0 - \alpha_{\mathrm{diffuse}}(x, y)\right)$$

The shadowed backdrop $\mathbf{B}'(x, y)$ is:
$$\mathbf{B}'(x, y) = \mathbf{B}(x, y) \cdot \tau(x, y)$$

#### Step 2: Foreground Alpha-Over Blending
Let $\mathbf{F}_{\mathrm{dehalo}}(x, y)$ be the defringed foreground porcelain color and $\alpha_F(x, y) \in [0.0, 1.0]$ be its alpha matte.
The final composited image $\mathbf{I}_{\mathrm{final}}(x, y)$ is:
$$\mathbf{I}_{\mathrm{final}}(x, y) = \mathbf{F}_{\mathrm{dehalo}}(x, y) \cdot \alpha_F(x, y) + \mathbf{B}'(x, y) \cdot \left(1.0 - \alpha_F(x, y)\right)$$

$$\mathbf{I}_{\mathrm{final, uint8}}(x, y) = \mathrm{clip}\left(\left\lfloor \mathbf{I}_{\mathrm{final}}(x, y) + 0.5 \right\rfloor, 0, 255\right)$$

---

### 4.3 Edge Defringing & Halo Elimination

When matting raw photos taken against bright studio backdrops, boundary pixels with partial transparency ($0.02 < \alpha_F < 0.95$) contain background light contamination. When placed on a dark slate background, this produces an artificial bright fringe ("halo").

To eliminate halos while preserving 100% authentic physical shape:
1. **Solid Core Extraction**: $\text{Core} = \{ (x, y) \mid \alpha_F(x, y) \ge 0.95 \}$.
2. **Boundary Transition Zone**: $\text{Fringe} = \{ (x, y) \mid 0.02 < \alpha_F(x, y) < 0.95 \}$.
3. **Inward Color Inpainting / Extension**:
   $$\mathbf{F}_{\mathrm{dehalo}}(x, y) = \begin{cases} \mathbf{F}(x, y) & \text{if } (x, y) \in \text{Core} \\ \mathrm{InpaintTelea}(\mathbf{F}, \text{Fringe}, r=3) & \text{if } (x, y) \in \text{Fringe} \\ \mathbf{F}(x, y) & \text{otherwise} \end{cases}$$
4. **Alpha Edge Feathering**: Erode $\alpha_F$ by $1\text{px}$ using $3 \times 3$ kernel, followed by subtle Gaussian smoothing ($\sigma = 0.5\text{px}$).

---

## 5. Specialized Directives for 5 Canonical Appraisal Angles

| Angle Index & Canonical Tag | Korean Tag | Matting Required | Contact Shadow Tier 1 & 2 | Backdrop Spotlight Setting | Unsharp Texture Focus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Angle 1: `HERO_FRONT`** | 전신 전면 마스터 | **Yes** (IS-Net) | **Enabled** ($K_1=0.85, K_2=0.45$) | Standard centered spotlight $(0.50, 0.42)$ | Whole-body terracotta grit & drapery |
| **Angle 2: `SIDE_PROFILE`** | 3/4 측면 프로필 | **Yes** (IS-Net) | **Enabled** ($K_1=0.85, K_2=0.45$) | Standard centered spotlight $(0.50, 0.42)$ | Amphora curve & silhouette edges |
| **Angle 3: `PORTRAIT_TORSO`** | 상체 & 이목구비 | **Yes** (IS-Net) | **Disabled** (Floating crop, no floor contact) | Spotlight focused on face/dove $(0.50, 0.40)$ | Wavy hair gloss, facial features, dove feathers |
| **Angle 4: `REAR_SCULPTURE`** | 후면 조각 화보 | **Yes** (IS-Net) | **Enabled** ($K_1=0.85, K_2=0.45$) | Standard centered spotlight $(0.50, 0.42)$ | Brick well texture & cascading robe folds |
| **Angle 5: `BASE_BACKSTAMP`** | 하단 백스탬프 각인 | **No** (Authentic Frame Preserved) | **Disabled** (Underside plane view) | Subtle dark perimeter vignette ($r_{\mathrm{in}}=0.65, r_{\mathrm{out}}=0.98, \text{opacity}=0.35$) | Incised `#2256`, blue bellflower stamp, glaze cracks |

---

## 6. Complete Python Reference Implementation

```python
"""
auction_studio_backdrop_shadow_engine.py
Sotheby's/Christie's Auction-Grade Backdrop & Dual-Tier Shadow Engine (Milestone 2)
"""

import numpy as np
import cv2
from typing import Tuple, Dict, Any, Optional

def generate_radial_spotlight_backdrop(
    width: int = 1400,
    height: int = 1800,
    center_color_rgb: Tuple[float, float, float] = (26.0, 29.0, 32.0),   # #1A1D20
    edge_color_rgb: Tuple[float, float, float] = (13.0, 14.0, 16.0),       # #0D0E10
    center_norm: Tuple[float, float] = (0.50, 0.42),
    radii_norm: Tuple[float, float] = (0.55, 0.70),
    dither_strength: float = 1.0
) -> np.ndarray:
    """
    Generates a 1400x1800 Sotheby's auction-grade radial spotlight backdrop.
    Uses Harmonic Cosine Smoothstep and TPDF dithering to eliminate 8-bit banding.
    Returns: (H, W, 3) uint8 RGB array.
    """
    u = np.linspace(0.0, 1.0, width, dtype=np.float32)
    v = np.linspace(0.0, 1.0, height, dtype=np.float32)
    ug, vg = np.meshgrid(u, v)

    cx, cy = center_norm
    rx, ry = radii_norm

    # Anisotropic elliptical distance metric
    dist = np.sqrt(((ug - cx) / rx) ** 2 + ((vg - cy) / ry) ** 2)

    # Harmonic Cosine Smoothstep falloff: f(0)=1.0 (center), f(1)=0.0 (edge)
    t = np.clip(dist, 0.0, 1.0)
    falloff = 0.5 * (1.0 + np.cos(np.pi * t))
    falloff = falloff[:, :, np.newaxis]  # (H, W, 1)

    c_center = np.array(center_color_rgb, dtype=np.float32).reshape(1, 1, 3)
    c_edge = np.array(edge_color_rgb, dtype=np.float32).reshape(1, 1, 3)

    # Continuous float32 gradient
    backdrop_float = c_edge + (c_center - c_edge) * falloff

    # Triangular Probability Density Function (TPDF) Dithering to eliminate 8-bit quantization banding
    if dither_strength > 0.0:
        r1 = np.random.uniform(0.0, 1.0, (height, width, 3)).astype(np.float32)
        r2 = np.random.uniform(0.0, 1.0, (height, width, 3)).astype(np.float32)
        tpdf_dither = (r1 + r2 - 1.0) * (dither_strength * 0.75)
        backdrop_float = backdrop_float + tpdf_dither

    return np.clip(np.round(backdrop_float), 0, 255).astype(np.uint8)


def synthesize_dual_tier_shadows(
    alpha_mask: np.ndarray,
    contact_opacity: float = 0.85,
    diffuse_opacity: float = 0.45,
    offset_y: int = 8,
    shadow_length_scale: float = 0.15
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Synthesizes physical dual-tier ground contact shadows from object alpha channel.
    Returns: (alpha_contact, alpha_diffuse) as (H, W) float32 arrays in [0.0, 1.0].
    """
    h, w = alpha_mask.shape[:2]
    fg_indices = np.where(alpha_mask > 25)

    if len(fg_indices[0]) == 0:
        return np.zeros((h, w), dtype=np.float32), np.zeros((h, w), dtype=np.float32)

    y_min, y_max = int(np.min(fg_indices[0])), int(np.max(fg_indices[0]))
    x_min, x_max = int(np.min(fg_indices[1])), int(np.max(fg_indices[1]))
    obj_height = max(1, y_max - y_min)
    obj_width = max(1, x_max - x_min)

    # === TIER 1: Ambient Occlusion Contact Line (Cavity) ===
    base_slice_h = max(20, int(obj_height * 0.06))
    y_base_start = max(0, y_max - base_slice_h)

    ao_source = np.zeros((h, w), dtype=np.float32)
    ao_source[y_base_start:y_max+1, :] = (alpha_mask[y_base_start:y_max+1, :] / 255.0).astype(np.float32)

    ao_shifted = np.zeros_like(ao_source)
    shift_ao_y = 3
    if shift_ao_y < h:
        ao_shifted[shift_ao_y:, :] = ao_source[:-shift_ao_y, :]

    # Morphological dilation with horizontal structuring element
    k_ao = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 3))
    ao_dilated = cv2.dilate(ao_shifted, k_ao)

    # Tight anisotropic Gaussian blur
    ao_blurred = cv2.GaussianBlur(ao_dilated, (0, 0), sigmaX=4.0, sigmaY=2.5)
    alpha_ao = np.clip(ao_blurred * contact_opacity, 0.0, contact_opacity)

    # === TIER 2: Diffuse Directional Perspective Shadow (Penumbra) ===
    lower_h = max(40, int(obj_height * 0.30))
    y_lower_start = max(0, y_max - lower_h)

    src_pts = np.float32([
        [x_min, y_lower_start],
        [x_max, y_lower_start],
        [x_max, y_max],
        [x_min, y_max]
    ])

    shadow_len = max(50, int(obj_height * shadow_length_scale))
    expand_x_base = int(obj_width * 0.04)
    expand_x_tip = int(obj_width * 0.18)

    dst_pts = np.float32([
        [x_min - expand_x_tip, min(h - 1, y_max + offset_y + shadow_len)],
        [x_max + expand_x_tip, min(h - 1, y_max + offset_y + shadow_len)],
        [x_max + expand_x_base, min(h - 1, y_max + offset_y)],
        [x_min - expand_x_base, min(h - 1, y_max + offset_y)]
    ])

    lower_alpha = np.zeros((h, w), dtype=np.float32)
    lower_alpha[y_lower_start:y_max+1, x_min:x_max+1] = (alpha_mask[y_lower_start:y_max+1, x_min:x_max+1] / 255.0).astype(np.float32)

    M_proj = cv2.getPerspectiveTransform(src_pts, dst_pts)
    warped_shadow = cv2.warpPerspective(lower_alpha, M_proj, (w, h), flags=cv2.INTER_LINEAR)

    diffuse_blurred = cv2.GaussianBlur(warped_shadow, (0, 0), sigmaX=22.0, sigmaY=11.0)

    # Distance-decay map
    y_coords = np.arange(h, dtype=np.float32).reshape(h, 1)
    decay_vals = np.clip(1.0 - (y_coords - y_max) / (shadow_len + offset_y + 1e-5), 0.0, 1.0) ** 1.3
    decay_map = np.tile(decay_vals, (1, w))

    alpha_diffuse = np.clip(diffuse_blurred * decay_map * diffuse_opacity, 0.0, diffuse_opacity)

    return alpha_ao, alpha_diffuse


def defringe_foreground(rgb: np.ndarray, alpha_uint8: np.ndarray) -> np.ndarray:
    """
    Eliminates light background color spill from boundary pixels via core inpainting.
    """
    core_mask = (alpha_uint8 > 240).astype(np.uint8)
    if np.sum(core_mask) == 0:
        return rgb

    fringe_mask = ((alpha_uint8 > 5) & (alpha_uint8 <= 240)).astype(np.uint8)
    if np.sum(fringe_mask) == 0:
        return rgb

    decontaminated_rgb = rgb.copy()
    decontaminated_rgb = cv2.inpaint(decontaminated_rgb, fringe_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    return decontaminated_rgb


def composite_master_artwork(
    backdrop_rgb: np.ndarray,
    foreground_rgb: np.ndarray,
    alpha_mask: np.ndarray,
    enable_shadow: bool = True,
    contact_opacity: float = 0.85,
    diffuse_opacity: float = 0.45,
    offset_y: int = 8
) -> np.ndarray:
    """
    Composites foreground antique onto luxury radial backdrop with dual-tier shadows.
    Returns: (H, W, 3) uint8 RGB master image.
    """
    h, w = backdrop_rgb.shape[:2]

    # Defringe foreground RGB
    fg_dehalo = defringe_foreground(foreground_rgb, alpha_mask).astype(np.float32)
    fg_alpha = (alpha_mask.astype(np.float32) / 255.0)[:, :, np.newaxis]  # (H, W, 1)
    bg_float = backdrop_rgb.astype(np.float32)

    if enable_shadow:
        alpha_ao, alpha_diffuse = synthesize_dual_tier_shadows(
            alpha_mask=alpha_mask,
            contact_opacity=contact_opacity,
            diffuse_opacity=diffuse_opacity,
            offset_y=offset_y
        )
        a_ao_3d = alpha_ao[:, :, np.newaxis]
        a_diff_3d = alpha_diffuse[:, :, np.newaxis]

        # Multiply transmittance attenuation for shadows
        transmittance = (1.0 - a_ao_3d) * (1.0 - a_diff_3d)
        bg_shadowed = bg_float * transmittance
    else:
        bg_shadowed = bg_float

    # Alpha-Over compositing
    final_float = fg_dehalo * fg_alpha + bg_shadowed * (1.0 - fg_alpha)
    return np.clip(np.round(final_float), 0, 255).astype(np.uint8)


def apply_authentic_backstamp_vignette(
    image_rgb: np.ndarray,
    inner_radius: float = 0.65,
    outer_radius: float = 0.98,
    opacity: float = 0.35
) -> np.ndarray:
    """
    Applies authentic museum-grade radial vignette to the backstamp macro photo.
    """
    h, w = image_rgb.shape[:2]
    u = np.linspace(-1.0, 1.0, w, dtype=np.float32)
    v = np.linspace(-1.0, 1.0, h, dtype=np.float32)
    ug, vg = np.meshgrid(u, v)

    dist = np.sqrt(ug**2 + vg**2)
    # Vignette factor: 0 at inner radius, 1 at outer radius
    vignette_raw = np.clip((dist - inner_radius) / (outer_radius - inner_radius + 1e-5), 0.0, 1.0)
    vignette_smooth = 0.5 * (1.0 - np.cos(np.pi * vignette_raw))  # (H, W)
    vignette_darkening = 1.0 - (vignette_smooth * opacity)
    vignette_darkening = vignette_darkening[:, :, np.newaxis]

    enhanced = image_rgb.astype(np.float32) * vignette_darkening
    return np.clip(np.round(enhanced), 0, 255).astype(np.uint8)
```

---

## 7. Verification & Quality Assurance Criteria

### 7.1 Quantitative Invariants
1. **Backdrop Color Invariants**:
   - Hotspot center pixel $(u=0.50, v=0.42)$ RGB $\in [24, 27, 30]$ to $[28, 31, 34]$.
   - Corner pixels $(u=0, v=0), (u=1, v=0), (u=0, v=1), (u=1, v=1)$ RGB $\in [11, 12, 14]$ to $[15, 16, 18]$.
   - Continuous monotonic decay from center to periphery.
2. **Zero-Banding Invariant**:
   - Gradient derivative across any 1D radial slice has no flat staircases with sudden jump $\Delta L \ge 2$.
3. **Contact Shadow Invariants**:
   - $\max(\alpha_{\mathrm{contact}}) = 0.85 \pm 0.02$.
   - $\max(\alpha_{\mathrm{diffuse}}) = 0.45 \pm 0.03$.
   - Shadow pixels only exist below base contact line ($y \ge y_{\mathrm{base}} - 2$).
   - Upper region ($y < y_{\mathrm{base}} - 5$) shadow alpha is strictly $0.0$.
4. **Authentic Edge Invariant**:
   - Core object geometry retains $100.0\%$ spatial silhouette fidelity.
   - Boundary fringe pixels contain zero bright background spill ($L^* < 35$ in dark backdrop composition).
