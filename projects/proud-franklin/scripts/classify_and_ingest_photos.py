#!/usr/bin/env python3
"""
Antique Studio Photo Classification & Ingestion Engine (Milestone 1)
Automated 5-Angle Precision Classification for Sotheby's & Christie's Auction Appraisals.

Canonical Angles:
1. HERO_FRONT     (전신 전면 마스터)
2. SIDE_PROFILE   (3/4 측면 프로필)
3. PORTRAIT_TORSO (상체 및 마크로 디테일)
4. REAR_SCULPTURE (후면 조형미 및 드레이퍼리)
5. BASE_BACKSTAMP (하단 백스탬프 / 각인 / 보증 번호)
"""

import os
import sys
import json
import argparse
import hashlib
import datetime
import numpy as np
import cv2
from PIL import Image, ImageOps
from typing import Dict, List, Tuple, Any, Optional

try:
    from scipy.optimize import linear_sum_assignment
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

CANONICAL_ANGLES = [
    "HERO_FRONT",
    "SIDE_PROFILE",
    "PORTRAIT_TORSO",
    "REAR_SCULPTURE",
    "BASE_BACKSTAMP"
]

ANGLE_METADATA = {
    "HERO_FRONT": {
        "angleIndex": 1,
        "canonicalTag": "HERO_FRONT",
        "angleTag": "HERO 01 • 전신 스튜디오 화보",
        "macroRatio": "MASTER",
        "defaultCaption": "소더비 경매 룩북 전신 3/4 스튜디오 마스터 화보",
        "outputSuffix": "01_hero_front.jpg",
        "mattingRequired": True,
        "mattingModel": "isnet-general-use",
        "preserveAuthenticFrame": false if False else False,
        "contactShadow": {"enabled": True, "contactOpacity": 0.85, "diffuseOpacity": 0.45, "offsetY": 8},
        "backdrop": {
            "style": "sothebys_dark_slate_charcoal_radial",
            "centerColorHex": "#2A2F35",
            "midColorHex": "#1A1D20",
            "outerColorHex": "#0A0B0D",
            "spotlightPosition": [0.50, 0.42],
            "spotlightRadii": [0.55, 0.70]
        },
        "textureEnhancement": {"unsharpRadius": 1.8, "unsharpPercent": 120, "unsharpThreshold": 2}
    },
    "SIDE_PROFILE": {
        "angleIndex": 2,
        "canonicalTag": "SIDE_PROFILE",
        "angleTag": "PROFILE 03 • 측면 실루엣 화보",
        "macroRatio": "PROFILE",
        "defaultCaption": "물 긷는 비너스 측면 실루엣 및 암포라 항아리",
        "outputSuffix": "02_side_profile.jpg",
        "mattingRequired": True,
        "mattingModel": "isnet-general-use",
        "preserveAuthenticFrame": False,
        "contactShadow": {"enabled": True, "contactOpacity": 0.85, "diffuseOpacity": 0.45, "offsetY": 8},
        "backdrop": {"style": "sothebys_dark_slate_charcoal_radial"},
        "textureEnhancement": {"unsharpRadius": 1.8, "unsharpPercent": 120, "unsharpThreshold": 2}
    },
    "PORTRAIT_TORSO": {
        "angleIndex": 3,
        "canonicalTag": "PORTRAIT_TORSO",
        "angleTag": "PORTRAIT 02 • 상체 & 이목구비",
        "macroRatio": "PORTRAIT",
        "defaultCaption": "비너스 이목구비 및 평화의 비둘기 클로즈업",
        "outputSuffix": "03_portrait_torso.jpg",
        "mattingRequired": True,
        "mattingModel": "isnet-general-use",
        "preserveAuthenticFrame": False,
        "contactShadow": {"enabled": False},
        "backdrop": {"style": "sothebys_dark_slate_charcoal_radial"},
        "textureEnhancement": {"unsharpRadius": 1.8, "unsharpPercent": 120, "unsharpThreshold": 2}
    },
    "REAR_SCULPTURE": {
        "angleIndex": 4,
        "canonicalTag": "REAR_SCULPTURE",
        "angleTag": "REAR 04 • 후면 조각 화보",
        "macroRatio": "REAR",
        "defaultCaption": "후면 드레이프 주름 및 벽돌 우물 테라코타 질감",
        "outputSuffix": "04_rear_sculpture.jpg",
        "mattingRequired": True,
        "mattingModel": "isnet-general-use",
        "preserveAuthenticFrame": False,
        "contactShadow": {"enabled": True, "contactOpacity": 0.85, "diffuseOpacity": 0.45, "offsetY": 8},
        "backdrop": {"style": "sothebys_dark_slate_charcoal_radial"},
        "textureEnhancement": {"unsharpRadius": 1.8, "unsharpPercent": 120, "unsharpThreshold": 2}
    },
    "BASE_BACKSTAMP": {
        "angleIndex": 5,
        "canonicalTag": "BASE_BACKSTAMP",
        "angleTag": "STAMP 05 • 정품 백스탬프 각인",
        "macroRatio": "HALLMARK",
        "defaultCaption": "LLADRÓ DAISA 1993 공식 종꽃 백스탬프 & #2256 각인",
        "outputSuffix": "05_backstamp.jpg",
        "mattingRequired": False,
        "preserveAuthenticFrame": True,
        "frameVignette": {
            "enabled": True,
            "opacity": 0.35,
            "innerRadius": 0.65,
            "outerRadius": 0.98
        },
        "textureEnhancement": {"unsharpRadius": 1.5, "unsharpPercent": 130, "unsharpThreshold": 1}
    }
}


