import React, { useState } from "react";
import { sound } from "./AudioEngine";
import MagnifierViewer from "./MagnifierViewer";

export default function BookReader({ book, onClose, onOpenModal }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const totalPages = book.pages.length;
  const currentPage = book.pages[currentPageIndex];

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      sound.playPageTurn();
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      sound.playPageTurn();
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const handleSelectPage = (index) => {
    if (index !== currentPageIndex) {
      sound.playPageTurn();
      setCurrentPageIndex(index);
    }
  };

  return (
    <div className="book-reader-panel">
      {/* Top Navigation Ribbon / Page Header */}
      <div className="reader-ribbon">
        <div className="ribbon-left">
          <span className="ribbon-tome-tag">{book.tomeNumber}</span>
          <span className="ribbon-divider">•</span>
          <span className="ribbon-era">{book.era}</span>
        </div>

        <div className="ribbon-bookmarks">
          {book.pages.map((pg, idx) => (
            <button
              key={pg.pageNumber}
              type="button"
              className={`bookmark-tab ${idx === currentPageIndex ? "active" : ""}`}
              onClick={() => handleSelectPage(idx)}
              title={`${pg.section} (Page ${pg.pageNumber})`}
            >
              <span className="tab-num">{pg.pageNumber}</span>
              <span className="tab-label">{pg.section}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reader Main Content Sheet (Aged Parchment Styling) */}
      <div className="reader-parchment-sheet">
        <div className="sheet-inner-content">
          {/* Section Indicator & Title */}
          <div className="page-header-block">
            <span className="page-section-tag">{currentPage.section}</span>
            <h3 className="page-main-heading">{currentPage.heading}</h3>
            {currentPage.quote && (
              <blockquote className="page-quote">
                {currentPage.quote}
              </blockquote>
            )}
          </div>

          <div className="page-rule" />

          {/* Interactive Magnifier Viewport for Page 3 */}
          {currentPage.interactiveMode === "magnifier" ? (
            <MagnifierViewer
              imageSrc={book.artifactImage}
              detailSrc={book.detailImage}
              title={book.title}
              era={book.era}
            />
          ) : (
            /* Narrative & Specs Body */
            <div className="page-text-body">
              <p className="page-paragraph">{currentPage.body}</p>

              {currentPage.highlights && (
                <div className="highlights-grid">
                  {currentPage.highlights.map((item, idx) => (
                    <div key={idx} className="highlight-card">
                      <span className="hl-label">{item.label}</span>
                      <strong className="hl-value">{item.value}</strong>
                    </div>
                  ))}
                </div>
              )}

              {currentPage.callout && (
                <div className="page-callout-box">
                  <div className="callout-icon">📜</div>
                  <p className="callout-text">{currentPage.callout}</p>
                </div>
              )}

              {currentPage.certificateNo && (
                <div className="cert-preview-card">
                  <div className="cert-preview-header">
                    <span className="cert-badge">공인 인증 완료</span>
                    <span className="cert-id">{currentPage.certificateNo}</span>
                  </div>
                  <p className="cert-inspector">수석 감정관: {currentPage.inspector}</p>
                  <p className="cert-status">{currentPage.status}</p>
                  <button
                    type="button"
                    className="view-cert-link"
                    onClick={() => onOpenModal("certificate")}
                  >
                    <span>공인 감정서 전문 및 밀랍 인장 날인 열람 ➔</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Parchment Corner Shadows and Stains */}
        <div className="parchment-stain stain-top" />
        <div className="parchment-stain stain-bottom" />
      </div>

      {/* Reader Bottom Navigation & Action Dock */}
      <div className="reader-bottom-dock">
        <div className="page-nav-controls">
          <button
            type="button"
            className="page-turn-btn prev-btn"
            disabled={currentPageIndex === 0}
            onClick={handlePrevPage}
          >
            ❮ 이전 장
          </button>
          <span className="page-indicator">
            Folio <strong>{currentPageIndex + 1}</strong> / {totalPages}
          </span>
          <button
            type="button"
            className="page-turn-btn next-btn"
            disabled={currentPageIndex === totalPages - 1}
            onClick={handleNextPage}
          >
            다음 장 ❯
          </button>
        </div>

        <div className="reader-action-buttons">
          <button
            type="button"
            className="action-btn cert-action"
            onClick={() => onOpenModal("certificate")}
          >
            <span className="btn-seal-dot" style={{ backgroundColor: book.sealColor }} />
            <span>감정서 열람</span>
          </button>

          <button
            type="button"
            className="action-btn inquire-action"
            onClick={() => onOpenModal("inquiry")}
          >
            <span>소장 문의</span>
          </button>

          <button
            type="button"
            className="action-btn close-action"
            onClick={onClose}
            title="도감 덮고 서재로 복귀"
          >
            <span>서재로 복귀</span>
          </button>
        </div>
      </div>
    </div>
  );
}
