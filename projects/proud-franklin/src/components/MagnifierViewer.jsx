import React, { useState, useRef, useCallback } from "react";

export default function MagnifierViewer({ imageSrc, detailSrc, title, era }) {
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [activeView, setActiveView] = useState("macro"); // "macro" or "overview"
  const containerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });
  }, []);

  const currentDisplayImage = activeView === "macro" ? detailSrc : imageSrc;

  return (
    <div className="museum-magnifier-module">
      {/* Top Tool Switcher */}
      <div className="magnifier-toolbar">
        <div className="mag-title-badge">
          <span className="mag-compass-icon">⌖</span>
          <span className="mag-label">2.5× 황동 돋보기 관찰</span>
        </div>
        <div className="view-mode-tabs">
          <button
            type="button"
            className={`view-tab-btn ${activeView === "macro" ? "active" : ""}`}
            onClick={() => setActiveView("macro")}
          >
            표면 마이크로 접사
          </button>
          <button
            type="button"
            className={`view-tab-btn ${activeView === "overview" ? "active" : ""}`}
            onClick={() => setActiveView("overview")}
          >
            성물 전체 뷰
          </button>
        </div>
      </div>

      {/* Interactive Magnifier Viewport */}
      <div
        ref={containerRef}
        className="magnifier-stage-box"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={currentDisplayImage}
          alt={`${title} - ${era} 정밀 확대도`}
          className="magnifier-base-image"
        />

        {/* 2.5x Renaissance Brass Loupe */}
        <div
          className={`brass-loupe-lens ${isHovering ? "active" : ""}`}
          style={{
            left: `${lensPos.x}%`,
            top: `${lensPos.y}%`,
            "--zoom-x": `${lensPos.x}%`,
            "--zoom-y": `${lensPos.y}%`,
            backgroundImage: `url(${currentDisplayImage})`
          }}
        >
          {/* Engraved Brass Milled Outer Ring */}
          <div className="loupe-milled-rim" />
          
          {/* Glass Specular Flare */}
          <div className="loupe-glass-sheen" />

          {/* Precision Crosshair Reticle & Ticks */}
          <div className="loupe-reticle">
            <span className="reticle-line h" />
            <span className="reticle-line v" />
            <span className="reticle-circle" />
            <span className="reticle-tick n">0°</span>
            <span className="reticle-tick e">90°</span>
            <span className="reticle-tick s">180°</span>
            <span className="reticle-tick w">270°</span>
          </div>

          {/* Gold Zoom Level Pill */}
          <div className="loupe-zoom-tag">2.5×</div>
        </div>
      </div>
    </div>
  );
}