class ClassificationIncompleteError(Exception):
    """Raised when strict classification requirements are not met."""
    pass


def safe_read_image(image_path: str, normalize_exif: bool = True) -> Tuple[Image.Image, np.ndarray, int, int]:
    """
    Safely opens an image file on Windows supporting Unicode paths and EXIF orientation.
    Returns: (PIL Image, RGB numpy array, width, height)
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    # Use PIL with binary buffer decoding for 100% Windows Unicode path reliability
    with open(image_path, "rb") as f:
        img_bytes = f.read()

    # Load into PIL
    pil_img = Image.open(image_path)
    pil_img.load()

    exif_orientation = 1
    if normalize_exif:
        try:
            exif = pil_img.getexif()
            if exif and 0x0112 in exif:
                exif_orientation = exif[0x0112]
            pil_img = ImageOps.exif_transpose(pil_img)
        except Exception:
            pass

    w, h = pil_img.size
    rgb_arr = np.array(pil_img.convert("RGB"))
    return pil_img, rgb_arr, w, h


def compute_file_sha256(image_path: str) -> str:
    """Computes SHA-256 hash of a file safely."""
    hasher = hashlib.sha256()
    with open(image_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def extract_features(image_path: str, normalize_exif: bool = True) -> Dict[str, Any]:
    """
    Extracts geometric, photometric, and semantic color/texture features from an image.
    """
    filename = os.path.basename(image_path)
    file_size = os.path.getsize(image_path)
    sha256 = compute_file_sha256(image_path)

    pil_img, rgb_arr, w, h = safe_read_image(image_path, normalize_exif=normalize_exif)
    bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
    gray_arr = cv2.cvtColor(bgr_arr, cv2.COLOR_BGR2GRAY)
    hsv_arr = cv2.cvtColor(bgr_arr, cv2.COLOR_BGR2HSV)

    # 1. Laplacian sharpness variance
    laplacian_var = float(cv2.Laplacian(gray_arr, cv2.CV_64F).var())

    # 2. Backstamp / Hallmark / Text analysis in center ROI
    center_roi = gray_arr[int(h * 0.20):int(h * 0.80), int(w * 0.20):int(w * 0.80)]
    center_hsv = hsv_arr[int(h * 0.20):int(h * 0.80), int(w * 0.20):int(w * 0.80)]

    # Exact hallmark ROI (35% to 65% in both dimensions)
    hallmark_roi = gray_arr[int(h * 0.35):int(h * 0.65), int(w * 0.35):int(w * 0.65)]
    hallmark_hsv = hsv_arr[int(h * 0.35):int(h * 0.65), int(w * 0.35):int(w * 0.65)]

    # Blue stamp mask (Lladró bellflower cobalt blue: H 95-135, S 50-255, V 40-255)
    blue_mask = cv2.inRange(center_hsv, np.array([95, 50, 40]), np.array([135, 255, 255]))
    blue_pixels = int(np.sum(blue_mask > 0))

    hallmark_blue_mask = cv2.inRange(hallmark_hsv, np.array([95, 50, 40]), np.array([135, 255, 255]))
    hallmark_blue_pixels = int(np.sum(hallmark_blue_mask > 0))

    # Canny edges in hallmark ROI to detect text/hallmark lines
    hallmark_edges = cv2.Canny(hallmark_roi, 50, 150)
    hallmark_edge_pixels = int(np.sum(hallmark_edges > 0))

    # Adaptive threshold for stamped inscriptions and hallmarks
    thresh_center = cv2.adaptiveThreshold(
        center_roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 5
    )
    stroke_density = float(np.sum(thresh_center > 0) / thresh_center.size)
    center_lap_var = float(cv2.Laplacian(center_roi, cv2.CV_64F).var())

    # 3. Foreground segmentation & Bounding Box
    blurred = cv2.GaussianBlur(gray_arr, (25, 25), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    border = np.concatenate([thresh[0, :], thresh[-1, :], thresh[:, 0], thresh[:, -1]])
    if np.mean(border) > 128:
        thresh = cv2.bitwise_not(thresh)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        valid_c = [c for c in contours if cv2.contourArea(c) > (w * h * 0.02)]
        if valid_c:
            all_pts = np.concatenate(valid_c)
            bx, by, bw, bh = cv2.boundingRect(all_pts)
        else:
            bx, by, bw, bh = 0, 0, w, h
    else:
        bx, by, bw, bh = 0, 0, w, h

    top_norm = float(by / h)
    bot_norm = float((by + bh) / h)
    height_norm = float(bh / h)
    width_norm = float(bw / w)

    # 4. Centroid and Symmetry
    M = cv2.moments(thresh)
    if M["m00"] > 0:
        cx_norm = float((M["m10"] / M["m00"]) / w)
        cy_norm = float((M["m01"] / M["m00"]) / h)
    else:
        cx_norm = 0.5
        cy_norm = 0.5

    # Horizontal symmetry of foreground mask
    half_w = w // 2
    left_mask = thresh[:, :half_w]
    right_mask = cv2.flip(thresh[:, w - half_w:], 1)
    sym_diff = np.mean(np.abs(left_mask.astype(float) - right_mask.astype(float))) / 255.0
    symmetry_score = float(max(0.0, 1.0 - sym_diff * 2.0))

    # 5. Semantic Color Distributions
    # Terracotta / Gres Skin tone: H in [0, 25], S in [15, 160], V in [60, 240]
    skin_mask = cv2.inRange(hsv_arr, np.array([0, 15, 60]), np.array([25, 160, 240]))
    skin_ratio = float(np.sum(skin_mask > 0) / (w * h))
    upper_skin_ratio = float(np.sum(skin_mask[:int(h * 0.5), :] > 0) / (w * h * 0.5))

    # Dark glazed hair / drapery shadow: V < 55
    hair_mask = cv2.inRange(hsv_arr, np.array([0, 0, 0]), np.array([180, 255, 55]))
    hair_ratio = float(np.sum(hair_mask > 0) / (w * h))
    upper_hair_ratio = float(np.sum(hair_mask[:int(h * 0.5), :] > 0) / (w * h * 0.5))

    # Gloss white / dove highlight: S < 30, V > 220
    white_mask = cv2.inRange(hsv_arr, np.array([0, 0, 220]), np.array([180, 30, 255]))
    white_ratio = float(np.sum(white_mask > 0) / (w * h))

    return {
        "filename": filename,
        "relativePath": image_path.replace("\\", "/"),
        "sha256": sha256,
        "fileSizeBytes": file_size,
        "width": w,
        "height": h,
        "aspectRatio": round(float(w) / float(h), 3),
        "laplacian_var": laplacian_var,
        "blue_pixels": blue_pixels,
        "hallmark_blue_pixels": hallmark_blue_pixels,
        "hallmark_edge_pixels": hallmark_edge_pixels,
        "stroke_density": stroke_density,
        "center_lap_var": center_lap_var,
        "top_norm": top_norm,
        "bot_norm": bot_norm,
        "height_norm": height_norm,
        "width_norm": width_norm,
        "cx_norm": cx_norm,
        "cy_norm": cy_norm,
        "symmetry_score": symmetry_score,
        "skin_ratio": skin_ratio,
        "upper_skin_ratio": upper_skin_ratio,
        "hair_ratio": hair_ratio,
        "upper_hair_ratio": upper_hair_ratio,
        "white_ratio": white_ratio
    }


def score_image_for_angles(feat: Dict[str, Any]) -> Dict[str, Tuple[float, Dict[str, float], str]]:
    """
    Evaluates likelihood scores (0.0 to 1.0) and rules for all 5 canonical angles.
    Returns: { canonical_tag: (score, sub_scores, rule_description) }
    """
    scores = {}

    # --- 1. BASE_BACKSTAMP ---
    # Strong indicator: blue hallmark pixels in center hallmark ROI + text edge structure in hallmark ROI
    h_blue = feat["hallmark_blue_pixels"]
    h_edges = feat["hallmark_edge_pixels"]
    is_stamp_candidate = (h_blue > 5000 and h_edges > 1000) or (feat["blue_pixels"] > 10000 and h_edges > 2000)
    stamp_blue_score = min(1.0, h_blue / 10000.0)
    stamp_edge_score = min(1.0, h_edges / 3000.0)
    stamp_stroke_score = min(1.0, feat["stroke_density"] / 0.05)
    stamp_white_penalty = max(0.0, 1.0 - feat["white_ratio"] * 50.0)

    if is_stamp_candidate and feat["white_ratio"] < 0.005:
        base_stamp_score = 0.88 + 0.06 * stamp_blue_score + 0.05 * stamp_edge_score
        stamp_rule = "underside_base_stamp_and_hallmark_text"
    elif is_stamp_candidate:
        base_stamp_score = 0.50 + 0.25 * stamp_blue_score + 0.20 * stamp_edge_score
        stamp_rule = "partial_base_or_hallmark_markings"
    else:
        base_stamp_score = 0.05 + 0.15 * stamp_stroke_score
        stamp_rule = "non_base_sculpture_composition"

    scores["BASE_BACKSTAMP"] = (
        round(base_stamp_score, 3),
        {
            "blueMarkScore": round(stamp_blue_score, 3),
            "hallmarkEdgeScore": round(stamp_edge_score, 3),
            "strokeDensity": round(stamp_stroke_score, 3),
            "whitePenalty": round(stamp_white_penalty, 3)
        },
        stamp_rule
    )

    # --- 2. HERO_FRONT ---
    # Full body standing: height_norm > 0.70, bot_norm > 0.80, top_norm < 0.25
    # Centered centroid: cx in [0.44, 0.56]
    # Front facing: balanced skin & hair, dove presence, high sharpness
    is_full_body = (feat["height_norm"] >= 0.70) and (feat["bot_norm"] >= 0.80)
    front_symmetry = feat["symmetry_score"]
    front_centering = max(0.0, 1.0 - abs(feat["cx_norm"] - 0.50) * 4.0)
    front_continuity = min(1.0, feat["height_norm"] / 0.75) if feat["bot_norm"] >= 0.85 else 0.5
    front_sharpness = min(1.0, feat["laplacian_var"] / 30.0)
    front_dove = min(1.0, feat["white_ratio"] / 0.005)

    if is_full_body and front_centering > 0.8 and feat["skin_ratio"] > 0.30 and feat["hair_ratio"] > 0.15:
        hero_score = 0.75 + 0.15 * front_sharpness + 0.08 * front_centering
        hero_rule = "full_body_standing_frontal_symmetry"
    elif is_full_body and front_centering > 0.6:
        hero_score = 0.60 + 0.20 * front_continuity + 0.10 * front_sharpness
        hero_rule = "full_body_standing_near_center"
    else:
        hero_score = 0.20 + 0.30 * front_continuity
        hero_rule = "non_frontal_or_cropped_view"

    scores["HERO_FRONT"] = (
        round(hero_score, 3),
        {
            "verticalContinuity": round(front_continuity, 3),
            "frontalCentering": round(front_centering, 3),
            "sharpness": round(front_sharpness, 3),
            "doveHighlight": round(front_dove, 3)
        },
        hero_rule
    )

    # --- 3. SIDE_PROFILE ---
    # Profile: asymmetrical lateral contour (amphora jar on one side), shifted cx or lateral width
    profile_asymmetry = 1.0 - feat["symmetry_score"]
    profile_cx_offset = min(1.0, abs(feat["cx_norm"] - 0.50) * 5.0)
    profile_bot_cutoff = 1.0 if (feat["bot_norm"] < 0.85 and feat["top_norm"] < 0.15) else 0.5

    if feat["bot_norm"] < 0.85 and feat["top_norm"] < 0.12 and feat["skin_ratio"] > 0.45:
        # e.g. _06.jpg: top 0.06, bot 0.79, amphora profile
        profile_score = 0.88 + 0.08 * profile_asymmetry
        profile_rule = "lateral_silhouette_amphora_profile"
    elif profile_cx_offset > 0.5 and is_full_body:
        profile_score = 0.75 + 0.15 * profile_asymmetry
        profile_rule = "lateral_standing_asymmetrical_profile"
    else:
        profile_score = 0.30 + 0.30 * profile_asymmetry
        profile_rule = "moderate_lateral_contour"

    scores["SIDE_PROFILE"] = (
        round(profile_score, 3),
        {
            "lateralAsymmetry": round(profile_asymmetry, 3),
            "cxOffset": round(profile_cx_offset, 3),
            "profileFraming": round(profile_bot_cutoff, 3)
        },
        profile_rule
    )

    # --- 4. PORTRAIT_TORSO ---
    # Zoomed in crop of upper bust, head, face, and dove
    # Characteristics: top_norm > 0.15 or close-up framing, high upper hair/skin ratio, dove white ratio
    torso_upper_focus = min(1.0, (feat["upper_skin_ratio"] + feat["upper_hair_ratio"]) / 0.8)
    torso_top_offset = min(1.0, feat["top_norm"] / 0.25)
    torso_crop_score = 1.0 if (feat["top_norm"] > 0.18 and feat["bot_norm"] >= 0.95 and feat["height_norm"] < 0.82) else 0.5

    if feat["top_norm"] >= 0.20 and feat["bot_norm"] >= 0.95 and feat["hair_ratio"] > 0.25:
        # e.g. _05.jpg: top 0.24, bot 1.00, hair 38.5%, skin 32.1%
        portrait_score = 0.90 + 0.08 * torso_upper_focus
        portrait_rule = "upper_torso_facial_macro_crop"
    elif feat["upper_skin_ratio"] > 0.60 and feat["top_norm"] >= 0.15:
        portrait_score = 0.78 + 0.12 * torso_upper_focus
        portrait_rule = "bust_and_facial_closeup"
    else:
        portrait_score = 0.25 + 0.30 * torso_upper_focus
        portrait_rule = "wide_or_full_body_crop"

    scores["PORTRAIT_TORSO"] = (
        round(portrait_score, 3),
        {
            "upperBodyFocus": round(torso_upper_focus, 3),
            "topOffset": round(torso_top_offset, 3),
            "cropRatio": round(torso_crop_score, 3)
        },
        portrait_rule
    )

    # --- 5. REAR_SCULPTURE ---
    # Rear view: high hair cascade, drapery striations, absence of front facial skin / low white dove gloss
    # e.g. _10.jpg: hair 31.4%, skin 41.2%, white 0.08%, full body
    rear_hair_score = min(1.0, feat["hair_ratio"] / 0.30)
    rear_low_white = max(0.0, 1.0 - feat["white_ratio"] * 100.0)
    rear_full_view = 1.0 if (feat["height_norm"] >= 0.85 and feat["bot_norm"] >= 0.95) else 0.6

    if is_full_body and feat["hair_ratio"] > 0.25 and feat["white_ratio"] < 0.002 and not is_stamp_candidate:
        rear_score = 0.88 + 0.08 * rear_hair_score
        rear_rule = "rear_drapery_cascades_brick_well"
    elif feat["hair_ratio"] > 0.20 and feat["white_ratio"] < 0.005 and not is_stamp_candidate:
        rear_score = 0.72 + 0.15 * rear_hair_score
        rear_rule = "rear_view_drapery_silhouette"
    else:
        rear_score = 0.20 + 0.30 * rear_hair_score
        rear_rule = "non_rear_facial_features_present"

    scores["REAR_SCULPTURE"] = (
        round(rear_score, 3),
        {
            "hairCascade": round(rear_hair_score, 3),
            "doveAbsence": round(rear_low_white, 3),
            "rearContinuity": round(rear_full_view, 3)
        },
        rear_rule
    )

    return scores


def resolve_angle_assignments(
    all_features: List[Dict[str, Any]],
    overrides: Optional[Dict[str, str]] = None
) -> Tuple[Dict[str, Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Performs optimal 1:1 assignment of images to the 5 canonical angles.
    Supports manual overrides and resolves remaining angles using bipartite matching.
    """
    overrides = overrides or {}
    num_images = len(all_features)
    if num_images < len(CANONICAL_ANGLES):
        raise ClassificationIncompleteError(
            f"Input directory contains only {num_images} images, but at least 5 are required for canonical 5-angle appraisal."
        )

    # Compute score matrix
    score_matrix = np.zeros((num_images, len(CANONICAL_ANGLES)), dtype=float)
    meta_matrix = [[None for _ in range(len(CANONICAL_ANGLES))] for _ in range(num_images)]

    for i, feat in enumerate(all_features):
        scored = score_image_for_angles(feat)
        for j, angle in enumerate(CANONICAL_ANGLES):
            sc, sub_sc, rule = scored[angle]
            score_matrix[i, j] = sc
            meta_matrix[i][j] = (sc, sub_sc, rule)

    assigned_angles = {}
    assigned_img_indices = set()
    assigned_angle_indices = set()

    # Step 1: Apply manual overrides
    for angle, override_filename in overrides.items():
        if angle not in CANONICAL_ANGLES:
            continue
        angle_idx = CANONICAL_ANGLES.index(angle)
        match_idx = None
        for i, feat in enumerate(all_features):
            if feat["filename"] == override_filename or os.path.basename(feat["relativePath"]) == override_filename:
                match_idx = i
                break

        if match_idx is not None:
            feat = all_features[match_idx]
            sc, sub_sc, rule = meta_matrix[match_idx][angle_idx]
            assigned_angles[angle] = {
                "feature": feat,
                "confidence": 1.0,
                "heuristicScores": sub_sc,
                "matchedRule": f"manual_override: {rule}"
            }
            assigned_img_indices.add(match_idx)
            assigned_angle_indices.add(angle_idx)

    # Step 2: Optimal assignment for remaining angles
    remaining_angles = [j for j in range(len(CANONICAL_ANGLES)) if j not in assigned_angle_indices]
    remaining_images = [i for i in range(num_images) if i not in assigned_img_indices]

    if remaining_angles and remaining_images:
        sub_matrix = score_matrix[np.ix_(remaining_images, remaining_angles)]
        # We want maximum score, so minimize -sub_matrix
        if HAS_SCIPY:
            row_ind, col_ind = linear_sum_assignment(-sub_matrix)
            for r, c in zip(row_ind, col_ind):
                img_idx = remaining_images[r]
                ang_idx = remaining_angles[c]
                angle_name = CANONICAL_ANGLES[ang_idx]
                feat = all_features[img_idx]
                sc, sub_sc, rule = meta_matrix[img_idx][ang_idx]
                assigned_angles[angle_name] = {
                    "feature": feat,
                    "confidence": float(sc),
                    "heuristicScores": sub_sc,
                    "matchedRule": rule
                }
                assigned_img_indices.add(img_idx)
        else:
            # Greedy matching fallback
            flat_indices = np.argsort(-sub_matrix, axis=None)
            used_r = set()
            used_c = set()
            for idx in flat_indices:
                r, c = np.unravel_index(idx, sub_matrix.shape)
                if r not in used_r and c not in used_c:
                    used_r.add(r)
                    used_c.add(c)
                    img_idx = remaining_images[r]
                    ang_idx = remaining_angles[c]
                    angle_name = CANONICAL_ANGLES[ang_idx]
                    feat = all_features[img_idx]
                    sc, sub_sc, rule = meta_matrix[img_idx][ang_idx]
                    assigned_angles[angle_name] = {
                        "feature": feat,
                        "confidence": float(sc),
                        "heuristicScores": sub_sc,
                        "matchedRule": rule
                    }
                    assigned_img_indices.add(img_idx)
                    if len(used_c) == len(remaining_angles):
                        break

    # Step 3: Collect unassigned supplementary photos
    unassigned_photos = []
    for i, feat in enumerate(all_features):
        if i not in assigned_img_indices:
            candidates = []
            for j, ang in enumerate(CANONICAL_ANGLES):
                candidates.append({"angle": ang, "score": float(score_matrix[i, j])})
            candidates.sort(key=lambda x: x["score"], reverse=True)

            unassigned_photos.append({
                "filename": feat["filename"],
                "relativePath": feat["relativePath"],
                "catalogRole": "RAW_SUPPLEMENTARY",
                "suggestedAngleTag": f"RAW {len(unassigned_photos) + 6:02d} • 실물 원본 보관",
                "macroRatio": "RAW",
                "topCandidates": candidates[:2]
            })

    return assigned_angles, unassigned_photos


