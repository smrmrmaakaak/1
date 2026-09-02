/* ==========================================================================
   Showcase App Master Logic (Search, Filter, Theme, Code Modal, Toast)
   ========================================================================== */

const componentCodeData = {
  1: {
    title: "Medieval Parchment & Wax Seal",
    html: `<div class="parchment-container">
  <div class="parchment-header">Kingdom Charter</div>
  <p class="parchment-body">In witness whereof, we have affixed our Great Imperial Wax Seal...</p>
  <div class="wax-seal"></div>
</div>`,
    css: `.parchment-container {
  background: #f4e8c1;
  border: 1px solid #c8a876;
  box-shadow: inset 0 0 30px rgba(110, 68, 26, 0.4);
  font-family: 'Cinzel', serif;
}
.wax-seal {
  width: 58px; height: 58px;
  background: radial-gradient(circle at 35% 35%, #b91c1c, #450a0a);
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}`
  },
  2: {
    title: "Gothic Illuminated Drop Caps",
    html: `<div class="gothic-manuscript">
  <span class="drop-cap">O</span>nce upon an ancient epoch in the gilded halls of Avalon, the runes whispered secrets of arcane alchemy...
  <div class="gold-shimmer-text">✦ MAGNUM OPUS ALCHEMICA ✦</div>
</div>`,
    css: `.drop-cap {
  float: left; font-size: 3.4rem;
  background: linear-gradient(135deg, #ffd700, #daa520);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`
  },
  3: {
    title: "Baroque Gold Leaf & Filigree Frame",
    html: `<div class="baroque-frame">
  <div class="baroque-ornament">⚜ ❖ ⚜</div>
  <h3>ROYAL ARCHIVE</h3>
  <p>Certified Renaissance Heritage</p>
</div>`,
    css: `.baroque-frame {
  border: 12px solid transparent;
  border-image: linear-gradient(45deg, #d4af37, #fff2a3, #8a6c1e, #f3e08b) 12;
  background: radial-gradient(circle, #241a12, #0d0906);
}`
  },
  7: {
    title: "Bento Grid Spotlight Glow",
    html: `<div class="spotlight-card">
  <div class="spotlight-glow"></div>
  <h3>Spotlight Interactive Card</h3>
  <p>Follows mouse coordinates dynamically.</p>
</div>`,
    css: `.spotlight-glow {
  position: absolute; width: 250px; height: 250px;
  background: radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%);
  pointer-events: none; transform: translate(-50%, -50%);
}`
  },
  8: {
    title: "3D Holographic Perspective Tilt Card",
    html: `<div class="holo-3d-card" id="holoTiltCard">
  <div class="holo-shine"></div>
  <h4>HOLOGRAPHIC 3D</h4>
  <p>Interactive tilt perspective</p>
</div>`,
    css: `.holo-3d-card {
  transform-style: preserve-3d;
  transition: transform 0.15s ease-out;
}`
  }
};

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function openCodeModal(id) {
  const modal = document.getElementById("codeModal");
  const modalTitle = document.getElementById("modalCodeTitle");
  const codeContent = document.getElementById("modalCodeContent");
  
  const data = componentCodeData[id] || {
    title: `Component #${id} Source Code`,
    html: `<!-- Interactive Component #${id} markup -->\n<div class="demo-box-${id}">\n  <span>Interactive Preview</span>\n</div>`,
    css: `/* CSS for Component #${id} */\n.demo-box-${id} {\n  display: flex;\n  border-radius: 12px;\n  background: var(--bg-card);\n}`
  };

  modalTitle.innerText = data.title;
  codeContent.innerText = `<!-- HTML -->\n${data.html}\n\n/* CSS */\n${data.css}`;
  modal.classList.add("active");
}

function closeCodeModal() {
  const modal = document.getElementById("codeModal");
  if (modal) modal.classList.remove("active");
}

function copyModalCode() {
  const codeContent = document.getElementById("modalCodeContent").innerText;
  navigator.clipboard.writeText(codeContent).then(() => {
    showToast("📋 Code Copied to Clipboard!");
    closeCodeModal();
  });
}

function setupApp() {
  // Category Filter
  const navBtns = document.querySelectorAll(".nav-btn");
  const cards = document.querySelectorAll(".showcase-card");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");

      cards.forEach(card => {
        const cat = card.getAttribute("data-category");
        if (filter === "all" || cat === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Search Filter
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      cards.forEach(card => {
        const title = card.querySelector(".card-title").innerText.toLowerCase();
        const desc = card.querySelector(".card-desc").innerText.toLowerCase();
        const tag = card.querySelector(".card-tag").innerText.toLowerCase();

        if (title.includes(q) || desc.includes(q) || tag.includes(q)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  }

  // Theme Switcher
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
      const theme = e.target.value;
      if (theme === "modern") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", theme);
      }
      showToast(`🎨 Theme switched to: ${theme.toUpperCase()}`);
    });
  }

  // Modal Backdrop Click
  const modal = document.getElementById("codeModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeCodeModal();
    });
  }
}

document.addEventListener("DOMContentLoaded", setupApp);
