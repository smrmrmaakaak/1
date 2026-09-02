import { ELEMENT_META } from '../config/settings.js';
import { ELEMENT_SIGILS } from './glyphs.js';

/**
 * MobileControls - AAA Mobile MOBA/RPG Action Controls
 * - 4 Dedicated Radial Skill Slots: [Q], [E], [R], [T]
 * - Instant Tap-to-Cast for all 4 skills
 * - Auto-Battle & Blink Dash Controls
 */
export class MobileControls {
  constructor(container = document.body) {
    this.container = container;
    this.onDash = null;
    this.onCast = null;
    this.onSelectAbility = null;
    this.onToggleAuto = null;

    this.root = document.createElement('div');
    this.root.className = 'mobile-controls-pad';
    this.container.appendChild(this.root);

    this.slots = [];
    this.skillMap = new Map(); // element -> slotData
    this.dashBtn = null;
    this.dashSweep = null;
    this.dashLabel = null;
    this.castBtn = null;
    this.autoBtn = null;

    this._createDOM();
  }

  _createDOM() {
    const slotKeys = ['Q', 'E', 'R', 'T'];

    this.root.innerHTML = `
      <div class="mobile-action-cluster">
        <!-- Radial Arc 4 Skill Slots (Q, E, R, T) -->
        <div class="mobile-skills-radial">
          ${slotKeys.map((key, i) => {
            const isUlt = key === 'R' || key === 'T';
            return `
              <button class="mobile-skill-btn mobile-slot-${i} ${isUlt ? 'is-ultimate' : ''}" data-slot="${i}" aria-label="Skill ${key}">
                <div class="mobile-skill-sweep" data-sweep></div>
                <span class="mobile-skill-icon" data-icon>✨</span>
                <span class="mobile-skill-key" data-key>${key}</span>
                <span class="mobile-skill-name" data-name></span>
                <span class="mobile-skill-cd" data-cd></span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Secondary Utility Buttons (Blink Dash & Auto-Attack) -->
        <div class="mobile-sub-actions">
          <!-- Auto Battle Toggle Button -->
          <button class="mobile-auto-btn" id="m-btn-auto" aria-label="Auto Battle">
            <span class="mobile-auto-icon">⚔️</span>
            <span class="mobile-auto-text" id="m-auto-label">AUTO</span>
          </button>

          <!-- Flash Blink Dash Button -->
          <button class="mobile-dash-btn" id="m-btn-dash" aria-label="Blink Dash">
            <div class="mobile-dash-sweep" id="m-dash-sweep"></div>
            <span class="mobile-dash-icon">⚡</span>
            <span class="mobile-dash-text" id="m-dash-label">BLINK</span>
          </button>
        </div>

        <!-- Big Primary Attack / Cast Trigger Button -->
        <button class="mobile-cast-btn" id="m-btn-cast" aria-label="Attack / Cast">
          <div class="mobile-cast-pulse"></div>
          <span class="mobile-cast-icon">🎯</span>
          <span class="mobile-cast-text">ATTACK</span>
        </button>
      </div>
    `;

    this.dashBtn = this.root.querySelector('#m-btn-dash');
    this.dashSweep = this.root.querySelector('#m-dash-sweep');
    this.dashLabel = this.root.querySelector('#m-dash-label');
    this.castBtn = this.root.querySelector('#m-btn-cast');
    this.autoBtn = this.root.querySelector('#m-btn-auto');

    // Attach 4 slot buttons
    const slotElements = this.root.querySelectorAll('.mobile-skill-btn');
    slotElements.forEach((btn, i) => {
      const slotData = {
        index: i,
        key: slotKeys[i],
        btn,
        element: null,
        icon: btn.querySelector('[data-icon]'),
        name: btn.querySelector('[data-name]'),
        sweep: btn.querySelector('[data-sweep]'),
        cd: btn.querySelector('[data-cd]')
      };
      this.slots.push(slotData);

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (slotData.element) {
          // Instant Tap-to-Cast on Mobile
          this.onSelectAbility?.(slotData.element);
          this.setActiveSkill(slotData.element);
        } else {
          this.onLockedSkillTapped?.(slotData.key);
        }
      });
    });

    // Attach Dash button
    this.dashBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onDash?.();
    });

    // Attach Cast / Attack button
    this.castBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onCast?.();
    });

    // Attach Auto button
    if (this.autoBtn) {
      this.autoBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onToggleAuto?.();
      });
    }
  }

  setAutoBattleState(isActive) {
    if (this.autoBtn) {
      this.autoBtn.classList.toggle('is-active', isActive);
      const label = this.root.querySelector('#m-auto-label');
      if (label) label.textContent = isActive ? 'AUTO ON' : 'AUTO OFF';
    }
  }

  /**
   * Bind hero's 4 skills to the 4 physical slot buttons
   */
  setExclusiveSkills(allowedSkills = [], unlockedSet = new Set()) {
    this.skillMap.clear();

    for (let i = 0; i < 4; i++) {
      const slot = this.slots[i];
      const el = allowedSkills[i];

      if (!el) {
        // No fruit ability equipped: Show locked slot
        slot.btn.style.display = 'flex';
        slot.element = null;
        slot.btn.dataset.element = '';
        slot.btn.style.setProperty('--accent', '#64748b');
        if (slot.icon) slot.icon.textContent = '🔒';
        if (slot.name) slot.name.textContent = '열매필요';
        slot.btn.classList.add('is-locked');
        slot.btn.style.opacity = '0.4';
        slot.btn.style.filter = 'grayscale(1)';
        slot.btn.style.pointerEvents = 'auto';
        continue;
      }

      slot.btn.style.display = 'flex';
      slot.element = el;
      slot.btn.dataset.element = el;
      this.skillMap.set(el, slot);

      const meta = ELEMENT_META[el] || { key: slot.key, label: el, nameKo: el, accent: '#38bdf8' };
      slot.btn.style.setProperty('--accent', meta.accent || '#38bdf8');
      if (slot.icon) slot.icon.textContent = ELEMENT_SIGILS[el] ?? '✨';
      if (slot.name) slot.name.textContent = meta.nameKo || meta.label || '';

      const isUnlocked = unlockedSet.has(el);
      slot.btn.classList.toggle('is-locked', !isUnlocked);
      slot.btn.style.opacity = isUnlocked ? '1' : '0.4';
      slot.btn.style.filter = isUnlocked ? 'none' : 'grayscale(0.9)';
      slot.btn.style.pointerEvents = 'auto';
    }
  }

  setUnlockedSkills(unlockedSet) {
    for (const slot of this.slots) {
      if (!slot.element) continue;
      const isUnlocked = unlockedSet.has(slot.element);
      slot.btn.classList.toggle('is-locked', !isUnlocked);
      slot.btn.style.opacity = isUnlocked ? '1' : '0.3';
      slot.btn.style.filter = isUnlocked ? 'none' : 'grayscale(0.9)';
      slot.btn.style.pointerEvents = isUnlocked ? 'auto' : 'none';
    }
  }

  setActiveSkill(element) {
    for (const slot of this.slots) {
      slot.btn.classList.toggle('is-active', slot.element === element);
    }
  }

  setSkillCooldown(element, remaining, total) {
    const slot = this.skillMap.get(element);
    if (!slot) return;

    const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
    slot.btn.style.setProperty('--cooldown', ratio);
    slot.btn.classList.toggle('is-cooling', ratio > 0.001);

    if (slot.cd) {
      slot.cd.textContent = remaining > 0.1 ? `${remaining.toFixed(1)}s` : '';
    }
  }

  setDashCooldown(remaining, total) {
    if (!this.dashBtn) return;
    const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
    this.dashBtn.style.setProperty('--cooldown', ratio);
    this.dashBtn.classList.toggle('is-cooling', ratio > 0.001);

    if (this.dashLabel) {
      this.dashLabel.textContent = remaining > 0.1 ? `${remaining.toFixed(1)}s` : 'BLINK';
    }
  }

  setVisible(visible) {
    this.root.style.display = visible ? 'flex' : 'none';
  }

  dispose() {
    this.root.remove();
  }
}
