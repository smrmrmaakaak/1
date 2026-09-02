import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ANTIQUE_BOOKS } from "./data/antiques";
import TopBar from "./components/TopBar";
import BookCard from "./components/BookCard";
import ThreeDRealBookViewer from "./components/ThreeDRealBookViewer";
import CinematicIntro from "./components/CinematicIntro";
import TextureFilters from "./components/TextureFilters";
import PaymentSuccessModal from "./components/PaymentSuccessModal";
import MuseumFooter from "./components/MuseumFooter";

export default function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [candleMode, setCandleMode] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [successReceipt, setSuccessReceipt] = useState(null);

  // Check for Toss Payments success redirect callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = params.get('amount');
    const paymentSuccess = params.get('payment_success');

    if ((paymentKey && orderId) || paymentSuccess === 'true') {
      setShowIntro(false);
      const paidNum = amount ? parseInt(amount, 10) : 8000000;
      const receipt = {
        orderId: orderId || `ORD-TOSS-${Date.now().toString().slice(-6)}`,
        orderName: '라벨르지안 앤틱 성물 소장 결제',
        productName: '스페인 야드로 나오 모성애와 아이 (My Sweet Girl)',
        brandName: '스페인 야드로 & 나오 공방',
        paidAmount: paidNum,
        totalPrice: 8000000,
        paymentPlan: paidNum <= 100 ? 'test100' : (paidNum < 1000000 ? 'deposit' : 'full'),
        paymentMethod: 'CARD',
        buyerName: 'VIP 수집가',
        buyerPhone: '010-1234-5678',
        deliveryType: 'direct',
        deliveryAddress: '라벨르지안 전담 감정사 보안 특송 배송지',
        approvedAt: new Date().toLocaleString('ko-KR'),
        cardCompany: '토스페이먼츠(Toss Payments) 정상 승인',
        apprNo: 'APPR-' + (paymentKey ? paymentKey.slice(-8) : Math.floor(10000000 + Math.random() * 90000000)),
        paymentKey: paymentKey
      };
      setSuccessReceipt(receipt);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 3D Cover Flow Showcase State
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });
  const galleryRef = useRef(null);

  // Filter books by category
  const filteredBooks = useMemo(() => {
    if (selectedCategory === "all") return ANTIQUE_BOOKS;
    return ANTIQUE_BOOKS.filter(b => b.id === selectedCategory || b.categoryKey === selectedCategory);
  }, [selectedCategory]);

  // Ensure activeIndex is within bounds when filteredBooks changes
  useEffect(() => {
    setActiveIndex(0);
    setDragOffset(0);
  }, [selectedCategory]);

  // Mouse Move for 3D Parallax Tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showIntro) {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          setShowIntro(false);
        }
        return;
      }

      if (selectedBook) {
        if (e.key === "Escape") setSelectedBook(null);
        return;
      }

      if (drawerOpen) {
        if (e.key === "Escape") setDrawerOpen(false);
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, filteredBooks.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" || e.key === " ") {
        if (filteredBooks[activeIndex]) {
          e.preventDefault();
          setSelectedBook(filteredBooks[activeIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showIntro, selectedBook, drawerOpen, activeIndex, filteredBooks]);

  // Horizontal Wheel / Trackpad Scroll
  const handleWheel = useCallback((e) => {
    if (showIntro || selectedBook || drawerOpen) return;
    if (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 30) {
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      if (delta > 30) {
        setActiveIndex(prev => Math.min(prev + 1, filteredBooks.length - 1));
      } else if (delta < -30) {
        setActiveIndex(prev => Math.max(prev - 1, 0));
      }
    }
  }, [showIntro, selectedBook, drawerOpen, filteredBooks.length]);

  // --- MOUSE & TOUCH SWIPE DRAG HANDLERS ---
  const handlePointerDown = (e) => {
    if (showIntro || selectedBook || drawerOpen) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (clientX === undefined) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      time: performance.now()
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (clientX === undefined) return;

    const deltaX = clientX - dragStartRef.current.x;
    setDragOffset(deltaX);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0]?.clientX) || dragStartRef.current.x;
    const deltaX = clientX - dragStartRef.current.x;
    const elapsed = performance.now() - dragStartRef.current.time;
    const velocity = Math.abs(deltaX) / Math.max(1, elapsed); // px/ms

    // Threshold: > 70px drag or swift swipe velocity > 0.45 px/ms
    if (deltaX < -70 || (deltaX < -25 && velocity > 0.4)) {
      setActiveIndex(prev => Math.min(prev + 1, filteredBooks.length - 1));
    } else if (deltaX > 70 || (deltaX > 25 && velocity > 0.4)) {
      setActiveIndex(prev => Math.max(prev - 1, 0));
    }

    setDragOffset(0);
  };

  const handleOpenBook = (book) => {
    setSelectedBook(book);
  };

  const handleCloseBook = () => {
    setSelectedBook(null);
  };

  const activeBook = filteredBooks[activeIndex] || filteredBooks[0];

  return (
    <div
      className={`stage ${candleMode ? "candle-ambience" : "natural-light"}`}
      data-mode={selectedBook ? "detail" : "gallery"}
      style={{
        "--mx": `${mousePos.x * 20}px`,
        "--my": `${mousePos.y * 20}px`
      }}
      onWheel={handleWheel}
    >
      {/* SVG Procedural Grain Filters */}
      <TextureFilters />

      {/* Floating Gold Motes / Ember Dust Particles */}
      <div className="ember-field" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="gold-ember"
            style={{
              left: `${(i * 5.8) % 100}%`,
              top: `${(i * 7.3) % 100}%`,
              animationDelay: `${(i * 0.45) % 6}s`,
              animationDuration: `${10 + (i % 6)}s`
            }}
          />
        ))}
      </div>

      {/* Top Header */}
      {!selectedBook && !showIntro && (
        <TopBar
          candleMode={candleMode}
          onToggleCandle={() => setCandleMode(prev => !prev)}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenDrawer={() => setDrawerOpen(true)}
          onPlayIntro={() => setShowIntro(true)}
          bgmEnabled={!showIntro}
          isBookOpen={false}
          books={ANTIQUE_BOOKS}
        />
      )}

      {/* Background Watermark Hero Title */}
      <h1 className="hero-word" aria-hidden="true">
        {selectedBook ? selectedBook.heroYear : (activeBook ? activeBook.heroYear : "ANTIQUA")}
      </h1>

      {/* 3D Interactive Books Swipe & Cover Flow Showcase */}
      {!selectedBook && !showIntro && (
        <main
          ref={galleryRef}
          className={`gallery coverflow-gallery ${isDragging ? "is-swiping" : ""}`}
          aria-label="중세 골동품 도감 3D 스와이프 쇼케이스"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Cover Flow Track */}
          <div className="coverflow-stage-viewport">
            {filteredBooks.map((book, idx) => {
              const itemWidth = 320;
              const liveDragOffset = dragOffset / itemWidth;
              const rawOffset = (idx - activeIndex) + liveDragOffset;
              const isCenter = idx === activeIndex;

              return (
                <BookCard
                  key={book.id}
                  book={book}
                  index={idx}
                  activeIndex={activeIndex}
                  offset={rawOffset}
                  isCenter={isCenter}
                  onSelect={handleOpenBook}
                  onFocus={setActiveIndex}
                  mousePos={mousePos}
                />
              );
            })}
          </div>

          {/* Left / Right Floating Golden Nav Arrows */}
          {filteredBooks.length > 1 && (
            <>
              <button
                type="button"
                className="coverflow-arrow-btn prev-arrow"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                title="이전 성물 서책 보기 (←)"
                aria-label="이전 성물 서책"
              >
                ❮
              </button>

              <button
                type="button"
                className="coverflow-arrow-btn next-arrow"
                disabled={activeIndex === filteredBooks.length - 1}
                onClick={() => setActiveIndex(prev => Math.min(filteredBooks.length - 1, prev + 1))}
                title="다음 성물 서책 보기 (→)"
                aria-label="다음 성물 서책"
              >
                ❯
              </button>
            </>
          )}

          {/* Bottom Showcase Carousel Controls & Meta Info */}
          <div className="coverflow-bottom-controller">
            <div className="coverflow-meta-pill">
              <span className="pill-tome">{activeBook?.tomeNumber}</span>
              <span className="pill-divider">•</span>
              <span className="pill-title">{activeBook?.brandName}</span>
              <span className="pill-divider">({activeBook?.heroYear} A.D.)</span>
              <span className="pill-count">총 {activeBook?.products?.length || 1}종 5각 정밀 제품 이미지 도감</span>
            </div>

            {/* Pagination Jump Dots */}
            {filteredBooks.length > 1 && (
              <div className="coverflow-dot-pagination">
                {filteredBooks.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`carousel-dot ${i === activeIndex ? "active" : ""}`}
                    onClick={() => setActiveIndex(i)}
                    title={`${b.tomeNumber} • ${b.title}`}
                    aria-label={`${b.title} 선택`}
                  />
                ))}
              </div>
            )}

            <div className="coverflow-swipe-hint">
              <span>{filteredBooks.length > 1 ? "✦ 마우스 드래그 / 좌우 스와이프로 서책 탐색 • 클릭 시 3D 도감 펼침 ✦" : "✦ 클릭 시 3D 도감 펼침 • 실물 사진 및 5각 정밀 제품 이미지 열람 ✦"}</span>
            </div>
          </div>

        </main>
      )}

      {/* Official Museum Business & Compliance Escrow Footer */}
      {!selectedBook && !showIntro && (
        <MuseumFooter />
      )}

      {/* Real 3D Mesh WebGL Open Book Experience */}
      {selectedBook && !showIntro && (
        <ThreeDRealBookViewer
          book={selectedBook}
          onClose={handleCloseBook}
        />
      )}

      {/* Cinematic Intro Video Overlay */}
      {showIntro && (
        <CinematicIntro
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Slide-out Archival Collection Index Drawer */}
      <div className={`archival-drawer-backdrop ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)}>
        <aside className="archival-drawer-panel" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <span className="drawer-crest">⚜️</span>
            <div className="drawer-title-group">
              <h2 className="drawer-title">ARCHIVUM IMPERIALE</h2>
              <span className="drawer-sub">황실 수장고 전체 보존 목록 색인 (총 {ANTIQUE_BOOKS.length}종)</span>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setDrawerOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="drawer-book-list">
            {ANTIQUE_BOOKS.map((book) => (
              <div
                key={book.id}
                className="drawer-book-item"
                onClick={() => {
                  setSelectedBook(book);
                  setDrawerOpen(false);
                }}
              >
                <div className="drawer-item-badge" style={{ backgroundColor: book.sealColor }}>
                  {book.tomeNumber.replace("LIBER ", "")}
                </div>
                <div className="drawer-item-meta">
                  <strong className="d-title">{book.title}</strong>
                  <span className="d-latin">{book.latinTitle}</span>
                  <span className="d-era">{book.era} • {book.category}</span>
                </div>
                <span className="d-price">{book.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Global Payment Success & Official Receipt Modal */}
      {successReceipt && (
        <PaymentSuccessModal
          receipt={successReceipt}
          onClose={() => setSuccessReceipt(null)}
        />
      )}
    </div>
  );
}
