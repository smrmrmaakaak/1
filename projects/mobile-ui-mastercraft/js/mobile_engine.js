/* ==========================================================================
   Mobile Mastercraft UI - In-House Mobile Engine
   Touch Gestures, Web Audio Drum Pads, Real Haptics & Mobile Scratch
   ========================================================================== */

// 1. Native Haptic Feedback Helper
function triggerHaptic(pattern = [20]) {
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

// 2. iOS Dynamic Island Morph
function toggleMobileIsland() {
  const island = document.getElementById("mobileIsland");
  if (!island) return;
  island.classList.toggle("expanded");
  triggerHaptic([30, 50, 20]);
  if (island.classList.contains("expanded")) {
    showMobileToast("🎧 Dynamic Island 펼침 모드 활성화");
  } else {
    showMobileToast("🎧 Dynamic Island 미니 캡슐 축소");
  }
}

function triggerIslandHaptic() {
  triggerHaptic([40, 30, 40]);
  showMobileToast("🎵 음악 일시정지 (Pause)");
}

// 3. Wax Seal Envelope Opener
function openEnvelopeLetter() {
  const env = document.getElementById("envelopeBox");
  if (!env) return;
  env.classList.toggle("opened");
  triggerHaptic([50, 30, 50]);
  if (env.classList.contains("opened")) {
    showMobileToast("📜 황실 비밀 칙서가 펼쳐졌습니다!");
  } else {
    showMobileToast("🔒 편지봉투가 다시 봉인되었습니다.");
  }
}

// 4. Web Audio Drum Synthesizer
let mAudioCtx = null;

function playDrumPad(type, freq) {
  if (!mAudioCtx) {
    mAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (mAudioCtx.state === 'suspended') {
    mAudioCtx.resume();
  }

  const now = mAudioCtx.currentTime;

  if (type === 'kick') {
    const osc = mAudioCtx.createOscillator();
    const gain = mAudioCtx.createGain();
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(mAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
    triggerHaptic([40]);
  } else if (type === 'snare') {
    const osc = mAudioCtx.createOscillator();
    const gain = mAudioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, now);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(mAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
    triggerHaptic([20, 20]);
  } else if (type === 'hihat') {
    const osc = mAudioCtx.createOscillator();
    const gain = mAudioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(mAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
    triggerHaptic([15]);
  } else {
    // Lead Synth
    const osc = mAudioCtx.createOscillator();
    const gain = mAudioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(mAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
    triggerHaptic([25]);
  }
}

// 5. Mobile Touch Scratch Engine
function initMobileScratch() {
  const canvas = document.getElementById("mobileScratchCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.parentElement.clientWidth || 340;
  canvas.height = canvas.parentElement.clientHeight || 250;

  // Gold foil background
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#d4af37");
  grad.addColorStop(0.5, "#fff2a3");
  grad.addColorStop(1, "#8a6c1e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#3b200b";
  ctx.font = "bold 14px 'Pretendard', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🪙 손가락으로 문질러 당첨을 확인하세요!", canvas.width / 2, canvas.height / 2 + 5);

  let isScratching = false;

  function scratchAt(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    triggerHaptic([10]);
  }

  // Touch Events
  canvas.addEventListener("touchstart", (e) => {
    isScratching = true;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    scratchAt(t.clientX - rect.left, t.clientY - rect.top);
  }, { passive: true });

  canvas.addEventListener("touchmove", (e) => {
    if (!isScratching) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    scratchAt(t.clientX - rect.left, t.clientY - rect.top);
  }, { passive: true });

  window.addEventListener("touchend", () => isScratching = false);

  // Mouse fallback
  canvas.addEventListener("mousedown", (e) => {
    isScratching = true;
    const rect = canvas.getBoundingClientRect();
    scratchAt(e.clientX - rect.left, e.clientY - rect.top);
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!isScratching) return;
    const rect = canvas.getBoundingClientRect();
    scratchAt(e.clientX - rect.left, e.clientY - rect.top);
  });
  window.addEventListener("mouseup", () => isScratching = false);
}

// 6. Bottom Sheet Controller
function openBottomSheet() {
  const sheet = document.getElementById("sheetBackdrop");
  if (!sheet) return;
  sheet.classList.add("active");
  triggerHaptic([20, 30]);
}

function closeBottomSheet() {
  const sheet = document.getElementById("sheetBackdrop");
  if (!sheet) return;
  sheet.classList.remove("active");
  triggerHaptic([15]);
}

function triggerAction(actionName) {
  closeBottomSheet();
  if (actionName === '햅틱 진동 테스트') {
    triggerHaptic([80, 50, 80, 50, 120]);
    showMobileToast("📳 강력한 3연타 햅틱 진동이 발생했습니다!");
  } else if (actionName === '즐겨찾기 저장') {
    window.open("https://github.com/smrmrmaakaak/1", "_blank");
    showMobileToast("⭐ GitHub 저장소로 이동합니다!");
  } else {
    showMobileToast(`✨ [${actionName}] 액션이 실행되었습니다.`);
  }
}

// 7. Tabbar Controller
function switchTab(el, tabName) {
  document.querySelectorAll(".v-tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  triggerHaptic([20]);
  showMobileToast(`📱 ${tabName} 탭으로 전환`);
}

// Toast
function showMobileToast(msg) {
  const toast = document.getElementById("mToast");
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// Modal Sources Dictionary
const MOBILE_SOURCES = {
  island: {
    title: "📱 iOS 18 Dynamic Island Morph",
    html: `<div class="m-island-pill" onclick="this.classList.toggle('expanded')">\n  <div class="island-mini"><span>🎧 AirPods</span></div>\n  <div class="island-full"><span>SMR Audio Master</span></div>\n</div>`,
    css: `.m-island-pill {\n  background: #000;\n  border-radius: 26px;\n  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.m-island-pill.expanded {\n  width: 290px;\n  height: 80px;\n}`,
    js: `function toggleIsland() {\n  navigator.vibrate?.([30, 50, 20]);\n  document.querySelector('.m-island-pill').classList.toggle('expanded');\n}`
  },
  wax: {
    title: "📜 Mobile Wax Seal Letter Opener",
    html: `<div class="envelope-box" onclick="this.classList.toggle('opened')">\n  <div class="envelope-wax-btn"><span>👑</span></div>\n  <div class="envelope-letter">황실 친서</div>\n</div>`,
    css: `.envelope-box {\n  background: #f4e4ba;\n  border-radius: 8px;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.8);\n}\n.envelope-box.opened .envelope-letter {\n  transform: translateY(0);\n  opacity: 1;\n}`,
    js: `function openEnvelope() {\n  navigator.vibrate?.([50, 30, 50]);\n}`
  },
  drum: {
    title: "🎛️ Web Audio Haptic Drum Pads",
    html: `<button onpointerdown="playDrum('kick')">🥁 KICK</button>`,
    css: `button:active {\n  transform: scale(0.94);\n  box-shadow: 0 0 15px #c084fc;\n}`,
    js: `const audioCtx = new AudioContext();\nfunction playDrum(type) {\n  navigator.vibrate?.([40]);\n  // Web Audio oscillator math\n}`
  },
  scratch: {
    title: "🪙 Mobile Touch Gold Scratch",
    html: `<canvas id="mobileScratchCanvas"></canvas>`,
    css: `#mobileScratchCanvas { touch-action: none; }`,
    js: `canvas.addEventListener('touchmove', (e) => {\n  ctx.globalCompositeOperation = 'destination-out';\n  ctx.arc(e.touches[0].clientX, e.touches[0].clientY, 20, 0, Math.PI*2);\n  ctx.fill();\n});`
  },
  laser: {
    title: "⚡ Linear Mobile 1px Laser Card",
    html: `<div class="m-laser-card" onclick="openBottomSheet()">\n  <span class="m-laser-badge">1px Subpixel</span>\n</div>`,
    css: `.m-laser-card {\n  background: #0d1322;\n  border: 1px solid rgba(0,240,255,0.3);\n  border-radius: 14px;\n}`,
    js: `function openBottomSheet() {\n  document.getElementById('sheetBackdrop').classList.add('active');\n}`
  },
  tabbar: {
    title: "💎 Vision Acrylic Floating Tabbar",
    html: `<nav class="vision-floating-tabbar">\n  <button class="v-tab active"><span>🏠</span></button>\n</nav>`,
    css: `.vision-floating-tabbar {\n  background: rgba(255,255,255,0.12);\n  backdrop-filter: blur(25px);\n  border-radius: 30px;\n}`,
    js: `function switchTab(el) {\n  navigator.vibrate?.([20]);\n}`
  }
};

let currentMobileKey = 'island';
let currentMobileLang = 'html';

function openMobileCodeModal(key) {
  const data = MOBILE_SOURCES[key];
  if (!data) return;
  currentMobileKey = key;
  document.getElementById("mModalTitle").innerText = data.title;
  switchMobileTab('html');
  document.getElementById("mCodeModal").classList.add("active");
}

function closeMobileCodeModal() {
  document.getElementById("mCodeModal").classList.remove("active");
}

function switchMobileTab(lang) {
  currentMobileLang = lang;
  document.getElementById("mTabHtml").classList.toggle("active", lang === 'html');
  document.getElementById("mTabCss").classList.toggle("active", lang === 'css');
  document.getElementById("mTabJs").classList.toggle("active", lang === 'js');

  const data = MOBILE_SOURCES[currentMobileKey];
  document.getElementById("mCodeView").innerText = data[lang];
}

function copyMobileCode() {
  const code = document.getElementById("mCodeView").innerText;
  navigator.clipboard.writeText(code).then(() => {
    showMobileToast("📋 모바일 코드가 복사되었습니다!");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileScratch();
});
