const fs = require('fs');
const path = require('path');

const cards = [
  // [A] 중세 고전 & 앤틱
  {
    id: 1,
    cat: 'medieval',
    tag: 'Medieval Antique',
    title: '01. Medieval Parchment & Wax Seal',
    desc: '실제 양피지 질감, 찢어진 종이 음영 및 클릭 시 봉인이 해제되는 인터랙티브 왁스 인장 스탬프',
    stage: `<div class="parchment-container">
      <div class="parchment-header">Royal Imperial Charter</div>
      <p class="parchment-body" id="parchmentText">In witness whereof, we have affixed our Great Imperial Wax Seal to this ancient parchment under the light of the celestial heavens...</p>
      <div class="wax-seal" id="waxSealDemo" title="인장을 클릭하여 봉인 해제"></div>
    </div>`
  },
  {
    id: 2,
    cat: 'medieval',
    tag: 'Gothic Typography',
    title: '02. Gothic Illuminated Drop Caps',
    desc: '중세 필사본 일루미네이션 대문자(Drop Cap)와 실시간 금박 엠보싱 쉬머(Gold Shimmer) 효과',
    stage: `<div class="gothic-manuscript">
      <span class="drop-cap">O</span>nce upon an ancient epoch in the gilded halls of Avalon, the runes whispered secrets of arcane alchemy and eternal wisdom.
      <div class="gold-shimmer-text" style="margin-top: 12px; text-align: center;">✦ MAGNUM OPUS ALCHEMICA ✦</div>
    </div>`
  },
  {
    id: 3,
    cat: 'medieval',
    tag: 'Baroque Luxury',
    title: '03. Baroque Gold Leaf & Filigree Frame',
    desc: '르네상스·바로크 양식의 앤틱 금장 문양 액자 테두리와 깊은 음영의 브라스 금속 광원 효과',
    stage: `<div class="baroque-frame">
      <div class="baroque-ornament">⚜ ❖ ⚜</div>
      <h3 style="font-family: 'Cinzel', serif; letter-spacing: 3px;">ROYAL ARCHIVE</h3>
      <p style="font-size: 0.8rem; color: #d4af37; margin-top: 4px;">Certified 15th Century Craftsmanship</p>
      <div class="baroque-ornament" style="margin-top: 8px;">⚜ ❖ ⚜</div>
    </div>`
  },
  {
    id: 4,
    cat: 'medieval',
    tag: 'Arcane 3D Book',
    title: '04. Grimoire Spellbook 3D Flip',
    desc: '마우스를 올리면 3D로 스르륵 펼쳐지는 고대 마도서와 회전하는 연금술 마법진 룬 서클',
    stage: `<div class="grimoire-book">
      <div class="grimoire-inner">
        <div class="grimoire-cover">
          <div class="rune-circle">⛧</div>
          <div style="font-weight: 800; letter-spacing: 2px;">GRIMOIRE</div>
          <div style="font-size: 0.75rem; color: #f59e0b;">(마우스를 올려 펼치기)</div>
        </div>
        <div class="grimoire-page">
          <div style="font-weight: 700; color: #78350f; margin-bottom: 6px;">📜 Arcane Chapter IV</div>
          <p>The convergence of modern code and medieval mysticism grants boundless creative potential.</p>
        </div>
      </div>
    </div>`
  },
  {
    id: 5,
    cat: 'medieval',
    tag: 'Cathedral Art',
    title: '05. Cathedral Stained Glass & Prism',
    desc: '고딕 대성당의 아치형 스테인드글라스 창문과 마우스 호버 시 화려하게 빛나는 프리즘 태양광',
    stage: `<div class="stained-glass-window">
      <div class="glass-pane ruby"></div>
      <div class="glass-pane sapphire"></div>
      <div class="glass-pane amber"></div>
      <div class="glass-pane emerald"></div>
      <div class="glass-pane amethyst"></div>
      <div class="glass-pane topaz"></div>
      <div class="prism-beam"></div>
    </div>`
  },
  {
    id: 6,
    cat: 'medieval',
    tag: 'Nautical Instrument',
    title: '06. Vintage Astrolabe & Compass',
    desc: '대항해시대 청동 아스트롤라베 천구의 및 마우스 드래그로 360도 회전하는 나침반 바늘',
    stage: `<div class="astrolabe-widget" id="astrolabeWidget" title="마우스로 드래그하여 나침반 회전">
      <div class="astrolabe-ring ring-outer"></div>
      <div class="astrolabe-ring ring-inner"></div>
      <div class="astrolabe-needle" id="astrolabeNeedle"></div>
      <div style="position: absolute; color: #d4af37; font-size: 0.75rem; font-weight: 700; top: 8px;">N</div>
    </div>`
  },

  // [B] 모던 3D & 시네마틱
  {
    id: 7,
    cat: 'cinematic',
    tag: 'Magic UI Style',
    title: '07. Bento Grid Spotlight Glow',
    desc: '마우스 커서의 실시간 좌표를 추적하여 부드러운 스포트라이트 광원을 비추는 벤토 카드',
    stage: `<div class="spotlight-card">
      <div class="spotlight-glow"></div>
      <div style="font-size: 1.5rem; margin-bottom: 6px;">🔦</div>
      <h4 style="font-size: 1rem; font-weight: 700;">Spotlight Card</h4>
      <p style="font-size: 0.8rem; color: var(--text-muted);">마우스를 올려 빛의 움직임을 확인하세요.</p>
    </div>`
  },
  {
    id: 8,
    cat: 'cinematic',
    tag: 'Aceternity 3D',
    title: '08. 3D Holographic Tilt Card',
    desc: '마우스 각도에 따라 입체 원근법(3D Tilt)으로 회전하며 무지개 오로라 광택을 반사하는 카드',
    stage: `<div class="holo-3d-card" id="holoTiltCard">
      <div class="holo-shine"></div>
      <div style="font-size: 0.75rem; color: #38bdf8; font-weight: 700;">PREMIUM ASSET</div>
      <h4 style="font-size: 1.1rem; margin: 6px 0;">3D HOLOGRAPHIC</h4>
      <p style="font-size: 0.75rem; color: var(--text-muted);">Move mouse around me</p>
    </div>`
  },
  {
    id: 9,
    cat: 'cinematic',
    tag: 'Canvas Particle',
    title: '09. Meteor Shower & Night Sky',
    desc: '실시간 HTML5 Canvas로 렌더링되는 은하수 별빛 및 대각선으로 떨어지는 유성우(별똥별)',
    stage: `<canvas class="canvas-stage" id="meteorCanvas"></canvas>`
  },
  {
    id: 10,
    cat: 'cinematic',
    tag: 'Fluid Gradient',
    title: '10. Aurora Borealis Fluid Waves',
    desc: '블러 필터와 다층 레이어로 연출되는 신비로운 북극광 오로라 유체 그라데이션',
    stage: `<div class="aurora-container">
      <div class="aurora-wave wave1"></div>
      <div class="aurora-wave wave2"></div>
      <div class="aurora-wave wave3"></div>
      <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; letter-spacing: 2px;">
        🌌 AURORA DYNAMICS
      </div>
    </div>`
  },
  {
    id: 11,
    cat: 'cinematic',
    tag: 'Physics Engine',
    title: '11. Magnetic Particle Repulsion',
    desc: '마우스 커서에 닿으면 사방으로 흩어졌다가 원래 자리로 유연하게 복원되는 파티클 매트릭스',
    stage: `<canvas class="canvas-stage" id="particleCanvas"></canvas>`
  },
  {
    id: 12,
    cat: 'cinematic',
    tag: 'Cyber Matrix',
    title: '12. Cyberpunk Decrypt & Glitch',
    desc: '클릭 시 무작위 외계 암호 문자가 실시간 디코딩되어 원본 문장으로 해독되는 해커 텍스트',
    stage: `<div class="glitch-text" id="decryptTextDemo" title="클릭하여 디코딩 재실행">SYSTEM_ONLINE_2026</div>`
  },
  {
    id: 13,
    cat: 'cinematic',
    tag: 'Micro Interaction',
    title: '13. Magnetic Liquid Ripple Button',
    desc: '쫀득한 스프링 호버 반응과 클릭한 위치에서 퍼져나가는 고유체 리플 물결 버튼',
    stage: `<button class="liquid-btn" id="liquidBtnDemo">⚡ Launch Orbit</button>`
  },
  {
    id: 14,
    cat: 'cinematic',
    tag: 'macOS Glass',
    title: '14. Frosted Glass Acrylic Dock',
    desc: '초고해상도 백드롭 블러와 마우스가 가까워지면 볼록하게 확대되는 피쉬아이 줌 독',
    stage: `<div class="acrylic-dock">
      <div class="dock-icon">🚀</div>
      <div class="dock-icon">🎨</div>
      <div class="dock-icon">⚡</div>
      <div class="dock-icon">💎</div>
      <div class="dock-icon">⚙️</div>
    </div>`
  },

  // [C] 차세대 UI 시스템
  {
    id: 15,
    cat: 'components',
    tag: 'Neomorphism',
    title: '15. Neomorphic Soft 3D Switch',
    desc: '부드러운 음각 및 양각 그림자로 누르는 촉감을 시각화한 차세대 뉴모피즘 토글 스위치',
    stage: `<div class="neo-box">
      <div class="neo-switch" id="neoSwitchDemo">
        <div class="neo-thumb"></div>
      </div>
      <span style="font-weight: 600; font-size: 0.9rem;">Touch Toggle</span>
    </div>`
  },
  {
    id: 16,
    cat: 'components',
    tag: 'shadcn Style',
    title: '16. Spotlight Command Palette',
    desc: '모던 웹 앱의 필수 요소인 키보드 친화적 빠른 명령 및 파일 검색 팝업 팔레트',
    stage: `<div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; width: 100%; max-width: 280px;">
      <div style="display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
        <span>⌘</span>
        <input type="text" placeholder="Type a command..." style="background: transparent; border: none; color: #fff; font-size: 0.85rem; outline: none; width: 100%;">
      </div>
      <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px;">
        <div style="padding: 4px 8px; border-radius: 6px; background: rgba(255,255,255,0.06);">📄 Open Document</div>
        <div style="padding: 4px 8px;">⚙️ Settings Panel</div>
      </div>
    </div>`
  },
  {
    id: 17,
    cat: 'components',
    tag: 'iOS Dynamic Island',
    title: '17. Dynamic Island Morphing Pill',
    desc: '클릭하면 부드러운 스프링 물리로 크기와 정보가 실시간 변형 확장되는 다이내믹 아일랜드',
    stage: `<div class="dynamic-island" id="dynamicIslandDemo" title="클릭하여 확장/축소">
      <span>🎧</span>
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 0.8rem; font-weight: 700;">Now Playing</span>
        <span class="island-sub" style="font-size: 0.7rem; color: #94a3b8;">Connected</span>
      </div>
    </div>`
  },
  {
    id: 18,
    cat: 'components',
    tag: '3D Marquee',
    title: '18. 3D Isometric Infinite Marquee',
    desc: '3차원 원근 각도로 비스듬히 기울어진 채 끊김 없이 무한 롤링되는 브랜드 배너 스트립',
    stage: `<div class="marquee-3d-wrap">
      <div class="marquee-3d-track">
        <div class="marquee-pill">🔥 Framer Motion</div>
        <div class="marquee-pill">⚡ Magic UI</div>
        <div class="marquee-pill">💎 Aceternity</div>
        <div class="marquee-pill">👑 Medieval Art</div>
        <div class="marquee-pill">🚀 WebGL WebGPU</div>
        <div class="marquee-pill">🔥 Framer Motion</div>
        <div class="marquee-pill">⚡ Magic UI</div>
        <div class="marquee-pill">💎 Aceternity</div>
      </div>
    </div>`
  },
  {
    id: 19,
    cat: 'components',
    tag: 'Interactive Pricing',
    title: '19. Morphing Pricing Tier Slider',
    desc: '사용자 수 슬라이더를 조작함에 따라 요금과 혜택이 실시간으로 부드럽게 계산되는 요금제 카드',
    stage: `<div class="pricing-card">
      <div style="font-size: 0.8rem; color: var(--text-muted);">Pro Team Plan</div>
      <div class="price-num" id="priceVal">$45</div>
      <input type="range" id="priceSlider" min="1" max="20" value="5" style="width: 100%; margin-top: 10px; accent-color: var(--accent);">
    </div>`
  },
  {
    id: 20,
    cat: 'components',
    tag: 'Fluid Accordion',
    title: '20. Fluid Spring Layout Accordion',
    desc: 'CSS grid-template-rows 0fr -> 1fr 기법을 이용한 끊김 없는 부드러운 아코디언 확장',
    stage: `<details style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; width: 100%; max-width: 280px; cursor: pointer;">
      <summary style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">📌 How does it work?</summary>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">It delivers buttery-smooth CSS animations without layout jitter or performance drop.</p>
    </details>`
  },
  {
    id: 21,
    cat: 'components',
    tag: 'Theme Engine',
    title: '21. Instant Theme Switcher Studio',
    desc: 'CSS 변수 기반으로 전체 사이트의 폰트, 글로우, 백그라운드를 단 1ms 만에 전환하는 테마 엔진',
    stage: `<div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
      <button class="btn-primary" onclick="document.getElementById('themeSelect').value='medieval'; document.getElementById('themeSelect').dispatchEvent(new Event('change'))">👑 Medieval</button>
      <button class="btn-primary" onclick="document.getElementById('themeSelect').value='cyberpunk'; document.getElementById('themeSelect').dispatchEvent(new Event('change'))">⚡ Cyber</button>
      <button class="btn-primary" onclick="document.getElementById('themeSelect').value='modern'; document.getElementById('themeSelect').dispatchEvent(new Event('change'))">🌌 Dark</button>
    </div>`
  },
  {
    id: 22,
    cat: 'components',
    tag: 'Code Inspector',
    title: '22. 1-Click Code Inspector',
    desc: '모든 컴포넌트의 우상단 [💻] 버튼을 누르면 원클릭으로 HTML/CSS를 클립보드에 복사',
    stage: `<button class="btn-primary" onclick="openCodeModal(1)">📋 Inspect & Copy Source</button>`
  },

  // [D] 데이터 & 크리에이티브 FX
  {
    id: 23,
    cat: 'creative',
    tag: 'Tremor Dashboard',
    title: '23. Tremor Live Pulsing KPI Metric',
    desc: '실시간 메트릭 수치 카운팅과 상승 곡선을 그리는 스파크라인 SVG 펄스 차트 카드',
    stage: `<div class="kpi-card">
      <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between;">
        <span>Monthly Recurring Revenue</span>
        <span style="color: #10b981; font-weight: 700;">+24.8% ↑</span>
      </div>
      <div class="kpi-val" id="kpiVal">$28,450</div>
      <svg class="sparkline-svg" viewBox="0 0 100 30">
        <path d="M0 25 Q 25 20, 50 12 T 100 5" fill="none" stroke="var(--accent)" stroke-width="3" />
      </svg>
    </div>`
  },
  {
    id: 24,
    cat: 'creative',
    tag: 'Audio FX',
    title: '24. Sound-reactive Visualizer',
    desc: '음악 주파수와 비트에 맞춰 유기적으로 튀어오르는 실시간 오디오 이퀄라이저 바',
    stage: `<div class="visualizer-stage">
      <div class="vis-bar"></div>
      <div class="vis-bar"></div>
      <div class="vis-bar"></div>
      <div class="vis-bar"></div>
      <div class="vis-bar"></div>
      <div class="vis-bar"></div>
      <div class="vis-bar"></div>
      <div class="vis-bar"></div>
      <div class="vis-bar"></div>
    </div>`
  },
  {
    id: 25,
    cat: 'creative',
    tag: 'Parallax 3D',
    title: '25. Multi-layer Parallax Hero',
    desc: '깊이감(Depth)에 따라 레이어별로 다른 속도로 움직이는 3차원 입체 공간 연출',
    stage: `<div style="text-align: center;">
      <div style="font-size: 2.5rem; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));">🪐</div>
      <div style="font-weight: 800; font-size: 1.1rem; margin-top: 4px;">Deep Space Voyage</div>
    </div>`
  },
  {
    id: 26,
    cat: 'creative',
    tag: 'Canvas Scratch',
    title: '26. Scratch-to-Reveal Lottery Card',
    desc: '마우스로 회색 코팅을 긁어내면 숨겨진 당첨 메시지와 골드 리워드가 드러나는 복권 스크래치',
    stage: `<div class="scratch-wrap">
      <div class="scratch-secret">
        <span>🎉 100% 당첨!</span>
        <span style="font-size: 0.8rem; font-weight: 500;">VIP Lifetime Pass</span>
      </div>
      <canvas class="scratch-canvas" id="scratchCanvas"></canvas>
    </div>`
  },
  {
    id: 27,
    cat: 'creative',
    tag: 'Kinetic Cursor',
    title: '27. Custom Kinetic Trail Cursors',
    desc: '골드 스파크, 네온 링, 화염 트레일 등 마우스 궤적을 따라다니는 인터랙티브 커서 효과',
    stage: `<div style="text-align: center; color: var(--accent); font-weight: 700;">
      ✨ Smooth Kinetic Cursor Enabled
    </div>`
  },
  {
    id: 28,
    cat: 'creative',
    tag: 'Confetti Cannon',
    title: '28. Celebration Confetti Fireworks',
    desc: '버튼을 클릭하면 화면 전체로 화려한 골드 & 컬러풀 종이 폭죽이 터지는 축하 인터랙션',
    stage: `<button class="btn-primary" id="confettiBtnDemo">🎉 Fire Confetti!</button>`
  },
  {
    id: 29,
    cat: 'creative',
    tag: 'Skeleton Shimmer',
    title: '29. Skeleton Shimmer Loader',
    desc: '데이터 로딩 시 매끄러운 빛줄기가 스쳐 지나가며 사용자 대기 경험을 개선하는 스켈레톤 UI',
    stage: `<div class="skeleton-box">
      <div class="skeleton-line" style="width: 40%; height: 20px;"></div>
      <div class="skeleton-line" style="width: 90%;"></div>
      <div class="skeleton-line" style="width: 75%;"></div>
    </div>`
  },
  {
    id: 30,
    cat: 'creative',
    tag: 'Celestial 3D Orbit',
    title: '30. Orbiting Planetarium Ring',
    desc: '3차원 태양 궤도를 주기적으로 공전하는 인터랙티브 행성 천체 링 애니메이션',
    stage: `<div class="orbit-system">
      <div class="sun-core"></div>
      <div class="planet"></div>
    </div>`
  }
];