def lookup_product_info(product_id: Optional[str], input_dir: str, item_slug: Optional[str]) -> Dict[str, str]:
    """
    Looks up antique product metadata from antiques.js or generates standard defaults.
    """
    dir_name = os.path.basename(os.path.abspath(input_dir))
    effective_slug = item_slug or ("venus" if "venus" in dir_name else dir_name.split("_")[0])
    effective_id = product_id or f"prod-{effective_slug}"

    info = {
        "id": effective_id,
        "itemSlug": effective_slug,
        "brand": "Lladró",
        "brandCode": "lladro_nao",
        "bookId": "book-1",
        "modelNumber": "2256" if "2256" in effective_id or "venus" in effective_slug else "1001",
        "koreanTitle": "우물가의 비너스와 평화의 비둘기" if "venus" in effective_slug else "앤틱 컬렉션 마스터",
        "materialType": "gres_terracotta" if "gres" in dir_name or "venus" in effective_slug else "fine_porcelain"
    }
    return info


def build_manifest(
    input_dir: str,
    assigned_angles: Dict[str, Dict[str, Any]],
    unassigned_photos: List[Dict[str, Any]],
    product_info: Dict[str, str],
    total_images_scanned: int,
    execution_mode: str = "automated-heuristic-v1"
) -> Dict[str, Any]:
    """
    Builds the complete JSON manifest document complying with the Explorer 3 schema.
    """
    clean_input_dir = input_dir.replace("\\", "/").rstrip("/")
    studio_output_dir = f"{clean_input_dir}/studio_master"
    item_slug = product_info["itemSlug"]

    classified_angles_doc = {}
    confidences = []

    for angle_tag in CANONICAL_ANGLES:
        meta = ANGLE_METADATA[angle_tag]
        assignment = assigned_angles.get(angle_tag)

        if assignment:
            feat = assignment["feature"]
            conf = assignment["confidence"]
            confidences.append(conf)

            target_filename = f"{item_slug}_{meta['outputSuffix']}"
            target_rel_path = f"{studio_output_dir}/{target_filename}"

            angle_doc = {
                "angleIndex": meta["angleIndex"],
                "canonicalTag": meta["canonicalTag"],
                "angleTag": meta["angleTag"],
                "macroRatio": meta["macroRatio"],
                "defaultCaption": meta["defaultCaption"],
                "source": {
                    "filename": feat["filename"],
                    "relativePath": feat["relativePath"],
                    "sha256": feat["sha256"],
                    "fileSizeBytes": feat["fileSizeBytes"],
                    "width": feat["width"],
                    "height": feat["height"],
                    "aspectRatio": feat["aspectRatio"],
                    "exifOrientationApplied": 1
                },
                "targetOutput": {
                    "filename": target_filename,
                    "relativePath": target_rel_path,
                    "targetDimensions": [1400, 1800],
                    "format": "JPEG",
                    "targetQuality": 95
                },
                "classification": {
                    "confidence": conf,
                    "heuristicScores": assignment["heuristicScores"],
                    "matchedRule": assignment["matchedRule"]
                },
                "enhancementDirectives": {
                    "mattingRequired": meta["mattingRequired"],
                    "preserveAuthenticFrame": meta["preserveAuthenticFrame"]
                }
            }

            if meta.get("mattingModel"):
                angle_doc["enhancementDirectives"]["mattingModel"] = meta["mattingModel"]
                angle_doc["enhancementDirectives"]["boundaryMorphology"] = {
                    "erodeSize": 1,
                    "gaussianBlur": 0.5
                }
            if meta.get("backdrop"):
                angle_doc["enhancementDirectives"]["backdrop"] = meta["backdrop"]
            if meta.get("contactShadow"):
                angle_doc["enhancementDirectives"]["contactShadow"] = meta["contactShadow"]
            if meta.get("textureEnhancement"):
                angle_doc["enhancementDirectives"]["textureEnhancement"] = meta["textureEnhancement"]
            if meta.get("frameVignette"):
                angle_doc["enhancementDirectives"]["frameVignette"] = meta["frameVignette"]

            classified_angles_doc[angle_tag] = angle_doc

    overall_confidence = float(np.mean(confidences)) if confidences else 0.0
    all_found = len(classified_angles_doc) == len(CANONICAL_ANGLES)

    # Validation section
    missing_angles = [a for a in CANONICAL_ANGLES if a not in classified_angles_doc]
    assigned_files = [classified_angles_doc[a]["source"]["filename"] for a in classified_angles_doc]
    duplicate_files = [f for f in set(assigned_files) if assigned_files.count(f) > 1]

    warnings = []
    if overall_confidence < 0.80:
        warnings.append("Overall classification confidence is below 0.80")
    for a, doc in classified_angles_doc.items():
        if doc["classification"]["confidence"] < 0.60:
            warnings.append(f"Low confidence ({doc['classification']['confidence']}) for angle {a}")

    is_valid = (len(missing_angles) == 0) and (len(duplicate_files) == 0)

    manifest = {
        "$schema": "https://labellejean.antique/schemas/v1/classification_manifest.json",
        "version": "1.0.0",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "pipeline": {
            "name": "antique-5angle-classifier",
            "version": "1.0.0",
            "executionMode": execution_mode
        },
        "product": product_info,
        "directories": {
            "sourceDir": clean_input_dir,
            "studioMasterOutputDir": studio_output_dir,
            "catalogAssetDir": f"public/assets/{product_info.get('brandCode', 'antique')}"
        },
        "summary": {
            "totalScannedImages": total_images_scanned,
            "classifiedAnglesCount": len(classified_angles_doc),
            "unassignedImagesCount": len(unassigned_photos),
            "allCanonicalAnglesFound": all_found,
            "overallConfidence": round(overall_confidence, 3),
            "validationStatus": "VALID" if is_valid else ("WARNING" if all_found else "INVALID")
        },
        "classifiedAngles": classified_angles_doc,
        "unassignedPhotos": unassigned_photos,
        "validation": {
            "isValid": is_valid,
            "requiredAnglesPresent": [a for a in CANONICAL_ANGLES if a in classified_angles_doc],
            "missingAngles": missing_angles,
            "duplicateAssignments": duplicate_files,
            "warnings": warnings
        }
    }

    return manifest


