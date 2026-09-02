import React, { useState, useRef, useCallback, useEffect } from "react";
import MagnifierViewer from "./MagnifierViewer";

export default function True3DOpenBook({ book, onClose }) {
  const [currentSpread, setCurrentSpread] = useState(0); // 0: Folio I-II, 1: Folio III-IV, 2: Folio V-VI
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState("next"); // "next" or "prev"
  const [isClosing, setIsClosing] = useState(false);
  const [isOpeningAnim, setIsOpeningAnim] = useState(true);
  const [waxStamped, setWaxStamped] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: "", contact: "" });
  const [inquirySent, setInquirySent] = useState(false);
  const [pageLight, setPageLight] = useState({ x: 50, y: 30 });

  const totalSpreads = 3;
  const bookRef = useRef(null);

  // Trigger opening animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpeningAnim(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Mouse move for subtle 3D lighting reflection
  const handleMouseMove = useCallback((e) => {
    if (!bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPageLight({ x, y });
  }, []);

  const handleNext = () => {
    if (currentSpread < totalSpreads - 1 && !isFlipping) {
      setIsFlipping(true);
      setFlipDir("next");
      setTimeout(() => {
        setCurrentSpread(prev => prev + 1);
        setIsFlipping(false);
      }, 500);
    }
  };

  const handlePrev = () => {
    if (currentSpread > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDir("prev");
      setTimeout(() => {
        setCurrentSpread(prev => prev - 1);
        setIsFlipping(false);
      }, 500);
    }
  };

  // Smooth Closing Sequence
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className={`open-book-viewport-overlay ${isClosing ? "closing" : ""} ${isOpeningAnim ? "opening" : ""}`}>
      {/* Top Bar with Book Title & Spread Tabs & Close Button */}
      <header className="open-book-top-bar">
        <div className="book-meta-header">
          <span className="book-tome-tag">{book.tomeNumber}</span>
          <div className="book-title-stack">
            <span className="book-title-main">{book.title} ({book.latinTitle})</span>
            <span className="book-title-sub">{book.era} • {book.origin}</span>
          </div>
        </div>

        {/* Spread Navigation Tabs */}
        <nav className="open-book-tabs" aria-label="도감 장절">
          <button
            type="button"
            className={`open-tab-btn ${currentSpread === 0 ? "active" : ""}`}
            onClick={() => !isFlipping && setCurrentSpread(0)}
          >
            <span>I. 기원 & 성물 실물</span>
          </button>
          <button
            type="button"
            className={`open-tab-btn ${currentSpread === 1 ? "active" : ""}`}
            onClick={() => !isFlipping && setCurrentSpread(1)}
          >
            <span>II. 전승 & 2.5x 돋보기</span>
          </button>
          <button
            type="button"
            className={`open-tab-btn ${currentSpread === 2 ? "active" : ""}`}
            onClick={() => !isFlipping && setCurrentSpread(2)}
          >
            <span>III. 공인 감정서 & 밀랍 인장</span>
          </button>
        </nav>

        {/* Close Button */}
        <button
          type="button"
          className="open-book-close-btn"
          onClick={handleClose}
          title="도감 덮기 (ESC)"
        >
          <span className="close-icon">✕</span>
          <span className="close-txt">책 덮기</span>
        </button>
      </header>

      {/* Main 3D Physical Open Book Spread Stage */}
      <div className="open-book-stage">
        <div
          ref={bookRef}
          className={`physical-3d-open-book ${isOpeningAnim ? "anim-opening-book" : ""} ${isClosing ? "anim-closing-book" : ""}`}
          onMouseMove={handleMouseMove}
          style={{
            "--cover-bg": book.themeColor,
            "--accent-gold": book.accentColor,
            "--lx": `${pageLight.x}%`,
            "--ly": `${pageLight.y}%`
          }}
        >
          {/* Deep Outer Leather Hardcover Case & Gilded Edge Rim */}
          <div className="open-book-leather-case">
            <div className="case-corner tl" />
            <div className="case-corner tr" />
            <div className="case-corner bl" />
            <div className="case-corner br" />
            <div className="case-shadow-ao" />
          </div>

          {/* Central Gutter / Spine Valley with Sewn Linen Headband & Satin Ribbon */}
          <div className="open-book-spine-gutter">
            <div className="spine-crease-shadow" />
            <div className="spine-stitch-knot k1" />
            <div className="spine-stitch-knot k2" />
            <div className="spine-stitch-knot k3" />
            <div className="spine-stitch-knot k4" />
          </div>
          <div className="spine-silk-ribbon" />

          {/* ================= LEFT SPREAD WING (SWINGS OPEN IN 3D) ================= */}
          <div className="open-page-wing left-wing">
            <div className="page-vellum-texture" />
            <div className="page-curved-shadow left" />

            <div className="page-content-wrapper">
              {currentSpread === 0 && (
                <div className="spread-text-folio">
                  <div className="folio-chapter-header">
                    <span className="folio-num">FOLIO I</span>
                    <span className="folio-rubric">CAPUT PRIMUM • {book.category}</span>
                  </div>

                  <h2 className="folio-main-title">{book.title}</h2>
                  <p className="folio-latin-subtitle">{book.latinTitle}</p>
                  <p className="folio-sub-desc">{book.subtitle}</p>

                  <div className="folio-gold-divider" />

                  <div className="folio-quote-block">
                    <span className="quote-glyph">“</span>
                    <p className="quote-body">{book.pages[0].quote}</p>
                  </div>

                  <p className="folio-body-prose">
                    {book.pages[0].body}
                  </p>

                  <div className="folio-marginalia-box">
                    <div className="marginalia-hdr">
                      <span className="m-icon">☞</span>
                      <span className="m-title">수장고 비망 사료 (ARCHIVUM NOTANDUM)</span>
                    </div>
                    <div className="marginalia-grid">
                      <div className="m-item">
                        <span className="m-label">공식 제작처:</span>
                        <strong className="m-val">{book.origin}</strong>
                      </div>
                      <div className="m-item">
                        <span className="m-label">보존 등급:</span>
                        <strong className="m-val rubric">{book.appraisalGrade}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSpread === 1 && (
                <div className="spread-text-folio">
                  <div className="folio-chapter-header">
                    <span className="folio-num">FOLIO III</span>
                    <span className="folio-rubric">PROVENANTIA • 540년의 전승 족보</span>
                  </div>

                  <h3 className="folio-main-title">540년간 봉인된 비밀 서고의 기록</h3>
                  <div className="folio-gold-divider" />

                  <p className="folio-body-prose">
                    {book.pages[1].body}
                  </p>

                  <div className="folio-provenance-plate">
                    <span className="prov-tag">⚜️ 소장 전승 족보 (PROVENANCE LINEAGE)</span>
                    <p className="prov-line">{book.provenance}</p>
                  </div>

                  <div className="folio-curator-callout">
                    <span className="callout-icon">❧</span>
                    <div className="callout-text">
                      <strong className="callout-lead">수석 큐레이터 관찰 비망록</strong>
                      <p className="callout-p">{book.pages[1].callout}</p>
                    </div>
                  </div>
                </div>
              )}

              {currentSpread === 2 && (
                <div className="spread-text-folio cert-folio">
                  <div className="folio-chapter-header">
                    <span className="folio-num">FOLIO V</span>
                    <span className="folio-rubric">AUTHENTICA • 공인 감정 증서</span>
                  </div>

                  <div className="cert-imperial-seal-header">
                    <span className="cert-fleur">⚜️</span>
                    <h3 className="cert-imperial-title">ARCHIVUM IMPERIALE</h3>
                    <p className="cert-motto">“대영·옥스퍼드 고문서 학회 공인 진품”</p>
                  </div>

                  <div className="folio-gold-divider" />

                  <div className="cert-table-styled">
                    <div className="c-row">
                      <span className="c-k">성물 명칭</span>
                      <strong className="c-v">{book.title} ({book.latinTitle})</strong>
                    </div>
                    <div className="c-row">
                      <span className="c-k">추정 제작 연대</span>
                      <strong className="c-v">{book.era}</strong>
                    </div>
                    <div className="c-row">
                      <span className="c-k">평가 추정 가치</span>
                      <strong className="c-v gold">{book.value}</strong>
                    </div>
                    <div className="c-row">
                      <span className="c-k">보존 검정 등급</span>
                      <strong className="c-v emerald">{book.appraisalGrade}</strong>
                    </div>
                    <div className="c-row">
                      <span className="c-k">외형 제원 규격</span>
                      <span className="c-v">{book.dimensions}</span>
                    </div>
                  </div>

                  <div className="cert-sign-strip">
                    <div className="sign-col">
                      <span className="sign-hand">Dr. Alistair Vance</span>
                      <span className="sign-sub">수석 고미술 감정관 직인</span>
                    </div>
                    <span className="cert-id-tag">{book.pages[3]?.certificateNo || `CERT-${book.heroYear}-994`}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Left Page Layered Thickness Lines */}
            <div className="page-stacked-edge-lines left" />
          </div>

          {/* ================= RIGHT SPREAD WING ================= */}
          <div className="open-page-wing right-wing">
            <div className="page-vellum-texture" />
            <div className="page-curved-shadow right" />

            <div className="page-content-wrapper">
              {currentSpread === 0 && (
                <div className="spread-media-folio">
                  <div className="folio-chapter-header">
                    <span className="folio-num">FOLIO II</span>
                    <span className="folio-rubric">VISIO ARTEFACTI • 성물 실사 & 제원</span>
                  </div>

                  {/* Museum Artifact Showcase Frame */}
                  <div className="open-museum-showcase-frame">
                    <div className="frame-bracket tl" />
                    <div className="frame-bracket tr" />
                    <div className="frame-bracket bl" />
                    <div className="frame-bracket br" />
                    <img
                      src={book.artifactImage}
                      alt={book.title}
                      className="showcase-img-fit"
                    />
                    <div className="showcase-caption-overlay">
                      <span className="cap-era-tag">{book.era} 원형 보존 실물</span>
                      <span className="cap-price-tag">{book.value}</span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="folio-specs-pills-row">
                    {book.pages[0].highlights.map((item, idx) => (
                      <div key={idx} className="folio-spec-badge">
                        <span className="s-label">{item.label}</span>
                        <strong className="s-val">{item.value}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Advance to Next Spread */}
                  <button
                    type="button"
                    className="folio-turn-page-btn"
                    onClick={handleNext}
                  >
                    <span>❧ Folio Sequens : 2.5배 돋보기로 정밀 관찰 ➔</span>
                  </button>
                </div>
              )}

              {currentSpread === 1 && (
                <div className="spread-media-folio">
                  <div className="folio-chapter-header">
                    <span className="folio-num">FOLIO IV</span>
                    <span className="folio-rubric">MICROSCOPIUM • 초정밀 돋보기 검증</span>
                  </div>

                  {/* Interactive Loupe Viewer */}
                  <MagnifierViewer
                    imageSrc={book.artifactImage}
                    detailSrc={book.detailImage}
                    title={book.title}
                    era={book.era}
                  />

                  <button
                    type="button"
                    className="folio-turn-page-btn mt-2"
                    onClick={handleNext}
                  >
                    <span>❧ Folio Sequens : 공인 감정서 및 붉은 밀랍 인장 날인 ➔</span>
                  </button>
                </div>
              )}

              {currentSpread === 2 && (
                <div className="spread-media-folio">
                  <div className="folio-chapter-header">
                    <span className="folio-num">FOLIO VI</span>
                    <span className="folio-rubric">SIGILLUM • 밀랍 인장 날인 & 소장</span>
                  </div>

                  {/* 3D Wax Seal Section */}
                  <div className="folio-wax-seal-box">
                    <div className="wax-info-left">
                      <strong className="wax-seal-title">황실 수장고 붉은 밀랍 봉인</strong>
                      <p className="wax-seal-prompt">인장을 클릭하여 진품 보증 직인을 날인하십시오.</p>
                    </div>

                    <button
                      type="button"
                      className={`folio-wax-stamp-3d ${waxStamped ? "stamped" : ""}`}
                      onClick={() => setWaxStamped(true)}
                      disabled={waxStamped}
                      title="클릭하여 밀랍 인장 날인"
                    >
                      <div className="wax-body-3d" style={{ backgroundColor: book.sealColor }}>
                        <span className="wax-seal-latin">ARCANA</span>
                        <span className="wax-seal-yr">{book.heroYear}</span>
                      </div>
                    </button>
                  </div>

                  {/* Collector Inquiry Form on Parchment */}
                  <div className="folio-collector-inquiry-box">
                    {!inquirySent ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setInquirySent(true);
                        }}
                        className="folio-inquiry-form"
                      >
                        <span className="form-head">프라이빗 1:1 수장고 관람 & 소장 문의</span>
                        <div className="form-row-2col">
                          <input
                            type="text"
                            required
                            placeholder="수집가 성함"
                            className="folio-input"
                            value={inquiryData.name}
                            onChange={e => setInquiryData({ ...inquiryData, name: e.target.value })}
                          />
                          <input
                            type="tel"
                            required
                            placeholder="연락처 (010-0000-0000)"
                            className="folio-input"
                            value={inquiryData.contact}
                            onChange={e => setInquiryData({ ...inquiryData, contact: e.target.value })}
                          />
                        </div>
                        <button type="submit" className="folio-submit-btn">
                          <span>소장 전언 밀봉 전송</span>
                        </button>
                      </form>
                    ) : (
                      <div className="folio-inquiry-success">
                        <span className="succ-fleur">📜</span>
                        <strong className="succ-msg">소장 문의가 안전하게 전달되었습니다</strong>
                        <p className="succ-sub">{inquiryData.name} 귀하께 수석 큐레이터가 직접 연락드리겠습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Page Layered Thickness Lines */}
            <div className="page-stacked-edge-lines right" />
          </div>

          {/* Dynamic 3D Fluttering Fan Page Leaves on Opening */}
          {isOpeningAnim && (
            <div className="opening-flutter-fan" aria-hidden="true">
              <div className="flutter-leaf f1" />
              <div className="flutter-leaf f2" />
              <div className="flutter-leaf f3" />
              <div className="flutter-leaf f4" />
            </div>
          )}

          {/* 3D Page Flip Leaf Animation Overlay for Next/Prev */}
          {isFlipping && (
            <div className={`page-flipping-leaf-3d ${flipDir}`}>
              <div className="leaf-face front" />
              <div className="leaf-face back" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Spread Navigation Bar */}
      <footer className="open-book-bottom-nav">
        <button
          type="button"
          className="spread-nav-btn prev"
          disabled={currentSpread === 0 || isFlipping || isOpeningAnim}
          onClick={handlePrev}
        >
          ❮ 이전 장 넘기기
        </button>

        <div className="spread-dots-group">
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`spread-dot ${i === currentSpread ? "active" : ""}`}
              onClick={() => !isFlipping && !isOpeningAnim && setCurrentSpread(i)}
              title={`Folio ${i * 2 + 1} - ${i * 2 + 2}`}
            />
          ))}
          <span className="spread-counter-text">
            FOLIO {currentSpread * 2 + 1} - {currentSpread * 2 + 2} / 6
          </span>
        </div>

        <button
          type="button"
          className="spread-nav-btn next"
          disabled={currentSpread === totalSpreads - 1 || isFlipping || isOpeningAnim}
          onClick={handleNext}
        >
          다음 장 넘기기 ❯
        </button>
      </footer>
    </div>
  );
}
