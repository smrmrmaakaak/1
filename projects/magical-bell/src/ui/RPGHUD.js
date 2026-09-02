import { HEROES_DATA } from '../characters/ProceduralHeroFactory.js';

/**
 * MMORPG Top Player Frame, Radar Minimap, Quest Tracker, and Quick Menu Bar.
 */
export class RPGHUD {
  constructor(parent = document.body, { playerData, questManager, onOpenInventory, onOpenStats, onInteractNPC, onOpenDevRoom }) {
    this.parent = parent;
    this.playerData = playerData;
    this.questManager = questManager;
    this.onOpenInventory = onOpenInventory;
    this.onOpenStats = onOpenStats;
    this.onInteractNPC = onInteractNPC;
    this.onOpenDevRoom = onOpenDevRoom;

    this.nearbyNPC = null;
    this._createDOM();
    this._bindEvents();
    this.updatePlayerStats();
  }

  _createDOM() {
    this.root = document.createElement('div');
    this.root.id = 'rpg-hud-root';
    this.root.className = 'rpg-hud-root';

    const hero = HEROES_DATA[this.playerData.heroId] || HEROES_DATA.adventurer || HEROES_DATA.arthur;

    this.root.innerHTML = `
      <!-- Top Left: MMORPG Player Frame -->
      <div class="rpg-player-frame">
        <div class="player-avatar-box" style="border-color: ${hero.color};">
          <span class="player-avatar-icon">${hero.icon}</span>
          <span class="player-level-badge" id="hud-player-level">Lv.1</span>
        </div>
        <div class="player-bars-wrap">
          <div class="player-info-row">
            <span class="player-name-text">${hero.name}</span>
            <span class="player-attr-badge" id="hud-player-attr" style="background: ${hero.color}26; color: ${hero.color}; border: 1px solid ${hero.color}; font-size: 10.5px; font-weight: 800; padding: 1px 6px; border-radius: 6px;">${hero.attributeName}</span>
            <span class="player-class-badge" id="hud-player-class" style="color: #cbd5e1; border-color: rgba(255,255,255,0.2);">${hero.title}</span>
            <span class="player-gold-tag">🪙 <b id="hud-player-gold">150</b>G</span>
          </div>
          <!-- HP Bar -->
          <div class="rpg-bar-track hp">
            <div class="rpg-bar-fill hp" id="hud-hp-fill" style="width: 100%;"></div>
            <span class="rpg-bar-text" id="hud-hp-text">800 / 800</span>
          </div>
          <!-- EXP Bar -->
          <div class="rpg-bar-track exp">
            <div class="rpg-bar-fill exp" id="hud-exp-fill" style="width: 0%;"></div>
            <span class="rpg-bar-text" id="hud-exp-text">EXP 0 / 100 (0%)</span>
          </div>
        </div>
      </div>

      <!-- Top Right: Radar Minimap -->
      <div class="rpg-minimap-frame">
        <div class="minimap-header">
          <span class="minimap-zone-title" id="hud-zone-name">성소 마을</span>
          <span class="minimap-coords" id="hud-coords">X: 0, Z: 0</span>
        </div>
        <div class="minimap-canvas-box">
          <canvas id="rpg-minimap-canvas" width="120" height="120"></canvas>
          <div class="minimap-player-center"></div>
        </div>
      </div>

      <!-- Right: Quest Tracker (Collapsible on Mobile) -->
      <div class="rpg-quest-tracker" id="rpg-quest-tracker">
        <div class="quest-tracker-header" id="btn-toggle-quest-tracker" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
          <span class="quest-tracker-title">📜 퀘스트</span>
          <span class="quest-tracker-toggle-icon" id="quest-tracker-chevron" style="font-size: 11px; color: #94a3b8; transition: transform 0.2s;">▼</span>
        </div>
        <div class="quest-tracker-content" id="quest-tracker-content">
          <!-- Populated dynamically -->
        </div>
      </div>

      <!-- Center Bottom: NPC Interaction Prompt -->
      <div class="rpg-interact-prompt" id="rpg-interact-prompt" style="display: none;">
        <button class="btn-interact-prompt" id="btn-interact-npc">
          💬 [E] 대화하기 — <span id="interact-npc-name">촌장 엘드린</span>
        </button>
      </div>

      <!-- Top-Left Below Profile: MMORPG Menu Buttons -->
      <div class="rpg-menu-buttons">
        <button class="rpg-menu-btn" id="btn-menu-dev" title="스킬 이펙트 연구실 (F1)" style="background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.6);">
          🛠️ <span>개발자방 [F1]</span>
        </button>
        <button class="rpg-menu-btn" id="btn-menu-inv" title="인벤토리 (I)">
          🎒 <span>가방 [I]</span>
        </button>
        <button class="rpg-menu-btn" id="btn-menu-stat" title="캐릭터 스탯 (U)">
          📊 <span>스탯 [U]</span>
        </button>
        <button class="rpg-menu-btn" id="btn-menu-chat" title="월드 채팅 열기/닫기" style="background: rgba(245, 158, 11, 0.2); border-color: rgba(245, 158, 11, 0.6); color: #ffd700;">
          💬 <span>채팅</span>
        </button>
        <div class="rpg-online-tag" style="background: rgba(10,20,35,0.85); border: 1px solid rgba(46,204,113,0.5); border-radius: 10px; padding: 3px 8px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 5px; color: #fff; pointer-events: auto;">
          <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#2ecc71; box-shadow:0 0 6px #2ecc71;"></span>
          <span>접속: <b id="online-count-num" style="color:#2ecc71;">1</b>명</span>
        </div>
      </div>

      <!-- Floating Zone Transition Banner -->
      <div class="rpg-zone-banner" id="rpg-zone-banner" style="display: none;">
        <h1 class="zone-banner-title" id="zone-banner-title">여명의 초원</h1>
        <p class="zone-banner-sub" id="zone-banner-sub">Lv.1~10 초보자 사냥터</p>
      </div>
    `;

    this.parent.appendChild(this.root);
    this.minimapCanvas = this.root.querySelector('#rpg-minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
  }

  _bindEvents() {
    this.root.querySelector('#btn-menu-dev')?.addEventListener('click', () => {
      this.onOpenDevRoom?.();
    });
    this.root.querySelector('#btn-menu-inv')?.addEventListener('click', () => {
      this.onOpenInventory?.();
    });
    this.root.querySelector('#btn-menu-stat')?.addEventListener('click', () => {
      this.onOpenStats?.();
    });
    this.root.querySelector('#btn-interact-npc')?.addEventListener('click', () => {
      if (this.nearbyNPC) {
        this.onInteractNPC?.(this.nearbyNPC);
      }
    });

    const questToggle = this.root.querySelector('#btn-toggle-quest-tracker');
    const questTracker = this.root.querySelector('#rpg-quest-tracker');
    const questChevron = this.root.querySelector('#quest-tracker-chevron');
    questToggle?.addEventListener('click', () => {
      questTracker?.classList.toggle('is-collapsed');
      const isCol = questTracker?.classList.contains('is-collapsed');
      if (questChevron) questChevron.textContent = isCol ? '▶' : '▼';
    });

    // Keyboard Shortcuts (I for Inventory, U for Stats, E for Interact when near NPC)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'i' || e.key === 'I') this.onOpenInventory?.();
      if (e.key === 'u' || e.key === 'U') this.onOpenStats?.();
      if (e.key === 'e' || e.key === 'E') {
        if (this.nearbyNPC) this.onInteractNPC?.(this.nearbyNPC);
      }
    });
  }

  updatePlayerStats(currentHp = this.playerData.hp) {
    const p = this.playerData;
    const hero = HEROES_DATA[p.heroId] || HEROES_DATA.adventurer || HEROES_DATA.arthur;
    const stats = p.getEffectiveStats();
    const effectiveMaxHp = stats.maxHp;

    const levelEl = this.root.querySelector('#hud-player-level');
    if (levelEl) levelEl.textContent = `Lv.${p.level}`;

    const iconEl = this.root.querySelector('.player-avatar-icon');
    const avatarBox = this.root.querySelector('.player-avatar-box');
    const classBadge = this.root.querySelector('.player-class-badge');
    const attrBadge = this.root.querySelector('#hud-player-attr');

    if (iconEl) iconEl.textContent = hero.icon;
    if (avatarBox) avatarBox.style.borderColor = hero.color;
    if (attrBadge) {
      attrBadge.textContent = hero.attributeName;
      attrBadge.style.color = hero.color;
      attrBadge.style.borderColor = hero.color;
      attrBadge.style.background = `${hero.color}26`;
    }
    if (classBadge) {
      classBadge.textContent = hero.title;
      classBadge.style.color = '#cbd5e1';
    }

    const goldEl = this.root.querySelector('#hud-player-gold');
    if (goldEl) goldEl.textContent = p.gold.toLocaleString();

    const hpFill = this.root.querySelector('#hud-hp-fill');
    const hpText = this.root.querySelector('#hud-hp-text');
    if (hpFill && hpText) {
      const pct = Math.max(0, Math.min(100, (currentHp / effectiveMaxHp) * 100));
      hpFill.style.width = `${pct}%`;
      hpText.textContent = `${Math.ceil(currentHp)} / ${effectiveMaxHp}`;
    }

    const expFill = this.root.querySelector('#hud-exp-fill');
    const expText = this.root.querySelector('#hud-exp-text');
    if (expFill && expText) {
      const expPct = Math.max(0, Math.min(100, (p.exp / p.maxExp) * 100));
      expFill.style.width = `${expPct}%`;
      expText.textContent = `EXP ${p.exp} / ${p.maxExp} (${expPct.toFixed(1)}%)`;
    }

    this.updateQuestTracker();
  }

  updateQuestTracker() {
    const q = this.questManager.getActiveQuest();
    const container = this.root.querySelector('#quest-tracker-content');
    if (!container) return;

    if (!q) {
      container.innerHTML = `
        <div class="quest-item-box completed">
          <div class="quest-name">🎉 모든 퀘스트 완료!</div>
          <div class="quest-goal">성소의 영웅으로서 자유롭게 모험하세요.</div>
        </div>
      `;
      return;
    }

    const isReadyToClaim = q.isCompleted && !q.isClaimed;
    container.innerHTML = `
      <div class="quest-item-box ${isReadyToClaim ? 'ready' : ''}">
        <div class="quest-name">${q.title}</div>
        <div class="quest-goal">
          ${q.type === 'hunt' ? `⚔️ ${q.desc} (${q.currentCount}/${q.targetCount})` : `💬 ${q.desc}`}
        </div>
        ${isReadyToClaim ? `
          <button class="btn-claim-quest" id="btn-quick-claim" data-quest-id="${q.id}">
            🎁 보상 받기 (+${q.rewardExp} EXP)
          </button>
        ` : ''}
      </div>
    `;

    const btnClaim = container.querySelector('#btn-quick-claim');
    if (btnClaim) {
      btnClaim.addEventListener('click', (e) => {
        e.stopPropagation();
        this.questManager.claimReward(q.id);
        this.updatePlayerStats();
      });
    }
  }

  setNearbyNPC(npc) {
    this.nearbyNPC = npc;
    const prompt = this.root.querySelector('#rpg-interact-prompt');
    const nameEl = this.root.querySelector('#interact-npc-name');
    if (!prompt || !nameEl) return;

    if (npc) {
      nameEl.textContent = `${npc.name} (${npc.title})`;
      prompt.style.display = 'block';
    } else {
      prompt.style.display = 'none';
    }
  }

  showZoneBanner(zone) {
    const banner = this.root.querySelector('#rpg-zone-banner');
    const title = this.root.querySelector('#zone-banner-title');
    const sub = this.root.querySelector('#zone-banner-sub');
    const zoneHeader = this.root.querySelector('#hud-zone-name');

    if (zoneHeader) zoneHeader.textContent = zone.name.split(' (')[0];

    if (banner && title && sub) {
      title.textContent = zone.name;
      title.style.color = zone.color;
      sub.textContent = zone.sub;
      banner.style.display = 'block';
      banner.classList.remove('fade-out');
      
      if (this._bannerTimer) clearTimeout(this._bannerTimer);
      this._bannerTimer = setTimeout(() => {
        banner.style.display = 'none';
      }, 3500);
    }
  }

  updateMinimap(playerPos, enemies = [], npcs = []) {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const size = 120;
    const center = size / 2;
    const scale = 1.8; // 1 unit in 3D = 1.8 pixels on minimap

    ctx.clearRect(0, 0, size, size);

    // Background circle
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Village Safe Zone Ring
    const villageRelX = center - playerPos.x * scale;
    const villageRelZ = center - playerPos.z * scale;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.arc(villageRelX, villageRelZ, 11 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Draw NPCs (Yellow dots)
    for (const npc of npcs) {
      const nx = center + (npc.position.x - playerPos.x) * scale;
      const nz = center + (npc.position.z - playerPos.z) * scale;
      if (Math.hypot(nx - center, nz - center) < center - 4) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(nx, nz, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Enemies (Red dots / Purple Boss)
    for (const enemy of enemies) {
      if (enemy.isDead || !enemy.group?.visible) continue;
      const ex = center + (enemy.position.x - playerPos.x) * scale;
      const ez = center + (enemy.position.z - playerPos.z) * scale;
      if (Math.hypot(ex - center, ez - center) < center - 4) {
        ctx.fillStyle = enemy.type === 'boss' ? '#e879f9' : '#ef4444';
        ctx.beginPath();
        ctx.arc(ex, ez, enemy.type === 'boss' ? 5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Update Coordinates Text
    const coordsEl = this.root.querySelector('#hud-coords');
    if (coordsEl) {
      coordsEl.textContent = `X: ${Math.round(playerPos.x)}, Z: ${Math.round(playerPos.z)}`;
    }
  }

  showLevelUpBanner(newLevel) {
    const banner = this.root.querySelector('#rpg-zone-banner');
    const title = this.root.querySelector('#zone-banner-title');
    const sub = this.root.querySelector('#zone-banner-sub');
    if (banner && title && sub) {
      title.textContent = `🌟 LEVEL UP! Lv.${newLevel}`;
      title.style.color = '#ffd700';
      sub.textContent = '스탯 포인트 +3 획득! [C] 키를 눌러 스탯을 강화하세요.';
      banner.style.display = 'block';
      if (this._bannerTimer) clearTimeout(this._bannerTimer);
      this._bannerTimer = setTimeout(() => {
        banner.style.display = 'none';
      }, 4000);
    }
  }
}
