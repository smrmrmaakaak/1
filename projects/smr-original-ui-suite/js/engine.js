/* ==========================================================================
   SMR Original UI Suite - 100% In-House Core Engine
   Contains: Web Audio Synthesizer, 3D Porcelain Math, Spark Physics & Scratch
   ========================================================================== */

// 1. Quantum Background Canvas
function initApexBgCanvas() {
  const canvas = document.getElementById("apexBgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const particles = [];
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.3 + 0.1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
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

// 2. LabelleJian Antique 3D Porcelain Turntable
function initAntique3D() {
  const stage = document.getElementById("antiqueStage");
  const model = document.getElementById("porcelainModel");
  if (!stage || !model) return;

  let isDragging = false;
  let startX = 0;
  let currentRotation = 0;

  stage.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    model.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    if (model) model.style.cursor = "grab";
  });

  stage.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const delta = e.clientX - startX;
      currentRotation += delta * 0.8;
      startX = e.clientX;
      model.style.transform = `rotateY(${currentRotation}deg)`;
    } else {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      model.style.transform = `rotateY(${currentRotation + x * 35}deg) rotateX(${-y * 20}deg)`;
    }
  });
}

// 3. Excalibur Blade Sparks Interaction
function initExcaliburSparks() {
  const stage = document.getElementById("excaliburStage");
  const sword = document.getElementById("excaliburSword");
  if (!stage || !sword) return;

  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create a spark
    const spark = document.createElement("div");
    spark.style.position = "absolute";
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.width = `${Math.random() * 4 + 2}px`;
    spark.style.height = `${Math.random() * 4 + 2}px`;
    spark.style.backgroundColor = ["#ffd700", "#f59e0b", "#ffffff", "#ef4444"][Math.floor(Math.random() * 4)];
    spark.style.borderRadius = "50%";
    spark.style.boxShadow = "0 0 8px #ffd700";
    spark.style.pointerEvents = "none";
    spark.style.zIndex = "10";
    spark.style.transition = "transform 0.4s ease-out, opacity 0.4s";
    stage.appendChild(spark);

    setTimeout(() => {
      spark.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${Math.random() * 40 + 10}px) scale(0)`;
      spark.style.opacity = "0";
    }, 20);
    setTimeout(() => spark.remove(), 420);
  });
}

// 4. Imperial Decree & Wax Shatter
function breakPureWaxSeal() {
  const seal = document.getElementById("pureWaxSeal");
  const text = document.getElementById("decreeTextLive");
  if (!seal || !text) return;

  seal.classList.toggle("shattered");
  if (seal.classList.contains("shattered")) {
    text.innerText = "📜 [어명 봉인 해제] '황실의 비밀 코드가 활성화되었습니다. 순수 자체 개발의 힘을 누리소서.'";
    showToast("👑 황실 왁스 인장 봉인이 깨졌습니다!");
  } else {
    text.innerText = '"우리가 직접 짠 순수한 코드만이 영원히 빛나리라."';
    showToast("🔒 황실 칙서가 다시 밀봉되었습니다.");
  }
}

// 5. In-House Web Audio Synthesizer
let audioCtx = null;

function playSynthNote(freq) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sawtooth"; // Rich synth wave
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);

  // Trigger wave animation on canvas
  triggerSynthWave(freq);
  showToast(`🎵 Web Audio 주파수 합성: ${freq} Hz`);
}

function triggerSynthWave(freq) {
  const canvas = document.getElementById("synthWaveCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.parentElement.clientWidth || 380;
  canvas.height = 120;

  let step = 0;
  function animateWave() {
    ctx.fillStyle = "rgba(4, 5, 8, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#c084fc";

    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin(x * 0.05 + step) * (freq * 0.08) * Math.sin(x / canvas.width * Math.PI);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    step += 0.3;
    if (step < Math.PI * 3) {
      requestAnimationFrame(animateWave);
    }
  }
  animateWave();
}

// 6. Prismatic Crystal 3D Tilt
function initCrystalTilt() {
  const stage = document.getElementById("crystalStage");
  const card = document.getElementById("crystalCard");
  if (!stage || !card) return;

  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 35}deg) rotateX(${-y * 35}deg) scale(1.06)`;
  });

  stage.addEventListener("mouseleave", () => {
    card.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
  });
}

