import React, { useState, useRef, useCallback } from "react";
import MagnifierViewer from "./MagnifierViewer";
import ParchmentTexture from "./ParchmentTexture";

export default function OpenTomeSpread({ book, onClose }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState("next");
  const [waxStamped, setWaxStamped] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: "", contact: "" });
  const [inquirySent, setInquirySent] = useState(false);
  const [pageLight, setPageLight] = useState({ x: 50, y: 30 });

  const spreadRef = useRef(null);
  const totalSpreads = 3;

  const handleSpreadMouseMove = useCallback((e) => {
    if (!spreadRef.current) return;
    const rect = spreadRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPageLight({ x, y });
  }, []);

  const handleNextSpread = () => {
    if (spreadIndex < totalSpreads - 1 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection("next");
      setTimeout(() => {
        setSpreadIndex(prev => prev + 1);
        setIsFlipping(false);
      }, 450);
    }
  };

  const handlePrevSpread = () => {
    if (spreadIndex > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection("prev");
      setTimeout(() => {
        setSpreadIndex(prev => prev - 1);
        setIsFlipping(false);
      }, 450);
    }
  };

  const handleStampWax = () => {
    setWaxStamped(true);
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    setInquirySent(true);
  };

  return (
    <div className="open-tome-overlay">
      {/* SVG Procedural Filters & Real Deckle Edge Paths */}
      <ParchmentTexture />

      {/* Top Gallery Header */}
      <header className="tome-top-nav">
        <div className="tome-badge-info">
          <div className="tome-emblem-mini" style={{ borderColor: book.accentColor }}>
            <span>{book.tomeNumber.replace("LIBER ", "")}</span>
          </div>
          <div className="tome-title-meta">
            <span className="tome-latin-tag">{book.tomeNumber} • {book.latinTitle}</span>
            <span className="tome-era-tag">{book.era} | {book.origin}</span>
          </div>
        </div>

        {/* Spread Navigation Ribbon Tabs */}
        <nav className="tome-spread-tabs" aria-label="도감 장절 이동">
          <button
            type="button"
            className={`spread-tab-btn ${spreadIndex === 0 ? "active" : ""}`}
            onClick={() => {
              if (spreadIndex !== 0 && !isFlipping) setSpreadIndex(0);
            }}
          >
            <span className="tab-roman">I</span> 기원과 성물 실물
          </button>
          <button
            type="button"
            className={`spread-tab-btn ${spreadIndex === 1 ? "active" : ""}`}
            onClick={() => {
              if (spreadIndex !== 1 && !isFlipping) setSpreadIndex(1);
            }}
          >
            <span className="tab-roman">II</span> 전승 비화 & 돋보기
          </button>
          <button
            type="button"
            className={`spread-tab-btn ${spreadIndex === 2 ? "active" : ""}`}
            onClick={() => {
              if (spreadIndex !== 2 && !isFlipping) setSpreadIndex(2);
            }}
          >
            <span className="tab-roman">III</span> 공인 감정 & 인장
          </button>
        </nav>

        {/* Close Button */}
        <button
          type="button"
          className="tome-close-btn"
          onClick={onClose}
          title="도감 덮기 (ESC)"
        >
          <span className="close-glyph">✕</span>
          <span className="close-label">도감 덮기</span>
        </button>
      </header>

      {/* Main 3D Two-Page Spread Book */}
      <div className="tome-spread-stage">
        <div
          ref={spreadRef}
          className="tome-book-spread"
          onMouseMove={handleSpreadMouseMove}
          style={{
            "--plx": `${pageLight.x}%`,
            "--ply": `${pageLight.y}%`
          }}
        >
          {/* Heavy Leather Base & Gold Corner Filigree */}
          <div className="tome-leather-base" style={{ "--cover-color": book.themeColor }}>
            <div className="leather-grain-overlay" />
            <div className="leather-corner tl" />
            <div className="leather-corner tr" />
            <div className="leather-corner bl" />
            <div className="leather-corner br" />
          </div>

          {/* Spine Center with Sewn Linen Headband Stitches & Satin Bookmark Ribbon */}
          <div className="tome-spine-center-realistic">
            <div className="spine-stitch s1" />
            <div className="spine-stitch s2" />
            <div className="spine-stitch s3" />
            <div className="spine-stitch s4" />
          </div>
          <div className="tome-ribbon-bookmark" />

          {/* Dynamic Light Specular Reflection Layer across the Book */}
          <div className="tome-interactive-sheen" />

          {/* ================= LEFT PAGE WING ================= */}
          <div className="tome-page-wing left-wing">
            {/* Real Aged Calfskin Vellum Layers */}
            <div className="vellum-paper-fiber" />
            <div className="vellum-tea-stain-vignette" />
            <div className="vellum-foxing-spots" />

            <div className="wing-parchment-inner">
              <div className="parchment-frame-border" />

              {spreadIndex === 0 && (
                <div className="folio-content-pane">
                  <div className="folio-header-bar">
                    <span className="folio-chapter-num">FOLIO I</span>
                    <span className="folio-rubric-tag">CAPUT PRIMUM • {book.category}</span>
                  </div>

                  <h2 className="illuminated-heading">{book.title}</h2>
                  <p className="illuminated-sub">{book.subtitle}</p>

                  <div className="manuscript-divider-gilded" />

                  {/* Illuminated Calligraphic Quote in Iron Gall Rubric */}
                  <div className="illuminated-quote-card">
                    <span className="quote-flourish">“</span>
                    <p className="quote-text">{book.pages[0].quote}</p>
                  </div>

                  {/* Illuminated Body with Gilded Drop-Cap */}
                  <div className="illuminated-body">
                    <span className="illuminated-dropcap-embossed" style={{ "--cap-color": book.accentColor }}>
                      {book.pages[0].body.charAt(0)}
                    </span>
                    <p className="body-prose">
                      {book.pages[0].body.slice(1)}
                    </p>
                  </div>

                  {/* Traditional Marginalia Archival Notes (Drawn directly on parchment) */}
                  <div className="manuscript-marginalia-block">
                    <div className="marginalia-header">
                      <span className="marginalia-rubric-glyph">☞</span>
                      <span className="marginalia-title">수장고 비망 사료 (ARCHIVUM NOTANDUM)</span>
                    </div>
                    <div className="marginalia-notes-grid">
                      <div className="m-note-item">
                        <span className="m-note-key">공식 제작처 :</span>
                        <strong className="m-note-val">{book.origin}</strong>
                      </div>
                      <div className="m-note-item">
                        <span className="m-note-key">보존 등급 :</span>
                        <strong className="m-note-val rubric-red">{book.appraisalGrade}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {spreadIndex === 1 && (
                <div className="folio-content-pane">
                  <div className="folio-header-bar">
                    <span className="folio-chapter-num">FOLIO III</span>
                    <span className="folio-rubric-tag">PROVENANTIA • 540년의 전승 족보</span>
                  </div>

                  <h3 className="illuminated-heading">540년간 봉인된 비밀 서고의 기록</h3>
                  <div className="manuscript-divider-gilded" />

                  <div className="illuminated-body">
                    <span className="illuminated-dropcap-embossed" style={{ "--cap-color": book.accentColor }}>
                      {book.pages[1].body.charAt(0)}
                    </span>
                    <p className="body-prose">
                      {book.pages[1].body.slice(1)}
                    </p>
                  </div>

                  {/* Traditional Calligraphic Provenance Lineage */}
                  <div className="manuscript-marginalia-block">
                    <span className="marginalia-title">소장 전승 족보 (PROVENANCE LINEAGE)</span>
                    <p className="provenance-flow-text">⚜️ {book.provenance}</p>
                  </div>

                  {/* Curator Callout on Parchment */}
                  <div className="manuscript-secret-callout">
                    <span className="secret-rubric-icon">❧</span>
                    <div className="secret-text-flow">
                      <strong className="secret-lead">수석 큐레이터 관찰 비망록</strong>
                      <p className="secret-p">{book.pages[1].callout}</p>
                    </div>
                  </div>
                </div>
              )}

              {spreadIndex === 2 && (
                <div className="folio-content-pane certificate-pane">
                  <div className="folio-header-bar">
                    <span className="folio-chapter-num">FOLIO V</span>
                    <span className="folio-rubric-tag">AUTHENTICA • 공인 감정 증서</span>
                  </div>

                  <div className="official-cert-header">
                    <span className="cert-crest">⚜️</span>
                    <h3 className="cert-main-title">ARCHIVUM IMPERIALE</h3>
                    <p className="cert-latin-sub">“Veritas et Aeternitas — 대영·옥스퍼드 고문서 학회 공인”</p>
                  </div>

                  <div className="manuscript-divider-gilded" />

                  <div className="cert-formal-table">
                    <div className="c-row">
                      <span className="c-key">성물 명칭</span>
                      <strong className="c-val">{book.title} ({book.latinTitle})</strong>
                    </div>
                    <div className="c-row">
                      <span className="c-key">추정 제작 연대</span>
                      <strong className="c-val">{book.era}</strong>
                    </div>
                    <div className="c-row">
                      <span className="c-key">평가 추정 가치</span>
                      <strong className="c-val text-gold-bright">{book.value}</strong>
                    </div>
                    <div className="c-row">
                      <span className="c-key">보존 검정 등급</span>
                      <strong className="c-val text-emerald">{book.appraisalGrade}</strong>
                    </div>
                    <div className="c-row">
                      <span className="c-key">외형 제원 규격</span>
                      <span className="c-desc">{book.dimensions}</span>
                    </div>
                  </div>

                  <p className="cert-solemn-note">
                    본 유물은 옥스퍼드 고고학 연구소 및 런던 고미술학회의 형광 X선(XRF) 및 방사성 탄소 연대 측정(C-14) 결과, 100% 진품이자 변형 없는 완품으로 공식 인증되었습니다.
                  </p>

                  <div className="cert-sign-row">
                    <div className="cert-curator-sign">
                      <span className="sign-cursive">Dr. Alistair Vance</span>
                      <span className="sign-title">수석 고미술 감정관 직인 • Master Curator</span>
                    </div>
                    <span className="cert-serial-tag">{book.pages[3].certificateNo || `CERT-${book.heroYear}-994`}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Left Page Layered Stack Lines */}
            <div className="page-stack-lines left" />
          </div>

          {/* ================= RIGHT PAGE WING ================= */}
          <div className="tome-page-wing right-wing">
            <div className="vellum-paper-fiber" />
            <div className="vellum-tea-stain-vignette" />
            <div className="vellum-foxing-spots" />

            <div className="wing-parchment-inner">
              <div className="parchment-frame-border" />

              {spreadIndex === 0 && (
                <div className="folio-content-pane">
                  <div className="folio-header-bar">
                    <span className="folio-chapter-num">FOLIO II</span>
                    <span className="folio-rubric-tag">VISIO ARTEFACTI • 성물 실사 & 제원</span>
                  </div>

                  {/* Antique Museum Photo Mounting with Brass Corner Clips */}
                  <div className="baroque-museum-frame-heavy">
                    <div className="frame-brass-corner tl" />
                    <div className="frame-brass-corner tr" />
                    <div className="frame-brass-corner bl" />
                    <div className="frame-brass-corner br" />
                    
                    <div className="frame-inner-matting-velvet">
                      <img
                        src={book.artifactImage}
                        alt={book.title}
                        className="baroque-art-img"
                      />
                      <div className="baroque-caption-overlay">
                        <span className="cap-era">{book.era} 원형 보존 실물</span>
                        <span className="cap-price">{book.value}</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights in Antique Rubric Table */}
                  <div className="manuscript-specs-rubric-grid">
                    {book.pages[0].highlights.map((item, idx) => (
                      <div key={idx} className="rubric-spec-pill">
                        <span className="r-spec-label">{item.label}</span>
                        <strong className="r-spec-val">{item.value}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Calligraphic Folio Advance Button */}
                  <button
                    type="button"
                    className="folio-ribbon-advance-btn"
                    onClick={handleNextSpread}
                  >
                    <span>❧ Folio Sequens : 2.5배 돋보기로 금속 세공 정밀 관찰 ➔</span>
                  </button>
                </div>
              )}

              {spreadIndex === 1 && (
                <div className="folio-content-pane">
                  <div className="folio-header-bar">
                    <span className="folio-chapter-num">FOLIO IV</span>
                    <span className="folio-rubric-tag">MICROSCOPIUM • 초정밀 돋보기 검증</span>
                  </div>

                  {/* 2.5x Renaissance Brass Loupe */}
                  <MagnifierViewer
                    imageSrc={book.artifactImage}
                    detailSrc={book.detailImage}
                    title={book.title}
                    era={book.era}
                  />

                  <button
                    type="button"
                    className="folio-ribbon-advance-btn mt-3"
                    onClick={handleNextSpread}
                  >
                    <span>❧ Folio Sequens : 공인 감정서 및 붉은 밀랍 인장 날인 ➔</span>
                  </button>
                </div>
              )}

              {spreadIndex === 2 && (
                <div className="folio-content-pane">
                  <div className="folio-header-bar">
                    <span className="folio-chapter-num">FOLIO VI</span>
                    <span className="folio-rubric-tag">SIGILLUM • 밀랍 인장 날인 & 소장</span>
                  </div>

                  {/* Authentic Parchment Wax Seal Chamber */}
                  <div className="manuscript-wax-chamber">
                    <div className="wax-chamber-intro">
                      <h4 className="wax-chamber-title">아르카나 황실 수장고 밀랍 봉인</h4>
                      <p className="wax-chamber-p">
                        오른쪽 붉은 밀랍 봉인을 클릭하여 진품 보증 직인을 날인하십시오.
                      </p>
                    </div>

                    <div className="wax-stamp-interactive-unit">
                      <button
                        type="button"
                        className={`royal-wax-stamp-btn-3d ${waxStamped ? "stamped" : ""}`}
                        onClick={handleStampWax}
                        disabled={waxStamped}
                        title="클릭하여 밀랍 인장 날인하기"
                      >
                        <div className="stamp-wax-disc-3d" style={{ backgroundColor: book.sealColor }}>
                          <span className="wax-droplet-edge e1" />
                          <span className="wax-droplet-edge e2" />
                          <span className="wax-droplet-edge e3" />
                          <span className="wax-monogram">ARCANA</span>
                          <span className="wax-year-sub">{book.heroYear}</span>
                        </div>
                      </button>
                      <span className="stamp-status-badge">
                        {waxStamped ? "✓ 공인 밀랍 인장 날인 완료" : "인장을 눌러 날인하세요"}
                      </span>
                    </div>
                  </div>

                  {/* Private Collector Ledger Record on Parchment */}
                  <div className="manuscript-collector-ledger">
                    {!inquirySent ? (
                      <form onSubmit={handleSendInquiry} className="inquiry-form-styled">
                        <span className="inquiry-form-title">프라이빗 1:1 수장고 관람 & 소장 신청</span>
                        <div className="inquiry-input-grid">
                          <input
                            type="text"
                            required
                            placeholder="수집가 성함 / 존칭"
                            className="collector-input-parchment"
                            value={inquiryData.name}
                            onChange={e => setInquiryData({ ...inquiryData, name: e.target.value })}
                          />
                          <input
                            type="tel"
                            required
                            placeholder="연락처 (010-0000-0000)"
                            className="collector-input-parchment"
                            value={inquiryData.contact}
                            onChange={e => setInquiryData({ ...inquiryData, contact: e.target.value })}
                          />
                        </div>
                        <button type="submit" className="folio-ledger-submit-btn">
                          <span className="btn-seal-dot" style={{ backgroundColor: book.sealColor }} />
                          <span>소장 전언 밀봉 전송 (SUBMIT)</span>
                        </button>
                      </form>
                    ) : (
                      <div className="inquiry-sealed-success">
                        <div className="success-crest">📜</div>
                        <h5 className="success-lead">소장 전언이 안전하게 밀봉되었습니다</h5>
                        <p className="success-body">
                          <strong>{inquiryData.name}</strong> 귀하의 신청이 아르카나 수석 큐레이터에게 안전하게 전달되었습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Right Page Layered Stack Lines */}
            <div className="page-stack-lines right" />
          </div>

          {/* Animated 3D Turning Page Leaf when flipping */}
          {isFlipping && (
            <div className={`tome-flipping-leaf ${flipDirection}`}>
              <div className="leaf-front" />
              <div className="leaf-back" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Page Navigation Ribbon */}
      <footer className="tome-bottom-nav">
        <button
          type="button"
          className="tome-nav-pill prev"
          disabled={spreadIndex === 0 || isFlipping}
          onClick={handlePrevSpread}
        >
          ❮ 이전 장 넘기기
        </button>

        <div className="tome-spread-dots-cluster">
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`tome-dot-gold ${i === spreadIndex ? "active" : ""}`}
              onClick={() => {
                if (i !== spreadIndex && !isFlipping) setSpreadIndex(i);
              }}
              title={`Folio ${i * 2 + 1} - ${i * 2 + 2}`}
            />
          ))}
          <span className="spread-counter-label">
            FOLIO {spreadIndex * 2 + 1} - {spreadIndex * 2 + 2} / 6
          </span>
        </div>

        <button
          type="button"
          className="tome-nav-pill next"
          disabled={spreadIndex === totalSpreads - 1 || isFlipping}
          onClick={handleNextSpread}
        >
          다음 장 넘기기 ❯
        </button>
      </footer>
    </div>
  );
}
