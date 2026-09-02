
/* ==========================================================================
   Design Vault 300 - Real Interactive Playground & Physics Engine
   Allows full hands-on interaction directly inside every card & modal!
   ========================================================================== */

function bindAllInteractiveWidgets() {
  // 1. 3D Tilt Cards
  document.querySelectorAll(".interactive-tilt-box").forEach(box => {
    box.addEventListener("mousemove", (e) => {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rx = -(y / rect.height) * 25;
      const ry = (x / rect.width) * 25;
      box.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.04, 1.04, 1.04)`;
    });
    box.addEventListener("mouseleave", () => {
      box.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });

  // 2. Interactive Wax Seals
  document.querySelectorAll(".interactive-wax-seal").forEach(seal => {
    seal.onclick = (e) => {
      e.stopPropagation();
      seal.classList.toggle("broken");
      if (seal.classList.contains("broken")) {
        seal.style.transform = "scale(0.85) rotate(15deg)";
        seal.style.filter = "grayscale(0.6)";
        showToast("📜 [황실 칙서 봉인 해제] 국왕의 비밀 메시지가 공개되었습니다!");
      } else {
        seal.style.transform = "scale(1) rotate(0deg)";
        seal.style.filter = "none";
        showToast("🔒 황실 인장이 다시 봉인되었습니다.");
      }
    };
  });

  // 3. Glitch & Decrypt Text Click
  document.querySelectorAll(".interactive-glitch-text").forEach(el => {
    el.onclick = (e) => {
      e.stopPropagation();
      const orig = el.getAttribute("data-orig") || el.innerText;
      el.setAttribute("data-orig", orig);
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let iter = 0;
      const timer = setInterval(() => {
        el.innerText = orig.split("").map((c, i) => {
          if (i < iter) return orig[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        if (iter >= orig.length) clearInterval(timer);
        iter += 1/2;
      }, 30);
      showToast("⚡ 사이버 암호 해독 시퀀스 실행!");
    };
  });

  // 4. Confetti Buttons
  document.querySelectorAll(".interactive-confetti-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      fireGlobalConfetti();
      showToast("🎉 축하 폭죽이 발사되었습니다!");
    };
  });

  // 5. Neomorphic Switches
  document.querySelectorAll(".interactive-neo-switch").forEach(sw => {
    sw.onclick = (e) => {
      e.stopPropagation();
      sw.classList.toggle("active");
      const thumb = sw.querySelector(".neo-thumb");
      if (thumb) {
        if (sw.classList.contains("active")) {
          thumb.style.transform = "translateX(24px)";
          thumb.style.background = "#10b981";
        } else {
          thumb.style.transform = "translateX(0px)";
          thumb.style.background = "#38bdf8";
        }
      }
      showToast("🔘 뉴모피즘 토글 스위치 조작 완료");
    };
  });

  // 6. Interactive Pricing Sliders
  document.querySelectorAll(".interactive-price-slider").forEach(slider => {
    slider.oninput = (e) => {
      e.stopPropagation();
      const val = e.target.value;
      const target = slider.parentElement.querySelector(".interactive-price-val");
      if (target) target.innerText = `$${val * 12}`;
    };
  });

  // 7. Dynamic Island Expand
  document.querySelectorAll(".interactive-dyn-island").forEach(island => {
    island.onclick = (e) => {
      e.stopPropagation();
      island.classList.toggle("expanded");
      if (island.classList.contains("expanded")) {
        island.style.width = "220px";
        island.style.height = "55px";
      } else {
        island.style.width = "140px";
        island.style.height = "36px";
      }
    };
  });

  // 8. Scratch Canvas Activation
  document.querySelectorAll(".interactive-scratch-canvas").forEach(canvas => {
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.parentElement.clientWidth || 220;
    canvas.height = canvas.parentElement.clientHeight || 120;
    ctx.fillStyle = "#64748b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🪙 마우스로 긁어보세요!", canvas.width / 2, canvas.height / 2 + 5);

    let scratching = false;
    canvas.onmousedown = () => scratching = true;
    window.addEventListener("mouseup", () => scratching = false);
    canvas.onmousemove = (e) => {
      if (!scratching) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
    };
  });
}

function fireGlobalConfetti() {
  for (let i = 0; i < 50; i++) {
    const c = document.createElement("div");
    c.style.position = "fixed";
    c.style.left = `${Math.random() * 100}vw`;
    c.style.top = "-20px";
    c.style.width = `${Math.random() * 10 + 6}px`;
    c.style.height = `${Math.random() * 10 + 6}px`;
    c.style.backgroundColor = ["#38bdf8", "#d4af37", "#f43f5e", "#10b981", "#a855f7"][Math.floor(Math.random() * 5)];
    c.style.zIndex = "99999";
    c.style.pointerEvents = "none";
    c.style.transition = "transform 2.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 2.5s";
    document.body.appendChild(c);
    setTimeout(() => {
      c.style.transform = `translate(${(Math.random() - 0.5) * 350}px, ${window.innerHeight + 50}px) rotate(${Math.random() * 720}deg)`;
      c.style.opacity = "0";
    }, 20);
    setTimeout(() => c.remove(), 2600);
  }
}