// 7. Gold Foil Scratch Canvas
function initGoldScratchCanvas() {
  const canvas = document.getElementById("goldScratchCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.parentElement.clientWidth || 380;
  canvas.height = canvas.parentElement.clientHeight || 270;

  // Draw gold foil pattern
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#d4af37");
  grad.addColorStop(0.3, "#fff2a3");
  grad.addColorStop(0.7, "#8a6c1e");
  grad.addColorStop(1, "#d4af37");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#3b200b";
  ctx.font = "bold 15px 'Pretendard', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🪙 마우스로 긁어 1등 당첨을 확인하세요!", canvas.width / 2, canvas.height / 2 + 5);

  let isScratching = false;
  canvas.addEventListener("mousedown", () => isScratching = true);
  window.addEventListener("mouseup", () => isScratching = false);

  canvas.addEventListener("mousemove", (e) => {
    if (!isScratching) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 8. Neural Cyber Decryptor
function triggerNeuralDecrypt() {
  const textEl = document.getElementById("decLiveStream");
  if (!textEl) return;

  const target = "SMR_QUANTUM_CORE_INITIALIZED";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@!$%^&*";
  let step = 0;

  const timer = setInterval(() => {
    textEl.innerText = target.split("").map((c, i) => {
      if (i < step) return target[i];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join("");

    if (step >= target.length) {
      clearInterval(timer);
      showToast("⚡ [SYSTEM] 신경망 양자 코어 해독 완료!");
    }
    step += 1/2;
  }, 25);
}

// Toast
function showToast(msg) {
  const toast = document.getElementById("apexToast");
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Modal Sources Dictionary
const SMR_ORIGINAL_SOURCES = {
  antique3d: {
    title: "🏛️ LabelleJian Antique 3D Porcelain Turntable",
    html: `<div class="antique-porcelain-turntable" id="porcelainModel">\n  <div class="porcelain-body">\n    <div class="gold-leaf-filigree">⚜ LA BELLE JIAN ⚜</div>\n    <div class="porcelain-glaze-shine"></div>\n  </div>\n  <div class="turntable-base"></div>\n</div>`,
    css: `.antique-porcelain-turntable {\n  width: 140px;\n  height: 180px;\n  perspective: 800px;\n  transform-style: preserve-3d;\n  cursor: grab;\n}\n.porcelain-body {\n  width: 120px;\n  height: 160px;\n  background: linear-gradient(135deg, #fff 0%, #cbd5e1 70%, #94a3b8 100%);\n  border: 3px solid #d4af37;\n  border-radius: 60px 60px 20px 20px;\n  box-shadow: inset -15px 0 25px rgba(0,0,0,0.4), inset 15px 0 25px #fff;\n}`,
    js: `// Pure In-House 3D Drag Rotation Math\nlet currentRot = 0;\nstage.addEventListener('mousemove', (e) => {\n  currentRot += (e.movementX || 0) * 0.8;\n  model.style.transform = \`rotateY(\${currentRot}deg)\`;\n});`
  },
  excalibur: {
    title: "⚔️ Excalibur Royal Blade & Sparks",
    html: `<div class="excalibur-sword-wrap">\n  <div class="sword-blade"><div class="blade-rune">✦ ARTHURIAN ✦</div></div>\n  <div class="sword-guard"></div>\n  <div class="sword-hilt"></div>\n</div>\n<div class="magic-circle-base"></div>`,
    css: `.sword-blade {\n  width: 14px;\n  height: 140px;\n  background: linear-gradient(to right, #94a3b8, #fff, #64748b);\n  clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);\n  box-shadow: 0 0 20px #fff;\n}\n.magic-circle-base {\n  width: 160px;\n  height: 160px;\n  border: 2px dashed #f59e0b;\n  border-radius: 50%;\n  animation: spinSlow 12s linear infinite;\n}`,
    js: `// Real-time Sparks Particle Emitter\nstage.addEventListener('mousemove', (e) => {\n  const spark = document.createElement('div');\n  spark.style.left = \`\${e.clientX}px\`;\n  spark.style.top = \`\${e.clientY}px\`;\n  // ...\n});`
  },
  decree: {
    title: "📜 Dynasty Imperial Charter & Wax Shatter",
    html: `<div class="decree-scroll-card">\n  <div class="decree-title">황 실 칙 서</div>\n  <div class="pure-wax-seal" onclick="this.classList.toggle('shattered')">\n    <span>👑</span>\n  </div>\n</div>`,
    css: `.decree-scroll-card {\n  background: #f4e4ba;\n  box-shadow: inset 0 0 25px rgba(139, 90, 43, 0.5);\n  border-radius: 6px;\n  font-family: 'Cinzel', serif;\n}\n.pure-wax-seal {\n  width: 48px;\n  height: 48px;\n  background: radial-gradient(circle at 35% 35%, #b91c1c, #450a0a);\n  border-radius: 50%;\n  cursor: pointer;\n}`,
    js: `function breakPureWaxSeal() {\n  document.querySelector('.pure-wax-seal').classList.toggle('shattered');\n}`
  },
  reactor: {
    title: "🌌 Deep-Space Quantum Reactor",
    html: `<div class="reactor-magnetic-ring">\n  <div class="plasma-pulsing-core"></div>\n</div>`,
    css: `.reactor-magnetic-ring {\n  width: 120px;\n  height: 120px;\n  border: 3px solid #00f0ff;\n  border-radius: 50%;\n  box-shadow: 0 0 30px #00f0ff;\n}\n.plasma-pulsing-core {\n  width: 50px;\n  height: 50px;\n  background: radial-gradient(circle, #fff, #00f0ff, #3b82f6);\n  border-radius: 50%;\n  filter: blur(4px);\n}`,
    js: `// Quantum Reactor Core Pulse Loop\n// Zero External Dependencies`
  },
  synth: {
    title: "🎛️ In-House Web Audio Synthesizer",
    html: `<canvas id="synthWaveCanvas"></canvas>\n<button onclick="playSynthNote(440)">A4 (440Hz)</button>`,
    css: `#synthWaveCanvas {\n  width: 100%;\n  height: 120px;\n  background: #040508;\n  border: 1px solid #c084fc;\n}`,
    js: `const audioCtx = new (window.AudioContext || window.webkitAudioContext)();\nfunction playSynthNote(freq) {\n  const osc = audioCtx.createOscillator();\n  osc.type = "sawtooth";\n  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);\n  osc.connect(audioCtx.destination);\n  osc.start();\n  osc.stop(audioCtx.currentTime + 0.5);\n}`
  },
  crystal: {
    title: "💎 Prismatic Crystal Glass Card",
    html: `<div class="crystal-card-wrap">\n  <div class="crystal-glass-surface">\n    <span>💎 Pure Crystal 24K</span>\n  </div>\n</div>`,
    css: `.crystal-card-wrap {\n  background: linear-gradient(135deg, #ff007f, #00ffcc, #ffe600, #00f0ff);\n  padding: 2px;\n  border-radius: 16px;\n}\n.crystal-glass-surface {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(25px);\n  border-radius: 14px;\n}`,
    js: `// Prismatic Angle Calculation`
  },
  scratch: {
    title: "🪙 Gold Foil Scratch & Win Engine",
    html: `<div class="scratch-stage">\n  <div class="scratch-under-content">🏆 1등 당첨</div>\n  <canvas id="goldScratchCanvas"></canvas>\n</div>`,
    css: `#goldScratchCanvas {\n  position: absolute;\n  inset: 0;\n  cursor: crosshair;\n}`,
    js: `const canvas = document.getElementById('goldScratchCanvas');\nconst ctx = canvas.getContext('2d');\n// Destination-out scratching algorithm\nctx.globalCompositeOperation = 'destination-out';`
  },
  decryptor: {
    title: "⚡ Neural Decryptor HUD Stream",
    html: `<div class="dec-live-stream" onmouseenter="triggerNeuralDecrypt()">\n  SMR_QUANTUM_CORE\n</div>`,
    css: `.dec-live-stream {\n  font-family: 'Fira Code', monospace;\n  color: #00ffcc;\n  text-shadow: 0 0 8px #00ffcc;\n  cursor: pointer;\n}`,
    js: `function triggerNeuralDecrypt() {\n  // 0.02s Scramble Timer\n}`
  }
};

let currentModalArtifact = 'antique3d';
let currentModalLang = 'html';

function openSourceModal(key) {
  const data = SMR_ORIGINAL_SOURCES[key];
  if (!data) return;
  currentModalArtifact = key;

  document.getElementById("modalArtifactTitle").innerText = data.title;
  switchModalLang('html');

  const modal = document.getElementById("sourceModal");
  modal.classList.add("active");
}

function closeSourceModal() {
  const modal = document.getElementById("sourceModal");
  modal.classList.remove("active");
}

function switchModalLang(lang) {
  currentModalLang = lang;
  document.getElementById("btnTabHtml").classList.toggle("active", lang === 'html');
  document.getElementById("btnTabCss").classList.toggle("active", lang === 'css');
  document.getElementById("btnTabJs").classList.toggle("active", lang === 'js');

  const data = SMR_ORIGINAL_SOURCES[currentModalArtifact];
  const box = document.getElementById("modalCodeDisplay");
  box.innerText = data[lang];
}

function copyDisplayedCode() {
  const box = document.getElementById("modalCodeDisplay");
  navigator.clipboard.writeText(box.innerText).then(() => {
    showToast("📋 자체 제작 오리지널 코드가 복사되었습니다!");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initApexBgCanvas();
  initAntique3D();
  initExcaliburSparks();
  initCrystalTilt();
  initGoldScratchCanvas();

  const modal = document.getElementById("sourceModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeSourceModal();
    });
  }
});