const cardsHtml = cards.map(c => `
      <article class="showcase-card" data-category="${c.cat}">
        <div class="card-header">
          <span class="card-tag">${c.tag}</span>
          <div class="card-actions">
            <button class="btn-icon" onclick="openCodeModal(${c.id})" title="코드 보기">💻</button>
          </div>
        </div>
        <h3 class="card-title">${c.title}</h3>
        <p class="card-desc">${c.desc}</p>
        <div class="card-stage">
          ${c.stage}
        </div>
      </article>
`).join('\n');

const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌟 Web Design Masterpieces 30 - Interactive Showcase</title>
  <!-- Google Fonts: Cinzel & Pretendard -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Fira+Code:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  <!-- Core & Component Styles -->
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/medieval.css">
  <link rel="stylesheet" href="css/modern_components.css">
</head>
<body>

<div class="app-container">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="brand-logo">
      <span style="font-size: 1.6rem;">✨</span>
      <span>DesignHub 30</span>
      <span class="brand-badge">PRO</span>
    </div>

    <nav class="category-nav">
      <button class="nav-btn active" data-filter="all">
        <span>🌐</span> 전체 쇼케이스 <span class="count">30</span>
      </button>
      <button class="nav-btn" data-filter="medieval">
        <span>👑</span> 중세 고전 & 앤틱 <span class="count">6</span>
      </button>
      <button class="nav-btn" data-filter="cinematic">
        <span>✨</span> 모던 3D & 시네마틱 <span class="count">8</span>
      </button>
      <button class="nav-btn" data-filter="components">
        <span>💎</span> 차세대 UI 시스템 <span class="count">8</span>
      </button>
      <button class="nav-btn" data-filter="creative">
        <span>📊</span> 데이터 & 크리에이티브 FX <span class="count">8</span>
      </button>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    <!-- Top Header -->
    <header class="top-header">
      <div class="header-title">
        <h1>웹 디자인 명작 30선 인터랙티브 쇼케이스</h1>
        <p>GitHub 최고의 UI / 인터랙션 라이브러리와 중세 고전 고딕 스타일을 직접 체험하세요.</p>
      </div>

      <div class="header-actions">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" placeholder="컴포넌트 검색 (예: 양피지, 3D, Bento...)">
        </div>

        <div class="theme-dropdown">
          <select id="themeSelect">
            <option value="modern">🌌 모던 다크 (Default)</option>
            <option value="medieval">👑 중세 고전 골드 (Medieval)</option>
            <option value="cyberpunk">⚡ 사이버펑크 (Cyberpunk)</option>
            <option value="synthwave">🌆 레트로 신스웨이브 (Synthwave)</option>
            <option value="emerald">🌲 럭셔리 에메랄드 (Emerald)</option>
            <option value="light">☀️ 클린 라이트 (Light)</option>
          </select>
        </div>
      </div>
    </header>

    <!-- Showcase Cards Grid -->
    <section class="showcase-grid">
      ${cardsHtml}
    </section>
  </main>
</div>

<!-- Code Inspector Modal -->
<div class="modal-overlay" id="codeModal">
  <div class="modal-container">
    <div class="modal-header">
      <h3 class="modal-title" id="modalCodeTitle">Component Source Code</h3>
      <button class="btn-icon" onclick="closeCodeModal()">✕</button>
    </div>
    <div class="modal-body">
      <pre class="code-block"><code id="modalCodeContent"></code></pre>
    </div>
    <div class="modal-footer">
      <button class="btn-primary" onclick="copyModalCode()">📋 코드 복사 (Copy)</button>
    </div>
  </div>
</div>

<!-- Toast Notification -->
<div class="toast" id="toastNotification">✨ Action Completed</div>

<!-- Scripts -->
<script src="js/medieval_effects.js"></script>
<script src="js/modern_effects.js"></script>
<script src="js/app.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), fullHtml, 'utf8');
console.log('SUCCESS: index.html has been generated with 30 components!');
