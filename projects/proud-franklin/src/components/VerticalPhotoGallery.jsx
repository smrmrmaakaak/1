import React, { useEffect, useState } from "react";
import PaymentModal from "./PaymentModal";
import PaymentSuccessModal from "./PaymentSuccessModal";

export default function VerticalPhotoGallery({ product, brand, onClose }) {
  const [reservationSubmitted, setReservationSubmitted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const handleReservationClick = () => {
    setShowReservationModal(true);
  };

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    setReservationSubmitted(true);
    setTimeout(() => {
      setShowReservationModal(false);
      setReservationSubmitted(false);
    }, 2400);
  };

  return (
    <div className="vertical-gallery-overlay" role="dialog" aria-modal="true">
      {/* Background Dim Backdrop */}
      <div className="vertical-gallery-backdrop" onClick={onClose} />

      {/* Main Vertical Scroll Container */}
      <div className="vertical-gallery-container">
        {/* Top Fixed Header */}
        <header className="vertical-gallery-header">
          <div className="vg-brand-meta">
            <span className="vg-fleur">⚜️</span>
            <div className="vg-text-stack">
              <span className="vg-brand-label">{brand?.brandName || "ARCHIVUM IMPERIALE"}</span>
              <h2 className="vg-product-title">{product.name}</h2>
              <span className="vg-latin-title">{product.latinName}</span>
            </div>
          </div>

          <div className="vg-badges-group">
            {product.isSoldOut && (
              <span className="vg-badge soldout">⚜ SOLD OUT • 소장 완료</span>
            )}
            <span className="vg-badge era">{product.era}</span>
            <span className="vg-badge grade">{product.appraisalGrade}</span>
          </div>

          <button
            type="button"
            className="vg-close-btn"
            onClick={onClose}
            title="갤러리 닫고 도감으로 돌아가기 (ESC)"
            aria-label="닫기"
          >
            <span className="icon">✕</span>
            <span className="lbl">도감으로 돌아가기</span>
          </button>
        </header>

        {/* Scrollable Vertical Photo Stream (세로 일렬 나열) */}
        <main className="vertical-photo-stream">
          <div className="vg-intro-strip">
            <span className="vg-guide-text">
              ✦ {product.name} 5각 정밀 제품 이미지 (총 {product.galleryPhotos?.length || 0}장) • 아래로 스크롤하여 각도별 세부 관찰 ✦
            </span>
          </div>

          {/* Vertical Stack of Huge Photos */}
          {product.galleryPhotos?.map((photo, idx) => (
            <article key={idx} className="vg-photo-card">
              {/* Photo Header Tag */}
              <div className="vg-card-header">
                <span className="vg-angle-tag">{photo.angleTag}</span>
                <span className="vg-ratio-badge">{photo.macroRatio}</span>
              </div>

              {/* Huge Image Container */}
              <div className="vg-image-wrapper">
                <img
                  src={photo.src}
                  alt={`${product.name} - ${photo.angleTag}`}
                  className="vg-image-element"
                  loading="lazy"
                />
                <div className="vg-image-vignette" />
                <div className="vg-image-gold-border" />
              </div>

              {/* Educational Caption Box */}
              <div className="vg-caption-card">
                <div className="vg-caption-icon">🔍</div>
                <div className="vg-caption-content">
                  <strong className="vg-caption-title">학술 관찰 및 감정 해설</strong>
                  <p className="vg-caption-desc">{photo.caption}</p>
                </div>
              </div>
            </article>
          ))}

          {/* UNIFIED ROYAL ARCHIVAL DOSSIER & VALUATION SUITE */}
          <div className="vg-archival-dossier">
            <div className="vg-dossier-inner">
              {/* Corner Brass / Gold Filigree Accents */}
              <span className="dossier-corner tl">⚜</span>
              <span className="dossier-corner tr">⚜</span>
              <span className="dossier-corner bl">⚜</span>
              <span className="dossier-corner br">⚜</span>

              {/* Top Dossier Header */}
              <div className="vg-dossier-header">
                <span className="vg-seal-crest">🏛️</span>
                <div className="vg-dossier-title-stack">
                  <span className="vg-dossier-tag">OFFICIAL ARCHIVAL DOSSIER & PROVENANCE</span>
                  <h3 className="vg-dossier-title">{product.name}</h3>
                  <span className="vg-dossier-materials">{product.materials}</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="vg-specs-grid">
                <div className="vg-spec-item">
                  <span className="label">규격 및 중량</span>
                  <strong className="val">{product.dimensions}</strong>
                </div>
                <div className="vg-spec-item">
                  <span className="label">보존 등급</span>
                  <strong className="val">{product.appraisalGrade}</strong>
                </div>
                <div className="vg-spec-item">
                  <span className="label">제작 시대</span>
                  <strong className="val">{product.era}</strong>
                </div>
                <div className="vg-spec-item">
                  <span className="label">공방 길드</span>
                  <strong className="val">{brand?.origin || "신성로마제국 왕립 공방"}</strong>
                </div>
              </div>

              <p className="vg-dossier-lore">{product.lore}</p>

              {/* Royal Seal Divider */}
              <div className="vg-dossier-divider">
                <span className="divider-line" />
                <span className="divider-crest">⚜</span>
                <span className="divider-line" />
              </div>

              {/* Official Valuation & Private Inquiry Section */}
              <div className="vg-valuation-section">
                <div className="vg-val-badge">
                  <span className="badge-dot">✦</span>
                  <span>ESTIMATED VALUATION · 공식 추정 감정가</span>
                  <span className="badge-dot">✦</span>
                </div>
                
                {/* Direct SVG 3D Chiseled Gold Foil Cursive Price Typography */}
                <div className="vg-svg-price-foil">
                  <svg
                    className="vg-svg-price-canvas"
                    viewBox="0 0 480 76"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label={`공식 감정가 ${product.value}`}
                  >
                    <defs>
                      <linearGradient id="pureGoldFoilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fffbf0" />
                        <stop offset="12%" stopColor="#fee492" />
                        <stop offset="45%" stopColor="#d4af37" />
                        <stop offset="80%" stopColor="#966f1c" />
                        <stop offset="100%" stopColor="#523506" />
                      </linearGradient>

                      {/* Realistic 3D Debossed Gold Foil Specular Lighting Filter */}
                      <filter id="gold-foil-direct" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1.0" result="blur" />
                        <feSpecularLighting in="blur" surfaceScale="4.2" specularConstant="2.4" specularExponent="26" lightingColor="#fffceb" result="specular">
                          <feDistantLight azimuth="225" elevation="55" />
                        </feSpecularLighting>
                        <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularMasked" />
                        <feComposite in="SourceGraphic" in2="specularMasked" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litGraphic" />
                        <feDropShadow dx="0" dy="2.5" stdDeviation="2.0" floodColor="#2e1906" floodOpacity="0.45" />
                      </filter>
                    </defs>

                    <text
                      x="240"
                      y="54"
                      textAnchor="middle"
                      fill="url(#pureGoldFoilGrad)"
                      fontFamily="'MonteCarlo', 'Pinyon Script', 'Alex Brush', 'Great Vibes', cursive"
                      fontSize="54"
                      fontWeight="700"
                      letterSpacing="1.5"
                      filter="url(#gold-foil-direct)"
                    >
                      {product.value}
                    </text>
                  </svg>
                </div>

                <p className="vg-val-note">
                  * 라벨르지안 엔틱 황실 문화재 공인 감정서 및 불변 소장 원장 동봉
                </p>

                <div className="vg-val-actions">
                  {product.isSoldOut ? (
                    <div className="vg-soldout-container">
                      <div className="vg-soldout-plaque">
                        <span className="plaque-crest">🏛️</span>
                        <div className="plaque-text-box">
                          <strong className="plaque-main-title">SOLD OUT • 라벨르지안 공식 소장 완료</strong>
                          <p className="plaque-sub-desc">본 성물은 프라이빗 컬렉터에게 소장 완료되었습니다. (도감 학술 기록 영구 보존)</p>
                        </div>
                      </div>

                      {/* Notification / Alternative Consultation Button */}
                      <button
                        type="button"
                        className="vg-reserve-btn vg-consult-btn antique-wood-cta"
                        onClick={handleReservationClick}
                      >
                        <span className="wood-brass-corner tl">✦</span>
                        <span className="wood-brass-corner tr">✦</span>
                        <span className="wood-brass-corner bl">✦</span>
                        <span className="wood-brass-corner br">✦</span>
                        <span className="wood-sheen" />
                        <span className="btn-icon">📜</span>
                        <span className="btn-text">동일 브랜드({brand?.brandName}) 유사 성물 입고 알림 신청</span>
                        <span className="btn-arrow">⟶</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* 1. Direct Real Payment Button (Toss Payments / Card / Escrow) */}
                      <button
                        type="button"
                        className="vg-reserve-btn vg-direct-pay-btn antique-wood-cta"
                        onClick={() => setShowPaymentModal(true)}
                      >
                        <span className="wood-brass-corner tl">✦</span>
                        <span className="wood-brass-corner tr">✦</span>
                        <span className="wood-brass-corner bl">✦</span>
                        <span className="wood-brass-corner br">✦</span>
                        <span className="wood-sheen" />
                        <span className="btn-icon">💳</span>
                        <span className="btn-text">성물 공식 소장 결제하기 ({product.value})</span>
                        <span className="btn-arrow">➔</span>
                      </button>

                      {/* 2. Private Viewing Consultation Button */}
                      <button
                        type="button"
                        className="vg-reserve-btn vg-consult-btn antique-wood-cta"
                        onClick={handleReservationClick}
                      >
                        <span className="wood-brass-corner tl">✦</span>
                        <span className="wood-brass-corner tr">✦</span>
                        <span className="wood-brass-corner bl">✦</span>
                        <span className="wood-brass-corner br">✦</span>
                        <span className="wood-sheen" />
                        <span className="btn-icon">⚜</span>
                        <span className="btn-text">프라이빗 뷰잉 & 방문 상담 예약</span>
                        <span className="btn-arrow">⟶</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="vg-subtle-return-btn"
                    onClick={onClose}
                  >
                    <span>⟵ 서책 도감으로 복귀 (ESC)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Reservation Modal Overlay */}
      {showReservationModal && (
        <div className="reservation-modal-overlay" onClick={() => setShowReservationModal(false)}>
          <div className="reservation-modal-box" onClick={e => e.stopPropagation()}>
            <div className="res-modal-header">
              <span className="res-fleur">⚜️</span>
              <h3 className="res-title">프라이빗 뷰잉 & 소장 예약 신청</h3>
              <button
                type="button"
                className="res-close-btn"
                onClick={() => setShowReservationModal(false)}
              >
                ✕
              </button>
            </div>

            {reservationSubmitted ? (
              <div className="res-success-message">
                <span className="res-success-icon">📜</span>
                <h4 className="res-success-title">예약 접수가 완료되었습니다</h4>
                <p className="res-success-desc">
                  <strong>{product.name}</strong>의 VIP 프라이빗 뷰잉 신청이 수장고 아카이브에 정식 등록되었습니다.<br />
                  공방 수석 학예관이 기재해주신 연락처로 예약 일정을 안내해 드립니다.
                </p>
              </div>
            ) : (
              <form className="res-form" onSubmit={handleConfirmReservation}>
                <div className="res-product-summary">
                  <span className="label">신청 성물:</span>
                  <strong className="name">{product.name} ({product.era})</strong>
                  <span className="price">{product.value}</span>
                </div>

                <div className="res-input-group">
                  <label htmlFor="res-name">예약자 성함 / 귀하</label>
                  <input
                    id="res-name"
                    type="text"
                    placeholder="예: 홍길동"
                    defaultValue="VIP 수집가"
                    required
                  />
                </div>

                <div className="res-input-group">
                  <label htmlFor="res-phone">연락처</label>
                  <input
                    id="res-phone"
                    type="tel"
                    placeholder="010-0000-0000"
                    defaultValue="010-1234-5678"
                    required
                  />
                </div>

                <div className="res-input-group">
                  <label htmlFor="res-memo">희망 방문 일자 및 문의 사항</label>
                  <textarea
                    id="res-memo"
                    rows={3}
                    placeholder="희망 방문 일시 또는 특별 요청 사항을 입력해주세요."
                    defaultValue="수장고 실물 감정 및 프라이빗 뷰잉을 희망합니다."
                  />
                </div>

                <div className="res-modal-actions">
                  <button type="submit" className="res-submit-btn">
                    <span>⚜️ 예약 신청 완료</span>
                  </button>
                  <button
                    type="button"
                    className="res-cancel-btn"
                    onClick={() => setShowReservationModal(false)}
                  >
                    취소
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Real Toss Payments / Escrow Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          product={product}
          book={brand}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(receipt) => {
            setShowPaymentModal(false);
            setPaymentReceipt(receipt);
          }}
        />
      )}

      {/* Official Payment Electronic Receipt Modal */}
      {paymentReceipt && (
        <PaymentSuccessModal
          receipt={paymentReceipt}
          onClose={() => setPaymentReceipt(null)}
        />
      )}
    </div>
  );
}
