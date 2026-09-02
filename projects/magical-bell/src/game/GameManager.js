/**
 * Game State, Player Stats & Wave Shop Manager for Elemental Sandbox Defense Mode
 */
export class GameManager {
  constructor({ scene, camera, shake, flash, hud, floatingText, particles }) {
    this.scene = scene;
    this.camera = camera;
    this.shake = shake;
    this.flash = flash;
    this.hud = hud;
    this.floatingText = floatingText;
    this.particles = particles;

    this.baseMaxHp = 1000;
    this.maxHp = 1000;
    this.hp = 1000;
    this.gold = 0;
    this.state = 'playing'; // 'playing', 'shop', 'gameover'
    this.score = 0;
    this.kills = 0;
    this.wave = 1;

    // Upgrades state
    this.upgrades = {
      damageLevel: 0,
      areaLevel: 0,
      cooldownLevel: 0,
      speedLevel: 0,
      maxHpLevel: 0,
      blizzardMastery: false
    };

    this.onGameOver = null;
    this.onRestart = null;
    this.onNextWaveCallback = null;

    this._createGameOverlay();
    this._bindKeys();
  }

  // Stat Getters
  get damageMultiplier() {
    return 1.0 + this.upgrades.damageLevel * 0.25;
  }

  get areaMultiplier() {
    return 1.0 + this.upgrades.areaLevel * 0.25;
  }

  get cooldownMultiplier() {
    return Math.max(0.5, 1.0 - this.upgrades.cooldownLevel * 0.15);
  }

  get speedMultiplier() {
    return 1.0 + this.upgrades.speedLevel * 0.15;
  }

  _bindKeys() {
    window.addEventListener('keydown', (e) => {
      if (this.state === 'shop' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        this.closeShopAndNextWave();
      }
    });
  }

