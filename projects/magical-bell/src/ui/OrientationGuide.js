/**
 * Orientation & Fullscreen Guide Overlay for Mobile Web Users.
 * Optimized for One Piece RPG Beta 1 with optional portrait bypass.
 */
export class OrientationGuide {
  constructor(parent = document.body) {
    this.parent = parent;
    this.dismissed = false;
    this._createDOM();
    this._bindEvents();
    this.checkOrientation();
  }

  _createDOM() {
    this.root = document.createElement('div');
    this.root.id = 'orientation-guide-overlay';
    this.root.className = 'orientation-guide-overlay';
    this.root.innerHTML = `
      <div class="orientation-box">
        <div class="phone-rotate-icon">📱 ➔ 🔄</div>
        <h2 class="orientation-title">가로 모드 권장</h2>
        <p class="orientation-desc">
          『원피스 게임 베타1』의 3D 액션과 스킬 조작은<br/>
          <b>가로 화면(Landscape)</b>에서 가장 쾌적하게 즐기실 수 있습니다.
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 18px;">
          <button class="btn-fullscreen-toggle" id="btn-guide-fullscreen" style="background: linear-gradient(135deg, #e74c3c, #d35400); color: #fff; font-weight: 800; padding: 12px; border-radius: 12px; border: none; font-size: 15px; cursor: pointer; box-shadow: 0 4px 15px rgba(231,76,60,0.4);">
            📺 전체화면 및 가로로 플레이
          </button>
          <button id="btn-guide-continue-portrait" style="background: rgba(255,255,255,0.12); color: #cbd5e1; font-weight: 600; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); font-size: 13px; cursor: pointer;">
            세로 모드로 계속하기
          </button>
        </div>
      </div>
    `;
    this.parent.appendChild(this.root);
  }

  _bindEvents() {
    window.addEventListener('resize', () => this.checkOrientation(), { passive: true });
    window.addEventListener('orientationchange', () => this.checkOrientation(), { passive: true });

    const btnFullscreen = this.root.querySelector('#btn-guide-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        this.toggleFullscreen();
        this.dismissed = true;
        this.root.classList.remove('is-visible');
      });
    }

    const btnContinue = this.root.querySelector('#btn-guide-continue-portrait');
    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        this.dismissed = true;
        this.root.classList.remove('is-visible');
      });
    }
  }

  checkOrientation() {
    if (this.dismissed) return;
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 900);

    if (isPortrait && isMobile) {
      this.root.classList.add('is-visible');
    } else {
      this.root.classList.remove('is-visible');
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }
}