def ingest_and_classify(
    input_dir: str,
    output_manifest: Optional[str] = None,
    product_id: Optional[str] = None,
    item_slug: Optional[str] = None,
    override_json: Optional[str] = None,
    strict: bool = True,
    normalize_exif: bool = True,
    dry_run: bool = False
) -> Dict[str, Any]:
    """
    Main orchestration routine for photo ingestion and 5-angle classification.
    """
    if not os.path.exists(input_dir):
        raise FileNotFoundError(f"Input directory does not exist: {input_dir}")

    # Gather image files
    valid_exts = {".jpg", ".jpeg", ".png", ".webp"}
    image_files = sorted([
        os.path.join(input_dir, f)
        for f in os.listdir(input_dir)
        if os.path.isfile(os.path.join(input_dir, f)) and os.path.splitext(f)[1].lower() in valid_exts
    ])

    if len(image_files) < len(CANONICAL_ANGLES):
        err_msg = f"Insufficient photos found in {input_dir} ({len(image_files)} found, minimum 5 required)."
        if strict:
            raise ClassificationIncompleteError(err_msg)

    # Load manual overrides if specified
    overrides = {}
    execution_mode = "automated-heuristic-v1"
    if override_json:
        if os.path.exists(override_json):
            with open(override_json, "r", encoding="utf-8") as f:
                overrides = json.load(f)
            execution_mode = "manual-override-v1"
        else:
            raise FileNotFoundError(f"Override JSON file not found: {override_json}")

    # Extract features for all images
    all_features = []
    for fpath in image_files:
        feat = extract_features(fpath, normalize_exif=normalize_exif)
        all_features.append(feat)

    # Resolve 5-angle assignments
    assigned_angles, unassigned_photos = resolve_angle_assignments(all_features, overrides=overrides)

    # Lookup metadata
    product_info = lookup_product_info(product_id, input_dir, item_slug)

    # Build manifest
    manifest = build_manifest(
        input_dir=input_dir,
        assigned_angles=assigned_angles,
        unassigned_photos=unassigned_photos,
        product_info=product_info,
        total_images_scanned=len(image_files),
        execution_mode=execution_mode
    )

    # Check strict validation
    if strict and not manifest["validation"]["isValid"]:
        missing = manifest["validation"]["missingAngles"]
        dups = manifest["validation"]["duplicateAssignments"]
        raise ClassificationIncompleteError(
            f"Strict classification validation failed. Missing: {missing}, Duplicates: {dups}"
        )

    # Save manifest unless dry-run
    if not dry_run:
        target_path = output_manifest or os.path.join(input_dir, "classification_manifest.json")
        os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)

    return manifest