  _createGameOverlay() {
    let overlay = document.getElementById('game-defense-ui');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'game-defense-ui';
      overlay.className = 'game-defense-ui';
      overlay.innerHTML = `
        <div class="game-top-bar">
          <div class="game-badge wave-badge">
            <span class="badge-label">WAVE</span>
            <span class="badge-value" id="game-wave-val">1</span>
          </div>
          <div class="game-badge gold-badge">
            <span class="badge-label">🪙 GOLD</span>
            <span class="badge-value" id="game-gold-val">0</span>
          </div>
          <div class="game-badge score-badge">
            <span class="badge-label">SCORE</span>
            <span class="badge-value" id="game-score-val">0</span>
          </div>
          <div class="game-badge kills-badge">
            <span class="badge-label">KILLS</span>
            <span class="badge-value" id="game-kills-val">0</span>
          </div>
          <button class="game-badge hero-badge" id="game-btn-hero-select" title="영웅 선택 창 열기">
            <span class="badge-label">HERO</span>
            <span class="badge-value" id="game-hero-val">👑 변경</span>
          </button>
          <button class="game-badge auto-badge is-active" id="game-btn-auto-toggle" title="자동 전투 토글 (단축키: T)">
            <span class="badge-label">BATTLE (T)</span>
            <span class="badge-value" id="game-auto-val">🤖 AUTO</span>
          </button>
        </div>

        <div class="game-player-hp-bar">
          <div class="hp-info">
            <span class="hp-title">🛡️ SANCTUARY HP</span>
            <span class="hp-num" id="game-hp-text">1000 / 1000</span>
          </div>
          <div class="hp-track">
            <div class="hp-fill" id="game-hp-fill" style="width: 100%;"></div>
          </div>
        </div>

        <div class="game-wave-banner" id="game-wave-banner">
          <h2 id="wave-banner-title">WAVE 1</h2>
          <p id="wave-banner-desc">DEFEND THE SANCTUARY!</p>
        </div>

        <!-- Wave Cleared & Upgrade Shop Modal -->
        <div class="game-modal" id="game-shop-modal" style="display: none;">
          <div class="game-modal-content shop-content">
            <div class="shop-header">
              <div class="shop-title-wrap">
                <h1 class="shop-title">✨ SANCTUARY SANCTUM</h1>
                <p class="shop-subtitle">웨이브 클리어! 골드로 스킬과 성소를 강화하세요.</p>
              </div>
              <div class="shop-header-right">
                <div class="shop-gold-badge">
                  <span class="label">보유 골드</span>
                  <span class="val" id="shop-current-gold">🪙 0</span>
                </div>
                <button class="shop-header-close-btn" id="btn-shop-close-header" title="상점 닫고 다음 웨이브 시작">
                  ▶ START
                </button>
              </div>
            </div>

            <div class="shop-grid" id="shop-items-grid">
              <!-- Dynamically populated -->
            </div>

            <div class="shop-footer">
              <button class="game-btn-next-wave" id="btn-next-wave">
                ▶ NEXT WAVE START <span class="shortcut">(Space / Enter)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Game Over Modal -->
        <div class="game-modal" id="game-over-modal" style="display: none;">
          <div class="game-modal-content">
            <h1 class="game-over-title">💀 SANCTUARY FALLEN</h1>
            <p class="game-over-sub">보이드 몬스터의 침공으로 성소가 파괴되었습니다!</p>
            <div class="game-over-stats">
              <div>Waves Survived: <b id="final-wave">1</b></div>
              <div>Monsters Slain: <b id="final-kills">0</b></div>
              <div>Final Score: <b id="final-score">0</b></div>
            </div>
            <button class="game-btn-restart" id="btn-game-restart">🔄 PLAY AGAIN</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const btnRestart = document.getElementById('btn-game-restart');
      if (btnRestart) {
        btnRestart.addEventListener('click', () => {
          this.restart();
        });
      }

      const btnNextWave = document.getElementById('btn-next-wave');
      if (btnNextWave) {
        btnNextWave.addEventListener('click', () => {
          this.closeShopAndNextWave();
        });
      }

      const btnCloseHeader = document.getElementById('btn-shop-close-header');
      if (btnCloseHeader) {
        btnCloseHeader.addEventListener('click', () => {
          this.closeShopAndNextWave();
        });
      }
      const btnAutoToggle = document.getElementById('game-btn-auto-toggle');
      if (btnAutoToggle) {
        btnAutoToggle.addEventListener('click', () => {
          this.onToggleAuto?.();
        });
      }

      const btnHeroSelect = document.getElementById('game-btn-hero-select');
      if (btnHeroSelect) {
        btnHeroSelect.addEventListener('click', () => {
          window.app?.openHeroSelection();
        });
      }
    }

    this.dom = {
      waveVal: document.getElementById('game-wave-val'),
      goldVal: document.getElementById('game-gold-val'),
      scoreVal: document.getElementById('game-score-val'),
      killsVal: document.getElementById('game-kills-val'),
      autoBtn: document.getElementById('game-btn-auto-toggle'),
      autoVal: document.getElementById('game-auto-val'),
      hpText: document.getElementById('game-hp-text'),
      hpFill: document.getElementById('game-hp-fill'),
      banner: document.getElementById('game-wave-banner'),
      bannerTitle: document.getElementById('wave-banner-title'),
      bannerDesc: document.getElementById('wave-banner-desc'),
      shopModal: document.getElementById('game-shop-modal'),
      shopGrid: document.getElementById('shop-items-grid'),
      shopGold: document.getElementById('shop-current-gold'),
      gameOverModal: document.getElementById('game-over-modal'),
      finalWave: document.getElementById('final-wave'),
      finalKills: document.getElementById('final-kills'),
      finalScore: document.getElementById('final-score')
    };
  }

  setAutoCast(enabled) {
    if (this.dom.autoVal) {
      this.dom.autoVal.textContent = enabled ? '🤖 AUTO' : '✋ MANUAL';
    }
    if (this.dom.autoBtn) {
      this.dom.autoBtn.classList.toggle('is-active', enabled);
    }
  }

  addGold(amount) {
    this.gold += amount;
    if (this.dom.goldVal) this.dom.goldVal.textContent = this.gold.toLocaleString();
    if (this.dom.shopGold) this.dom.shopGold.textContent = `🪙 ${this.gold.toLocaleString()}`;
  }

  showWaveBanner(title, desc) {
    if (!this.dom.banner) return;
    this.dom.bannerTitle.textContent = title;
    this.dom.bannerDesc.textContent = desc;
    this.dom.banner.classList.remove('is-active');
    void this.dom.banner.offsetWidth; // trigger reflow
    this.dom.banner.classList.add('is-active');
  }

  damagePlayer(amount) {
    if (this.state !== 'playing') return;

    this.hp = Math.max(0, this.hp - amount);
    this.shake?.add(0.3, 1.5, 20);
    this.updateHpUI();

    if (this.hp <= 0) {
      this.gameOver();
    }
  }

  healPlayer(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.updateHpUI();
  }

  updateHpUI() {
    if (!this.dom.hpFill) return;
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.dom.hpFill.style.width = `${(ratio * 100).toFixed(1)}%`;
    this.dom.hpText.textContent = `${Math.ceil(this.hp)} / ${this.maxHp}`;

    if (ratio > 0.5) {
      this.dom.hpFill.style.background = 'linear-gradient(90deg, #00ff88, #00d2ff)';
    } else if (ratio > 0.25) {
      this.dom.hpFill.style.background = 'linear-gradient(90deg, #ffbb00, #ff8800)';
    } else {
      this.dom.hpFill.style.background = 'linear-gradient(90deg, #ff2244, #ff0055)';
    }
  }

  updateStats(wave, score, kills) {
    this.wave = wave;
    this.score = score;
    this.kills = kills;

    if (this.dom.waveVal) this.dom.waveVal.textContent = wave;
    if (this.dom.goldVal) this.dom.goldVal.textContent = this.gold.toLocaleString();
    if (this.dom.scoreVal) this.dom.scoreVal.textContent = score.toLocaleString();
    if (this.dom.killsVal) this.dom.killsVal.textContent = kills;
  }

  /* ------------------------------------------------------------------ */
  /* Wave Shop & Upgrades System                                         */
  /* ------------------------------------------------------------------ */

  openShop(wave, onNextWave) {
    this.state = 'shop';
    this.wave = wave;
    this.onNextWaveCallback = onNextWave;

    // Hide joysticks and mobile pads so touch isn't intercepted
    window.app?.joystick?.setVisible(false);
    window.app?.mobileControls?.setVisible(false);

    // Bonus gold for clearing wave
    const waveBonus = wave * 30;
    this.addGold(waveBonus);
    this.hud.showToast(`🎉 WAVE ${wave} CLEAR! +${waveBonus}🪙 BONUS GOLD`);

    this._renderShopItems();
    if (this.dom.shopModal) {
      this.dom.shopModal.classList.add('is-open');
      this.dom.shopModal.style.display = 'flex';
    }
  }

  _renderShopItems() {
    if (!this.dom.shopGrid) return;
    if (this.dom.shopGold) this.dom.shopGold.textContent = `🪙 ${this.gold.toLocaleString()}`;

    const items = [
      {
        id: 'repair',
        icon: '💖',
        name: '성소 긴급 수리 (Repair)',
        desc: '손상된 성소 체력을 +350 회복합니다.',
        cost: 30,
        canBuy: this.hp < this.maxHp && this.gold >= 30,
        levelText: `${Math.ceil(this.hp)} / ${this.maxHp} HP`,
        action: () => {
          this.gold -= 30;
          this.healPlayer(350);
          this.hud.showToast('💖 성소 HP가 +350 회복되었습니다!');
        }
      },
      {
        id: 'maxhp',
        icon: '🛡️',
        name: '성소 최대 내구도 증축 (Max HP)',
        desc: '최대 체력 +250 증가 및 전체 체력 완전 회복.',
        cost: 60 + this.upgrades.maxHpLevel * 40,
        canBuy: this.gold >= 60 + this.upgrades.maxHpLevel * 40,
        levelText: `Lv.${this.upgrades.maxHpLevel} (최대 ${this.maxHp})`,
        action: () => {
          const cost = 60 + this.upgrades.maxHpLevel * 40;
          this.gold -= cost;
          this.upgrades.maxHpLevel++;
          this.maxHp += 250;
          this.hp = this.maxHp;
          this.updateHpUI();
          this.hud.showToast(`🛡️ 최대 체력이 ${this.maxHp}로 증가했습니다!`);
        }
      },
      {
        id: 'damage',
        icon: '⚔️',
        name: '주문 공격력 강화 (Spell Power)',
        desc: '모든 마법 스킬의 데미지 +25% 증가.',
        cost: 45 + this.upgrades.damageLevel * 30,
        canBuy: this.gold >= 45 + this.upgrades.damageLevel * 30,
        levelText: `Lv.${this.upgrades.damageLevel} (+${this.upgrades.damageLevel * 25}% DMG)`,
        action: () => {
          const cost = 45 + this.upgrades.damageLevel * 30;
          this.gold -= cost;
          this.upgrades.damageLevel++;
          this.hud.showToast(`⚔️ 주문력 Lv.${this.upgrades.damageLevel} 달성 (+${this.upgrades.damageLevel * 25}%)`);
        }
      },
      {
        id: 'area',
        icon: '🌐',
        name: '마법 영향 반경 확장 (AoE Radius)',
        desc: '눈보라, 메테오, 서리 왕관, 전격 함정 범위 +25% 증가.',
        cost: 50 + this.upgrades.areaLevel * 35,
        canBuy: this.gold >= 50 + this.upgrades.areaLevel * 35,
        levelText: `Lv.${this.upgrades.areaLevel} (+${this.upgrades.areaLevel * 25}% 범위)`,
        action: () => {
          const cost = 50 + this.upgrades.areaLevel * 35;
          this.gold -= cost;
          this.upgrades.areaLevel++;
          this.hud.showToast(`🌐 마법 범위 Lv.${this.upgrades.areaLevel} 달성 (+${this.upgrades.areaLevel * 25}%)`);
        }
      },
      {
        id: 'cooldown',
        icon: '⏱️',
        name: '원소 주문 가속 (Cooldown Haste)',
        desc: '모든 스킬의 쿨타임 -15% 감소 (최대 3레벨).',
        cost: 60 + this.upgrades.cooldownLevel * 40,
        canBuy: this.upgrades.cooldownLevel < 3 && this.gold >= 60 + this.upgrades.cooldownLevel * 40,
        levelText: this.upgrades.cooldownLevel >= 3 ? 'MAX' : `Lv.${this.upgrades.cooldownLevel} (-${this.upgrades.cooldownLevel * 15}%)`,
        action: () => {
          const cost = 60 + this.upgrades.cooldownLevel * 40;
          this.gold -= cost;
          this.upgrades.cooldownLevel++;
          this.hud.showToast(`⏱️ 주문 가속 Lv.${this.upgrades.cooldownLevel} 달성 (-${this.upgrades.cooldownLevel * 15}%)`);
        }
      },
      {
        id: 'speed',
        icon: '🏃',
        name: '신속의 발걸음 (Swift Steps)',
        desc: '플레이어 걷기 및 무빙 속도 +15% 증가.',
        cost: 40 + this.upgrades.speedLevel * 25,
        canBuy: this.gold >= 40 + this.upgrades.speedLevel * 25,
        levelText: `Lv.${this.upgrades.speedLevel} (+${this.upgrades.speedLevel * 15}% 이속)`,
        action: () => {
          const cost = 40 + this.upgrades.speedLevel * 25;
          this.gold -= cost;
          this.upgrades.speedLevel++;
          this.hud.showToast(`🏃 신속의 발걸음 Lv.${this.upgrades.speedLevel} 달성!`);
        }
      },
      {
        id: 'blizzardMastery',
        icon: '❄️',
        name: '절대영도 눈보라 진화 (Blizzard Mastery)',
        desc: '눈보라 지속시간 +1.5초 & 블랙홀 흡입력 1.5배 강화.',
        cost: 120,
        canBuy: !this.upgrades.blizzardMastery && this.gold >= 120,
        levelText: this.upgrades.blizzardMastery ? 'EVOLVED' : '미보유',
        action: () => {
          this.gold -= 120;
          this.upgrades.blizzardMastery = true;
          this.hud.showToast('❄️ 절대영도 눈보라 마스터리 획득!');
        }
      }
    ];

    // Add elemental skill acquisition cards for locked skills
    const allSkills = [
      { id: 'ice', icon: '❄️', name: 'Frost Lance 습득', cost: 70, desc: '관통 얼음 창 스킬을 해금합니다.' },
      { id: 'thunder', icon: '⚡', name: 'Storm Lance 습득', cost: 70, desc: '연쇄 전격 창 스킬을 해금합니다.' },
      { id: 'meteor', icon: '🔥', name: 'Cinder Fall 습득', cost: 85, desc: '광역 지옥불 메테오 스킬을 해금합니다.' },
      { id: 'beam', icon: '🌟', name: 'Nova Beam 습득', cost: 85, desc: '단일 집중 에테르 레이저를 해금합니다.' },
      { id: 'snare', icon: '🌀', name: 'Voltaic Snare 습득', cost: 75, desc: '전격 감전 기절 함정을 해금합니다.' },
      { id: 'glacier', icon: '🧊', name: 'Glacial Crown 습득', cost: 80, desc: '서리 왕관 결빙 장판을 해금합니다.' },
      { id: 'blizzard', icon: '🌪️', name: 'Blizzard Storm 습득', cost: 95, desc: '눈보라 소용돌이 블랙홀을 해금합니다.' }
    ];

    const unlocked = window.app?.unlockedSkills || new Set(['ice']);
    for (const sk of allSkills) {
      if (!unlocked.has(sk.id)) {
        items.push({
          id: `unlock_${sk.id}`,
          icon: sk.icon,
          name: `✨ ${sk.name}`,
          desc: sk.desc,
          cost: sk.cost,
          canBuy: this.gold >= sk.cost,
          levelText: '신규 스킬 해금',
          action: () => {
            this.gold -= sk.cost;
            window.app.unlockedSkills.add(sk.id);
            window.app.hud.setUnlockedSkills(window.app.unlockedSkills);
            window.app.mobileControls.setUnlockedSkills(window.app.unlockedSkills);
            this.hud.showToast(`🎉 [${sk.name}] 스킬을 습득했습니다!`);
          }
        });
      }
    }

    this.dom.shopGrid.innerHTML = items.map((it) => `
      <div class="shop-card ${it.canBuy ? '' : 'is-disabled'}">
        <div class="shop-card-top">
          <div class="shop-card-icon">${it.icon}</div>
          <div class="shop-card-level">${it.levelText}</div>
        </div>
        <div class="shop-card-name">${it.name}</div>
        <div class="shop-card-desc">${it.desc}</div>
        <button class="shop-card-buy-btn" data-id="${it.id}" ${it.canBuy ? '' : 'disabled'}>
          🪙 ${it.cost} G 구매
        </button>
      </div>
    `).join('');

    // Attach button listeners
    for (const btn of this.dom.shopGrid.querySelectorAll('.shop-card-buy-btn')) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = items.find((i) => i.id === id);
        if (item && item.canBuy) {
          item.action();
          this._renderShopItems();
          this.updateStats(this.wave, this.score, this.kills);
        }
      });
    }
  }

  closeShopAndNextWave() {
    if (this.dom.shopModal) {
      this.dom.shopModal.classList.remove('is-open');
      this.dom.shopModal.style.display = 'none';
    }
    this.state = 'playing';

    // Re-enable joysticks and mobile pads
    window.app?.joystick?.setVisible(true);
    window.app?.mobileControls?.setVisible(true);

    const nextWave = this.wave + 1;
    this.showWaveBanner(`WAVE ${nextWave}`, 'DEFEND THE SANCTUARY!');
    this.onNextWaveCallback?.(nextWave);
  }

  gameOver() {
    this.state = 'gameover';
    if (this.dom.gameOverModal) {
      this.dom.finalWave.textContent = this.wave;
      this.dom.finalKills.textContent = this.kills;
      this.dom.finalScore.textContent = this.score.toLocaleString();
      this.dom.gameOverModal.classList.add('is-open');
      this.dom.gameOverModal.style.display = 'flex';
    }
    if (this.dom.shopModal) {
      this.dom.shopModal.classList.remove('is-open');
      this.dom.shopModal.style.display = 'none';
    }
    this.onGameOver?.();
  }

  restart() {
    this.maxHp = this.baseMaxHp;
    this.hp = this.maxHp;
    this.gold = 0;
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.state = 'playing';

    this.upgrades = {
      damageLevel: 0,
      areaLevel: 0,
      cooldownLevel: 0,
      speedLevel: 0,
      maxHpLevel: 0,
      blizzardMastery: false
    };

    if (this.dom.gameOverModal) {
      this.dom.gameOverModal.classList.remove('is-open');
      this.dom.gameOverModal.style.display = 'none';
    }
    if (this.dom.shopModal) {
      this.dom.shopModal.classList.remove('is-open');
      this.dom.shopModal.style.display = 'none';
    }

    this.updateHpUI();
    this.updateStats(1, 0, 0);
    this.showWaveBanner('WAVE 1', 'DEFEND THE SANCTUARY!');
    this.onRestart?.();
  }

  dispose() {
    const overlay = document.getElementById('game-defense-ui');
    if (overlay) overlay.remove();
  }
}
