import { ELEMENTS, ELEMENT_META } from '../config/settings.js';
import { ELEMENT_SIGILS } from './glyphs.js';

/**
 * Heads-up display: the ability bar, controls, live stats and toasts.
 *
 * Plain DOM — no framework. The bar is built from `ELEMENTS`, so a new ability
 * appears in it on its own; the slots are the only interactive part, and they
 * mirror the keyboard shortcuts through `onAbility`.
 *
 * The cooldown sweep is a `conic-gradient` driven by a CSS custom property, so
 * updating it every frame is one `setProperty` call and never touches layout.
 */
export class HUD {
  constructor(root) {
    this.root = root;
    this.onAbility = null;
    this.onToggleAuto = null;
    this._toastTimer = 0;
    this._statsAccumulator = 0;
    this._frames = 0;
    this._fps = 0;
    /** Last sweep ratio pushed to the DOM, per element. */
    this._cooldownShown = new Map();
    this._armedShown = null;

    root.innerHTML = `
      <div class="hud__panel hud__title">
        황태민의 멋진 게임 — Elemental Defense
        <span data-blurb>성소를 노리는 공허 몬스터들을 원소 마법으로 격퇴하세요!</span>
      </div>

      <div class="hud__panel hud__stats">
        <div>FPS <b data-stat="fps">—</b></div>
        <div>Particles <b data-stat="particles">0</b></div>
        <div>Instances <b data-stat="spikes">0</b></div>
        <div>Draw calls <b data-stat="calls">0</b></div>
      </div>

      <div class="hud__panel hud__help">
        <div style="color: #38bdf8; font-weight: bold; margin-bottom: 4px;">🎮 <strong>W A S D</strong> — 캐릭터 이동 (Move)</div>
        <div style="color: #fbbf24; font-weight: bold; margin-bottom: 4px;">⚡ <strong>SPACE</strong> — 순간이동 회피 (Flash Blink)</div>
        <div><strong>Q</strong> — Frost Lance &nbsp; <strong>E</strong> — Storm Lance</div>
        <div><strong>R</strong> — Cinder Fall &nbsp; <strong>F</strong> — Nova Beam</div>
        <div><strong>V</strong> — Voltaic Snare &nbsp; <strong>X</strong> — Glacial Crown</div>
        <div><strong>C / B</strong> — Blizzard Storm (눈보라 소용돌이)</div>
        <div class="hud__help-note">V, X, C는 원형 타겟팅 / 좌클릭으로 시전</div>
        <div><strong>마우스 조준</strong> / <strong>좌클릭</strong> — 스킬 시전</div>
        <div><strong>우클릭 드래그</strong> — 카메라 회전 &nbsp; <strong>휠</strong> — 줌</div>
      </div>

      <div class="hud__abilities">
        <div class="ability-card dash-card" data-dash style="--accent:#38bdf8">
          <div class="ability-card__sweep" data-dash-sweep></div>
          <div class="ability-card__key">SPACE</div>
          <div class="ability-card__glyph">⚡</div>
          <div class="ability-card__label" data-dash-label>BLINK</div>
        </div>

        ${ELEMENTS.map((element) => {
          const meta = ELEMENT_META[element] || { accent: '#ff7700', key: 'Q', label: element };
          return `
            <div class="ability-card" data-element="${element}" style="--accent:${meta.accent || '#ff7700'}">
              <div class="ability-card__sweep" data-sweep></div>
              <div class="ability-card__key">${meta.key || 'Q'}</div>
              <div class="ability-card__glyph">${ELEMENT_SIGILS[element] ?? ''}</div>
              <div class="ability-card__label">${meta.label || element}</div>
            </div>`;
        }).join('')}
      </div>

      <div class="hud__toast" data-toast></div>
      <div class="hud__paused" data-paused>Paused</div>
    `;

    this.dashCard = root.querySelector('[data-dash]');
    this.dashSweep = root.querySelector('[data-dash-sweep]');
    this.dashLabel = root.querySelector('[data-dash-label]');

    this.cards = new Map();
    for (const card of root.querySelectorAll('.ability-card')) {
      this.cards.set(card.dataset.element, card);
      card.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        this.onAbility?.(card.dataset.element);
      });
    }

    this.stats = {
      fps: root.querySelector('[data-stat="fps"]'),
      particles: root.querySelector('[data-stat="particles"]'),
      spikes: root.querySelector('[data-stat="spikes"]'),
      calls: root.querySelector('[data-stat="calls"]')
    };
    this.help = root.querySelector('.hud__help');
    this.toast = root.querySelector('[data-toast]');
    this.pausedBadge = root.querySelector('[data-paused]');
    this.abilityBar = root.querySelector('.hud__abilities');
  }

  setExclusiveSkills(allowedSkills = [], unlockedSet = new Set()) {
    this.allowedSkills = new Set(allowedSkills);
    for (const [key, card] of this.cards) {
      if (allowedSkills.length === 0) {
        card.style.display = 'none'; // In normal adventurer mode, hide desktop spell cards or show locked
      } else {
        const isAllowed = this.allowedSkills.has(key);
        if (!isAllowed) {
          card.style.display = 'none';
        } else {
          card.style.display = 'flex';
          const isUnlocked = unlockedSet.has(key);
          card.classList.toggle('is-locked', !isUnlocked);
          card.style.opacity = isUnlocked ? '1' : '0.4';
          card.style.filter = isUnlocked ? 'none' : 'grayscale(0.8)';
        }
      }
    }
  }

  setUnlockedSkills(unlockedSet) {
    for (const [key, card] of this.cards) {
      if (this.allowedSkills && !this.allowedSkills.has(key)) {
        card.style.display = 'none';
        continue;
      }
      const isUnlocked = unlockedSet.has(key);
      card.classList.toggle('is-locked', !isUnlocked);
      card.style.opacity = isUnlocked ? '1' : '0.4';
      card.style.filter = isUnlocked ? 'none' : 'grayscale(0.8)';
    }
  }

  /** @param {{silent?: boolean}} [options] */
  setElement(element, options = {}) {
    for (const [key, card] of this.cards) {
      card.classList.toggle('is-active', key === element);
    }
    const meta = ELEMENT_META[element];
    if (meta && !options.silent) this.showToast(`${meta.hint} selected`);
  }

  /** Highlight the slot while a cast is armed. */
  setArmed(armed) {
    if (armed === this._armedShown) return;
    this._armedShown = armed;
    this.abilityBar.classList.toggle('is-armed', armed);
  }

  /**
   * Drive one slot's cooldown sweep. Cooldowns are per ability, so this is
   * called once per element each frame.
   *
   * @param {string} element
   * @param {number} remaining seconds left
   * @param {number} total     the full cooldown, for the sweep angle
   */
  setCooldown(element, remaining, total) {
    const card = this.cards.get(element);
    if (!card) return;

    const ratio = Math.max(0, Math.min(1, remaining / Math.max(total, 0.001)));
    // Only touch the DOM when the sweep visibly moves.
    if (Math.abs(ratio - (this._cooldownShown.get(element) ?? -1)) < 0.01) return;
    this._cooldownShown.set(element, ratio);
    card.style.setProperty('--cooldown', ratio);
    card.classList.toggle('is-cooling', ratio > 0.001);
  }

  setDashCooldown(remaining, total) {
    if (!this.dashCard) return;
    const ratio = Math.max(0, Math.min(1, remaining / Math.max(total, 0.001)));
    this.dashCard.style.setProperty('--cooldown', ratio);
    this.dashCard.classList.toggle('is-cooling', ratio > 0.001);
    if (this.dashLabel) {
      this.dashLabel.textContent = remaining > 0.1 ? `${remaining.toFixed(1)}s` : 'BLINK';
    }
  }

  setPaused(paused) {
    this.pausedBadge.classList.toggle('is-visible', paused);
  }

  toggleHelp() {
    this.help.classList.toggle('is-hidden');
  }

  showToast(message, duration = 1600) {
    this.toast.textContent = message;
    this.toast.classList.add('is-visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('is-visible'), duration);
  }

  /**
   * @param {number} dt
   * @param {() => {particles:number, spikes:number, calls:number}} collect
   *   Called only when the readout actually refreshes, so gathering the numbers
   *   (which means walking the particle pools) stays off the hot path.
   */
  update(dt, collect) {
    this._frames++;
    this._statsAccumulator += dt;
    if (this._statsAccumulator < 0.4) return;

    this._fps = Math.round(this._frames / this._statsAccumulator);
    this._frames = 0;
    this._statsAccumulator = 0;

    const info = collect();
    this.stats.fps.textContent = this._fps;
    this.stats.particles.textContent = info.particles;
    this.stats.spikes.textContent = info.spikes;
    this.stats.calls.textContent = info.calls;
  }
}

/** Boot screen helper. */
export class LoadingScreen {
  constructor() {
    this.element = document.getElementById('loader');
    this.fill = document.getElementById('loader-fill');
    this.status = document.getElementById('loader-status');
  }

  setProgress(ratio, message) {
    this.fill.style.width = `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`;
    if (message) this.status.textContent = message;
  }

  hide() {
    this.setProgress(1);
    setTimeout(() => this.element.classList.add('is-hidden'), 220);
  }

  fail(message) {
    this.status.textContent = message;
    this.status.style.color = '#ff7a6a';
  }
}