def main():
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    parser = argparse.ArgumentParser(
        description="Ingest and classify antique collection photography into Sotheby's 5 canonical appraisal angles."
    )
    parser.add_argument("-i", "--input-dir", required=True, help="Directory containing raw photo collection")
    parser.add_argument("-o", "--output-manifest", default=None, help="Output classification manifest JSON path")
    parser.add_argument("-p", "--product-id", default=None, help="Product catalog ID (e.g. prod-lladro-gres-2256-venus)")
    parser.add_argument("-s", "--item-slug", default=None, help="Item slug prefix (e.g. venus)")
    parser.add_argument("-t", "--target-dir", default=None, help="Optional staging directory")
    parser.add_argument("-m", "--override-json", default=None, help="Path to JSON file specifying manual angle overrides")
    parser.add_argument("--strict", action="store_true", default=True, help="Enforce strict validation (default: True)")
    parser.add_argument("--no-strict", action="store_false", dest="strict", help="Disable strict validation")
    parser.add_argument("--normalize-exif", action="store_true", default=True, help="Auto-rotate upright using EXIF (default: True)")
    parser.add_argument("--no-normalize-exif", action="store_false", dest="normalize_exif", help="Disable EXIF rotation")
    parser.add_argument("--dry-run", action="store_true", default=False, help="Compute without writing files")
    parser.add_argument("--json", action="store_true", default=False, help="Print clean JSON output to stdout")

    args = parser.parse_args()

    try:
        manifest = ingest_and_classify(
            input_dir=args.input_dir,
            output_manifest=args.output_manifest,
            product_id=args.product_id,
            item_slug=args.item_slug,
            override_json=args.override_json,
            strict=args.strict,
            normalize_exif=args.normalize_exif,
            dry_run=args.dry_run
        )

        if args.json:
            print(json.dumps(manifest, indent=2, ensure_ascii=False))
        else:
            print("=" * 80)
            print(f"5-ANGLE CLASSIFICATION MANIFEST -- {manifest['product']['id']}")
            print("=" * 80)
            print(f"Total Scanned: {manifest['summary']['totalScannedImages']} | Classified: {manifest['summary']['classifiedAnglesCount']} | Confidence: {manifest['summary']['overallConfidence']:.3f}")
            print("-" * 80)
            for angle_tag, doc in manifest["classifiedAngles"].items():
                src = doc["source"]["filename"]
                conf = doc["classification"]["confidence"]
                out = doc["targetOutput"]["filename"]
                rule = doc["classification"]["matchedRule"]
                print(f"[{doc['angleIndex']}] {angle_tag:<16} -> {src:<36} (Conf: {conf:.2f}, Rule: {rule}) -> {out}")
            print("-" * 80)
            print(f"Validation Status: {manifest['summary']['validationStatus']}")
            if not args.dry_run:
                out_path = args.output_manifest or os.path.join(args.input_dir, 'classification_manifest.json')
                print(f"Manifest written to: {out_path}")
            print("=" * 80)
        sys.exit(0)

    except ClassificationIncompleteError as e:
        sys.stderr.write(f"CLASSIFICATION ERROR: {e}\n")
        sys.exit(1)
    except Exception as e:
        sys.stderr.write(f"SYSTEM ERROR: {e}\n")
        sys.exit(2)


if __name__ == "__main__":
    main()
