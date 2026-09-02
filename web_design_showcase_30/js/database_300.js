/* ==========================================================================
   Design Vault Master Verified Unique Database (Zero Duplication)
   Total Unique Masterpieces: 32
   ========================================================================== */

const DESIGN_VAULT_300 = [
  {
    "id": 101,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "황실 양피지 & 붉은 왁스 인장 (Royal Wax Seal & Parchment)",
    "desc": "실제 찢어진 양피지 텍스처와 클릭 시 물리적으로 봉인이 깨지는 3D 왁스 인장 도장",
    "tags": [
      "양피지",
      "왁스인장",
      "봉인해제",
      "Antique"
    ],
    "stars": 28400,
    "repo": "medieval-design-vault/royal-wax-seal",
    "previewType": "wax-seal",
    "codeHtml": "<div class=\"parchment-box\">\n  <h3>황실 칙서</h3>\n  <div class=\"wax-seal-stamp\">♛</div>\n</div>",
    "codeCss": ".wax-seal-stamp { background: radial-gradient(#b91c1c, #450a0a); border-radius: 50%; }"
  },
  {
    "id": 102,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "3D 고대 마도서 펼침 (Grimoire 3D Spellbook)",
    "desc": "마우스를 올리면 3차원으로 스르륵 펼쳐지며 금빛 룬 문자가 회전하는 연금술 마도서",
    "tags": [
      "3D마도서",
      "룬문자",
      "연금술",
      "Gothic"
    ],
    "stars": 24900,
    "repo": "arcana-ui/grimoire-3d",
    "previewType": "grimoire",
    "codeHtml": "<div class=\"grimoire-3d-book\">\n  <div class=\"rune-circle\">⛧</div>\n</div>",
    "codeCss": ".grimoire-3d-book { transform-style: preserve-3d; transition: transform 0.8s; }"
  },
  {
    "id": 103,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "고딕 대성당 스테인드글라스 & 프리즘 (Cathedral Stained Glass)",
    "desc": "아치형 6색 보석 글라스와 마우스 이동에 따라 쏟아지는 무지개빛 태양광 굴절 광원",
    "tags": [
      "스테인드글라스",
      "대성당",
      "프리즘",
      "빛굴절"
    ],
    "stars": 21500,
    "repo": "gothic-shaders/stained-glass-prism",
    "previewType": "stained-glass",
    "codeHtml": "<div class=\"stained-glass-arch\">\n  <div class=\"prism-sunbeam\"></div>\n</div>",
    "codeCss": ".stained-glass-arch { border: 4px solid #1c150e; box-shadow: 0 0 25px rgba(255,180,0,0.5); }"
  },
  {
    "id": 104,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "중세 주점 촛불 조명 셰이더 (Candlelit Tavern Flame)",
    "desc": "실시간으로 불꽃이 일렁이며 주변 오브젝트에 따뜻한 그림자를 드리우는 촛불 조명",
    "tags": [
      "촛불조명",
      "플리커링",
      "중세주점",
      "광원효과"
    ],
    "stars": 19800,
    "repo": "medieval-fx/candlelight-shader",
    "previewType": "candle",
    "codeHtml": "<div class=\"candle-flame\">\n  <div class=\"wax-pillar\"></div>\n</div>",
    "codeCss": "@keyframes candleFlicker { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }"
  },
  {
    "id": 105,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "대항해시대 청동 아스트롤라베 천구의 (Astrolabe Compass)",
    "desc": "천체의 고도를 측정하던 정교한 청동 기어와 360도 회전하는 마그네틱 나침반 자침",
    "tags": [
      "아스트롤라베",
      "천구의",
      "나침반",
      "대항해시대"
    ],
    "stars": 18400,
    "repo": "renaissance-instruments/astrolabe",
    "previewType": "astrolabe",
    "codeHtml": "<div class=\"astrolabe-dial\">\n  <div class=\"needle\"></div>\n</div>",
    "codeCss": ".astrolabe-dial { border: 3px solid #d4af37; border-radius: 50%; }"
  },
  {
    "id": 106,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "필사본 금박 일루미네이션 대문자 (Illuminated Drop Caps)",
    "desc": "화려한 15세기 수도원 필사본 이니셜 대문자와 반짝이는 실시간 금박 엠보싱 쉬머",
    "tags": [
      "일루미네이션",
      "드롭캡",
      "금박쉬머",
      "캘리그래피"
    ],
    "stars": 17200,
    "repo": "typography-vault/illuminated-caps",
    "previewType": "drop-caps",
    "codeHtml": "<span class=\"drop-cap-gold\">O</span>nce upon an ancient epoch...",
    "codeCss": ".drop-cap-gold { background: linear-gradient(135deg, #ffd700, #daa520); -webkit-background-clip: text; }"
  },
  {
    "id": 107,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "바로크 황금 액자 & 필리그리 문양 (Baroque Gold Leaf Frame)",
    "desc": "르네상스·바로크 양식의 앤틱 황금 잎사귀 문양 테두리와 묵직한 브라스 금속 광택",
    "tags": [
      "바로크",
      "황금액자",
      "필리그리",
      "Renaissance"
    ],
    "stars": 16500,
    "repo": "baroque-design/gold-filigree-frame",
    "previewType": "baroque",
    "codeHtml": "<div class=\"baroque-frame\">\n  <span>⚜ ROYAL HERITAGE ⚜</span>\n</div>",
    "codeCss": ".baroque-frame { border-image: linear-gradient(45deg, #d4af37, #fff2a3, #8a6c1e) 12; }"
  },
  {
    "id": 108,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "연금술사의 발광 포션 플라스크 (Alchemist Glowing Potion)",
    "desc": "신비로운 에메랄드빛 액체와 보글보글 솟아오르는 마법 기포 파티클 인터랙션",
    "tags": [
      "연금술",
      "마법물약",
      "포션",
      "기포파티클"
    ],
    "stars": 15300,
    "repo": "alchemy-ui/potion-flask",
    "previewType": "potion",
    "codeHtml": "<div class=\"potion-flask\">\n  <div class=\"bubbling-liquid\"></div>\n</div>",
    "codeCss": ".potion-flask { background: radial-gradient(circle, #10b981, #064e3b); box-shadow: 0 0 25px #10b981; }"
  },
  {
    "id": 109,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "엘든링 스타일 고딕 RPG HUD (Elden Gothic Game UI)",
    "desc": "황금빛 룬 게이지, 체력/마나 구체 및 고딕 다크 판타지 스타일의 게임 인터페이스",
    "tags": [
      "엘든링",
      "고딕HUD",
      "RPG인터페이스",
      "다크판타지"
    ],
    "stars": 26100,
    "repo": "game-ui-vault/elden-gothic-hud",
    "previewType": "gothic-hud",
    "codeHtml": "<div class=\"gothic-hud-bar\">\n  <div class=\"hp-gauge\"></div>\n</div>",
    "codeCss": ".hp-gauge { background: linear-gradient(90deg, #b91c1c, #ef4444); }"
  },
  {
    "id": 110,
    "categoryId": "medieval",
    "categoryName": "👑 중세 고전 & 앤틱",
    "title": "중세 모래시계 입자 물리 (Hourglass Sand Physics)",
    "desc": "중력에 따라 미세한 황금빛 모래 알갱이가 좁은 병목을 지나 쌓이는 모래시계",
    "tags": [
      "모래시계",
      "입자물리",
      "중력시뮬레이션",
      "Time"
    ],
    "stars": 14700,
    "repo": "physics-canvas/medieval-hourglass",
    "previewType": "hourglass",
    "codeHtml": "<div class=\"hourglass-glass\">\n  <div class=\"sand-top\"></div>\n  <div class=\"sand-bottom\"></div>\n</div>",
    "codeCss": ".hourglass-glass { border: 2px solid #d4af37; background: #24160a; }"
  },
  {
    "id": 201,
    "categoryId": "webgl",
    "categoryName": "🌌 Awwwards 3D WebGL",
    "title": "Three.js 액체 렌즈 왜곡 셰이더 (Three.js Fluid Lens Distortion)",
    "desc": "마우스 궤적에 따라 화면이 물결처럼 출렁이고 빛이 굴절되는 유체 인터랙션",
    "tags": [
      "Three.js",
      "유체왜곡",
      "GLSL셰이더",
      "Awwwards"
    ],
    "stars": 98500,
    "repo": "mrdoob/three.js",
    "previewType": "fluid-distortion",
    "codeHtml": "<canvas id=\"fluidCanvas\"></canvas>",
    "codeCss": "canvas { width: 100%; height: 100%; filter: contrast(120%); }"
  },
  {
    "id": 202,
    "categoryId": "webgl",
    "categoryName": "🌌 Awwwards 3D WebGL",
    "title": "블랙홀 중력 렌즈 셰이더 (Black Hole Gravitational Lensing)",
    "desc": "아인슈타인의 상대성 이론에 따른 광선 왜곡과 주변 별빛을 흡수하는 실시간 블랙홀",
    "tags": [
      "블랙홀",
      "중력렌즈",
      "우주셰이더",
      "WebGL"
    ],
    "stars": 42100,
    "repo": "space-shaders/black-hole-lensing",
    "previewType": "black-hole",
    "codeHtml": "<div class=\"black-hole-core\">\n  <div class=\"accretion-disk\"></div>\n</div>",
    "codeCss": ".black-hole-core { border-radius: 50%; box-shadow: 0 0 35px #f59e0b; }"
  },
  {
    "id": 203,
    "categoryId": "webgl",
    "categoryName": "🌌 Awwwards 3D WebGL",
    "title": "Locomotive Scroll 관성 스무스 스크롤 (Locomotive Smooth Scroll)",
    "desc": "애플 및 글로벌 명품 브랜드 사이트에서 사용하는 부드러운 물리 관성 스크롤 엔진",
    "tags": [
      "Locomotive",
      "관성스크롤",
      "스무스스크롤",
      "Smooth"
    ],
    "stars": 31200,
    "repo": "locomotivemtl/locomotive-scroll",
    "previewType": "smooth-scroll",
    "codeHtml": "<div data-scroll-container>\n  <section data-scroll-section>...</section>\n</div>",
    "codeCss": "html.has-scroll-smooth { overflow: hidden; }"
  },
  {
    "id": 204,
    "categoryId": "webgl",
    "categoryName": "🌌 Awwwards 3D WebGL",
    "title": "React Three Fiber 크리스탈 다면체 (R3F Crystal Polyhedron)",
    "desc": "빛을 받으면 다각도로 무지개 스펙트럼을 반사하는 3D 정이십면체 크리스탈",
    "tags": [
      "R3F",
      "ReactThreeFiber",
      "크리스탈",
      "3D다면체"
    ],
    "stars": 27800,
    "repo": "pmndrs/react-three-fiber",
    "previewType": "crystal-3d",
    "codeHtml": "<Canvas>\n  <mesh><icosahedronGeometry /><meshPhysicalMaterial /></mesh>\n</Canvas>",
    "codeCss": "mesh { transform: rotate3d(1, 1, 0, 45deg); }"
  },
  {
    "id": 205,
    "categoryId": "webgl",
    "categoryName": "🌌 Awwwards 3D WebGL",
    "title": "100만 GPU 중력 파티클 필드 (GPU Million Particles Field)",
    "desc": "마우스 클릭 위치로 100만 개의 미세한 은하 입자가 소용돌이치며 끌려오는 파티클 엔진",
    "tags": [
      "GPU파티클",
      "은하소용돌이",
      "중력장",
      "WebGL2"
    ],
    "stars": 35400,
    "repo": "spite/webgl-particles",
    "previewType": "particles-field",
    "codeHtml": "<canvas id=\"particleGpuCanvas\"></canvas>",
    "codeCss": "canvas { background: #000; }"
  },
  {
    "id": 206,
    "categoryId": "webgl",
    "categoryName": "🌌 Awwwards 3D WebGL",
    "title": "거스트너 해양 파도 셰이더 (Realistic Gerstner Ocean Wave)",
    "desc": "햇빛 반사광(Caustics)과 흰 포말이 살아 숨쉬는 사실적인 3D 바다 수면 셰이더",
    "tags": [
      "해양셰이더",
      "거스트너파도",
      "수면반사",
      "Water"
    ],
    "stars": 22400,
    "repo": "ocean-gl/gerstner-waves",
    "previewType": "ocean-wave",
    "codeHtml": "<div class=\"ocean-wave-stage\"></div>",
    "codeCss": ".ocean-wave-stage { background: linear-gradient(180deg, #0284c7, #082f49); }"
  },
  {
    "id": 301,
    "categoryId": "linear",
    "categoryName": "⚡ Linear & Vercel 다크",
    "title": "Linear 스타일 1px 서브픽셀 레이저 보더 (Linear 1px Laser Border)",
    "desc": "카드 모서리를 따라 부드럽게 빛이 회전하며 지나가는 정교한 1픽셀 레이저 빔 효과",
    "tags": [
      "Linear",
      "1px보더",
      "레이저빔",
      "BorderGlow"
    ],
    "stars": 76500,
    "repo": "shadcn-ui/ui",
    "previewType": "laser-border",
    "codeHtml": "<div class=\"laser-card\">\n  <div class=\"beam-tracer\"></div>\n</div>",
    "codeCss": ".laser-card { border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 0 15px rgba(56,189,248,0.2); }"
  },
  {
    "id": 302,
    "categoryId": "linear",
    "categoryName": "⚡ Linear & Vercel 다크",
    "title": "Spotlight 커맨드 메뉴 (Cmd+K Command Menu)",
    "desc": "키보드 단축키(⌘K)로 어디서나 호출 가능한 초고속 검색 및 작업 실행 팝업",
    "tags": [
      "Cmd+K",
      "커맨드메뉴",
      "Spotlight",
      "Vercel"
    ],
    "stars": 48900,
    "repo": "pacocoursey/cmdk",
    "previewType": "command-menu",
    "codeHtml": "<Command>\n  <CommandInput placeholder=\"Type a command...\" />\n</Command>",
    "codeCss": ".command-menu { background: #090d16; border: 1px solid rgba(255,255,255,0.1); }"
  },
  {
    "id": 303,
    "categoryId": "linear",
    "categoryName": "⚡ Linear & Vercel 다크",
    "title": "Bento Grid 반응형 마우스 스포트라이트 (Bento Grid Spotlight)",
    "desc": "마우스 커서의 위치를 실시간 추적하여 카드 표면에 부드러운 스포트라이트를 비추는 그리드",
    "tags": [
      "BentoGrid",
      "스포트라이트",
      "MagicUI",
      "SaaS"
    ],
    "stars": 39400,
    "repo": "magicuidesign/magicui",
    "previewType": "bento-spotlight",
    "codeHtml": "<div class=\"bento-card\">\n  <div class=\"spotlight-glow\"></div>\n</div>",
    "codeCss": ".spotlight-glow { background: radial-gradient(circle, rgba(56,189,248,0.3), transparent 70%); }"
  },
  {
    "id": 304,
    "categoryId": "linear",
    "categoryName": "⚡ Linear & Vercel 다크",
    "title": "실시간 협업 라이브 커서 & 상태 뱃지 (Live Collab Presence Radar)",
    "desc": "피그마나 노션처럼 다른 사용자의 실시간 접속 및 마우스 커서 위치를 보여주는 시스템",
    "tags": [
      "실시간협업",
      "라이브커서",
      "FigmaStyle",
      "Presence"
    ],
    "stars": 29800,
    "repo": "liveblocks/liveblocks",
    "previewType": "live-presence",
    "codeHtml": "<div class=\"presence-badge\">\n  <span class=\"pulse-dot\"></span> Live 8 Users\n</div>",
    "codeCss": ".pulse-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; }"
  },
  {
    "id": 401,
    "categoryId": "glass",
    "categoryName": "🔮 Stripe 네온 글래스",
    "title": "Apple Pro 투과형 아크릴 글래스모피즘 (Frosted Acrylic Glass)",
    "desc": "초고해상도 백드롭 블러와 빛 굴절 테두리를 가진 애플 macOS 스타일의 반투명 아크릴",
    "tags": [
      "글래스모피즘",
      "아크릴",
      "ApplePro",
      "BackdropBlur"
    ],
    "stars": 44200,
    "repo": "apple-design/acrylic-glass",
    "previewType": "acrylic-glass",
    "codeHtml": "<div class=\"acrylic-glass-box\">\n  <span>Frosted Glass</span>\n</div>",
    "codeCss": ".acrylic-glass-box { backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.25); }"
  },
  {
    "id": 402,
    "categoryId": "glass",
    "categoryName": "🔮 Stripe 네온 글래스",
    "title": "Stripe 스타일 오로라 메쉬 그라데이션 (Stripe Aurora Mesh Gradient)",
    "desc": "유기적으로 형태가 바뀌며 끊김 없이 부드럽게 흐르는 네온 오로라 배경 애니메이션",
    "tags": [
      "Stripe",
      "오로라",
      "메쉬그라데이션",
      "NeonGlow"
    ],
    "stars": 38700,
    "repo": "stripe-design/mesh-gradient",
    "previewType": "aurora-mesh",
    "codeHtml": "<div class=\"aurora-mesh-stage\">\n  <div class=\"mesh-blob\"></div>\n</div>",
    "codeCss": ".mesh-blob { filter: blur(35px); background: #ec4899; }"
  },
  {
    "id": 403,
    "categoryId": "glass",
    "categoryName": "🔮 Stripe 네온 글래스",
    "title": "3D 홀로그램 원근 틸트 카드 (3D Holographic Perspective Tilt)",
    "desc": "마우스 각도에 따라 입체적으로 회전하며 각도별로 무지개 오로라 광택이 반사되는 카드",
    "tags": [
      "3D틸트",
      "홀로그램",
      "Aceternity",
      "Perspective"
    ],
    "stars": 36200,
    "repo": "aceternity/ui",
    "previewType": "holo-tilt",
    "codeHtml": "<div class=\"holo-card\" id=\"tiltDemo\">\n  <div class=\"holo-shine\"></div>\n</div>",
    "codeCss": ".holo-card { transform-style: preserve-3d; transition: transform 0.15s; }"
  },
  {
    "id": 501,
    "categoryId": "cyberpunk",
    "categoryName": "🤖 Cyberpunk & Sci-Fi",
    "title": "클릭형 사이버펑크 텍스트 디코딩 (Cyberpunk Click Decrypt Text)",
    "desc": "텍스트를 클릭하면 무작위 외계/해커 암호가 실시간으로 풀리며 복원되는 디코딩 애니메이션",
    "tags": [
      "사이버펑크",
      "글리치",
      "암호해독",
      "Matrix"
    ],
    "stars": 29500,
    "repo": "fauux/cyberpunk-hud",
    "previewType": "glitch-decrypt",
    "codeHtml": "<div class=\"glitch-text-click\">CYBER_SYS_ONLINE</div>",
    "codeCss": ".glitch-text-click { font-family: 'Fira Code', monospace; color: #00ffcc; text-shadow: 0 0 10px #00ffcc; }"
  },
  {
    "id": 502,
    "categoryId": "cyberpunk",
    "categoryName": "🤖 Cyberpunk & Sci-Fi",
    "title": "홀로그래픽 레이더 조준선 HUD (Holographic Crosshair Targeting)",
    "desc": "목표물을 추적하며 회전하는 레이더 스캔라인과 미래형 전투기 조준 HUD 시스템",
    "tags": [
      "Sci-Fi",
      "조준선HUD",
      "홀로그램",
      "Radar"
    ],
    "stars": 24300,
    "repo": "scifi-ui/holographic-reticle",
    "previewType": "scifi-reticle",
    "codeHtml": "<div class=\"sci-fi-reticle\">\n  <div class=\"radar-scan\"></div>\n</div>",
    "codeCss": ".sci-fi-reticle { border: 2px dashed #00ffcc; border-radius: 50%; }"
  },
  {
    "id": 601,
    "categoryId": "datafx",
    "categoryName": "📊 데이터 & 크리에이티브 FX",
    "title": "복권 긁기 실시간 캔버스 (Scratch-to-Reveal Lottery Card)",
    "desc": "마우스로 회색 코팅을 긁어내면 진짜로 가려진 당첨 메시지가 드러나는 캔버스 스크래치",
    "tags": [
      "복권스크래치",
      "캔버스",
      "Scratch",
      "Interactive"
    ],
    "stars": 31900,
    "repo": "canvas-magic/scratch-card",
    "previewType": "scratch-card",
    "codeHtml": "<div class=\"scratch-container\">\n  <canvas class=\"scratch-canvas\"></canvas>\n</div>",
    "codeCss": ".scratch-canvas { cursor: crosshair; }"
  },
  {
    "id": 602,
    "categoryId": "datafx",
    "categoryName": "📊 데이터 & 크리에이티브 FX",
    "title": "축하 골드 & 컬러풀 종이 폭죽 대포 (Confetti Cannon Fireworks)",
    "desc": "버튼을 클릭하면 화면 전체로 50개 이상의 화려한 종이 꽃가루가 물리 폭발하는 인터랙션",
    "tags": [
      "폭죽대포",
      "Confetti",
      "축하파티클",
      "Fireworks"
    ],
    "stars": 33400,
    "repo": "catdad/canvas-confetti",
    "previewType": "confetti-cannon",
    "codeHtml": "<button class=\"confetti-trigger-btn\">🎉 폭죽 터뜨리기</button>",
    "codeCss": ".confetti-trigger-btn { background: #38bdf8; font-weight: 800; border-radius: 8px; }"
  },
  {
    "id": 603,
    "categoryId": "datafx",
    "categoryName": "📊 데이터 & 크리에이티브 FX",
    "title": "Tremor 스타일 실시간 펄스 KPI 차트 (Tremor Live Pulse KPI)",
    "desc": "실시간 수치 카운팅과 주가/매출 상승 곡선을 그리는 스파크라인 SVG 펄스 대시보드",
    "tags": [
      "Tremor",
      "KPI차트",
      "스파크라인",
      "Dashboard"
    ],
    "stars": 21800,
    "repo": "tremorlabs/tremor",
    "previewType": "kpi-chart",
    "codeHtml": "<div class=\"kpi-metric-box\">\n  <div class=\"kpi-value\">$28,450</div>\n  <svg class=\"sparkline\"></svg>\n</div>",
    "codeCss": ".kpi-value { font-size: 1.8rem; font-weight: 800; }"
  },
  {
    "id": 604,
    "categoryId": "datafx",
    "categoryName": "📊 데이터 & 크리에이티브 FX",
    "title": "음악 주파수 반응형 오디오 이퀄라이저 (Sound-reactive Equalizer)",
    "desc": "비트와 주파수에 맞춰 5개의 바가 유기적으로 튀어오르는 실시간 오디오 비주얼라이저",
    "tags": [
      "오디오비주얼라이저",
      "이퀄라이저",
      "사운드반응",
      "AudioFX"
    ],
    "stars": 20100,
    "repo": "audio-fx/web-equalizer",
    "previewType": "audio-equalizer",
    "codeHtml": "<div class=\"audio-equalizer\">\n  <div class=\"bar\"></div>\n</div>",
    "codeCss": "@keyframes barWave { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }"
  },
  {
    "id": 701,
    "categoryId": "components",
    "categoryName": "💎 실무 UI 컴포넌트",
    "title": "iOS 스타일 모핑 다이내믹 아일랜드 (Dynamic Island Morphing Pill)",
    "desc": "클릭하면 부드러운 스프링 물리로 크기가 확장되며 세부 정보가 나타나는 캡슐 배너",
    "tags": [
      "DynamicIsland",
      "iOS",
      "모핑캡슐",
      "SpringMotion"
    ],
    "stars": 37500,
    "repo": "emilkowalski/dynamic-island",
    "previewType": "dynamic-island",
    "codeHtml": "<div class=\"dynamic-island\">\n  <span>🎧 AirPods Pro</span>\n</div>",
    "codeCss": ".dynamic-island { background: #000; border-radius: 20px; transition: all 0.3s; }"
  },
  {
    "id": 702,
    "categoryId": "components",
    "categoryName": "💎 실무 UI 컴포넌트",
    "title": "뉴모피즘 소프트 3D 토글 스위치 (Neomorphic Soft 3D Switch)",
    "desc": "부드러운 음각/양각 그림자로 실감 나는 촉감을 시각화한 뉴모피즘 토글 스위치",
    "tags": [
      "뉴모피즘",
      "토글스위치",
      "SoftUI",
      "Neomorphism"
    ],
    "stars": 25800,
    "repo": "neomorphism/soft-ui-switch",
    "previewType": "neo-switch",
    "codeHtml": "<div class=\"neo-switch\">\n  <div class=\"neo-thumb\"></div>\n</div>",
    "codeCss": ".neo-switch { box-shadow: inset 2px 2px 4px #000; }"
  },
  {
    "id": 703,
    "categoryId": "components",
    "categoryName": "💎 실무 UI 컴포넌트",
    "title": "실시간 구독 요금제 슬라이더 (Interactive Pricing Tier Slider)",
    "desc": "슬라이더를 드래그하면 요금과 팀 규모가 실시간으로 부드럽게 계산되는 요금제 카드",
    "tags": [
      "요금제슬라이더",
      "PricingCard",
      "SaaS",
      "Calculator"
    ],
    "stars": 22900,
    "repo": "saas-pricing/tier-slider",
    "previewType": "price-slider",
    "codeHtml": "<div class=\"pricing-card\">\n  <input type=\"range\" class=\"price-slider\" />\n</div>",
    "codeCss": ".price-slider { accent-color: #38bdf8; }"
  }
];
