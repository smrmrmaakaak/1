import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import VerticalPhotoGallery from "./VerticalPhotoGallery";

// 1. High-Res Canvas Texture for Left Folio (Lore & Text with Real Vintage Parchment)
function drawLeftFolioCanvas(book, spreadIndex, loadedParchmentImg = null) {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  // Real Aged Parchment Photo or Gradient Fallback
  if (loadedParchmentImg && loadedParchmentImg.complete && loadedParchmentImg.naturalWidth > 0) {
    ctx.drawImage(loadedParchmentImg, 0, 0, canvas.width, canvas.height);
    // Soft creamy ivory vellum wash to keep manuscript text razor sharp while preserving fibers & aging
    ctx.fillStyle = "rgba(248, 243, 230, 0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#e8dcbd");
    grad.addColorStop(0.08, "#f7f1e1");
    grad.addColorStop(0.92, "#f4ecda");
    grad.addColorStop(1, "#ded0b0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(90, 60, 25, 0.035)";
    for (let i = 0; i < 9000; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      ctx.fillRect(rx, ry, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }
  }

  // Gold Leaf Borders
  ctx.strokeStyle = "rgba(180, 140, 50, 0.85)";
  ctx.lineWidth = 10;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.65)";
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

  // Corner Fleurons
  ctx.fillStyle = "#8c6a23";
  ctx.font = "40px 'Cinzel Decorative', serif";
  ctx.fillText("⚜", 100, 125);
  ctx.fillText("⚜", canvas.width - 140, 125);
  ctx.fillText("⚜", 100, canvas.height - 100);
  ctx.fillText("⚜", canvas.width - 140, canvas.height - 100);

  const folioNum = spreadIndex * 2 + 1;
  const products = book.products || [];
  const isFinalCert = spreadIndex >= products.length;
  const product = products[spreadIndex] || products[0];

  // Header Line
  ctx.fillStyle = "#8c6a23";
  ctx.font = "bold 28px 'Cinzel', serif";
  ctx.fillText(`FOLIO ${folioNum}`, 140, 160);

  ctx.fillStyle = "#a62a1e";
  ctx.font = "bold 26px 'Cinzel', serif";
  ctx.textAlign = "right";
  if (isFinalCert) {
    ctx.fillText(`CAPUT ${spreadIndex + 1} • 황실 공인 감정 보증서`, canvas.width - 140, 160);
  } else {
    ctx.fillText(`CAPUT ${spreadIndex + 1} • ${product.itemNumber} • ${book.brandName}`, canvas.width - 140, 160);
  }
  ctx.textAlign = "left";

  // Divider
  ctx.strokeStyle = "rgba(140, 105, 55, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 190);
  ctx.lineTo(canvas.width - 140, 190);
  ctx.stroke();

  if (!isFinalCert) {
    // PRODUCT SPREAD: Left Folio (Title, Lore, Specs)
    ctx.fillStyle = "#0f0703";
    ctx.font = "bold 60px 'Noto Serif KR', serif";
    ctx.fillText(product.name, 140, 275);

    ctx.fillStyle = "#78521a";
    ctx.font = "italic 32px 'Cinzel', serif";
    ctx.fillText(product.latinName, 140, 330);

    ctx.fillStyle = "#3d2b1a";
    ctx.font = "600 26px 'Noto Serif KR', serif";
    ctx.fillText(`제작 연대: ${product.era} • 공방: ${book.origin}`, 140, 375);

    ctx.fillStyle = "#8c6a23";
    ctx.fillRect(140, 405, canvas.width - 280, 4);

    // Lore Body
    ctx.fillStyle = "#1a0f07";
    ctx.font = "600 31px/1.85 'Noto Serif KR', serif";
    wrapText(ctx, product.lore, 140, 470, canvas.width - 280, 54);

    // Structura & Material Specs Box
    ctx.fillStyle = "rgba(140, 105, 55, 0.12)";
    ctx.fillRect(140, 1080, canvas.width - 280, 660);
    ctx.strokeStyle = "#8c6a23";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(140, 1080, canvas.width - 280, 660);
    ctx.fillStyle = "#8c6a23";
    ctx.fillRect(140, 1080, 8, 660);

    ctx.fillStyle = "#a62a1e";
    ctx.font = "bold 28px 'Cinzel', serif";
    ctx.fillText("✦ STRUCTURA & SPECIFICATIO (재질 및 구조)", 170, 1140);

    const specRows = [
      { label: "원천 재질", val: product.materials },
      { label: "규격 중량", val: product.dimensions },
      { label: "보존 등급", val: product.appraisalGrade },
      { label: "소장 안내", val: "상세 사진 터치 시 하단에 감정가 & 예약 확인" }
    ];

    specRows.forEach((s, idx) => {
      const y = 1200 + idx * 125;
      ctx.fillStyle = "#6a4e32";
      ctx.font = "24px 'Noto Serif KR', serif";
      ctx.fillText(s.label, 170, y + 30);

      ctx.fillStyle = "#1a0f05";
      ctx.font = "bold 26px 'Noto Serif KR', serif";
      wrapText(ctx, s.val, 360, y + 30, canvas.width - 520, 36);

      if (idx < specRows.length - 1) {
        ctx.strokeStyle = "rgba(140, 105, 55, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(170, y + 85);
        ctx.lineTo(canvas.width - 170, y + 85);
        ctx.stroke();
      }
    });
  } else {
    // FINAL SPREAD: Brand Master Certification
    ctx.fillStyle = "#0f0703";
    ctx.font = "bold 58px 'Noto Serif KR', serif";
    ctx.fillText("황실 공인 브랜드 도감 감정 보증서", 140, 275);

    ctx.fillStyle = "#78521a";
    ctx.font = "italic 32px 'Cinzel', serif";
    ctx.fillText("SIGILLUM VERITATIS & ARCHIVUM IMPERIALE", 140, 330);

    ctx.fillStyle = "#8c6a23";
    ctx.fillRect(140, 370, canvas.width - 280, 4);

    // Cert Lore
    ctx.fillStyle = "#1a0f07";
    ctx.font = "600 30px/1.85 'Noto Serif KR', serif";
    wrapText(
      ctx,
      `본 황실 도감에 수록된 ${book.brandName}의 모든 성물은 14~16세기 당대 공방 길드의 정통 비전과 원천 재질 및 물리적 보존 상태에 대해 황실 문화재 수석 감정원의 엄격한 비파괴 정밀 검증을 거쳤음을 영구 보증합니다. 각 성물의 상세 감정가 및 프라이빗 뷰잉 소장 예약은 개별 성물 상세 사진 룩북 하단에서 확인하실 수 있습니다.`,
      140,
      430,
      canvas.width - 280,
      54
    );

    // Certificate Table
    ctx.fillStyle = "rgba(140, 105, 55, 0.08)";
    ctx.fillRect(140, 1050, canvas.width - 280, 690);
    ctx.strokeStyle = "#8c6a23";
    ctx.lineWidth = 3;
    ctx.strokeRect(140, 1050, canvas.width - 280, 690);

    const rows = [
      { label: "감정 일자", val: "서기 2026년 8월 31일" },
      { label: "브랜드 공방", val: book.brandName },
      { label: "수록 성물 수", val: `총 ${products.length}종 전 품목 완질 수록` },
      { label: "소장 안내", val: "상세 사진 룩북 하단에서 감정가 및 예약 확인" },
      { label: "공식 등록 번호", val: `ANT-IMPERIAL-${book.heroYear}-099` }
    ];

    rows.forEach((r, idx) => {
      const y = 1100 + idx * 110;
      ctx.fillStyle = "#6a4e32";
      ctx.font = "24px 'Noto Serif KR', serif";
      ctx.fillText(r.label, 170, y + 35);

      ctx.fillStyle = "#1a0f05";
      ctx.font = "bold 28px 'Noto Serif KR', serif";
      ctx.fillText(r.val, 480, y + 35);

      if (idx < rows.length - 1) {
        ctx.strokeStyle = "rgba(140, 105, 55, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(170, y + 70);
        ctx.lineTo(canvas.width - 170, y + 70);
        ctx.stroke();
      }
    });

    // Signatures
    ctx.fillStyle = "#a62a1e";
    ctx.font = "italic 32px 'Cinzel Decorative', serif";
    ctx.fillText("Archivarius Maximus", 170, 1680);

    ctx.fillStyle = "#8c6a23";
    ctx.font = "bold 24px 'Cinzel', serif";
    ctx.textAlign = "right";
    ctx.fillText("SIGILLUM VERITATIS", canvas.width - 170, 1680);
    ctx.textAlign = "left";
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

// 2. High-Res Canvas Texture for Right Folio
function drawRightFolioCanvas(book, spreadIndex, loadedImage = null, loadedParchmentImg = null) {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  // Real Aged Parchment Photo or Gradient Fallback
  if (loadedParchmentImg && loadedParchmentImg.complete && loadedParchmentImg.naturalWidth > 0) {
    ctx.drawImage(loadedParchmentImg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(248, 243, 230, 0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#ded0b0");
    grad.addColorStop(0.08, "#f4ecda");
    grad.addColorStop(0.92, "#f7f1e1");
    grad.addColorStop(1, "#e8dcbd");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(90, 60, 25, 0.035)";
    for (let i = 0; i < 9000; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      ctx.fillRect(rx, ry, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }
  }

  // Gold Borders
  ctx.strokeStyle = "rgba(180, 140, 50, 0.75)";
  ctx.lineWidth = 10;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

  // Corner Fleurons
  ctx.fillStyle = "#8c6a23";
  ctx.font = "40px 'Cinzel Decorative', serif";
  ctx.fillText("⚜", 100, 125);
  ctx.fillText("⚜", canvas.width - 140, 125);
  ctx.fillText("⚜", 100, canvas.height - 100);
  ctx.fillText("⚜", canvas.width - 140, canvas.height - 100);

  const folioNum = spreadIndex * 2 + 2;
  const products = book.products || [];
  const isFinalCert = spreadIndex >= products.length;
  const product = products[spreadIndex] || products[0];

  // Header Line
  ctx.fillStyle = "#8c6a23";
  ctx.font = "bold 28px 'Cinzel', serif";
  ctx.fillText(`FOLIO ${folioNum}`, 140, 160);

  ctx.fillStyle = "#a62a1e";
  ctx.font = "bold 26px 'Cinzel', serif";
  ctx.textAlign = "right";
  if (isFinalCert) {
    ctx.fillText("SIGILLUM CERAE • 붉은 밀랍 인장", canvas.width - 140, 160);
  } else {
    ctx.fillText(`VISIO ARTEFACTI • ${product.itemNumber} 실물 화보`, canvas.width - 140, 160);
  }
  ctx.textAlign = "left";

  // Divider
  ctx.strokeStyle = "rgba(140, 105, 55, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 190);
  ctx.lineTo(canvas.width - 140, 190);
  ctx.stroke();

  if (!isFinalCert) {
    // PRODUCT SPREAD: Right Folio (Large Photo + Gallery Trigger + Highlights)
    ctx.fillStyle = "#110d08";
    ctx.fillRect(140, 230, canvas.width - 280, 800);
    ctx.strokeStyle = "#8c6a23";
    ctx.lineWidth = 4;
    ctx.strokeRect(140, 230, canvas.width - 280, 800);

    if (loadedImage && loadedImage.complete && loadedImage.naturalWidth > 0) {
      try {
        ctx.drawImage(loadedImage, 140, 230, canvas.width - 280, 800);
      } catch (e) {}
    } else {
      ctx.fillStyle = "#22150a";
      ctx.fillRect(140, 230, canvas.width - 280, 800);
      ctx.fillStyle = "#f5d77f";
      ctx.font = "bold 44px 'Cinzel', serif";
      ctx.textAlign = "center";
      ctx.fillText(`⚜ ${product.name}`, canvas.width / 2, 600);
      ctx.textAlign = "left";
    }

    // Photo Clickable Ribbon Banner (Calls Vertical Gallery)
    ctx.fillStyle = "rgba(22, 14, 8, 0.92)";
    ctx.fillRect(140, 930, canvas.width - 280, 100);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.strokeRect(140, 930, canvas.width - 280, 100);

    ctx.fillStyle = "#f5d77f";
    ctx.font = "bold 28px 'Noto Serif KR', serif";
    ctx.textAlign = "center";
    ctx.fillText(`🔍 사진 터치 시 세로형 고화질 갤러리 열림 (${product.galleryPhotos?.length || 4}장) ➔`, canvas.width / 2, 990);
    ctx.textAlign = "left";

    // Specs Badges
    product.specs?.forEach((h, idx) => {
      const y = 1070 + idx * 115;
      ctx.fillStyle = "rgba(140, 105, 55, 0.08)";
      ctx.fillRect(140, y, canvas.width - 280, 95);
      ctx.fillStyle = "#8c6a23";
      ctx.fillRect(140, y, 6, 95);

      ctx.fillStyle = "#6a4e32";
      ctx.font = "24px 'Noto Serif KR', serif";
      ctx.fillText(h.label, 170, y + 42);

      ctx.fillStyle = "#1a0f05";
      ctx.font = "bold 28px 'Noto Serif KR', serif";
      ctx.fillText(h.value, 170, y + 78);
    });

    // Advance Action Bar
    ctx.fillStyle = "#2b1f14";
    ctx.fillRect(140, 1600, canvas.width - 280, 95);
    ctx.strokeStyle = "#8c6a23";
    ctx.lineWidth = 3;
    ctx.strokeRect(140, 1600, canvas.width - 280, 95);

    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 28px 'Cinzel', serif";
    ctx.textAlign = "center";
    const nextItem = products[spreadIndex + 1];
    if (nextItem) {
      ctx.fillText(`❧ 다음 성물 (${nextItem.itemNumber} • ${nextItem.name}) ➔`, canvas.width / 2, 1660);
    } else {
      ctx.fillText("❧ 황실 공인 감정서 & 밀랍 인장 보기 ➔", canvas.width / 2, 1660);
    }
    ctx.textAlign = "left";
  } else {
    // FINAL SPREAD: Wax Seal
    ctx.fillStyle = "#181008";
    ctx.fillRect(140, 230, canvas.width - 280, 600);
    ctx.strokeStyle = "#8c6a23";
    ctx.lineWidth = 4;
    ctx.strokeRect(140, 230, canvas.width - 280, 600);

    const cx = canvas.width / 2;
    const cy = 530;

    // Red wax seal
    ctx.fillStyle = "#80120a";
    ctx.beginPath();
    ctx.arc(cx, cy, 190, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#a81c12";
    ctx.beginPath();
    ctx.arc(cx, cy, 165, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 135, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#f5d77f";
    ctx.font = "bold 100px 'Cinzel Decorative', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚜", cx, cy);

    ctx.fillStyle = "#f5d77f";
    ctx.font = "bold 24px 'Cinzel', serif";
    ctx.fillText("ARCHIVUM IMPERIALE", cx, cy + 90);

    // Vault Accession Box
    ctx.fillStyle = "rgba(140, 105, 55, 0.08)";
    ctx.fillRect(140, 900, canvas.width - 280, 640);
    ctx.strokeStyle = "#8c6a23";
    ctx.lineWidth = 2;
    ctx.strokeRect(140, 900, canvas.width - 280, 640);

    ctx.fillStyle = "#a62a1e";
    ctx.font = "bold 28px 'Cinzel', serif";
    ctx.textAlign = "left";
    ctx.fillText("✦ BRAND MASTER ACCESSION RECORD", 170, 960);

    const vaultInfo = [
      { label: "수장고 격벽", val: "Sanctum Imperialis (항온 항습 18°C 45%)" },
      { label: "보안 등급", val: "Class-I (황실 수석 학예관 전용)" },
      { label: "디지털 블록체인 검증", val: "0x8F9C...7B12 (불변 원장 기록)" },
      { label: "소유권 상태", val: "단독 독점 전시 라이선스 확보" }
    ];

    vaultInfo.forEach((v, idx) => {
      const y = 1020 + idx * 115;
      ctx.fillStyle = "#6a4e32";
      ctx.font = "24px 'Noto Serif KR', serif";
      ctx.fillText(v.label, 170, y + 30);

      ctx.fillStyle = "#1a0f05";
      ctx.font = "bold 28px 'Noto Serif KR', serif";
      ctx.fillText(v.val, 170, y + 72);
    });

    ctx.fillStyle = "#2b1f14";
    ctx.fillRect(140, 1600, canvas.width - 280, 95);
    ctx.strokeStyle = "#8c6a23";
    ctx.lineWidth = 3;
    ctx.strokeRect(140, 1600, canvas.width - 280, 95);

    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 28px 'Cinzel', serif";
    ctx.textAlign = "center";
    ctx.fillText("❧ 도감 열람 완료 (책 덮기) ✕", canvas.width / 2, 1660);
    ctx.textAlign = "left";
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// 3. Leather Cover Textures with Realistic Deep Embossing / Debossing (형압/불박)
function createCoverTexture(isInside, book, loadedLeatherImg = null) {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  if (isInside) {
    // Solid vintage endpaper lining
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#d8c5a2");
    grad.addColorStop(0.5, "#e6d7b9");
    grad.addColorStop(1, "#ceb994");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(140, 105, 55, 0.45)";
    ctx.lineWidth = 8;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
  }

  // A. Real Vintage Leather Background
  if (loadedLeatherImg && loadedLeatherImg.complete && loadedLeatherImg.naturalWidth > 0) {
    ctx.drawImage(loadedLeatherImg, 0, 0, canvas.width, canvas.height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
  } else {
    ctx.fillStyle = book.themeColor || "#2b1408";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // B. Micro Leather Pore Texture
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  for (let i = 0; i < 40000; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    ctx.fillRect(rx, ry, Math.random() * 3 + 1, Math.random() * 3 + 1);
  }
  ctx.fillStyle = "rgba(255, 235, 170, 0.09)";
  for (let i = 0; i < 20000; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
  }

  // C. Deeply Debossed Outer Grooves & Raised Gold Foil Framing
  ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
  ctx.lineWidth = 20;
  ctx.strokeRect(74, 74, canvas.width - 148, canvas.height - 148);

  ctx.strokeStyle = "#fff0a8";
  ctx.lineWidth = 4;
  ctx.strokeRect(66, 66, canvas.width - 132, canvas.height - 132);

  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 14;
  ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
  ctx.lineWidth = 6;
  ctx.strokeRect(102, 102, canvas.width - 204, canvas.height - 204);

  ctx.strokeStyle = "#f3cf65";
  ctx.lineWidth = 3;
  ctx.strokeRect(98, 98, canvas.width - 196, canvas.height - 196);

  // Corner Rosettes
  const corners = [
    [130, 130],
    [canvas.width - 130, 130],
    [130, canvas.height - 130],
    [canvas.width - 130, canvas.height - 130]
  ];
  corners.forEach(([cornerX, cornerY]) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    ctx.font = "bold 60px 'Cinzel Decorative', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚜", cornerX + 4, cornerY + 4);
    ctx.fillStyle = "#fff2b2";
    ctx.fillText("⚜", cornerX - 2, cornerY - 2);
    ctx.fillStyle = "#ffd769";
    ctx.fillText("⚜", cornerX, cornerY);
  });

  // Top Header Header Ribbon
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.font = "bold 36px 'Cinzel', serif";
  ctx.textAlign = "left";
  ctx.fillText(book.tomeNumber || "LIBER I", 120, 180);
  ctx.fillStyle = "#f5d77f";
  ctx.fillText(book.tomeNumber || "LIBER I", 118, 178);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.fillText(`${book.heroYear || "1482"} A.D.`, canvas.width - 120, 180);
  ctx.fillStyle = "#f5d77f";
  ctx.fillText(`${book.heroYear || "1482"} A.D.`, canvas.width - 122, 178);

  // D. Stamped Central Medallion
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 - 120;

  ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(cx + 5, cy + 5, 260, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#fff0a8";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx - 2, cy - 2, 260, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, 260, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx + 3, cy + 3, 220, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#f3cf65";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 220, 0, Math.PI * 2);
  ctx.stroke();

  // Central Emblem Glyph
  const emblemChar = book.coverEmboss === "cross" ? "✠" :
                     book.coverEmboss === "crown" ? "👑" :
                     book.coverEmboss === "seal" ? "⚗" : "⚜";

  ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
  ctx.font = "bold 150px 'Cinzel Decorative', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emblemChar, cx + 6, cy + 14);

  ctx.fillStyle = "#fff8d6";
  ctx.fillText(emblemChar, cx - 3, cy + 7);

  ctx.fillStyle = "#ffd769";
  ctx.fillText(emblemChar, cx, cy + 10);

  // E. Gilded Embossed Pure Latin Typography (100% Matching BookCard)
  const latinTitle = book.brandLatin || book.latinTitle || "OFFICINA REGIOMONTANI";
  const latinSub = book.latinSubtitle || "Norimberga · AD 1482";
  const badgeLatin = book.badgeLatin || "Norimberga Guild";

  // Main Latin Title
  ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
  ctx.font = "bold 78px 'Cinzel Decorative', 'Cinzel', serif";
  ctx.fillText(latinTitle, cx + 5, cy + 425);
  ctx.fillStyle = "#fff5cc";
  ctx.fillText(latinTitle, cx - 2, cy + 418);
  ctx.fillStyle = "#ffd769";
  ctx.fillText(latinTitle, cx, cy + 420);

  // Gold Rule Divider
  ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 240, cy + 482);
  ctx.lineTo(cx + 240, cy + 482);
  ctx.stroke();

  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 240, cy + 480);
  ctx.lineTo(cx + 240, cy + 480);
  ctx.stroke();

  // Latin Subtitle
  ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
  ctx.font = "italic 44px 'Cormorant Garamond', 'Cinzel', serif";
  ctx.fillText(latinSub, cx + 4, cy + 542);
  ctx.fillStyle = "#fff8d6";
  ctx.fillText(latinSub, cx - 2, cy + 537);
  ctx.fillStyle = "#ffe28a";
  ctx.fillText(latinSub, cx, cy + 539);

  // Bottom Status Bar
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.font = "bold 32px 'Cinzel', serif";
  ctx.fillText(badgeLatin, 120, canvas.height - 130);
  ctx.fillStyle = "#d4af37";
  ctx.fillText(badgeLatin, 118, canvas.height - 132);

  const tomeStr = (book.tomeNumber || "TOMUS I").toUpperCase();
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.fillText(tomeStr, canvas.width - 120, canvas.height - 130);
  ctx.fillStyle = "#d4af37";
  ctx.fillText(tomeStr, canvas.width - 122, canvas.height - 132);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export default function ThreeDRealBookViewer({ book, onClose }) {
  const mountRef = useRef(null);
  const containerRef = useRef(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  const [isFlippingPage, setIsFlippingPage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeGalleryProduct, setActiveGalleryProduct] = useState(null);

  const products = useMemo(() => book.products || [], [book]);
  // Total Spreads = Number of Products + 1 Certification Spread
  const totalSpreads = products.length + 1;

  const threeStateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    bookGroup: null,
    frontCoverPivot: null,
    leftPageMesh: null,
    rightPageMesh: null,
    turningPageMesh: null,
    turningPageGeo: null,
    turningPageInitialPos: null,
    leftPageMat: null,
    rightPageMat: null,
    turningPageFrontMat: null,
    turningPageBackMat: null,
    fanPages: [],
    openStartTime: 0,
    openDuration: 650,
    isOpening: true,
    isClosing: false,
    closeStartTime: 0,
    closeDuration: 550,
    flipStartTime: 0,
    flipDuration: 450,
    isFlipping: false,
    flipDirection: 1,
    currentSpreadIndex: 0,
    targetSpreadIndex: 0,
    isUserDragging: false,
    dragProgress: 0,
    dragStartX: 0,
    dragStartY: 0,
    dragStartTime: 0,
    dragDirection: 1,
    dragPointerId: null
  });

  // Preloaded Product Images cache
  const loadedProductImgsRef = useRef([]);
  const leatherImgRef = useRef(null);
  const parchmentImgRef = useRef(null);

  useEffect(() => {
    // Preload all product images and update texture on load
    loadedProductImgsRef.current = products.map((p, idx) => {
      const img = new Image();
      img.src = p.mainImage || "/artifacts/astrolabe_main.jpg";
      img.onload = () => {
        const state = threeStateRef.current;
        if (state && state.rightPageMat && state.currentSpreadIndex === idx) {
          state.rightPageMat.map = drawRightFolioCanvas(book, idx, img, parchmentImgRef.current);
          state.rightPageMat.needsUpdate = true;
        }
      };
      return img;
    });

    // Preload vintage leather cover texture
    const lImg = new Image();
    lImg.src = book.coverTextureUrl || "/assets/textures/leather_brown.jpg";
    lImg.onload = () => {
      leatherImgRef.current = lImg;
      const state = threeStateRef.current;
      if (state && state.coverExtMat) {
        state.coverExtMat.map = createCoverTexture(false, book, lImg);
        state.coverExtMat.bumpMap = state.coverExtMat.map;
        state.coverExtMat.needsUpdate = true;
      }
    };
    leatherImgRef.current = lImg;

    // Preload vintage aged parchment texture
    const pImg = new Image();
    pImg.src = "/assets/textures/parchment_page.jpg";
    pImg.onload = () => {
      parchmentImgRef.current = pImg;
      const state = threeStateRef.current;
      if (state && state.leftPageMat && state.rightPageMat) {
        const prodImg = getImageForSpread(state.currentSpreadIndex || 0);
        state.leftPageMat.map = drawLeftFolioCanvas(book, state.currentSpreadIndex || 0, pImg);
        state.rightPageMat.map = drawRightFolioCanvas(book, state.currentSpreadIndex || 0, prodImg, pImg);
        state.leftPageMat.needsUpdate = true;
        state.rightPageMat.needsUpdate = true;
      }
    };
    parchmentImgRef.current = pImg;
  }, [products, book]);

  const getImageForSpread = useCallback((spreadIdx) => {
    if (spreadIdx < loadedProductImgsRef.current.length) {
      return loadedProductImgsRef.current[spreadIdx];
    }
    return null;
  }, []);

  // Helper to calculate responsive camera position
  const updateCameraResponsive = useCallback((camera, width, height) => {
    const aspect = width / height;
    const pageWidth = 1.45;
    const totalBookWidth = pageWidth * 2; // 2.90
    const totalBookHeight = 1.95;

    // Calculate required distance so the entire open book is fully visible with margin
    const vFovRad = THREE.MathUtils.degToRad(34);
    const halfTan = Math.tan(vFovRad / 2);

    // Height fit
    const distForHeight = (totalBookHeight / (2 * halfTan)) * 1.18;
    // Width fit
    const distForWidth = (totalBookWidth / (2 * halfTan * aspect)) * 1.15;

    const targetZ = Math.max(4.4, Math.max(distForHeight, distForWidth));
    camera.position.set(0, 0, targetZ);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    updateCameraResponsive(camera, width, height);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 3. Studio Lights
    const ambient = new THREE.AmbientLight(0xffecd0, 1.2);
    scene.add(ambient);

    const mainSpot = new THREE.SpotLight(0xfff2d6, 4.5);
    mainSpot.position.set(2.5, 5.5, 4.5);
    mainSpot.angle = Math.PI / 3.5;
    mainSpot.penumbra = 0.5;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 2048;
    mainSpot.shadow.mapSize.height = 2048;
    scene.add(mainSpot);

    const goldFill = new THREE.DirectionalLight(0xe5c158, 2.0);
    goldFill.position.set(-3.5, 3.5, 2.5);
    scene.add(goldFill);

    const candlePoint = new THREE.PointLight(0xff9933, 1.4, 8);
    candlePoint.position.set(0, -2, 2.5);
    scene.add(candlePoint);

    // 4. 3D Book Construction
    const bookGroup = new THREE.Group();
    scene.add(bookGroup);

    const pageWidth = 1.45;
    const pageHeight = 1.95;

    // Cover Textures
    const coverExtTex = createCoverTexture(false, book);
    const coverInsideTex = createCoverTexture(true, book);

    const coverExtMat = new THREE.MeshStandardMaterial({
      map: coverExtTex,
      bumpMap: coverExtTex,
      bumpScale: 0.04,
      roughness: 0.45,
      metalness: 0.2,
      transparent: false,
      opacity: 1.0
    });

    const coverInsideMat = new THREE.MeshStandardMaterial({
      map: coverInsideTex,
      roughness: 0.65,
      transparent: false,
      opacity: 1.0
    });

    const initImg = getImageForSpread(0);
    const leftPageTex = drawLeftFolioCanvas(book, 0);
    const rightPageTex = drawRightFolioCanvas(book, 0, initImg);

    const leftPageMat = new THREE.MeshStandardMaterial({ map: leftPageTex, roughness: 0.68 });
    const rightPageMat = new THREE.MeshStandardMaterial({ map: rightPageTex, roughness: 0.68 });

    const turningPageFrontMat = new THREE.MeshStandardMaterial({ map: rightPageTex, roughness: 0.68, side: THREE.DoubleSide });
    const turningPageBackMat = new THREE.MeshStandardMaterial({ map: leftPageTex, roughness: 0.68, side: THREE.DoubleSide });

    // A. Symmetrical Heavy Leather Covers
    const coverGeo = new THREE.BoxGeometry(pageWidth + 0.02, pageHeight + 0.04, 0.014);

    // Right Back Cover (under right pages)
    const backCover = new THREE.Mesh(coverGeo, coverExtMat);
    backCover.position.set(pageWidth / 2 + 0.01, 0, -0.014);
    backCover.castShadow = true;
    backCover.receiveShadow = true;
    bookGroup.add(backCover);

    // Left Under Cover (under left pages when open)
    const leftCover = new THREE.Mesh(coverGeo, coverExtMat);
    leftCover.position.set(-pageWidth / 2 - 0.01, 0, -0.014);
    leftCover.castShadow = true;
    leftCover.receiveShadow = true;
    bookGroup.add(leftCover);

    // B. Left Page Static Base (Curved gently near spine)
    const leftPagePlaneGeo = new THREE.PlaneGeometry(pageWidth, pageHeight, 32, 16);
    leftPagePlaneGeo.translate(-pageWidth / 2, 0, 0);
    const leftPos = leftPagePlaneGeo.attributes.position;
    for (let v = 0; v < leftPos.count; v++) {
      const x = leftPos.getX(v);
      const u = (x + pageWidth) / pageWidth;
      const dip = -Math.pow(u, 2) * 0.01;
      leftPos.setZ(v, dip);
    }
    leftPos.needsUpdate = true;
    leftPagePlaneGeo.computeVertexNormals();

    const leftPageMesh = new THREE.Mesh(leftPagePlaneGeo, leftPageMat);
    leftPageMesh.position.set(0, 0, 0.002);
    leftPageMesh.receiveShadow = true;
    bookGroup.add(leftPageMesh);

    // C. Right Page Static Base (Curved gently near spine)
    const rightPagePlaneGeo = new THREE.PlaneGeometry(pageWidth, pageHeight, 32, 16);
    rightPagePlaneGeo.translate(pageWidth / 2, 0, 0);
    const rightPos = rightPagePlaneGeo.attributes.position;
    for (let v = 0; v < rightPos.count; v++) {
      const x = rightPos.getX(v);
      const u = 1 - (x / pageWidth);
      const dip = -Math.pow(u, 2) * 0.01;
      rightPos.setZ(v, dip);
    }
    rightPos.needsUpdate = true;
    rightPagePlaneGeo.computeVertexNormals();

    const rightPageMesh = new THREE.Mesh(rightPagePlaneGeo, rightPageMat);
    rightPageMesh.position.set(0, 0, 0.002);
    rightPageMesh.receiveShadow = true;
    bookGroup.add(rightPageMesh);

    // D. Vertical Center Rounded Spine
    const spineGeo = new THREE.CylinderGeometry(0.024, 0.024, pageHeight + 0.04, 24, 1, false, -Math.PI / 2, Math.PI);
    const spine = new THREE.Mesh(spineGeo, coverExtMat);
    spine.rotation.y = -Math.PI / 2;
    spine.position.set(0, 0, -0.014);
    bookGroup.add(spine);

    // E. 4 Cascading Fanning Pages on initial opening ("촤르륵" Flutter)
    const numFanPages = 4;
    const fanPages = [];
    const blankParchmentMat = new THREE.MeshStandardMaterial({
      color: 0xf5eedc,
      roughness: 0.68,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < numFanPages; i++) {
      const pGeo = new THREE.PlaneGeometry(pageWidth, pageHeight, 32, 16);
      pGeo.translate(pageWidth / 2, 0, 0);

      const pMesh = new THREE.Mesh(pGeo, blankParchmentMat);
      pMesh.position.set(0, 0, 0.004 + (i * 0.003));
      pMesh.castShadow = true;
      pMesh.receiveShadow = true;
      bookGroup.add(pMesh);

      fanPages.push({
        mesh: pMesh,
        geo: pGeo,
        initialPos: pMesh.geometry.attributes.position.clone(),
        index: i
      });
    }

    // F. Dynamic Interactive Page Flip Mesh
    const turningPageGeo = new THREE.PlaneGeometry(pageWidth, pageHeight, 48, 24);
    turningPageGeo.translate(pageWidth / 2, 0, 0);
    const turningPageMesh = new THREE.Mesh(turningPageGeo, turningPageFrontMat);
    turningPageMesh.position.set(0, 0, 0.008);
    turningPageMesh.visible = false;
    turningPageMesh.castShadow = true;
    bookGroup.add(turningPageMesh);

    // G. 3D Turning Front Cover Assembly
    const frontCoverPivot = new THREE.Group();
    frontCoverPivot.position.set(0, 0, 0.008);
    bookGroup.add(frontCoverPivot);

    const frontCoverMesh = new THREE.Mesh(coverGeo, [
      coverExtMat, coverExtMat, coverExtMat, coverExtMat, coverExtMat, coverInsideMat
    ]);
    frontCoverMesh.position.set(pageWidth / 2 + 0.01, 0, 0.007);
    frontCoverMesh.castShadow = true;
    frontCoverPivot.add(frontCoverMesh);

    // Initial closed position
    bookGroup.position.set(-pageWidth / 4, 0, 0);
    bookGroup.rotation.set(0.12, -0.22, 0);

    threeStateRef.current = {
      scene,
      camera,
      renderer,
      bookGroup,
      frontCoverPivot,
      leftCover,
      leftPageMesh,
      rightPageMesh,
      turningPageMesh,
      turningPageGeo,
      turningPageInitialPos: turningPageGeo.attributes.position.clone(),
      leftPageMat,
      rightPageMat,
      turningPageFrontMat,
      turningPageBackMat,
      coverExtMat,
      fanPages,
      openStartTime: performance.now(),
      openDuration: 650,
      isOpening: true,
      isClosing: false,
      closeStartTime: 0,
      closeDuration: 550,
      flipStartTime: 0,
      flipDuration: 450,
      isFlipping: false,
      flipDirection: 1,
      currentSpreadIndex: 0,
      targetSpreadIndex: 0,
      isUserDragging: false,
      dragProgress: 0,
      dragStartX: 0,
      dragStartY: 0,
      dragStartTime: 0,
      dragDirection: 1,
      dragPointerId: null
    };

    let mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e) => {
      if (threeStateRef.current.isUserDragging) return;
      mouse.tx = ((e.clientX / window.innerWidth) - 0.5) * 0.18;
      mouse.ty = ((e.clientY / window.innerHeight) - 0.5) * 0.12;
    };
    window.addEventListener("mousemove", onMouseMove);

    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const state = threeStateRef.current;

      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // --- 1. INITIAL BOOK OPENING SEQUENCE ---
      if (state.isOpening) {
        const elapsed = now - state.openStartTime;
        const progress = Math.min(1, Math.max(0, elapsed / state.openDuration));
        const coverEase = easeOutCubic(progress);

        state.frontCoverPivot.visible = true;
        state.frontCoverPivot.rotation.y = -coverEase * Math.PI;

        state.fanPages.forEach((p, idx) => {
          const delay = (idx / numFanPages) * 0.35;
          const pProg = Math.max(0, Math.min(1, (progress - delay) / 0.65));
          const pEase = easeOutCubic(pProg);
          p.mesh.rotation.y = -pEase * Math.PI;

          const pos = p.geo.attributes.position;
          const orig = p.initialPos;
          const curlAmp = Math.sin(pProg * Math.PI) * 0.30;
          for (let v = 0; v < pos.count; v++) {
            const x = orig.getX(v);
            const y = orig.getY(v);
            const u = x / pageWidth;
            const bendZ = -Math.sin(u * Math.PI) * curlAmp;
            pos.setXYZ(v, x, y, bendZ);
          }
          pos.needsUpdate = true;
        });

        const isMobileAspect = camera.aspect < 1.0;
        const targetPosY = isMobileAspect ? 0.30 : 0;
        state.bookGroup.position.x = (-pageWidth / 4) * (1 - coverEase);
        state.bookGroup.position.y = (targetPosY * coverEase);
        state.bookGroup.rotation.x = 0.12 * (1 - coverEase) + 0.06 * coverEase + mouse.y * 0.15;
        state.bookGroup.rotation.y = -0.22 * (1 - coverEase) + mouse.x * 0.2;
        state.bookGroup.rotation.z = 0;

        if (progress >= 1) {
          state.isOpening = false;
          setIsFullyOpen(true);
          state.frontCoverPivot.visible = false; // Hide turning cover so leftCover sits flush
          state.fanPages.forEach(p => (p.mesh.visible = false));
        }
      }

      // --- 2. LIVE USER DRAGGING 3D PAGE ---
      if (state.isUserDragging && state.turningPageMesh) {
        const pProg = state.dragProgress;
        let rotY = 0;
        if (state.dragDirection === 1) {
          rotY = -pProg * Math.PI;
        } else {
          rotY = -Math.PI + pProg * Math.PI;
        }

        state.turningPageMesh.rotation.y = rotY;

        const pos = state.turningPageGeo.attributes.position;
        const orig = state.turningPageInitialPos;
        const curlAmp = Math.sin(pProg * Math.PI) * 0.42;

        for (let v = 0; v < pos.count; v++) {
          const x = orig.getX(v);
          const y = orig.getY(v);
          const u = x / pageWidth;
          const bendZ = -Math.sin(u * Math.PI) * curlAmp;
          pos.setXYZ(v, x, y, bendZ);
        }
        pos.needsUpdate = true;

        if (pProg >= 0.5) {
          state.turningPageMesh.material = state.dragDirection === 1 ? state.turningPageBackMat : state.turningPageFrontMat;
        } else {
          state.turningPageMesh.material = state.dragDirection === 1 ? state.turningPageFrontMat : state.turningPageBackMat;
        }
      }

      // --- 3. DYNAMIC PAGE TURN FLIP ANIMATION ---
      if (state.isFlipping && state.turningPageMesh) {
        const elapsed = now - state.flipStartTime;
        const progress = Math.min(1, Math.max(0, elapsed / state.flipDuration));
        const ease = easeInOutCubic(progress);

        let rotY = 0;
        if (state.flipDirection === 1) {
          rotY = -ease * Math.PI;
        } else {
          rotY = -Math.PI + (ease * Math.PI);
        }

        state.turningPageMesh.rotation.y = rotY;

        const pos = state.turningPageGeo.attributes.position;
        const orig = state.turningPageInitialPos;
        const curlAmp = Math.sin(progress * Math.PI) * 0.42;

        for (let v = 0; v < pos.count; v++) {
          const x = orig.getX(v);
          const y = orig.getY(v);
          const u = x / pageWidth;
          const bendZ = -Math.sin(u * Math.PI) * curlAmp;
          pos.setXYZ(v, x, y, bendZ);
        }
        pos.needsUpdate = true;

        if (progress >= 0.5) {
          state.turningPageMesh.material = state.flipDirection === 1 ? state.turningPageBackMat : state.turningPageFrontMat;
        }

        if (progress >= 1) {
          state.isFlipping = false;
          state.turningPageMesh.visible = false;
          setIsFlippingPage(false);

          state.currentSpreadIndex = state.targetSpreadIndex;
          const targetImg = getImageForSpread(state.targetSpreadIndex);

          state.leftPageMat.map = drawLeftFolioCanvas(book, state.targetSpreadIndex, parchmentImgRef.current);
          state.leftPageMat.needsUpdate = true;

          state.rightPageMat.map = drawRightFolioCanvas(book, state.targetSpreadIndex, targetImg, parchmentImgRef.current);
          state.rightPageMat.needsUpdate = true;
        }
      }

      // Parallax Tilt when idle
      if (!state.isOpening && !state.isClosing && !state.isUserDragging) {
        const isMobileAspect = camera.aspect < 1.0;
        state.bookGroup.position.x = 0;
        state.bookGroup.position.y = isMobileAspect ? 0.30 : 0;
        state.bookGroup.position.z = 0;
        state.bookGroup.rotation.x = 0.06 + mouse.y * 0.15;
        state.bookGroup.rotation.y = mouse.x * 0.2;
        state.bookGroup.rotation.z = 0;
      }

      // --- 4. CLOSING SEQUENCE ---
      if (state.isClosing) {
        state.frontCoverPivot.visible = true;
        const elapsed = now - state.closeStartTime;
        const progress = Math.min(1, Math.max(0, elapsed / state.closeDuration));
        const coverEase = 1 - Math.pow(progress, 3);

        state.frontCoverPivot.rotation.y = -coverEase * Math.PI;

        state.fanPages.forEach((p, idx) => {
          p.mesh.visible = true;
          const delay = ((numFanPages - idx) / numFanPages) * 0.35;
          const pProg = Math.max(0, Math.min(1, ((1 - progress) - delay) / 0.65));
          p.mesh.rotation.y = -pProg * Math.PI;
        });

        state.bookGroup.position.x = (-pageWidth / 4) * progress;
        state.bookGroup.rotation.x = 0.06 * (1 - progress) + 0.12 * progress;
        state.bookGroup.rotation.y = -0.22 * progress;
        state.bookGroup.rotation.z = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      updateCameraResponsive(camera, w, h);
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [book, getImageForSpread, updateCameraResponsive]);

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Programmatic Page Turn
  const goToSpread = useCallback((targetIndex) => {
    if (targetIndex === currentSpread || !isFullyOpen || isFlippingPage) return;
    if (targetIndex < 0 || targetIndex >= totalSpreads) return;

    const state = threeStateRef.current;
    if (!state || state.isFlipping) return;

    const direction = targetIndex > currentSpread ? 1 : -1;
    setIsFlippingPage(true);
    setCurrentSpread(targetIndex);

    state.flipDirection = direction;
    state.targetSpreadIndex = targetIndex;
    state.flipStartTime = performance.now();
    state.isFlipping = true;

    const oldImg = getImageForSpread(currentSpread);
    const newImg = getImageForSpread(targetIndex);

    if (direction === 1) {
      state.turningPageFrontMat.map = drawRightFolioCanvas(book, currentSpread, oldImg, parchmentImgRef.current);
      state.turningPageFrontMat.needsUpdate = true;

      state.turningPageBackMat.map = drawLeftFolioCanvas(book, targetIndex, parchmentImgRef.current);
      state.turningPageBackMat.needsUpdate = true;

      state.rightPageMat.map = drawRightFolioCanvas(book, targetIndex, newImg, parchmentImgRef.current);
      state.rightPageMat.needsUpdate = true;

      state.turningPageMesh.material = state.turningPageFrontMat;
      state.turningPageMesh.rotation.y = 0;
      state.turningPageMesh.visible = true;
    } else {
      state.turningPageFrontMat.map = drawLeftFolioCanvas(book, currentSpread, parchmentImgRef.current);
      state.turningPageFrontMat.needsUpdate = true;

      state.turningPageBackMat.map = drawRightFolioCanvas(book, targetIndex, newImg, parchmentImgRef.current);
      state.turningPageBackMat.needsUpdate = true;

      state.leftPageMat.map = drawLeftFolioCanvas(book, targetIndex, parchmentImgRef.current);
      state.leftPageMat.needsUpdate = true;

      state.turningPageMesh.material = state.turningPageFrontMat;
      state.turningPageMesh.rotation.y = -Math.PI;
      state.turningPageMesh.visible = true;
    }
  }, [currentSpread, isFullyOpen, isFlippingPage, book, totalSpreads, getImageForSpread]);

  // --- UNIFIED POINTER DRAG TO FLIP ENGINE WITH POINTER CAPTURE ---
  const handlePointerDown = (e) => {
    if (!isFullyOpen || isFlippingPage || activeGalleryProduct) return;
    const state = threeStateRef.current;
    if (!state || state.isFlipping) return;

    // Check if target is a clickable button/tab
    if (e.target.closest("button:not(.page-drag-target), .threejs-top-bar, .threejs-bottom-nav, .threejs-tabs-nav")) {
      return;
    }

    const rect = mountRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX;
    const clientY = e.clientY;
    if (clientX === undefined) return;

    const relX = clientX - rect.left;
    const isRightHalf = relX > rect.width / 2;

    let dir = 0;
    let target = currentSpread;
    if (isRightHalf && currentSpread < totalSpreads - 1) {
      dir = 1;
      target = currentSpread + 1;
    } else if (!isRightHalf && currentSpread > 0) {
      dir = -1;
      target = currentSpread - 1;
    } else {
      return;
    }

    // Capture pointer
    try {
      if (e.currentTarget.setPointerCapture) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } catch (err) {}

    state.isUserDragging = true;
    setIsDragging(true);
    state.dragDirection = dir;
    state.targetSpreadIndex = target;
    state.dragStartX = clientX;
    state.dragStartY = clientY;
    state.dragStartTime = performance.now();
    state.dragProgress = 0;
    state.dragPointerId = e.pointerId;

    const oldImg = getImageForSpread(currentSpread);
    const newImg = getImageForSpread(target);

    if (dir === 1) {
      state.turningPageFrontMat.map = drawRightFolioCanvas(book, currentSpread, oldImg, parchmentImgRef.current);
      state.turningPageFrontMat.needsUpdate = true;

      state.turningPageBackMat.map = drawLeftFolioCanvas(book, target, parchmentImgRef.current);
      state.turningPageBackMat.needsUpdate = true;

      state.rightPageMat.map = drawRightFolioCanvas(book, target, newImg, parchmentImgRef.current);
      state.rightPageMat.needsUpdate = true;

      state.turningPageMesh.material = state.turningPageFrontMat;
      state.turningPageMesh.rotation.y = 0;
      state.turningPageMesh.visible = true;
    } else {
      state.turningPageFrontMat.map = drawLeftFolioCanvas(book, currentSpread, parchmentImgRef.current);
      state.turningPageFrontMat.needsUpdate = true;

      state.turningPageBackMat.map = drawRightFolioCanvas(book, target, newImg, parchmentImgRef.current);
      state.turningPageBackMat.needsUpdate = true;

      state.leftPageMat.map = drawLeftFolioCanvas(book, target, parchmentImgRef.current);
      state.leftPageMat.needsUpdate = true;

      state.turningPageMesh.material = state.turningPageFrontMat;
      state.turningPageMesh.rotation.y = -Math.PI;
      state.turningPageMesh.visible = true;
    }
  };

  const handlePointerMove = (e) => {
    const state = threeStateRef.current;
    if (!state.isUserDragging) return;

    const clientX = e.clientX;
    if (clientX === undefined) return;

    const deltaX = clientX - state.dragStartX;
    const dragDistance = Math.min(window.innerWidth * 0.40, 420);

    let progress = 0;
    if (state.dragDirection === 1) {
      progress = Math.max(0, Math.min(1, -deltaX / dragDistance));
    } else {
      progress = Math.max(0, Math.min(1, deltaX / dragDistance));
    }

    state.dragProgress = progress;
  };

  const handlePointerUp = (e) => {
    const state = threeStateRef.current;
    if (!state.isUserDragging) return;

    try {
      if (e.currentTarget.releasePointerCapture && state.dragPointerId !== null) {
        e.currentTarget.releasePointerCapture(state.dragPointerId);
      }
    } catch (err) {}

    state.isUserDragging = false;
    setIsDragging(false);

    const clientX = e.clientX || state.dragStartX;
    const clientY = e.clientY || state.dragStartY;
    const dragDist = Math.abs(clientX - state.dragStartX);
    const dragDistY = Math.abs(clientY - state.dragStartY);
    const elapsed = performance.now() - state.dragStartTime;
    const velocity = dragDist / Math.max(1, elapsed);

    // If it was just a quick tap without drag movement (< 12px)
    if (dragDist < 12 && dragDistY < 12) {
      const rect = mountRef.current?.getBoundingClientRect();
      if (rect) {
        const isRight = (clientX - rect.left) > rect.width / 2;
        const relY = clientY - rect.top;
        const isUpperPhotoArea = relY < rect.height * 0.78;

        if (isRight) {
          // If tapping on the photo/lookbook area on the right page and a product is active
          if (isUpperPhotoArea && currentProduct) {
            setActiveGalleryProduct(currentProduct);
          } else {
            // Tapping on the bottom action strip advances page
            if (currentSpread === totalSpreads - 1) {
              handleClose();
            } else {
              goToSpread(currentSpread + 1);
            }
          }
        } else if (currentSpread > 0) {
          goToSpread(currentSpread - 1);
        }
      }
      state.turningPageMesh.visible = false;
      return;
    }

    const shouldCommit = state.dragProgress >= 0.20 || (velocity > 0.25 && state.dragProgress > 0.04);

    if (shouldCommit) {
      setIsFlippingPage(true);
      setCurrentSpread(state.targetSpreadIndex);

      state.flipDirection = state.dragDirection;
      state.flipStartTime = performance.now() - (state.dragProgress * state.flipDuration);
      state.isFlipping = true;
    } else {
      state.turningPageMesh.visible = false;
      const origImg = getImageForSpread(currentSpread);
      state.leftPageMat.map = drawLeftFolioCanvas(book, currentSpread, parchmentImgRef.current);
      state.leftPageMat.needsUpdate = true;
      state.rightPageMat.map = drawRightFolioCanvas(book, currentSpread, origImg, parchmentImgRef.current);
      state.rightPageMat.needsUpdate = true;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (activeGalleryProduct) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goToSpread(currentSpread + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToSpread(currentSpread - 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSpread, goToSpread, activeGalleryProduct]);

  const handleClose = () => {
    setIsFullyOpen(false);
    if (threeStateRef.current) {
      threeStateRef.current.isClosing = true;
      threeStateRef.current.isOpening = false;
      threeStateRef.current.closeStartTime = performance.now();
    }
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const currentProduct = products[currentSpread] || null;

  return (
    <div
      ref={containerRef}
      className={`threejs-book-overlay ${isDragging ? "dragging" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={mountRef}
        className="threejs-canvas-stage active-3d"
      />

      {/* Floating Gallery Trigger Button for Mobile & Desktop (Always Accessible) */}
      {isFullyOpen && currentProduct && !activeGalleryProduct && (
        <div className="threejs-floating-gallery-pill">
          <button
            type="button"
            className="photo-gallery-click-hotspot"
            onClick={(e) => {
              e.stopPropagation();
              setActiveGalleryProduct(currentProduct);
            }}
            title="🔍 고화질 세로 갤러리 열람"
          >
            <span className="hotspot-loupe-badge">
              🔍 {currentProduct.name} 고화질 사진 룩북 ({currentProduct.galleryPhotos?.length || 4}장) ➔
            </span>
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="threejs-top-bar" onPointerDown={e => e.stopPropagation()}>
        <div className="book-badge-info">
          <span className="badge-tome">{book.tomeNumber}</span>
          <div className="badge-text-stack">
            <span className="badge-title">{book.brandName}</span>
            <span className="badge-desc">{book.heroYear} A.D. • 총 {products.length}종 수록</span>
          </div>
        </div>

        {/* Dynamic Spread Navigation Tabs for Each Product */}
        <nav className="threejs-tabs-nav" aria-label="도감 성물 목차">
          {products.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              className={`tab-pill-btn ${currentSpread === idx ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                goToSpread(idx);
              }}
              title={p.name}
            >
              <span>{p.itemNumber} • {p.name.split(" ")[1] || p.name}</span>
            </button>
          ))}
          <button
            type="button"
            className={`tab-pill-btn ${currentSpread === products.length ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              goToSpread(products.length);
            }}
          >
            <span>📜 공방 보증서</span>
          </button>
        </nav>

        {/* Close Button */}
        <button
          type="button"
          className="threejs-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          title="도감 덮기 (ESC)"
        >
          <span className="icon">✕</span>
          <span className="lbl">책 덮기</span>
        </button>
      </header>

      {/* Drag Direction Subtle Hints */}
      {isFullyOpen && !activeGalleryProduct && (
        <div className="threejs-drag-hints-bar">
          <span className="drag-hint-text">
            ✦ 마우스/손가락으로 좌우 드래그하여 책 넘김 • 클릭 시 페이지 이동 ✦
          </span>
        </div>
      )}

      {/* Bottom Navigation Footer */}
      <footer className="threejs-bottom-nav" onPointerDown={e => e.stopPropagation()}>
        <button
          type="button"
          className="bottom-nav-btn prev"
          disabled={currentSpread === 0 || !isFullyOpen || isFlippingPage}
          onClick={(e) => {
            e.stopPropagation();
            goToSpread(currentSpread - 1);
          }}
        >
          ❮ 이전 성물
        </button>

        <div className="spread-indicator-dots">
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot-pill ${i === currentSpread ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                goToSpread(i);
              }}
              title={i < products.length ? `${products[i].itemNumber} • ${products[i].name}` : "공방 감정서"}
            />
          ))}
          <span className="indicator-text">
            {currentSpread < products.length ? (
              `${products[currentSpread].itemNumber} • ${products[currentSpread].name} (${currentSpread * 2 + 1}-${currentSpread * 2 + 2} / ${totalSpreads * 2}p)`
            ) : (
              `공방 공인 보증서 (${totalSpreads * 2 - 1}-${totalSpreads * 2} / ${totalSpreads * 2}p)`
            )}
          </span>
        </div>

        <button
          type="button"
          className="bottom-nav-btn next"
          disabled={currentSpread === totalSpreads - 1 || !isFullyOpen || isFlippingPage}
          onClick={(e) => {
            e.stopPropagation();
            goToSpread(currentSpread + 1);
          }}
        >
          다음 성물 ❯
        </button>
      </footer>

      {/* Full-Screen Vertical Photo Gallery Lookbook Modal */}
      {activeGalleryProduct && (
        <VerticalPhotoGallery
          product={activeGalleryProduct}
          brand={book}
          onClose={() => setActiveGalleryProduct(null)}
        />
      )}
    </div>
  );
}
