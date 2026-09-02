import React, { useState } from 'react';
import PaymentModal from './PaymentModal';
import PaymentSuccessModal from './PaymentSuccessModal';

export default function MobileSinglePageReader({ book, products = [], onClose, onOpenLookbook }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animDirection, setAnimDirection] = useState('next');
  const [activePaymentProduct, setActivePaymentProduct] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  // Build the linear list of pages for mobile
  // Each product gets 2 pages: 1 (Commentary) and 2 (Hero Photo + 5-Angle Product Image Launcher)
  const pages = [];
  products.forEach((prod, pIdx) => {
    pages.push({
      type: 'commentary',
      product: prod,
      folioNum: pIdx * 2 + 1,
      itemNumber: prod.itemNumber || ('ITEM ' + String(pIdx + 1).padStart(2, '0')),
      title: prod.name,
      latinTitle: prod.latinName,
      lore: prod.lore,
      specs: prod.specs || [],
      era: prod.era,
      grade: prod.appraisalGrade,
      value: prod.value
    });
    pages.push({
      type: 'photo',
      product: prod,
      folioNum: pIdx * 2 + 2,
      itemNumber: prod.itemNumber || ('ITEM ' + String(pIdx + 1).padStart(2, '0')),
      title: prod.name,
      mainImage: prod.mainImage,
      galleryPhotos: prod.galleryPhotos || [],
      caption: prod.galleryPhotos?.[0]?.caption || prod.name,
      angleTag: prod.galleryPhotos?.[0]?.angleTag || 'ANGLE 01 • 정면 실물 뷰',
      grade: prod.appraisalGrade,
      value: prod.value
    });
  });

  const totalPages = pages.length;

  const goToPage = (targetIdx) => {
    if (targetIdx < 0 || targetIdx >= totalPages || targetIdx === currentPage || isAnimating) return;
    setAnimDirection(targetIdx > currentPage ? 'next' : 'prev');
    setIsAnimating(true);
    setCurrentPage(targetIdx);
    setTimeout(() => setIsAnimating(false), 320);
  };

  const minSwipeDistance = 40;

  const onTouchStartHandler = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveHandler = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    } else if (isRightSwipe && currentPage > 0) {
      goToPage(currentPage - 1);
    }
  };

  const curPageData = pages[currentPage] || pages[0];

  return (
    <div
      className="mobile-single-reader-overlay"
      onTouchStart={onTouchStartHandler}
      onTouchMove={onTouchMoveHandler}
      onTouchEnd={onTouchEndHandler}
    >
      {/* Top Mobile Bar */}
      <header className="mobile-reader-topbar">
        <div className="mobile-tome-badge">
          <span className="tome-num">{book.tomeNumber}</span>
          <div className="tome-names">
            <strong className="b-name">{book.brandName}</strong>
            <span className="b-sub">{book.heroYear} A.D. · {curPageData.itemNumber || 'ARCHIVE'}</span>
          </div>
        </div>

        <div className="mobile-top-actions">
          <span className="mobile-page-indicator">
            {currentPage + 1} / {totalPages}p
          </span>
          <button
            type="button"
            className="mobile-reader-close-btn"
            onClick={onClose}
            aria-label="도감 덮기"
            title="도감 덮기"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Single Page Parchment Body */}
      <main className="mobile-reader-viewport">
        <div className={'mobile-parchment-page-card ' + (isAnimating ? 'anim-' + animDirection : '')}>
          {/* Subtle Spine Shadow on Left Edge */}
          <div className="parchment-spine-shadow" />
          {/* Antique Gilded Edge Frame */}
          <div className="parchment-gold-border" />

          <div className="mobile-page-scrollable-content">
            {/* 1. COMMENTARY PAGE (대형 학술 감정 해설) */}
            {curPageData.type === 'commentary' && (
              <div className="mobile-commentary-layout">
                <div className="mobile-folio-meta">
                  <span className="folio-tag">FOLIO {curPageData.folioNum} · {curPageData.itemNumber}</span>
                  <span className="folio-rubric">HISTORIA & SPECIFICATIO</span>
                </div>

                <h2 className="mobile-page-title">{curPageData.title}</h2>
                <span className="mobile-page-latin">{curPageData.latinTitle}</span>

                <div className="mobile-gold-divider" />

                {/* Grade Badge */}
                <div className="mobile-grade-pill">
                  <span className="grade-glyph">⚜️</span>
                  <span className="grade-text">{curPageData.grade}</span>
                </div>

                {/* Main Lore Description */}
                <div className="mobile-lore-card">
                  <p className="mobile-lore-text">{curPageData.lore}</p>
                </div>

                {/* Specs Box */}
                <div className="mobile-specs-box">
                  <div className="specs-box-header">
                    <span className="box-glyph">📜</span>
                    <span className="box-title">학술 감정 및 실측 규격표</span>
                  </div>
                  <div className="mobile-specs-grid">
                    {curPageData.specs.map((s, idx) => (
                      <div key={idx} className="mobile-spec-row">
                        <span className="spec-k">{s.label}</span>
                        <strong className="spec-v">{s.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Swipe Next Prompt */}
                <div
                  className="mobile-swipe-prompt-btn"
                  onClick={() => goToPage(currentPage + 1)}
                >
                  <span>👉 다음 장 넘김 • <strong>5각 정밀 제품 이미지</strong> ➔</span>
                </div>
              </div>
            )}

            {/* 2. PHOTO & 5-ANGLE PRODUCT IMAGE LAUNCHER PAGE */}
            {curPageData.type === 'photo' && (
              <div className="mobile-photo-layout">
                <div className="mobile-folio-meta">
                  <span className="folio-tag">FOLIO {curPageData.folioNum} · {curPageData.itemNumber}</span>
                  <span className="folio-rubric">VISIO ARTIFACTI</span>
                </div>

                <h2 className="mobile-page-title small">{curPageData.title}</h2>

                {/* Big Hero Image Mount */}
                <div
                  className="mobile-hero-photo-mount"
                  onClick={() => onOpenLookbook(curPageData.product)}
                >
                  <img
                    src={curPageData.mainImage}
                    alt={curPageData.title}
                    className="mobile-hero-img"
                  />
                  <div className="hero-corner-bracket tl" />
                  <div className="hero-corner-bracket tr" />
                  <div className="hero-corner-bracket bl" />
                  <div className="hero-corner-bracket br" />
                  
                  <div className="hero-photo-tag-strip">
                    <span className="tag-angle">{curPageData.angleTag}</span>
                    <span className="tag-zoom">🔍 터치 시 5각 정밀 제품 이미지 확대</span>
                  </div>
                </div>

                {/* Observation Caption */}
                <div className="mobile-photo-caption-card">
                  <span className="cap-icon">🔍</span>
                  <p className="cap-text">{curPageData.caption}</p>
                </div>

                {/* Big High-Visibility 5-Angle Product Image Launcher CTA Button */}
                <button
                  type="button"
                  className="mobile-open-lookbook-cta antique-wood-cta"
                  onClick={() => onOpenLookbook(curPageData.product)}
                >
                  <span className="btn-icon">⚜</span>
                  <span className="btn-text">🔍 5각 정밀 제품 이미지 ({curPageData.galleryPhotos.length || 5}장)</span>
                  <span className="btn-arrow">➔</span>
                </button>

                {/* Price Preview & Direct Payment CTA */}
                <div className="mobile-price-strip">
                  <div className="mobile-price-info">
                    <span className="p-lbl">공식 추정 감정가</span>
                    <strong className="p-val">{curPageData.value}</strong>
                  </div>
                  {curPageData.product?.isSoldOut ? (
                    <div className="mobile-soldout-badge-pill">
                      <span>🏛️ SOLD OUT (소장 완료)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="mobile-direct-pay-btn"
                      onClick={() => setActivePaymentProduct(curPageData.product)}
                    >
                      <span>💳 소장 결제 ➔</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <footer className="mobile-reader-bottom-nav">
        <button
          type="button"
          className="m-nav-btn prev"
          disabled={currentPage === 0 || isAnimating}
          onClick={() => goToPage(currentPage - 1)}
        >
          ❮ 이전 장
        </button>

        <div className="m-dots-cluster">
          {pages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={'m-dot ' + (idx === currentPage ? 'active' : '')}
              onClick={() => goToPage(idx)}
              aria-label={(idx + 1) + '페이지로 이동'}
            />
          ))}
        </div>

        <button
          type="button"
          className="m-nav-btn next"
          disabled={currentPage === totalPages - 1 || isAnimating}
          onClick={() => goToPage(currentPage + 1)}
        >
          다음 장 ❯
        </button>
      </footer>
      {/* Real Toss Payments / Escrow Payment Modal for Mobile */}
      {activePaymentProduct && (
        <PaymentModal
          product={activePaymentProduct}
          book={book}
          onClose={() => setActivePaymentProduct(null)}
          onSuccess={(receipt) => {
            setActivePaymentProduct(null);
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
