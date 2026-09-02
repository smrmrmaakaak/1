
/* ==========================================================================
   Design Vault 300 Interactive Logic with Real-time Live Visual Previews
   ========================================================================== */

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'stars';
let currentPage = 1;
const itemsPerPage = 24;

let filteredItems = [...DESIGN_VAULT_300];

function showToast(msg) {
  const toast = document.getElementById("vaultToast");
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function applyFilters() {
  filteredItems = DESIGN_VAULT_300.filter(item => {
    const matchCat = (currentCategory === 'all' || item.categoryId === currentCategory);
    const q = currentSearch.toLowerCase();
    const matchSearch = (!q || 
      item.title.toLowerCase().includes(q) || 
      item.desc.toLowerCase().includes(q) || 
      item.tags.some(t => t.toLowerCase().includes(q))
    );
    return matchCat && matchSearch;
  });

  if (currentSort === 'stars') {
    filteredItems.sort((a, b) => b.stars - a.stars);
  } else if (currentSort === 'title') {
    filteredItems.sort((a, b) => a.title.localeCompare(b.title));
  } else if (currentSort === 'id') {
    filteredItems.sort((a, b) => a.id - b.id);
  }

  currentPage = 1;
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("vaultGrid");
  const totalCountEl = document.getElementById("totalItemsCount");
  if (totalCountEl) totalCountEl.innerText = filteredItems.length;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filteredItems.slice(start, end);

  if (pageItems.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-body); font-size: 1.1rem;">🔍 검색 결과가 없습니다.</div>';
    renderPagination();
    return;
  }

  grid.innerHTML = pageItems.map(item => {
    const isMedieval = item.categoryId === 'medieval';
    const previewStage = getLivePreviewHTML(item, false);

    return `
      <article class="vault-card ${isMedieval ? 'medieval-card' : ''}" onclick="openDetailModal(${item.id})">
        <div class="card-top">
          <span class="card-cat-badge" style="${isMedieval ? 'color: var(--gold); border-color: rgba(212,175,55,0.4);' : ''}">${item.categoryName.split(' ')[0]} ${item.tags[0]}</span>
          <span class="card-stars">★ ${item.stars.toLocaleString()}</span>
        </div>
        
        <!-- Live Visual Preview Stage -->
        <div class="card-preview-container" style="margin-bottom: 14px;">
          ${previewStage}
        </div>

        <h3 class="card-title-text">${item.title}</h3>
        <p class="card-desc-text">${item.desc}</p>
        
        <div class="card-tags">
          ${item.tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}
        </div>
        
        <div class="card-footer">
          <span>📦 ${item.repo}</span>
          <button class="btn-open" onclick="event.stopPropagation(); openDetailModal(${item.id})">👀 실시간 라이브 뷰</button>
        </div>
      </article>
    `;
  }).join('');

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const infoEl = document.getElementById("pageInfoText");

  if (prevBtn) prevBtn.disabled = (currentPage === 1);
  if (nextBtn) nextBtn.disabled = (currentPage >= totalPages);
  if (infoEl) infoEl.innerText = `Page ${currentPage} / ${totalPages} (${filteredItems.length} items)`;
}

let currentModalItem = null;

function switchModalTab(tabName) {
  const liveTab = document.getElementById("modalTabLive");
  const codeTab = document.getElementById("modalTabCode");
  const btnLive = document.getElementById("btnTabLive");
  const btnCode = document.getElementById("btnTabCode");

  if (tabName === 'live') {
    liveTab.style.display = 'block';
    codeTab.style.display = 'none';
    btnLive.classList.add('active');
    btnCode.classList.remove('active');
  } else {
    liveTab.style.display = 'none';
    codeTab.style.display = 'block';
    btnLive.classList.remove('active');
    btnCode.classList.add('active');
  }
}

function openDetailModal(id) {
  const item = DESIGN_VAULT_300.find(x => x.id === id);
  if (!item) return;
  currentModalItem = item;

  const modal = document.getElementById("detailModal");
  const titleEl = document.getElementById("modalTitle");
  const descEl = document.getElementById("modalDesc");
  const codeEl = document.getElementById("modalCode");
  const repoEl = document.getElementById("modalRepo");
  const liveStageEl = document.getElementById("modalLiveStage");

  titleEl.innerText = item.title;
  descEl.innerText = item.desc;
  codeEl.innerText = `${item.codeHtml}\n\n${item.codeCss}`;
  repoEl.innerText = `GitHub: https://github.com/${item.repo}`;
  liveStageEl.innerHTML = getLivePreviewHTML(item, true);

  switchModalTab('live');
  modal.classList.add("active");
}

function closeDetailModal() {
  const modal = document.getElementById("detailModal");
  if (modal) modal.classList.remove("active");
}

function copyCurrentCode() {
  const codeEl = document.getElementById("modalCode");
  navigator.clipboard.writeText(codeEl.innerText).then(() => {
    showToast("📋 소스코드가 클립보드에 복사되었습니다!");
  });
}

// Background Particle Canvas
function initHeroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = [];
  for (let i = 0; i < 70; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.3 + 0.1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      ctx.fillStyle = `rgba(56, 189, 248, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      s.y -= s.speed;
      if (s.y < 0) s.y = canvas.height;
    });
    requestAnimationFrame(loop);
  }
  loop();
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroCanvas();

  // Search Input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      applyFilters();
    });
  }

  // Sort Select
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }

  // Category Tabs
  const tabs = document.querySelectorAll(".category-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active", "gold"));
      tab.classList.add("active");
      if (tab.getAttribute("data-cat") === 'medieval') tab.classList.add("gold");
      currentCategory = tab.getAttribute("data-cat");
      applyFilters();
    });
  });

  // Pagination
  document.getElementById("prevPageBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderGrid();
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  });

  document.getElementById("nextPageBtn").addEventListener("click", () => {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderGrid();
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  });

  // Modal Backdrop Click
  const modal = document.getElementById("detailModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeDetailModal();
    });
  }

  applyFilters();
});
