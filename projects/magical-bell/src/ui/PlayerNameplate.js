import { Vector3 } from 'three';
import { HEROES_DATA } from '../characters/ProceduralHeroFactory.js';

/**
 * 3D Projected Player Nameplate & Title floating directly above the player character's head.
 */
export class PlayerNameplate {
  constructor(parent = document.body) {
    this.parent = parent;
    this._pos3D = new Vector3();
    this.playerName = '황태민';
    this.heroId = 'adventurer';
    this.level = 1;
    this.visible = true;

    this._createDOM();
  }

  _createDOM() {
    this.root = document.createElement('div');
    this.root.id = 'player-3d-nameplate';
    this.root.className = 'player-3d-nameplate';
    this.root.innerHTML = `
      <div class="nameplate-inner">
        <div class="nameplate-title-row">
          <span class="nameplate-lvl" id="np-lvl">Lv.1</span>
          <span class="nameplate-name" id="np-name">황태민</span>
        </div>
        <div class="nameplate-class-title" id="np-class" style="color: #94a3b8;">[⚔️ 물리 평타 · 신입 모험가]</div>
        <div class="nameplate-hp-bar">
          <div class="nameplate-hp-fill" id="np-hp-fill" style="width: 100%;"></div>
        </div>
      </div>
    `;
    this.parent.appendChild(this.root);
  }

  setPlayerInfo(name, heroId, level = 1) {
    this.playerName = name || '황태민';
    this.heroId = heroId || 'adventurer';
    this.level = level;

    const hero = HEROES_DATA[this.heroId] || HEROES_DATA.adventurer || HEROES_DATA.arthur;
    const nameEl = this.root.querySelector('#np-name');
    const classEl = this.root.querySelector('#np-class');
    const lvlEl = this.root.querySelector('#np-lvl');

    if (nameEl) nameEl.textContent = this.playerName;
    if (classEl) {
      classEl.textContent = `[${hero.attributeName} · ${hero.title}]`;
      classEl.style.color = hero.color;
    }
    if (lvlEl) lvlEl.textContent = `Lv.${this.level}`;
  }

  updateHp(currentHp, maxHp) {
    const fill = this.root.querySelector('#np-hp-fill');
    if (fill) {
      const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
      fill.style.width = `${pct}%`;
    }
  }

  update(playerPos, camera, isSelectingHero = false) {
    if (isSelectingHero || !this.visible) {
      this.root.style.display = 'none';
      return;
    }

    this._pos3D.set(playerPos.x, playerPos.y + 2.25, playerPos.z);
    this._pos3D.project(camera);

    // Behind camera check
    if (this._pos3D.z > 1.0) {
      this.root.style.display = 'none';
      return;
    }

    const x = Math.round((this._pos3D.x * 0.5 + 0.5) * window.innerWidth);
    const y = Math.round((-this._pos3D.y * 0.5 + 0.5) * window.innerHeight);

    this.root.style.display = 'block';
    this.root.style.transform = `translate3d(${x}px, ${y}px, 0px) translate(-50%, -100%)`;
  }

  dispose() {
    this.root.remove();
  }
}
