import React, { useState } from "react";
import MagnifierViewer from "./MagnifierViewer";

export default function DetailPanel({ book, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [waxStamped, setWaxStamped] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: "", contact: "" });
  const [inquirySent, setInquirySent] = useState(false);

  if (!book) return null;

  return (
    <aside className="detail-panel" aria-label={`${book.title} 상세 감정 패널`}>
      {/* Header Info */}
      <div className="detail-header-group">
        <div className="detail-tome-tag">
          <span className="tome-roman-badge">{book.tomeNumber}</span>
          <span className="tome-era-badge">{book.era} • {book.origin}</span>
        </div>
        <h2 className="detail-title">{book.title}</h2>
        <p className="detail-latin-title">{book.latinTitle}</p>
        <p className="detail-subtitle">{book.subtitle}</p>
      </div>

      {/* Navigation Tab Pills */}
      <div className="detail-tab-row">
        <button
          type="button"
          className={`detail-tab-pill ${activeTab === 0 ? "active" : ""}`}
          onClick={() => setActiveTab(0)}
        >
          <span>I. 기원과 성물 실물</span>
        </button>
        <button
          type="button"
          className={`detail-tab-pill ${activeTab === 1 ? "active" : ""}`}
          onClick={() => setActiveTab(1)}
        >
          <span>II. 2.5x 초정밀 돋보기</span>
        </button>
        <button
          type="button"
          className={`detail-tab-pill ${activeTab === 2 ? "active" : ""}`}
          onClick={() => setActiveTab(2)}
        >
          <span>III. 감정서 & 밀랍 인장</span>
        </button>
      </div>

      {/* Scrollable Parchment Content Area */}
      <div className="detail-scroll">
        {activeTab === 0 && (
          <div className="detail-tab-pane">
            {/* Artifact Showcase Photo */}
            <div className="antique-museum-showcase">
              <div className="showcase-frame-bracket tl" />
              <div className="showcase-frame-bracket tr" />
              <div className="showcase-frame-bracket bl" />
              <div className="showcase-frame-bracket br" />
              <img
                src={book.artifactImage}
                alt={book.title}
                className="showcase-artifact-img"
              />
              <div className="showcase-caption-bar">
                <span className="caption-era">{book.era} 원형 보존 실물</span>
                <span className="caption-val">{book.value}</span>
              </div>
            </div>

            {/* Quote Block */}
            <div className="detail-quote-box">
              <span className="quote-mark">“</span>
              <p className="quote-body">{book.pages[0].quote}</p>
            </div>

            {/* Main Descriptive Prose (Clean, without broken dropcap) */}
            <p className="detail-prose-text">{book.pages[0].body}</p>

            {/* Specifications Grid */}
            <div className="detail-specs-grid">
              {book.pages[0].highlights.map((h, i) => (
                <div key={i} className="spec-card">
                  <span className="spec-label">{h.label}</span>
                  <strong className="spec-value">{h.value}</strong>
                </div>
              ))}
            </div>

            {/* Archival Provenance */}
            <div className="detail-provenance-box">
              <div className="prov-header">
                <span className="prov-glyph">⚜️</span>
                <span className="prov-title">수장고 전승 족보 (PROVENANCE)</span>
              </div>
              <p className="prov-content">{book.provenance}</p>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="detail-tab-pane">
            <div className="loupe-intro-text">
              <p className="loupe-lead-text">
                마우스를 유물 이미지 위로 움직여 500년간 보존된 금속 세공과 파티나(Patina) 피막을 2.5배 확대경으로 정밀 관찰하십시오.
              </p>
            </div>

            <MagnifierViewer
              imageSrc={book.artifactImage}
              detailSrc={book.detailImage}
              title={book.title}
              era={book.era}
            />

            <div className="detail-curator-note">
              <span className="curator-badge">수석 큐레이터 관찰 비망록</span>
              <p className="curator-p">{book.pages[1].callout}</p>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="detail-tab-pane">
            {/* Imperial Appraisal Certificate */}
            <div className="imperial-certificate-card">
              <div className="cert-crest-row">
                <span className="cert-fleur">⚜️</span>
                <span className="cert-org-name">ARCHIVUM IMPERIALE</span>
              </div>
              <h3 className="cert-heading">진품 공인 감정 증서</h3>
              <p className="cert-sub-note">“옥스퍼드 고문서 & 고고학 연구원 공인”</p>

              <div className="cert-data-table">
                <div className="c-row">
                  <span className="c-key">성물 명칭</span>
                  <strong className="c-val">{book.title} ({book.latinTitle})</strong>
                </div>
                <div className="c-row">
                  <span className="c-key">제작 연대</span>
                  <strong className="c-val">{book.era}</strong>
                </div>
                <div className="c-row">
                  <span className="c-key">평가 가치</span>
                  <strong className="c-val gold">{book.value}</strong>
                </div>
                <div className="c-row">
                  <span className="c-key">보존 등급</span>
                  <strong className="c-val emerald">{book.appraisalGrade}</strong>
                </div>
                <div className="c-row">
                  <span className="c-key">외형 규격</span>
                  <span className="c-val">{book.dimensions}</span>
                </div>
              </div>

              <div className="cert-signature-area">
                <div className="sign-block">
                  <span className="sign-cursive">Dr. Alistair Vance</span>
                  <span className="sign-role">수석 고미술 감정관 직인</span>
                </div>
                <span className="cert-code">{book.pages[3]?.certificateNo || `CERT-${book.heroYear}-994`}</span>
              </div>
            </div>

            {/* Interactive 3D Wax Seal */}
            <div className="wax-seal-section">
              <div className="wax-seal-info">
                <span className="wax-title">황실 수장고 붉은 밀랍 봉인</span>
                <span className="wax-desc">우측 인장을 클릭하여 공인 보증 직인을 날인하십시오.</span>
              </div>

              <button
                type="button"
                className={`wax-seal-btn-3d ${waxStamped ? "stamped" : ""}`}
                onClick={() => setWaxStamped(true)}
                disabled={waxStamped}
                title="클릭하여 밀랍 인장 날인"
              >
                <div className="wax-disc-3d" style={{ backgroundColor: book.sealColor }}>
                  <span className="wax-crest">ARCANA</span>
                  <span className="wax-yr">{book.heroYear}</span>
                </div>
              </button>
            </div>

            {/* Private Collector Inquiry Form */}
            <div className="collector-ledger-form-box">
              {!inquirySent ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setInquirySent(true);
                  }}
                  className="ledger-form"
                >
                  <span className="form-legend">프라이빗 1:1 수장고 관람 & 소장 문의</span>
                  <div className="form-input-pair">
                    <input
                      type="text"
                      required
                      placeholder="수집가 성함"
                      className="form-input-antique"
                      value={inquiryData.name}
                      onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                    />
                    <input
                      type="tel"
                      required
                      placeholder="연락처 (010-0000-0000)"
                      className="form-input-antique"
                      value={inquiryData.contact}
                      onChange={(e) => setInquiryData({ ...inquiryData, contact: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="form-submit-gold-btn">
                    <span>소장 문의 밀봉 전송 (SUBMIT)</span>
                  </button>
                </form>
              ) : (
                <div className="inquiry-success-msg">
                  <span className="succ-icon">📜</span>
                  <strong className="succ-lead">소장 문의가 안전하게 접수되었습니다</strong>
                  <p className="succ-body">{inquiryData.name} 귀하께 수석 큐레이터가 직접 연락드리겠습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="detail-bottom-dock">
        <div className="detail-meta-row">
          <div className="star-rating">★★★★★</div>
          <div className="meta-div" />
          <span className="rating-text">Masterwork Grade</span>
          <span className="item-year">{book.heroYear} A.D.</span>
        </div>
      </div>
    </aside>
  );
}
