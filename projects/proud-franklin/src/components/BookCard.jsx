import React, { useRef, useState, useCallback } from "react";

export default function BookCard({
  book,
  index,
  activeIndex,
  offset,
  isCenter,
  onSelect,
  onFocus,
  mousePos
}) {
  const cardRef = useRef(null);
  const [localLight, setLocalLight] = useState({ x: 50, y: 30 });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLocalLight({ x, y });
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isCenter) {
      onSelect(book);
    } else {
      onFocus(index);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`book-card coverflow-card ${isCenter ? "is-center" : "is-side"}`}
      data-book={book.id}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{
        "--cover-color": book.themeColor,
        "--accent-color": book.accentColor,
        "--lx": `${localLight.x}%`,
        "--ly": `${localLight.y}%`,
        "--local-x": `${isCenter ? mousePos.x * 12 : 0}px`,
        "--local-y": `${isCenter ? mousePos.y * 12 : 0}px`,
        "--offset": offset,
        zIndex: 100 - Math.round(Math.abs(offset) * 10)
      }}
      role="button"
      tabIndex={0}
      aria-label={`${book.title} - ${book.subtitle}`}
    >
      <div className="book">
        {/* Soft Contact Floor Shadow */}
        <div className="book-shadow" />

        {/* Back Leather Cover */}
        <div
          className="book-back"
          style={{
            backgroundImage: `url(${book.coverTextureUrl || '/assets/textures/leather_brown.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Stacked Parchment Page Block with Real Aged Vellum Texture */}
        <div
          className="page-block"
          style={{
            backgroundImage: `url(/assets/textures/parchment_page.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="page-fiber-overlay" />
        </div>

        {/* Fan Pages that flutter and unfold when opened in 3D */}
        <div className="page-fan">
          <i style={{ backgroundImage: `url(/assets/textures/parchment_page.jpg)`, backgroundSize: 'cover' }} />
          <i style={{ backgroundImage: `url(/assets/textures/parchment_page.jpg)`, backgroundSize: 'cover' }} />
          <i style={{ backgroundImage: `url(/assets/textures/parchment_page.jpg)`, backgroundSize: 'cover' }} />
          <i style={{ backgroundImage: `url(/assets/textures/parchment_page.jpg)`, backgroundSize: 'cover' }} />
        </div>

        {/* Heavy Morocco Leather Front Cover with 3D Hinge (Zero HTML/CSS UI Overlay) */}
        <div className="front-cover">
          {/* Authentic Real Vintage Leather Texture Photo Layer */}
          <div
            className="vintage-leather-photo-bg"
            style={{
              backgroundImage: `url(${book.coverTextureUrl || '/assets/textures/leather_brown.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="leather-grain-tex" />
          <div className="leather-distress-overlay" />
          <div className="leather-specular-light" />

          {/* Soft Spine Shadow and Specular Highlights */}
          <div className="spine-hinge-bar" />

          {/* Hover Open Ribbon Seal */}
          <div className="hover-open-ribbon">
            <span>{isCenter ? "OPEN" : "VIEW"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
