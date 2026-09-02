/* ==========================================================================
   Ultra UI Mastercraft - Core Interactive Engine
   Contains component logic, 3D math, WebGL fluid waves & code generator
   ========================================================================== */

// 1. Particle Starfield Background
function initBgCanvas() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.4 + 0.1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      p.y -= p.speed;
      if (p.y < 0) p.y = canvas.height;
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// 2. Grimoire 3D Mouse Parallax
function initGrimoireParallax() {
  const stage = document.getElementById("grimoireStage");
  const book = document.getElementById("grimoireBook");
  if (!stage || !book) return;

  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / rect.height) * 35 + 10;
    const ry = (x / rect.width) * 45 - 15;
    book.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05)`;
  });

  stage.addEventListener("mouseleave", () => {
    book.style.transform = "rotateX(15deg) rotateY(-25deg) scale(1)";
  });
}

// 3. Royal Wax Seal Toggle
function toggleSealBreak() {
  const seal = document.getElementById("interactiveSeal");
  const decree = document.getElementById("decreeBodyText");
  if (!seal || !decree) return;

  seal.classList.toggle("broken");
  if (seal.classList.contains("broken")) {
    decree.innerText = "📜 [황실 봉인 해제] '황실의 비밀 지령이 전달되었습니다: 당신의 웹 프로젝트에 최정상급 아티팩트의 힘이 부여됩니다.'";
    showToast("👑 황실 왁스 인장 봉인이 풀렸습니다!");
  } else {
    decree.innerText = '"짐이 명하노니, 이 코드를 복사하는 모든 개발자에게 버그 없는 축복과 눈부신 UI 영광이 깃들지어다."';
    showToast("🔒 황실 칙서가 다시 봉인되었습니다.");
  }
}

// 4. Linear Laser Border Spotlight
function initLaserSpotlight() {
  const laserStage = document.getElementById("laserStage");
  const laserCard = document.getElementById("laserCardDemo");
  if (!laserStage || !laserCard) return;

  laserStage.addEventListener("mousemove", (e) => {
    const rect = laserCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    laserCard.style.setProperty("--mouse-x", `${x}px`);
    laserCard.style.setProperty("--mouse-y", `${y}px`);
  });
}

// 5. Interactive Fluid Lens Canvas
function initFluidCanvas() {
  const canvas = document.getElementById("fluidCanvasDemo");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const stage = document.getElementById("fluidStage");

  function resize() {
    canvas.width = stage.clientWidth || 400;
    canvas.height = stage.clientHeight || 280;
  }
  resize();
  window.addEventListener("resize", resize);

  let mouse = { x: canvas.width / 2, y: canvas.height / 2, active: false };
  let ripples = [];

  stage.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    ripples.push({
      x: mouse.x,
      y: mouse.y,
      radius: 10,
      alpha: 0.8,
      color: `hsl(${Math.random() * 60 + 190}, 100%, 65%)`
    });
    if (ripples.length > 25) ripples.shift();
  });

  function renderFluid() {
    ctx.fillStyle = "rgba(2, 4, 8, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ripples.forEach((r, idx) => {
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = r.alpha;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();

      r.radius += 3.5;
      r.alpha *= 0.94;
    });

    ripples = ripples.filter(r => r.alpha > 0.02);
    ctx.globalAlpha = 1.0;
    requestAnimationFrame(renderFluid);
  }
  renderFluid();
}

// 6. Dynamic Island Pill Toggle
function toggleDynamicIsland() {
  const island = document.getElementById("dynIslandPill");
  if (!island) return;
  island.classList.toggle("expanded");
  if (island.classList.contains("expanded")) {
    showToast("🎧 Dynamic Island 펼침 모드 활성화");
  } else {
    showToast("🎧 Dynamic Island 캡슐 모드 축소");
  }
}

// 7. Cyberpunk Glitch Decrypt Sequence
function runCyberDecrypt() {
  const textEl = document.getElementById("cyberGlitchText");
  if (!textEl) return;

  const target = "0x89F_SECURE_TOKEN_AUTH_SUCCESS";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let step = 0;

  const timer = setInterval(() => {
    textEl.innerText = target.split("").map((c, i) => {
      if (i < step) return target[i];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join("");

    if (step >= target.length) {
      clearInterval(timer);
      showToast("⚡ [SYSTEM] 보안 토큰 해독 성공!");
    }
    step += 1/2;
  }, 25);
}

// Toast
function showToast(msg) {
  const toast = document.getElementById("toastBox");
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Code Modal Engine
const COMPONENT_SOURCES = {
  grimoire: {
    title: "👑 3D Grimoire Spellbook",
    html: `<div class="grimoire-3d-wrap">\n  <div class="book-cover front-cover">\n    <div class="book-inner-border">\n      <div class="rune-symbol">⛧</div>\n      <div class="book-title-cinzel">LIBER ARCANUM</div>\n    </div>\n  </div>\n</div>`,
    css: `.grimoire-3d-wrap {\n  width: 170px;\n  height: 220px;\n  perspective: 900px;\n  transform-style: preserve-3d;\n  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);\n}\n.grimoire-3d-wrap:hover {\n  transform: rotateX(5deg) rotateY(15deg) scale(1.08);\n}\n.book-cover.front-cover {\n  background: linear-gradient(135deg, #3d1c07, #1c0b02);\n  border: 3px solid #d4af37;\n  border-radius: 6px;\n  box-shadow: 0 15px 35px rgba(0,0,0,0.9);\n}`,
    js: `// Grimoire Parallax Mouse Tracker\nconst book = document.querySelector('.grimoire-3d-wrap');\nwindow.addEventListener('mousemove', (e) => {\n  const x = (e.clientX / window.innerWidth - 0.5) * 40;\n  const y = (e.clientY / window.innerHeight - 0.5) * -40;\n  book.style.transform = \`rotateX(\${y}deg) rotateY(\${x}deg)\`;\n});`
  },
  'wax-seal': {
    title: "👑 Royal Wax Seal & Charter",
    html: `<div class="parchment-scroll">\n  <div class="decree-header">⚜ IMPERIAL DECREE ⚜</div>\n  <div class="wax-seal-btn" onclick="this.classList.toggle('broken')">\n    <div class="wax-inner-emblem">♛</div>\n  </div>\n</div>`,
    css: `.parchment-scroll {\n  background: #f4e4ba;\n  box-shadow: inset 0 0 30px rgba(139, 90, 43, 0.5);\n  border-radius: 6px;\n  font-family: 'Cinzel', serif;\n  color: #3b200b;\n}\n.wax-seal-btn {\n  width: 50px;\n  height: 50px;\n  background: radial-gradient(circle at 35% 35%, #b91c1c, #450a0a);\n  border-radius: 50%;\n  box-shadow: 0 6px 15px rgba(0,0,0,0.6);\n  cursor: pointer;\n}`,
    js: `function toggleSealBreak() {\n  const seal = document.querySelector('.wax-seal-btn');\n  seal.classList.toggle('broken');\n}`
  },
  'laser-bento': {
    title: "⚡ 1px Laser Border & Bento Spotlight",
    html: `<div class="laser-card-demo" id="laserCard">\n  <div class="laser-beam-tracer"></div>\n  <div class="bento-content">\n    <span class="laser-badge">1px Subpixel</span>\n    <h3>Dynamic Spotlight Core</h3>\n  </div>\n</div>`,
    css: `.laser-card-demo {\n  background: #090d16;\n  border: 1px solid rgba(56, 189, 248, 0.3);\n  border-radius: 12px;\n  position: relative;\n  overflow: hidden;\n}\n.laser-beam-tracer {\n  position: absolute;\n  inset: 0;\n  background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(56, 189, 248, 0.15), transparent 70%);\n}`,
    js: `const card = document.getElementById('laserCard');\ncard.addEventListener('mousemove', (e) => {\n  const rect = card.getBoundingClientRect();\n  card.style.setProperty('--mouse-x', \`\${e.clientX - rect.left}px\`);\n  card.style.setProperty('--mouse-y', \`\${e.clientY - rect.top}px\`);\n});`
  },
  'fluid-lens': {
    title: "🌌 Fluid Lens Ripple Shader",
    html: `<div class="fluid-stage">\n  <canvas id="fluidCanvas"></canvas>\n</div>`,
    css: `.fluid-stage {\n  position: relative;\n  background: #020408;\n  border-radius: 14px;\n  overflow: hidden;\n}`,
    js: `const canvas = document.getElementById('fluidCanvas');\nconst ctx = canvas.getContext('2d');\ncanvas.addEventListener('mousemove', (e) => {\n  // Draw interactive ripples on canvas\n});`
  },
  'vision-glass': {
    title: "🔮 Vision Acrylic Glass & Dynamic Island",
    html: `<div class="dynamic-island-pill" onclick="this.classList.toggle('expanded')">\n  <span>🎧 AirPods Max</span>\n</div>\n<div class="vision-pro-card">\n  <span>Vision Frosted Acrylic</span>\n</div>`,
    css: `.dynamic-island-pill {\n  background: #000;\n  border-radius: 28px;\n  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.dynamic-island-pill.expanded {\n  width: 280px;\n  height: 75px;\n}\n.vision-pro-card {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(24px);\n  border: 1px solid rgba(255, 255, 255, 0.35);\n}`,
    js: `function toggleDynamicIsland() {\n  document.querySelector('.dynamic-island-pill').classList.toggle('expanded');\n}`
  },
  'glitch-terminal': {
    title: "🤖 Cyber Glitch & Decrypt Terminal",
    html: `<div class="terminal-glitch-text" onclick="runDecrypt(this)">\n  [CLICK TO DECRYPT]\n</div>`,
    css: `.terminal-glitch-text {\n  font-family: 'Fira Code', monospace;\n  color: #00ffcc;\n  text-shadow: 0 0 8px #00ffcc;\n  cursor: pointer;\n}`,
    js: `function runDecrypt(el) {\n  const target = '0x89F_ACCESS_GRANTED';\n  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';\n  let s = 0;\n  const timer = setInterval(() => {\n    el.innerText = target.split('').map((c, i) => i < s ? target[i] : chars[Math.floor(Math.random()*chars.length)]).join('');\n    if (s >= target.length) clearInterval(timer);\n    s += 1/2;\n  }, 30);\n}`
  }
};

