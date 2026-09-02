/* ==========================================================================
   Modern Interactive Visual & Canvas Effects
   ========================================================================== */

function initModernEffects() {
  // 7. Spotlight Glow Tracking
  const spotlightCards = document.querySelectorAll(".spotlight-card");
  spotlightCards.forEach(card => {
    const glow = card.querySelector(".spotlight-glow");
    if (!glow) return;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    });
  });

  // 8. 3D Perspective Tilt Card
  const tiltCard = document.getElementById("holoTiltCard");
  if (tiltCard) {
    tiltCard.addEventListener("mousemove", (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / rect.height) * 30;
      const rotateY = (x / rect.width) * 30;
      tiltCard.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });
    tiltCard.addEventListener("mouseleave", () => {
      tiltCard.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  }

  // 9. Meteor Canvas
  const meteorCanvas = document.getElementById("meteorCanvas");
  if (meteorCanvas) {
    const ctx = meteorCanvas.getContext("2d");
    meteorCanvas.width = meteorCanvas.clientWidth || 380;
    meteorCanvas.height = meteorCanvas.clientHeight || 180;

    const meteors = [];
    for (let i = 0; i < 4; i++) {
      meteors.push({
        x: Math.random() * meteorCanvas.width,
        y: Math.random() * meteorCanvas.height / 2,
        len: Math.random() * 80 + 40,
        speed: Math.random() * 4 + 3,
        opacity: Math.random() * 0.8 + 0.2
      });
    }

    function drawMeteors() {
      ctx.fillStyle = "rgba(6, 9, 19, 0.25)";
      ctx.fillRect(0, 0, meteorCanvas.width, meteorCanvas.height);

      // Stars
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect((i * 37) % meteorCanvas.width, (i * 29) % meteorCanvas.height, 1.5, 1.5);
      }

      meteors.forEach(m => {
        const grad = ctx.createLinearGradient(m.x, m.y, m.x + m.len, m.y + m.len * 0.6);
        grad.addColorStop(0, `rgba(56, 189, 248, ${m.opacity})`);
        grad.addColorStop(1, "transparent");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + m.len, m.y + m.len * 0.6);
        ctx.stroke();

        m.x -= m.speed;
        m.y += m.speed * 0.6;

        if (m.x < -100 || m.y > meteorCanvas.height + 50) {
          m.x = meteorCanvas.width + Math.random() * 100;
          m.y = -20;
          m.len = Math.random() * 80 + 40;
          m.speed = Math.random() * 4 + 3;
        }
      });
      requestAnimationFrame(drawMeteors);
    }
    drawMeteors();
  }

  // 11. Particle Repulsion Canvas
  const partCanvas = document.getElementById("particleCanvas");
  if (partCanvas) {
    const ctx = partCanvas.getContext("2d");
    partCanvas.width = partCanvas.clientWidth || 380;
    partCanvas.height = partCanvas.clientHeight || 180;

    const particles = [];
    const numParticles = 45;
    let mouse = { x: -100, y: -100, radius: 60 };

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * partCanvas.width,
        y: Math.random() * partCanvas.height,
        originX: 0,
        originY: 0,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3 + 2,
        color: "#38bdf8"
      });
      particles[i].originX = particles[i].x;
      particles[i].originY = particles[i].y;
    }

    partCanvas.addEventListener("mousemove", (e) => {
      const rect = partCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    partCanvas.addEventListener("mouseleave", () => {
      mouse.x = -100;
      mouse.y = -100;
    });

    function animateParticles() {
      ctx.clearRect(0, 0, partCanvas.width, partCanvas.height);

      particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= Math.cos(angle) * force * 5;
          p.y -= Math.sin(angle) * force * 5;
        } else {
          p.x += (p.originX - p.x) * 0.05;
          p.y += (p.originY - p.y) * 0.05;
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // 12. Cyberpunk Text Decrypt
  const decryptEl = document.getElementById("decryptTextDemo");
  if (decryptEl) {
    const originalText = decryptEl.innerText;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    decryptEl.addEventListener("click", () => {
      let iteration = 0;
      const interval = setInterval(() => {
        decryptEl.innerText = originalText
          .split("")
          .map((letter, index) => {
            if (index < iteration) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");

        if (iteration >= originalText.length) {
          clearInterval(interval);
        }
        iteration += 1 / 3;
      }, 30);
    });
  }

  // 13. Liquid Button Ripple
  const liquidBtn = document.getElementById("liquidBtnDemo");
  if (liquidBtn) {
    liquidBtn.addEventListener("click", function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - 50;
      const y = e.clientY - rect.top - 50;
      const ripple = document.createElement("span");
      ripple.className = "liquid-ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
      showToast("✨ Liquid Energy Released!");
    });
  }

  // 15. Neomorphic Switch
  const neoSwitch = document.getElementById("neoSwitchDemo");
  if (neoSwitch) {
    neoSwitch.addEventListener("click", () => {
      neoSwitch.classList.toggle("active");
    });
  }

  // 17. Dynamic Island Toggle
  const dynIsland = document.getElementById("dynamicIslandDemo");
  if (dynIsland) {
    dynIsland.addEventListener("click", () => {
      dynIsland.classList.toggle("expanded");
      const sub = dynIsland.querySelector(".island-sub");
      if (dynIsland.classList.contains("expanded")) {
        if (sub) sub.innerText = "AirPods Pro Connected • 98%";
      } else {
        if (sub) sub.innerText = "Connected";
      }
    });
  }

  // 19. Pricing Slider
  const priceSlider = document.getElementById("priceSlider");
  const priceVal = document.getElementById("priceVal");
  if (priceSlider && priceVal) {
    priceSlider.addEventListener("input", (e) => {
      const val = e.target.value;
      priceVal.innerText = `$${val * 9}`;
    });
  }

  // 23. Live KPI Chart Update
  const kpiVal = document.getElementById("kpiVal");
  if (kpiVal) {
    setInterval(() => {
      const base = 28450;
      const delta = Math.floor(Math.random() * 400 - 180);
      kpiVal.innerText = `$${(base + delta).toLocaleString()}`;
    }, 2000);
  }

  // 24. Audio Visualizer Simulator
  const visBars = document.querySelectorAll(".vis-bar");
  if (visBars.length > 0) {
    setInterval(() => {
      visBars.forEach(bar => {
        const height = Math.floor(Math.random() * 70 + 8);
        bar.style.height = `${height}px`;
      });
    }, 100);
  }

  // 26. Scratch-to-Reveal Canvas
  const scratchCanvas = document.getElementById("scratchCanvas");
  if (scratchCanvas) {
    const sCtx = scratchCanvas.getContext("2d");
    scratchCanvas.width = 240;
    scratchCanvas.height = 120;

    // Gray coating
    sCtx.fillStyle = "#64748b";
    sCtx.fillRect(0, 0, 240, 120);
    sCtx.font = "bold 14px sans-serif";
    sCtx.fillStyle = "#cbd5e1";
    sCtx.textAlign = "center";
    sCtx.fillText("🪙 긁어서 당첨 확인", 120, 65);

    let isScratching = false;

    function scratch(e) {
      if (!isScratching) return;
      const rect = scratchCanvas.getBoundingClientRect();
      const x = (e.clientX || e.touches[0].clientX) - rect.left;
      const y = (e.clientY || e.touches[0].clientY) - rect.top;

      sCtx.globalCompositeOperation = "destination-out";
      sCtx.beginPath();
      sCtx.arc(x, y, 16, 0, Math.PI * 2);
      sCtx.fill();
    }

    scratchCanvas.addEventListener("mousedown", () => isScratching = true);
    window.addEventListener("mouseup", () => isScratching = false);
    scratchCanvas.addEventListener("mousemove", scratch);
  }

  // 28. Confetti Cannon
  const confettiBtn = document.getElementById("confettiBtnDemo");
  if (confettiBtn) {
    confettiBtn.addEventListener("click", () => {
      createConfetti();
      showToast("🎉 Celebration Confetti Fired!");
    });
  }
}

function createConfetti() {
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = "-20px";
    confetti.style.width = `${Math.random() * 10 + 6}px`;
    confetti.style.height = `${Math.random() * 10 + 6}px`;
    confetti.style.backgroundColor = ["#f59e0b", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6"][Math.floor(Math.random() * 5)];
    confetti.style.borderRadius = "2px";
    confetti.style.zIndex = "9999";
    confetti.style.pointerEvents = "none";
    confetti.style.transition = "transform 3s cubic-bezier(0.25, 1, 0.5, 1), opacity 3s";
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.transform = `translate(${(Math.random() - 0.5) * 300}px, ${window.innerHeight + 50}px) rotate(${Math.random() * 720}deg)`;
      confetti.style.opacity = "0";
    }, 20);

    setTimeout(() => confetti.remove(), 3200);
  }
}

document.addEventListener("DOMContentLoaded", initModernEffects);
