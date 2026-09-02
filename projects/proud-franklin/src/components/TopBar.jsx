import React from "react";
import BackgroundMusicPlayer from "./BackgroundMusicPlayer";

export default function TopBar({
  candleMode,
  onToggleCandle,
  selectedCategory,
  onSelectCategory,
  onOpenDrawer,
  onPlayIntro,
  bgmEnabled,
  isBookOpen,
  books = []
}) {
  // Function to get authentic official brand SVG logo for TopBar buttons
  const getBrandLogoIcon = (bookId) => {
    if (bookId === "lladro_nao") {
      // 1. Authentic Official Lladró Stylized Tulip / Bellflower Emblem
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="nav-medallion-svg">
          <path d="M50 14 C43 28 36 42 36 56 C36 67 42 74 50 74 C58 74 64 67 64 56 C64 42 57 28 50 14 Z" />
          <path d="M32 38 C26 46 24 57 28 64 C31 69 38 72 43 70 C39 65 37 57 39 46 L32 38 Z" />
          <path d="M68 38 L61 46 C63 57 61 65 57 70 C62 72 69 69 72 64 C76 57 74 46 68 38 Z" />
          <path d="M50 77 C42 77 38 83 38 89 C38 94 43 97 50 97 C57 97 62 94 62 89 C62 83 58 77 50 77 Z M50 82 C53 82 56 85 56 89 C56 92 53 94 50 94 C47 94 44 92 44 89 C44 85 47 82 50 82 Z" />
        </svg>
      );
    }
    if (bookId === "royaldoulton" || bookId === "royaldoulton_jennifer") {
      // 2. Authentic Official Royal Doulton Crown with Standing Lion & Rosette Emblem
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="nav-medallion-svg">
          <path d="M26 62 L32 44 L42 54 L50 36 L58 54 L68 44 L74 62 Z" />
          <line x1="24" y1="65" x2="76" y2="65" stroke="currentColor" strokeWidth="3" />
          <path d="M48 14 C46 14 44 16 44 18 C44 20 45 22 47 23 L43 33 L57 33 L53 23 C55 22 56 20 56 18 C56 16 54 14 52 14 Z" />
          <circle cx="50" cy="18" r="4" fill="currentColor" />
          <circle cx="50" cy="80" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <circle cx="50" cy="80" r="5" fill="currentColor" />
          <circle cx="50" cy="71" r="2" fill="currentColor" />
          <circle cx="50" cy="89" r="2" fill="currentColor" />
          <circle cx="41" cy="80" r="2" fill="currentColor" />
          <circle cx="59" cy="80" r="2" fill="currentColor" />
        </svg>
      );
    }
    if (bookId === "aynsley_orchard" || bookId === "aynsley") {
      // 3. Authentic Official Aynsley Imperial Crown & English Rose Crest
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="nav-medallion-svg">
          <path d="M22 55 L28 32 L40 44 L50 22 L60 44 L72 32 L78 55 Z" />
          <path d="M20 58 L80 58 L78 64 L22 64 Z" />
          <circle cx="28" cy="28" r="3.5" />
          <circle cx="50" cy="17" r="4.5" />
          <circle cx="72" cy="28" r="3.5" />
          <path d="M50 70 C42 70 38 76 40 83 C42 88 47 92 50 92 C53 92 58 88 60 83 C62 76 58 70 50 70 Z" />
          <circle cx="43" cy="80" r="2.5" fill="currentColor" />
          <circle cx="57" cy="80" r="2.5" fill="currentColor" />
          <circle cx="50" cy="76" r="2.5" fill="currentColor" />
          <circle cx="50" cy="86" r="2.5" fill="currentColor" />
        </svg>
      );
    }
    if (bookId === "sevres_royal" || bookId === "sevres") {
      // 4. Manufacture Nationale de Sèvres Royal Crossed L's with Crown
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="nav-medallion-svg">
          <path d="M30 35 Q50 20 70 35 L66 42 Q50 30 34 42 Z" fill="currentColor" stroke="none" />
          <circle cx="50" cy="18" r="3.5" fill="currentColor" stroke="none" />
          <path d="M48 18 L52 18 L50 12 Z" fill="currentColor" stroke="none" />
          <circle cx="34" cy="24" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="66" cy="24" r="2.5" fill="currentColor" stroke="none" />
          <path d="M38 42 C38 68 58 78 68 86 C64 92 54 94 46 90 C36 84 32 72 32 58 C32 46 38 42 42 42 C48 42 50 48 46 54 C42 60 36 62 36 62" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M62 42 C62 68 42 78 32 86 C36 92 46 94 54 90 C64 84 68 72 68 58 C68 46 62 42 58 42 C52 42 50 48 54 54 C58 60 64 62 64 62" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="50" cy="66" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    }
    if (bookId === "royalworcester") {
      // 5. Official Royal Worcester Crown & 4-Quadrant Crescent Crest
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="nav-medallion-svg">
          <path d="M30 36 L36 20 L44 28 L50 14 L56 28 L64 20 L70 36 Z" />
          <rect x="28" y="38" width="44" height="5" rx="2" />
          <circle cx="50" cy="68" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
          <line x1="28" y1="68" x2="72" y2="68" stroke="currentColor" strokeWidth="2" />
          <line x1="50" y1="46" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
          <path d="M42 62 C42 56 46 52 50 52 C46 54 45 58 45 62 C45 66 46 70 50 72 C46 72 42 68 42 62 Z" />
          <circle cx="60" cy="58" r="2.5" />
          <circle cx="40" cy="78" r="2.5" />
          <circle cx="60" cy="78" r="2.5" />
        </svg>
      );
    }
    if (bookId === "rococo_porcelain" || bookId === "dresden") {
      // 6. Dresden Porzellan Imperial Crown & Gothic 'D'
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="nav-medallion-svg">
          <path d="M22 42 L28 22 L40 32 L50 15 L60 32 L72 22 L78 42 Z" />
          <path d="M20 44 L80 44 L78 50 L22 50 Z" />
          <circle cx="28" cy="18" r="3" />
          <circle cx="50" cy="10" r="3.5" />
          <circle cx="72" cy="18" r="3" />
          <path d="M36 56 L48 56 C62 56 70 64 70 74 C70 84 62 92 48 92 L36 92 Z M44 64 L44 84 L48 84 C56 84 61 80 61 74 C61 68 56 64 48 64 Z" />
        </svg>
      );
    }
    if (bookId === "victorian_embroidery" || bookId === "embroidery") {
      // 7. Victorian Petit Point Tapestry Needle & Floral Rosette Cartouche
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" className="nav-medallion-svg">
          <ellipse cx="50" cy="50" rx="34" ry="40" strokeWidth="2.5" strokeDasharray="3 3" />
          <ellipse cx="50" cy="50" rx="28" ry="34" strokeWidth="1.5" />
          <line x1="28" y1="72" x2="72" y2="28" strokeWidth="3" strokeLinecap="round" />
          <circle cx="70" cy="30" r="1.5" fill="currentColor" />
          <circle cx="50" cy="50" r="9" fill="currentColor" stroke="none" />
          <circle cx="50" cy="38" r="4" fill="currentColor" stroke="none" />
          <circle cx="50" cy="62" r="4" fill="currentColor" stroke="none" />
          <circle cx="38" cy="50" r="4" fill="currentColor" stroke="none" />
          <circle cx="62" cy="50" r="4" fill="currentColor" stroke="none" />
        </svg>
      );
    }
    if (bookId === "classic_art_frames" || bookId === "art_frames") {
      // 8. Art Union of London Classical Shield & Artist's Palette
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="nav-medallion-svg">
          <path d="M24 20 L76 20 L76 52 C76 72 50 88 50 88 C50 88 24 72 24 52 Z" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M50 32 C40 32 34 38 34 46 C34 54 40 58 45 58 C47 58 48 59 48 61 C48 64 45 66 48 68 C51 70 60 70 64 64 C68 58 66 46 66 42 C66 36 60 32 50 32 Z" />
          <circle cx="42" cy="42" r="2.5" fill="#fdfbf7" />
          <circle cx="50" cy="38" r="2.5" fill="#fdfbf7" />
          <circle cx="58" cy="42" r="2.5" fill="#fdfbf7" />
          <circle cx="60" cy="52" r="3" fill="#fdfbf7" />
          <path d="M22 16 L50 6 L78 16 Z" />
        </svg>
      );
    }
    // Fallback Heraldic Fleur-de-lis
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nav-medallion-svg">
        <circle cx="12" cy="12" r="9" strokeDasharray="2 2" />
        <path d="M12 4 C10 8 8 10 8 14 C8 17 10 19 12 19 C14 19 16 17 16 14 C16 10 14 8 12 4 Z" />
      </svg>
    );
  };

  // Dynamically map unique active brand books
  const uniqueBooksMap = new Map();
  books.forEach(b => {
    const key = b.id;
    if (!uniqueBooksMap.has(key)) {
      uniqueBooksMap.set(key, b);
    }
  });

  const brandCategories = [
    {
      id: "all",
      label: "전체 수장고 · Omnia",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="nav-medallion-svg">
          <path d="M12 2L3 7v2h18V7L12 2z" strokeLinejoin="round" />
          <path d="M5 9v9M9 9v9M15 9v9M19 9v9M3 18h18M2 21h20" strokeLinecap="round" />
        </svg>
      )
    },
    ...Array.from(uniqueBooksMap.values()).map(b => ({
      id: b.id,
      label: `${b.brandName}`,
      icon: getBrandLogoIcon(b.id)
    }))
  ];

  return (
    <header className="museum-topbar">
      {/* Left Brand Badge with Official 24K Gold Cameo */}
      <div className="museum-topbar-brand">
        <img
          src="/assets/brand/emblem_gold_only.png"
          alt="LA BELLE JIAN"
          className="topbar-gold-emblem"
        />
        <div className="topbar-brand-texts">
          <span className="topbar-brand-latin">LA BELLE JIAN</span>
          <span className="topbar-brand-sub">ARCHIVUM ANTIQUUM</span>
        </div>
      </div>

      {/* Center Filter Navigation with Pure Luxury Antique Medallion Icons */}
      {!isBookOpen && (
        <nav className="museum-nav-shelf" aria-label="성물 브랜드 카테고리">
          {brandCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`shelf-nav-icon-btn ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => onSelectCategory(cat.id)}
              title={cat.label}
              aria-label={cat.label}
            >
              <div className="icon-medallion-ring">
                {cat.icon}
              </div>
              <span className="medallion-tooltip">{cat.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Right Control Badges */}
      <div className="museum-topbar-actions">
        {/* Background Music Player (별을 따다) */}
        <BackgroundMusicPlayer isEnabled={bgmEnabled} volume={0.35} />

        {/* Replay Intro Video Button */}
        <button
          type="button"
          className="museum-action-pill"
          onClick={onPlayIntro}
          title="공식 인트로 영상 다시보기"
        >
          <span className="action-glyph">🎬</span>
          <span className="action-text">인트로 영상</span>
        </button>

        {/* Candlelight Ambient Toggle */}
        <button
          type="button"
          className={`museum-action-pill ${candleMode ? "glow-active" : ""}`}
          onClick={onToggleCandle}
          title={candleMode ? "촛불 조명 켜짐" : "촛불 조명 켜기"}
        >
          <span className="action-glyph">🕯️</span>
          <span className="action-text">{candleMode ? "촛불 앰비언스" : "자연광"}</span>
        </button>

        {/* Collection Index Drawer Button */}
        <button
          type="button"
          className="museum-drawer-trigger-btn"
          onClick={onOpenDrawer}
          title="수장고 전체 소장품 색인 열기"
        >
          <span className="action-glyph">📜</span>
          <span className="action-text">수장고 색인</span>
        </button>
      </div>
    </header>
  );
}