let currentModalComp = 'grimoire';
let currentTab = 'html';

function openCodeModal(compKey) {
  const data = COMPONENT_SOURCES[compKey];
  if (!data) return;
  currentModalComp = compKey;

  document.getElementById("modalComponentTitle").innerText = data.title;
  switchCodeTab('html');

  const modal = document.getElementById("codeModal");
  modal.classList.add("active");
}

function closeCodeModal() {
  const modal = document.getElementById("codeModal");
  modal.classList.remove("active");
}

function switchCodeTab(tab) {
  currentTab = tab;
  document.getElementById("tabBtnHtml").classList.toggle("active", tab === 'html');
  document.getElementById("tabBtnCss").classList.toggle("active", tab === 'css');
  document.getElementById("tabBtnJs").classList.toggle("active", tab === 'js');

  const data = COMPONENT_SOURCES[currentModalComp];
  const box = document.getElementById("codeSnippetBox");
  box.innerText = data[tab];
}

function copyCurrentModalCode() {
  const box = document.getElementById("codeSnippetBox");
  navigator.clipboard.writeText(box.innerText).then(() => {
    showToast("📋 컴포넌트 코드가 복사되었습니다!");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initBgCanvas();
  initGrimoireParallax();
  initLaserSpotlight();
  initFluidCanvas();

  // Close modal on backdrop click
  const modal = document.getElementById("codeModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeCodeModal();
    });
  }
});
