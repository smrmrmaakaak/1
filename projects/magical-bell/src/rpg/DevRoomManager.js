import {
  Group,
  Mesh,
  GridHelper,
  MeshStandardMaterial,
  CylinderGeometry,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  Vector3
} from 'three';
import { settings, ELEMENTS } from '../config/settings.js';
import { ENEMY_TYPES } from '../game/EnemyManager.js';

/**
 * DevRoomManager - Real-time In-Game VFX Testing Sandbox
 * - Dedicated clean test arena with 5 training dummies
 * - Real monster spawner (Minion, Brute, Pyro, Boss)
 * - Auto-attack completely disabled in Dev Room
 * - Infinite Cooldown & Slow-Mo Speed sliders
 */
export class DevRoomManager {
  constructor(app) {
    this.app = app;
    this.isInDevRoom = false;
    this.infiniteCooldown = true;
    this.slowMoScale = 1.0;

    this.savedPlayerPos = new Vector3();
    this.savedCameraDistance = 18;

    this.group = new Group();
    this.group.name = 'DevRoom_World';
    this.group.visible = false;
    this.app.scene.add(this.group);

    this.dummies = [];
    this._buildDevArena();
    this._buildDevUI();
  }

  _buildDevArena() {
    // 1. Dark High-Tech Clean Floor Plane
    const floorMat = new MeshStandardMaterial({
      color: 0x05070d,
      roughness: 0.15,
      metalness: 0.85
    });
    const floor = new Mesh(new PlaneGeometry(120, 120), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.group.add(floor);

    // 2. Glowing Cyan / Orange Matrix Grids
    const grid1 = new GridHelper(100, 50, 0x38bdf8, 0x1e293b);
    grid1.position.y = 0.06;
    const grid2 = new GridHelper(40, 20, 0xff3300, 0x334155);
    grid2.position.y = 0.07;
    this.group.add(grid1, grid2);

    // 3. 5 Target Training Dummies (Lined up at 6m, 12m, 18m, 24m, 32m)
    const dummyMat = new MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.3 });
    const dummyHeadMat = new MeshStandardMaterial({ color: 0xff4400, roughness: 0.3 });
    const distances = [6, 12, 18, 24, 32];

