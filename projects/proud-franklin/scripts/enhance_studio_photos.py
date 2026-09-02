#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/enhance_studio_photos.py
================================
Auction-Grade Antique Studio Photo Processing Engine for Arcana Antiqua.

Features:
1. 100% Authentic Physical Shape Preservation (Zero AI hallucination or redraw)
2. IS-Net Alpha Matting with Connected Component Filtering & Boundary Morphology
3. Sotheby's Dark Slate Radial Spotlight Backdrop Synthesis (#2A2F35 -> #1A1D20 -> #0A0B0D)
   with Harmonic Cosine Smoothstep & TPDF Anti-Banding Dithering
4. Dual-Tier Ground Contact Shadows (Cavity Ambient Occlusion Line + Diffuse Perspective Penumbra)
5. CIELAB L* Adaptive Unsharp Masking for Terracotta Stoneware, Glazed Hair & White Dove
6. Angle 5 Base Backstamp Macro Archival Preservation (Zero cutout, Framing Vignette)
7. Standardized 1400x1800 Master Exports and Lookbook Asset Synchronization
"""

import os
import sys
import argparse
import json
import time
import gc
import numpy as np
from PIL import Image, ImageOps
import cv2

try:
    import torch
    TORCH_AVAILABLE = True
except (ImportError, OSError, Exception):
    TORCH_AVAILABLE = False

try:
    import rembg
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False


def release_memory():
    """Forces garbage collection and GPU cache cleanup."""
    gc.collect()
    if TORCH_AVAILABLE and torch.cuda.is_available():
        try:
            torch.cuda.empty_cache()
        except Exception:
            pass


def hex_to_rgb(hex_str: str) -> np.ndarray:
    """Converts hex color string (#RRGGBB) to RGB float32 array in range [0, 255]."""
    hex_clean = hex_str.lstrip('#')
    return np.array([int(hex_clean[i:i+2], 16) for i in (0, 2, 4)], dtype=np.float32)


def safe_load_image(filepath: str) -> Image.Image:
    """Safely loads image handling Windows Unicode paths and EXIF orientation."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Source image file not found: {filepath}")
    
    with open(filepath, 'rb') as f:
        file_bytes = f.read()
    np_arr = np.frombuffer(file_bytes, np.uint8)
    cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if cv_img is None:
        raise ValueError(f"Failed to decode image from buffer: {filepath}")
    
    cv_rgb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(cv_rgb)
    try:
        pil_img = ImageOps.exif_transpose(pil_img)
    except Exception:
        pass
    return pil_img


def generate_radial_spotlight_backdrop(
    width: int = 1400,
    height: int = 1800,
    center_xy: tuple = (0.50, 0.42),
    radii_xy: tuple = (0.55, 0.70),
    center_hex: str = "#2A2F35",
    mid_hex: str = "#1A1D20",
    outer_hex: str = "#0A0B0D",
    dither: bool = True
) -> np.ndarray:
    """
    Synthesizes Sotheby's luxury dark slate radial spotlight backdrop.
    Uses harmonic cosine smoothstep and TPDF dithering to completely eliminate Mach banding.
    Memory-optimized float32 computation.
    """
    c_center = hex_to_rgb(center_hex)
    c_mid = hex_to_rgb(mid_hex)
    c_outer = hex_to_rgb(outer_hex)
    
    u0, v0 = center_xy
    ru, rv = radii_xy
    
    # 1D coordinates to avoid large 2D meshgrids
    u = (np.linspace(0.0, 1.0, width, dtype=np.float32) - u0) / ru
    v = (np.linspace(0.0, 1.0, height, dtype=np.float32) - v0) / rv
    
    # Outer sum of squares for elliptical distance: dist = sqrt(u^2 + v^2)
    dist_sq = (v[:, np.newaxis] ** 2) + (u[np.newaxis, :] ** 2)
    dist = np.sqrt(dist_sq)
    del dist_sq
    
    t1 = np.clip(dist / 0.60, 0.0, 1.0)
    smooth_t1 = 0.5 * (1.0 - np.cos(np.pi * t1))
    del t1
    
    t2 = np.clip((dist - 0.60) / 0.80, 0.0, 1.0)
    smooth_t2 = 0.5 * (1.0 - np.cos(np.pi * t2))
    del t2, dist
    
    # Interpolate colors
    interp_1 = (1.0 - smooth_t1[:, :, np.newaxis]) * c_center + smooth_t1[:, :, np.newaxis] * c_mid
    del smooth_t1
    backdrop_float = (1.0 - smooth_t2[:, :, np.newaxis]) * interp_1 + smooth_t2[:, :, np.newaxis] * c_outer
    del smooth_t2, interp_1
    
    if dither:
        u1 = np.random.uniform(0.0, 1.0, size=(height, width)).astype(np.float32)
        u2 = np.random.uniform(0.0, 1.0, size=(height, width)).astype(np.float32)
        tpdf = ((u1 + u2 - 1.0) * 0.75)[:, :, np.newaxis]
        del u1, u2
        backdrop_float += tpdf
        del tpdf
    
    backdrop_uint8 = np.clip(np.round(backdrop_float), 0, 255).astype(np.uint8)
    del backdrop_float
    return backdrop_uint8


def extract_alpha_matting(
    img_pil: Image.Image,
    session=None,
    erode_size: int = 1,
    gaussian_sigma: float = 0.5
) -> tuple:
    """
    Performs high-precision boundary extraction & alpha matting with 100% geometry preservation.
    Returns (fg_rgb_np, alpha_mask_float).
    """
    w_orig, h_orig = img_pil.size
    img_rgb = np.array(img_pil.convert('RGB'), dtype=np.uint8)
    
    if REMBG_AVAILABLE and session is not None:
        # Downscale for IS-Net inference if resolution is excessively large (> 1800)
        max_dim = max(w_orig, h_orig)
        if max_dim > 1800:
            scale_factor = 1800.0 / float(max_dim)
            infer_w = int(w_orig * scale_factor)
            infer_h = int(h_orig * scale_factor)
            infer_img = img_pil.resize((infer_w, infer_h), Image.Resampling.LANCZOS)
            mask_result = rembg.remove(infer_img, session=session, only_mask=True, post_process_mask=False)
            del infer_img
            alpha_infer = np.array(mask_result)
            del mask_result
            if alpha_infer.ndim == 3:
                alpha_infer = alpha_infer[:, :, 0]
            alpha_raw = cv2.resize(alpha_infer, (w_orig, h_orig), interpolation=cv2.INTER_LANCZOS4)
            del alpha_infer
        else:
            mask_result = rembg.remove(img_pil, session=session, only_mask=True, post_process_mask=False)
            alpha_raw = np.array(mask_result)
            if alpha_raw.ndim == 3:
                alpha_raw = alpha_raw[:, :, 0]
            del mask_result
    else:
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        alpha_raw = thresh
    
    # Connected component filtering on alpha > 64 to eliminate detached table shadows
    bin_mask = (alpha_raw > 64).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(bin_mask)
    if num_labels > 1:
        largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        cleaned_mask = (labels == largest_label).astype(np.uint8) * 255
        kernel_dilate = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        allowed_zone = cv2.dilate(cleaned_mask, kernel_dilate, iterations=2)
        alpha_purged = np.where(allowed_zone > 0, alpha_raw, 0)
        del cleaned_mask, allowed_zone, labels, stats, bin_mask
    else:
        alpha_purged = alpha_raw
        
    # Morphological closing (3x3 ellipse) to seal internal pores
    kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha_closed = cv2.morphologyEx(alpha_purged, cv2.MORPH_CLOSE, kernel_close)
    del alpha_purged
    
    # Boundary erosion (erode_size) to strip bright white background bleed
    if erode_size > 0:
        kernel_erode = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        alpha_eroded = cv2.erode(alpha_closed, kernel_erode, iterations=erode_size)
        del alpha_closed
    else:
        alpha_eroded = alpha_closed
        
    # Sub-pixel Gaussian feathering for smooth edge transition
    if gaussian_sigma > 0:
        alpha_feathered = cv2.GaussianBlur(alpha_eroded, (3, 3), gaussian_sigma)
        del alpha_eroded
    else:
        alpha_feathered = alpha_eroded
        
    alpha_float = alpha_feathered.astype(np.float32) / 255.0
    del alpha_feathered
    return img_rgb, alpha_float


def synthesize_dual_tier_shadows(
    alpha_mask: np.ndarray,
    width: int = 1400,
    height: int = 1800,
    contact_opacity: float = 0.85,
    diffuse_opacity: float = 0.45,
    offset_y: int = 8
) -> np.ndarray:
    """
    Synthesizes dual-tier ground contact shadows:
    Tier 1: Razor-sharp ambient occlusion contact line at porcelain base
    Tier 2: Soft diffuse perspective projection shadow grounding object in 3D space
    Returns shadow alpha matrix in range [0, 1] of shape (height, width).
    """
    y_idxs, x_idxs = np.where(alpha_mask > 0.1)
    if len(y_idxs) == 0:
        return np.zeros((height, width), dtype=np.float32)
        
    ymin, ymax = int(y_idxs.min()), int(y_idxs.max())
    xmin, xmax = int(x_idxs.min()), int(x_idxs.max())
    obj_h = ymax - ymin
    obj_w = max(10, xmax - xmin)
    
    # Tier 1: AO Cavity Contact Line
    h_base_slice = max(15, int(0.06 * obj_h))
    base_slice_mask = np.zeros_like(alpha_mask)
    y_start_base = max(0, ymax - h_base_slice)
    base_slice_mask[y_start_base:ymax+1, :] = alpha_mask[y_start_base:ymax+1, :]
    
    m_shifted = np.zeros_like(base_slice_mask)
    m_shifted[3:, :] = base_slice_mask[:-3, :]
    del base_slice_mask
    
    b_rect = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 3))
    m_dilated = cv2.dilate((m_shifted * 255).astype(np.uint8), b_rect).astype(np.float32) / 255.0
    del m_shifted
    
    ao_blurred = cv2.GaussianBlur(m_dilated, (15, 7), sigmaX=4.0, sigmaY=2.5)
    del m_dilated
    alpha_contact = np.clip(ao_blurred * contact_opacity, 0.0, contact_opacity)
    del ao_blurred
    
    # Tier 2: Diffuse Perspective Penumbra Ground Shadow
    h_lower = max(40, int(0.30 * obj_h))
    y_lower_start = max(0, ymax - h_lower)
    lower_mask = np.zeros_like(alpha_mask)
    lower_mask[y_lower_start:ymax+1, :] = alpha_mask[y_lower_start:ymax+1, :]
    
    l_shadow = max(50, int(0.15 * obj_h))
    delta_base = max(10, int(0.04 * obj_w))
    delta_tip = max(40, int(0.18 * obj_w))
    delta_y2 = offset_y
    
    p_src = np.array([
        [xmin, y_lower_start],
        [xmax, y_lower_start],
        [xmax, ymax],
        [xmin, ymax]
    ], dtype=np.float32)
    
    p_dst = np.array([
        [xmin - delta_tip, min(height - 1, ymax + delta_y2 + l_shadow)],
        [xmax + delta_tip, min(height - 1, ymax + delta_y2 + l_shadow)],
        [xmax + delta_base, min(height - 1, ymax + delta_y2)],
        [xmin - delta_base, min(height - 1, ymax + delta_y2)]
    ], dtype=np.float32)
    
    try:
        m_proj = cv2.getPerspectiveTransform(p_src, p_dst)
        warped = cv2.warpPerspective((lower_mask * 255).astype(np.uint8), m_proj, (width, height), flags=cv2.INTER_LINEAR).astype(np.float32) / 255.0
    except Exception:
        warped = np.zeros((height, width), dtype=np.float32)
    del lower_mask
    
    diffuse_blurred = cv2.GaussianBlur(warped, (89, 45), sigmaX=22.0, sigmaY=11.0)
    del warped
    
    y_grid = np.arange(height, dtype=np.float32)[:, np.newaxis]
    s_dist = np.clip((y_grid - ymax) / float(l_shadow + delta_y2 + 1e-5), 0.0, 1.0)
    g_decay = (1.0 - s_dist) ** 1.3
    g_decay[y_grid < ymax] = 1.0
    del y_grid, s_dist
    
    alpha_diffuse = np.clip(diffuse_blurred * g_decay * diffuse_opacity, 0.0, diffuse_opacity)
    del diffuse_blurred, g_decay
    
    combined_shadow_alpha = 1.0 - (1.0 - alpha_contact) * (1.0 - alpha_diffuse)
    del alpha_contact, alpha_diffuse
    return np.clip(combined_shadow_alpha, 0.0, 1.0).astype(np.float32)


def apply_cielab_unsharp_mask(
    img_rgb: np.ndarray,
    radius: float = 1.8,
    percent: int = 120,
    threshold: float = 1.0,
    alpha_mask: np.ndarray = None
) -> np.ndarray:
    """
    Applies halo-free unsharp masking strictly on the Lightness channel in CIELAB space.
    Memory-optimized: Keeps a and b channels in uint8, only computes float32 on L*.
    """
    img_lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    l_orig = img_lab[:, :, 0].astype(np.float32)
    
    ksize = int(np.ceil(radius * 3) * 2 + 1)
    l_blurred = cv2.GaussianBlur(l_orig, (ksize, ksize), radius)
    diff = l_orig - l_blurred
    del l_blurred
    
    diff_gated = np.zeros_like(diff)
    thresh_val = float(threshold)
    mask_above = np.abs(diff) >= thresh_val
    diff_gated[mask_above] = diff[mask_above] - np.sign(diff[mask_above]) * thresh_val
    del mask_above
    
    w_high = np.clip((255.0 - l_orig) / 30.0, 0.0, 1.0)
    w_edge = 1.0 / (1.0 + (np.abs(diff) / 80.0) ** 2)
    w_weight = w_high * w_edge
    del w_high, w_edge, diff
    
    k_amount = percent / 100.0
    l_enhanced = np.clip(l_orig + k_amount * w_weight * diff_gated, 0.0, 255.0)
    del diff_gated, w_weight
    
    if alpha_mask is not None:
        m = cv2.GaussianBlur(alpha_mask, (3, 3), 0.5)
        l_final = l_orig * (1.0 - m) + l_enhanced * m
        del m, l_orig, l_enhanced
    else:
        l_final = l_enhanced
        del l_orig
        
    img_lab[:, :, 0] = np.clip(np.round(l_final), 0, 255).astype(np.uint8)
    del l_final
    enhanced_rgb = cv2.cvtColor(img_lab, cv2.COLOR_LAB2RGB)
    del img_lab
    return enhanced_rgb


def process_cutout_angle(
    img_pil: Image.Image,
    angle_key: str,
    directive: dict,
    target_w: int = 1400,
    target_h: int = 1800,
    session=None
) -> tuple:
    """
    Processes angles 1-4 (HERO_FRONT, SIDE_PROFILE, PORTRAIT_TORSO, REAR_SCULPTURE).
    Executes IS-Net matting, standardized framing, backdrop synthesis, contact shadows, and USM.
    Returns (master_image_pil, metrics_dict).
    """
    w_orig, h_orig = img_pil.size
    
    morph_cfg = directive.get("boundaryMorphology", {})
    erode_size = morph_cfg.get("erodeSize", 1)
    gauss_sigma = morph_cfg.get("gaussianBlur", 0.5)
    
    fg_rgb_raw, alpha_raw = extract_alpha_matting(
        img_pil, session=session, erode_size=erode_size, gaussian_sigma=gauss_sigma
    )
    
    row_mask = np.any(alpha_raw > 0.05, axis=1)
    col_mask = np.any(alpha_raw > 0.05, axis=0)
    row_nz = np.where(row_mask)[0]
    col_nz = np.where(col_mask)[0]
    if len(row_nz) == 0 or len(col_nz) == 0:
        ymin, ymax, xmin, xmax = 0, h_orig, 0, w_orig
    else:
        ymin, ymax = int(row_nz[0]), int(row_nz[-1])
        xmin, xmax = int(col_nz[0]), int(col_nz[-1])
    del row_mask, col_mask, row_nz, col_nz
        
    pad = 10
    c_ymin = max(0, ymin - pad)
    c_ymax = min(h_orig, ymax + pad)
    c_xmin = max(0, xmin - pad)
    c_xmax = min(w_orig, xmax + pad)
    
    crop_rgb = fg_rgb_raw[c_ymin:c_ymax, c_xmin:c_xmax].copy()
    crop_alpha = alpha_raw[c_ymin:c_ymax, c_xmin:c_xmax].copy()
    del fg_rgb_raw, alpha_raw
    ch, cw = crop_rgb.shape[:2]
    
    if angle_key == "PORTRAIT_TORSO":
        target_obj_h = int(target_h * 0.85)
        scale = target_obj_h / float(ch)
        new_w = int(cw * scale)
        new_h = target_obj_h
        
        scaled_rgb = cv2.resize(crop_rgb, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        scaled_alpha = cv2.resize(crop_alpha, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        
        pos_x = (target_w - new_w) // 2
        pos_y = int(target_h * 0.08)
    else:
        target_obj_h = int(target_h * 0.78)
        scale = target_obj_h / float(ch)
        new_w = int(cw * scale)
        new_h = target_obj_h
        
        scaled_rgb = cv2.resize(crop_rgb, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        scaled_alpha = cv2.resize(crop_alpha, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        
        pos_x = (target_w - new_w) // 2
        pos_y = 1520 - new_h
        if pos_y < 40:
            pos_y = 40
    del crop_rgb, crop_alpha
    
    canvas_fg_rgb = np.zeros((target_h, target_w, 3), dtype=np.uint8)
    canvas_alpha = np.zeros((target_h, target_w), dtype=np.float32)
    
    src_y1 = max(0, -pos_y)
    src_x1 = max(0, -pos_x)
    src_y2 = new_h - max(0, (pos_y + new_h) - target_h)
    src_x2 = new_w - max(0, (pos_x + new_w) - target_w)
    
    dst_y1 = max(0, pos_y)
    dst_x1 = max(0, pos_x)
    dst_y2 = dst_y1 + (src_y2 - src_y1)
    dst_x2 = dst_x1 + (src_x2 - src_x1)
    
    canvas_fg_rgb[dst_y1:dst_y2, dst_x1:dst_x2] = scaled_rgb[src_y1:src_y2, src_x1:src_x2]
    canvas_alpha[dst_y1:dst_y2, dst_x1:dst_x2] = scaled_alpha[src_y1:src_y2, src_x1:src_x2]
    del scaled_rgb, scaled_alpha
    
    bg_cfg = directive.get("backdrop", {})
    c_pos = bg_cfg.get("spotlightPosition", [0.5, 0.42])
    c_rad = bg_cfg.get("spotlightRadii", [0.55, 0.70])
    c_center = bg_cfg.get("centerColorHex", "#2A2F35")
    c_mid = bg_cfg.get("midColorHex", "#1A1D20")
    c_outer = bg_cfg.get("outerColorHex", "#0A0B0D")
    
    backdrop = generate_radial_spotlight_backdrop(
        width=target_w, height=target_h,
        center_xy=tuple(c_pos), radii_xy=tuple(c_rad),
        center_hex=c_center, mid_hex=c_mid, outer_hex=c_outer
    )
    
    shadow_cfg = directive.get("contactShadow", {})
    enable_shadow = shadow_cfg.get("enabled", False)
    
    if enable_shadow and angle_key != "PORTRAIT_TORSO":
        c_op = shadow_cfg.get("contactOpacity", 0.85)
        d_op = shadow_cfg.get("diffuseOpacity", 0.45)
        off_y = shadow_cfg.get("offsetY", 8)
        shadow_mask = synthesize_dual_tier_shadows(
            canvas_alpha, width=target_w, height=target_h,
            contact_opacity=c_op, diffuse_opacity=d_op, offset_y=off_y
        )
    else:
        shadow_mask = np.zeros((target_h, target_w), dtype=np.float32)
        
    # Per-channel optical compositing to minimize peak RAM
    comp_uint8 = np.zeros((target_h, target_w, 3), dtype=np.uint8)
    for c in range(3):
        bg_c = backdrop[:, :, c].astype(np.float32) * (1.0 - shadow_mask)
        fg_c = canvas_fg_rgb[:, :, c].astype(np.float32)
        comp_c = fg_c * canvas_alpha + bg_c * (1.0 - canvas_alpha)
        comp_uint8[:, :, c] = np.clip(np.round(comp_c), 0, 255).astype(np.uint8)
        del bg_c, fg_c, comp_c
        
    del backdrop, shadow_mask, canvas_fg_rgb
    
    usm_cfg = directive.get("textureEnhancement", {})
    u_radius = usm_cfg.get("unsharpRadius", 1.8)
    u_percent = max(180, usm_cfg.get("unsharpPercent", 180))
    u_thresh = min(0.5, usm_cfg.get("unsharpThreshold", 0.0))
    
    final_rgb = apply_cielab_unsharp_mask(
        comp_uint8, radius=u_radius, percent=u_percent, threshold=u_thresh, alpha_mask=canvas_alpha
    )
    del comp_uint8, canvas_alpha
    release_memory()
    
    metrics = {
        "angle": angle_key,
        "originalSize": [w_orig, h_orig],
        "masterSize": [target_w, target_h],
        "shadowSynthesized": enable_shadow,
        "unsharpApplied": True
    }
    return Image.fromarray(final_rgb, mode="RGB"), metrics


def process_backstamp_angle(
    img_pil: Image.Image,
    angle_key: str,
    directive: dict,
    target_w: int = 1400,
    target_h: int = 1800
) -> tuple:
    """
    Processes Angle 5 (BASE_BACKSTAMP).
    Authentic photographic macro preservation: NO cutout, precise 1400x1800 framing,
    CIELAB unsharp mask, and luxury smoothstep radial vignette.
    """
    w_orig, h_orig = img_pil.size
    img_rgb = np.array(img_pil.convert("RGB"), dtype=np.uint8)
    
    aspect_tgt = target_w / float(target_h)
    aspect_orig = w_orig / float(h_orig)
    
    if aspect_orig > aspect_tgt:
        crop_w = int(h_orig * aspect_tgt)
        x0 = (w_orig - crop_w) // 2
        cropped = img_rgb[:, x0:x0+crop_w]
    else:
        crop_h = int(w_orig / aspect_tgt)
        y0 = (h_orig - crop_h) // 2
        cropped = img_rgb[y0:y0+crop_h, :]
    del img_rgb
    
    resized = cv2.resize(cropped, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
    del cropped
    
    usm_cfg = directive.get("textureEnhancement", {})
    u_radius = usm_cfg.get("unsharpRadius", 1.5)
    u_percent = usm_cfg.get("unsharpPercent", 130)
    u_thresh = usm_cfg.get("unsharpThreshold", 1.0)
    
    enhanced = apply_cielab_unsharp_mask(
        resized, radius=u_radius, percent=u_percent, threshold=u_thresh, alpha_mask=None
    )
    del resized
    
    vig_cfg = directive.get("frameVignette", {})
    if vig_cfg.get("enabled", True):
        inner_r = vig_cfg.get("innerRadius", 0.50)
        outer_r = vig_cfg.get("outerRadius", 1.05)
        opacity = max(0.88, vig_cfg.get("opacity", 0.88))
        
        u = (np.linspace(0.0, 1.0, target_w, dtype=np.float32) - 0.5) / 0.5
        v = (np.linspace(0.0, 1.0, target_h, dtype=np.float32) - 0.5) / 0.5
        dist = np.sqrt((v[:, np.newaxis] ** 2) + (u[np.newaxis, :] ** 2))
        del u, v
        
        vig_t = np.clip((dist - inner_r) / (outer_r - inner_r + 1e-5), 0.0, 1.0)
        smooth_vig = vig_t * vig_t * (3.0 - 2.0 * vig_t) * opacity
        del dist, vig_t
        
        final_rgb = np.zeros((target_h, target_w, 3), dtype=np.uint8)
        for c in range(3):
            ch_float = enhanced[:, :, c].astype(np.float32) * (1.0 - smooth_vig)
            final_rgb[:, :, c] = np.clip(np.round(ch_float), 0, 255).astype(np.uint8)
            del ch_float
        del enhanced, smooth_vig
    else:
        final_rgb = enhanced
        
    release_memory()
    metrics = {
        "angle": angle_key,
        "originalSize": [w_orig, h_orig],
        "masterSize": [target_w, target_h],
        "vignetteApplied": vig_cfg.get("enabled", True),
        "unsharpApplied": True
    }
    return Image.fromarray(final_rgb, mode="RGB"), metrics


def process_manifest(
    manifest_path: str,
    output_dir: str = None,
    catalog_dir: str = None,
    target_dims: tuple = (1400, 1800),
    jpeg_quality: int = 95,
    device: str = "auto",
    dry_run: bool = False,
    force: bool = False
) -> dict:
    """
    Processes full antique studio enhancement pipeline for all classified angles in manifest.
    """
    start_time = time.time()
    if not os.path.exists(manifest_path):
        raise FileNotFoundError(f"Classification manifest not found: {manifest_path}")
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    manifest_dir = os.path.dirname(os.path.abspath(manifest_path))
    
    dirs = manifest.get("directories", {})
    if output_dir is None:
        output_dir = os.path.join(manifest_dir, "studio_master")
    os.makedirs(output_dir, exist_ok=True)
    
    if catalog_dir is None:
        catalog_dir = os.path.abspath(os.path.join(manifest_dir, "..", "..", "assets", "lladro_nao"))
    os.makedirs(catalog_dir, exist_ok=True)
    
    session = None
    if REMBG_AVAILABLE:
        try:
            import onnxruntime as ort
            sess_opts = ort.SessionOptions()
            sess_opts.enable_cpu_mem_arena = False
            sess_opts.intra_op_num_threads = 2
            sess_opts.inter_op_num_threads = 1
            sess_opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
            session = rembg.new_session("isnet-general-use", session_options=sess_opts)
        except Exception:
            session = rembg.new_session()
            
    classified_angles = manifest.get("classifiedAngles", {})
    processed_results = []
    
    target_w, target_h = target_dims
    
    for angle_key, angle_info in classified_angles.items():
        src_info = angle_info["source"]
        tgt_info = angle_info["targetOutput"]
        directives = angle_info["enhancementDirectives"]
        
        src_rel = src_info["relativePath"]
        src_path = os.path.join(workspace_root, src_rel)
        if not os.path.exists(src_path):
            src_path = os.path.join(os.path.dirname(manifest_path), src_info["filename"])
            
        out_filename = tgt_info["filename"]
        out_master_path = os.path.join(output_dir, out_filename)
        
        print(f"Processing {angle_key} -> {out_filename}...")
        img_pil = safe_load_image(src_path)
        
        t0 = time.time()
        if directives.get("mattingRequired", True):
            out_img, metrics = process_cutout_angle(
                img_pil, angle_key, directives,
                target_w=target_w, target_h=target_h,
                session=session
            )
        else:
            out_img, metrics = process_backstamp_angle(
                img_pil, angle_key, directives,
                target_w=target_w, target_h=target_h
            )
        t1 = time.time()
        metrics["processingTimeSec"] = round(t1 - t0, 3)
        metrics["outputMasterPath"] = out_master_path
        
        if not dry_run:
            out_img.save(out_master_path, "JPEG", quality=jpeg_quality, optimize=True)
            metrics["fileSizeBytes"] = os.path.getsize(out_master_path)
            
            lookbook_map = {
                "HERO_FRONT": "venus_01_hero_front.jpg",
                "SIDE_PROFILE": "venus_02_side_profile.jpg",
                "PORTRAIT_TORSO": "venus_03_portrait_torso.jpg",
                "REAR_SCULPTURE": "venus_04_rear_sculpture.jpg",
                "BASE_BACKSTAMP": "venus_05_backstamp.jpg"
            }
            if angle_key in lookbook_map:
                cat_file = os.path.join(catalog_dir, lookbook_map[angle_key])
                out_img.save(cat_file, "JPEG", quality=jpeg_quality, optimize=True)
                
        processed_results.append(metrics)
        print(f"  [DONE] {angle_key} in {metrics['processingTimeSec']}s (Size: {out_img.size})")
        release_memory()
        
    total_duration = round(time.time() - start_time, 3)
    summary = {
        "status": "SUCCESS",
        "totalAnglesProcessed": len(processed_results),
        "outputDirectory": output_dir,
        "catalogDirectory": catalog_dir,
        "targetDimensions": [target_w, target_h],
        "totalExecutionTimeSec": total_duration,
        "angles": processed_results
    }
    return summary


def main():
    parser = argparse.ArgumentParser(description="Auction-Grade Studio Photo Processing Pipeline")
    parser.add_argument("-m", "--manifest", type=str, required=True, help="Path to classification_manifest.json")
    parser.add_argument("-o", "--output-dir", type=str, default=None, help="Output directory for studio masters")
    parser.add_argument("-c", "--catalog-dir", type=str, default=None, help="Catalog lookbook directory")
    parser.add_argument("-d", "--target-dims", type=int, nargs=2, default=[1400, 1800], help="Target width and height")
    parser.add_argument("-q", "--jpeg-quality", type=int, default=95, help="JPEG quality (1-100)")
    parser.add_argument("--device", type=str, default="auto", help="Acceleration device (cuda/cpu/auto)")
    parser.add_argument("--dry-run", action="store_true", help="Simulate processing without writing files")
    parser.add_argument("--json", action="store_true", help="Output machine-readable JSON status")
    parser.add_argument("-f", "--force", action="store_true", help="Force overwrite")
    
    args = parser.parse_args()
    
    try:
        summary = process_manifest(
            manifest_path=args.manifest,
            output_dir=args.output_dir,
            catalog_dir=args.catalog_dir,
            target_dims=tuple(args.target_dims),
            jpeg_quality=args.jpeg_quality,
            device=args.device,
            dry_run=args.dry_run,
            force=args.force
        )
        if args.json:
            print(json.dumps(summary, indent=2))
        else:
            print(f"\nPipeline completed successfully in {summary['totalExecutionTimeSec']}s.")
            print(f"Studio Masters written to: {summary['outputDirectory']}")
        return 0
    except Exception as e:
        print(f"Error executing studio enhancement pipeline: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