    distances.forEach((dist, idx) => {
      const dGroup = new Group();
      dGroup.position.set((idx - 2) * 4.5, 0, -dist);

      const base = new Mesh(new CylinderGeometry(0.8, 1.0, 0.4, 16), dummyMat);
      base.position.y = 0.2;
      const pole = new Mesh(new CylinderGeometry(0.18, 0.18, 2.2, 12), dummyMat);
      pole.position.y = 1.3;
      const cross = new Mesh(new BoxGeometry(1.8, 0.35, 0.35), dummyMat);
      cross.position.y = 1.8;
      const head = new Mesh(new SphereGeometry(0.4, 16, 16), dummyHeadMat);
      head.position.y = 2.4;

      dGroup.add(base, pole, cross, head);
      dGroup.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      this.group.add(dGroup);

      // Dummy state (Compatible with Enemy target interface)
      const dummyObj = {
        id: `dummy_${idx}`,
        name: `훈련용 허수아비 ${idx + 1} (${dist}m)`,
        position: dGroup.position,
        mesh: dGroup,
        hp: 9999999,
        maxHp: 9999999,
        alive: true,
        isDead: false,
        isSinking: false,
        takeDamage: (dmg, isCrit, opts = {}) => {
          // Trigger impact reaction only if not sinking in black hole
          if (!dummyObj.isSinking && !opts.isSinking) {
            dGroup.position.y = 0.4;
            setTimeout(() => { if (!dummyObj.isSinking) dGroup.position.y = 0; }, 120);
          }
          this.app.floatingText?.spawn(`${dmg} 💥 CRIT!`, dGroup.position, {
            color: isCrit ? '#ff0033' : '#ffaa00',
            size: isCrit ? 28 : 22,
            isCrit: true
          });
        }
      };

      this.dummies.push(dummyObj);
    });
  }

  _buildDevUI() {
    const container = document.createElement('div');
    container.id = 'dev-room-ui';
    container.style.cssText = `
      position: fixed;
      top: 14px;
      left: 14px;
      z-index: 99999;
      display: none;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(56, 189, 248, 0.5);
      border-radius: 14px;
      padding: 12px 14px;
      color: #f8fafc;
      font-family: system-ui, sans-serif;
      box-shadow: 0 12px 30px rgba(0,0,0,0.7);
      width: min(300px, 88vw);
      max-height: 82vh;
      overflow-y: auto;
      touch-action: pan-y;
    `;

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-weight: 800; font-size: 14px; color: #38bdf8;">🛠️ DEV SANDBOX</span>
        <div style="display: flex; gap: 6px;">
          <button id="btn-dev-toggle-fold" style="background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #38bdf8; padding: 2px 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 700;">➖</button>
          <button id="btn-dev-exit" style="background: #ef4444; color: white; border: none; padding: 3px 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 700;">나가기</button>
        </div>
      </div>
      <div id="dev-room-body">
        <div style="font-size: 11.5px; color: #94a3b8; margin-bottom: 8px;">스킬 연구실 (자동공격 OFF)</div>
        
        <div style="margin-bottom: 6px; background: rgba(30, 41, 59, 0.6); padding: 6px 8px; border-radius: 8px;">
          <label style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
            <span>⚡ 무한 쿨다운</span>
            <input type="checkbox" id="dev-toggle-cd" checked style="cursor: pointer;" />
          </label>
        </div>

        <div style="margin-bottom: 8px; background: rgba(30, 41, 59, 0.6); padding: 6px 8px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 3px;">
            <span>⏱️ 슬로우모션</span>
            <span id="dev-speed-label" style="color: #38bdf8; font-weight: 700;">1.0x</span>
          </div>
          <input type="range" id="dev-slider-speed" min="0.1" max="2.0" step="0.1" value="1.0" style="width: 100%; cursor: pointer;" />
        </div>

        <div style="margin-bottom: 10px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #fbbf24; margin-bottom: 4px;">👾 몬스터 소환</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 5px;">
            <button id="btn-spawn-minions" style="background: #4f46e5; color: white; border: none; padding: 6px 4px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">👾 미니언 3</button>
            <button id="btn-spawn-brutes" style="background: #0284c7; color: white; border: none; padding: 6px 4px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">🛡️ 브루트 2</button>
            <button id="btn-spawn-pyros" style="background: #ea580c; color: white; border: none; padding: 6px 4px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">🔥 파이로 2</button>
            <button id="btn-spawn-boss" style="background: #dc2626; color: white; border: none; padding: 6px 4px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">👑 보스 1</button>
          </div>
          <button id="btn-clear-monsters" style="width: 100%; background: #334155; color: #f87171; border: 1px solid #475569; padding: 5px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">🗑️ 몬스터 전부 제거</button>
        </div>

        <div style="margin-bottom: 10px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #c084fc; margin-bottom: 4px;">🍇 악마의 열매 제단 (즉시 복용)</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;">
            <button class="btn-dev-eat-fruit" data-fruit="fruit_dark" style="background: rgba(168,85,247,0.25); border: 1px solid #a855f7; color: #fff; padding: 4px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">🍇 어둠어둠</button>
            <button class="btn-dev-eat-fruit" data-fruit="fruit_fire" style="background: rgba(249,115,22,0.25); border: 1px solid #f97316; color: #fff; padding: 4px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">🔥 이글이글</button>
            <button class="btn-dev-eat-fruit" data-fruit="fruit_ice" style="background: rgba(56,189,248,0.25); border: 1px solid #38bdf8; color: #fff; padding: 4px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">🧊 빙빙</button>
            <button class="btn-dev-eat-fruit" data-fruit="fruit_lightning" style="background: rgba(251,191,36,0.25); border: 1px solid #fbbf24; color: #fff; padding: 4px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">⚡ 쿠릉쿠릉</button>
            <button class="btn-dev-eat-fruit" data-fruit="fruit_magma" style="background: rgba(239,68,68,0.25); border: 1px solid #ef4444; color: #fff; padding: 4px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">🌋 마그마그</button>
            <button class="btn-dev-eat-fruit" data-fruit="fruit_light" style="background: rgba(253,224,71,0.25); border: 1px solid #fde047; color: #fff; padding: 4px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">✨ 번쩍번쩍</button>
            <button class="btn-dev-eat-fruit" data-fruit="fruit_wind" style="background: rgba(52,211,153,0.25); border: 1px solid #34d399; color: #fff; padding: 4px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">🌪️ 폭풍폭풍</button>
            <button class="btn-dev-eat-fruit" data-fruit="fruit_quake" style="background: rgba(163,230,53,0.25); border: 1px solid #a3e635; color: #fff; padding: 4px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">💥 흔들흔들</button>
          </div>
          <button id="btn-dev-clear-fruit" style="width: 100%; background: #0284c7; color: white; border: none; padding: 4px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">🌊 능력 정화 (무능력자로 환원)</button>
        </div>

        <div>
          <button id="btn-dev-cast-inferno" style="width: 100%; background: linear-gradient(135deg, #ff2200, #ff8800); color: white; border: none; padding: 6px; border-radius: 8px; font-weight: 700; font-size: 11.5px; cursor: pointer; margin-bottom: 4px;">🔥 헬파이어 카타클리즘 (T)</button>
          <button id="btn-dev-cast-all" style="width: 100%; background: #1e293b; color: #cbd5e1; border: 1px solid #475569; padding: 5px; border-radius: 6px; font-size: 10.5px; cursor: pointer;">✨ 8종 전 스킬 일괄 투사</button>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.ui = container;

    // Devil Fruit Altar Buttons
    container.querySelectorAll('.btn-dev-eat-fruit').forEach(btn => {
      btn.onclick = () => {
        const fruitId = btn.dataset.fruit;
        this.app.eatFruit?.(fruitId);
      };
    });

    container.querySelector('#btn-dev-clear-fruit').onclick = () => {
      this.app.removeFruit?.();
    };

    // Event Listeners
    container.querySelector('#btn-dev-exit').onclick = () => this.toggleDevRoom(false);

    const devBody = container.querySelector('#dev-room-body');
    const foldBtn = container.querySelector('#btn-dev-toggle-fold');
    foldBtn.onclick = () => {
      const isHidden = devBody.style.display === 'none';
      devBody.style.display = isHidden ? 'block' : 'none';
      foldBtn.textContent = isHidden ? '➖' : '➕';
    };
    
    const cdToggle = container.querySelector('#dev-toggle-cd');
    cdToggle.onchange = (e) => {
      this.infiniteCooldown = e.target.checked;
    };

    const speedSlider = container.querySelector('#dev-slider-speed');
    const speedLabel = container.querySelector('#dev-speed-label');
    speedSlider.oninput = (e) => {
      this.slowMoScale = parseFloat(e.target.value);
      speedLabel.textContent = `${this.slowMoScale.toFixed(1)}x`;
      settings.global.timeScale = this.slowMoScale;
    };

    // Monster Spawners
    container.querySelector('#btn-spawn-minions').onclick = () => {
      if (this.app.enemies) {
        this.app.enemies.spawnDirect(ENEMY_TYPES.MINION, -4.5, -14);
        this.app.enemies.spawnDirect(ENEMY_TYPES.MINION, 0, -15);
        this.app.enemies.spawnDirect(ENEMY_TYPES.MINION, 4.5, -14);
        this.app.hud?.showToast('👾 미니언 3마리가 소환되었습니다!');
      }
    };

    container.querySelector('#btn-spawn-brutes').onclick = () => {
      if (this.app.enemies) {
        this.app.enemies.spawnDirect(ENEMY_TYPES.BRUTE, -3.5, -16);
        this.app.enemies.spawnDirect(ENEMY_TYPES.BRUTE, 3.5, -16);
        this.app.hud?.showToast('🛡️ 돌격 브루트 2마리가 소환되었습니다!');
      }
    };

    container.querySelector('#btn-spawn-pyros').onclick = () => {
      if (this.app.enemies) {
        this.app.enemies.spawnDirect(ENEMY_TYPES.PYRO, -2.5, -12);
        this.app.enemies.spawnDirect(ENEMY_TYPES.PYRO, 2.5, -12);
        this.app.hud?.showToast('🔥 화염 파이로 2마리가 소환되었습니다!');
      }
    };

    container.querySelector('#btn-spawn-boss').onclick = () => {
      if (this.app.enemies) {
        this.app.enemies.spawnDirect(ENEMY_TYPES.BOSS, 0, -18);
        this.app.hud?.showToast('👑 보스 모놀리스가 소환되었습니다!');
      }
    };

    container.querySelector('#btn-clear-monsters').onclick = () => {
      if (this.app.enemies) {
        this.app.enemies.clearAllEnemies();
        this.app.hud?.showToast('🗑️ 소환된 모든 몬스터가 제거되었습니다.');
      }
    };

    container.querySelector('#btn-dev-cast-inferno').onclick = () => {
      if (this.app.character) {
        this.app.selectAbility('inferno');
        const target = new Vector3(0, 0, -14);
        const dir = new Vector3(0, 0, -1);
        this.app._cast(this.app.character.position, dir, 14);
      }
    };

    container.querySelector('#btn-dev-cast-all').onclick = () => {
      if (this.app.character) {
        ELEMENTS.forEach((elem, idx) => {
          setTimeout(() => {
            this.app.selectAbility(elem);
            const dist = 6 + (idx % 5) * 6;
            const targetX = ((idx % 5) - 2) * 4.5;
            const dir = new Vector3(targetX, 0, -dist).sub(this.app.character.position).normalize();
            this.app._cast(this.app.character.position, dir, dist);
          }, idx * 250);
        });
      }
    };
  }

  toggleDevRoom(forceState) {
    const nextState = forceState !== undefined ? forceState : !this.isInDevRoom;
    if (this.isInDevRoom === nextState) return;

    this.isInDevRoom = nextState;

    if (this.isInDevRoom) {
      // Save Open World state
      this.savedPlayerPos.copy(this.app.character.position);
      this.savedCameraDistance = settings.camera.distance;

      // Disable Auto-Attack and Auto-Cast in Dev Room
      if (this.app.autoCast) {
        this.app.toggleAutoCast();
      }
      this.app.game?.setAutoCast(false);

      // Hide Open World meshes & NPCs
      if (this.app.worldMap) this.app.worldMap.setVisible(false);
      if (this.app.npcManager) this.app.npcManager.setVisible(false);
      if (this.app.ground) this.app.ground.mesh.visible = false;

      // Show Dev Room
      this.group.visible = true;
      this.ui.style.display = 'block';

      // Unlock all 8 skills
      ELEMENTS.forEach(elem => this.app.unlockedSkills.add(elem));
      this.app.hud?.setUnlockedSkills(this.app.unlockedSkills);
      this.app.mobileControls?.setUnlockedSkills(this.app.unlockedSkills);

      // Move player to Dev Room center
      this.app.character.root.position.set(0, 0, 0);
      this.app.character.setFacing(Math.PI);
      this.app.rig.setAnchor(0, 0, 0);

      this.app.hud?.showToast('🛠️ [개발자 연구실] 입장 완료! (자동공격 OFF / 몬스터 소환 가능)');
    } else {
      // Clear Dev Room spawned monsters
      this.app.enemies?.clearAllEnemies();

      // Restore Open World
      this.group.visible = false;
      this.ui.style.display = 'none';

      if (this.app.worldMap) this.app.worldMap.setVisible(true);
      if (this.app.npcManager) this.app.npcManager.setVisible(true);
      if (this.app.ground) this.app.ground.mesh.visible = true;

      this.app.clearEffects?.();

      // Restore player position & time scale
      this.app.character.root.position.copy(this.savedPlayerPos);
      this.app.rig.setAnchor(this.savedPlayerPos.x, 0, this.savedPlayerPos.z);
      settings.global.timeScale = 1.0;
      this.app.hud?.showToast('🌿 [성소 오픈월드]로 복귀했습니다.');
    }
  }

  update(dt) {
    if (!this.isInDevRoom) return;

    // Reset cooldowns instantly if infinite cooldown mode is on
    if (this.infiniteCooldown) {
      for (const elem of ELEMENTS) {
        this.app.cooldowns.set(elem, 0);
      }
      this.app.dashCooldown = 0;
    }

    // Update active spawned enemies in Dev Room so they animate & react
    if (this.app.enemies && this.app.character) {
      this.app.enemies.update(dt, this.app.character.position);
    }
  }
}
