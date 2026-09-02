import {
  Vector2,
  Vector3,
  Color,
  MathUtils,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Group
} from 'three';

import { Renderer } from './Renderer.js';
import { Time } from './Time.js';
import { CameraRig } from './CameraRig.js';
import { frame } from './FrameUniforms.js';

import { Environment } from '../world/Environment.js';
import { Ground } from '../world/Ground.js';
import { DustMotes } from '../world/DustMotes.js';
import { ContactShadows } from '../world/ContactShadows.js';
import { SkyDome } from '../world/SkyDome.js';
import { ProceduralWorldMap } from '../world/ProceduralWorldMap.js';
import { WaterPlane } from '../world/WaterPlane.js';
import { ProceduralFlora } from '../world/ProceduralFlora.js';
import { SoundManager } from '../audio/SoundManager.js';

import { AssetLoader } from '../loaders/AssetLoader.js';
import { CharacterController } from '../animation/CharacterController.js';

import { InputManager } from '../input/InputManager.js';
import { AimController } from '../input/AimController.js';

import { ParticleEngine } from '../particles/ParticleEngine.js';
import { LightPool } from '../effects/LightPool.js';
import { DecalSystem } from '../effects/GroundDecals.js';
import { FissureSystem } from '../effects/GroundFissures.js';
import { BurstSystem, BurstMode } from '../effects/BurstSphere.js';
import { CameraShake } from '../effects/CameraShake.js';
import { ScreenFlash } from '../effects/ScreenFlash.js';
import { ShockwaveDistortionManager } from '../effects/ShockwaveDistortion.js';
import { GroundRockDebrisManager } from '../effects/GroundRockDebris.js';

import { AbilityManager } from '../abilities/AbilityManager.js';
import { PostProcessing } from '../postprocessing/PostProcessing.js';

import { HUD, LoadingScreen } from '../ui/HUD.js';
import { MobileControls } from '../ui/MobileControls.js';
import { VirtualJoystick } from '../input/VirtualJoystick.js';
import { OrientationGuide } from '../ui/OrientationGuide.js';
import { ProceduralHeroFactory, HEROES_DATA, DEVIL_FRUITS, BASE_ADVENTURER } from '../characters/ProceduralHeroFactory.js';
import { HeroSelectModal } from '../ui/HeroSelectModal.js';
import { PlayerNameplate } from '../ui/PlayerNameplate.js';
import { Editor } from '../ui/Editor.js';

import { RPGPlayerData } from '../rpg/RPGPlayerData.js';
import { QuestManager } from '../rpg/QuestManager.js';
import { NPCManager } from '../rpg/NPCManager.js';
import { WorldZoneManager } from '../rpg/WorldZoneManager.js';
import { RPGHUD } from '../ui/RPGHUD.js';
import { InventoryModal } from '../ui/InventoryModal.js';
import { NPCDialogModal } from '../ui/NPCDialogModal.js';
import { DevRoomManager } from '../rpg/DevRoomManager.js';
import { NetworkManager } from '../network/NetworkManager.js';
import { ChatOverlay } from '../ui/ChatOverlay.js';

import { FloatingTextManager } from '../game/FloatingText.js';
import { EnemyManager } from '../game/EnemyManager.js';
import { GameManager } from '../game/GameManager.js';

import { settings, ELEMENTS, ELEMENT_META } from '../config/settings.js';

const HDR_URL = './hdri/spruit_sunrise.hdr';

/**
 * Application root: owns every subsystem and the frame loop.
 *
 * The wiring is deliberately one-directional — App builds the systems, hands the
 * ability manager a context object of the shared services, and then does nothing
 * but order the per-frame updates. No subsystem reaches back into App.
 *
 * The interaction is a single loop: select and arm an ability (Q / E), swing the
 * ground arrow with the mouse, click to fire. `AimController` owns the targeting
 * and emits one `cast` event; App turns that into an ability, a heading for the
 * character and a cooldown.
 */
export class App {
  constructor(canvas) {
    this.canvas = canvas;
    this.time = new Time();
    this.elapsed = 0;
    this.paused = false;
    this._raf = 0;

    /**
     * Seconds left before each ability can be armed again. Per element, so
     * spending one slot never locks the other out.
     */
    this.cooldowns = new Map(ELEMENTS.map((element) => [element, 0]));

    /* ---- core ---- */
    this.renderer = new Renderer(canvas);
    this.rig = new CameraRig(canvas);
    this.camera = this.rig.camera;

    // Prevent default context menu everywhere for smooth right-click camera rotation
    window.addEventListener('contextmenu', (e) => e.preventDefault(), { capture: true });

    this.rig.onFirstPersonChange = (isFirstPerson) => {
      if (this.character?.model) {
        this.character.model.visible = !isFirstPerson;
      }
      if (this.nameplate?.root) {
        this.nameplate.root.style.opacity = isFirstPerson ? '0' : '1';
      }
    };

    this.environment = new Environment(this.renderer, this.camera);
    this.scene = this.environment.scene;

    /* ---- world ---- */
    this.ground = new Ground(this.environment);
    this.dust = new DustMotes();
    this.contactShadows = new ContactShadows(this.renderer, { size: 2.6, height: 2.4, blur: 2.0 });

    this.scene.add(this.ground.mesh, this.dust.points, this.contactShadows.group);
    this.dust.setPixelRatio(this.renderer.gl.getPixelRatio());

    /* ---- 100% Procedural AAA Open World, Sky Dome, River & Foliage ---- */
    this.skyDome = new SkyDome(this.scene);
    this.worldMap = new ProceduralWorldMap(this.scene);
    this.water = new WaterPlane(this.scene);
    this.flora = new ProceduralFlora(this.scene);
    this.sound = new SoundManager();

    /* ---- shared VFX services ---- */
    this.particles = new ParticleEngine(this.scene);
    this.lights = new LightPool(this.scene);
    this.decals = new DecalSystem(this.scene);
    this.fissures = new FissureSystem(this.scene);
    this.bursts = new BurstSystem(this.scene);
    this.shake = new CameraShake(this.rig);
    this.flash = new ScreenFlash();
    this.shockwaves = new ShockwaveDistortionManager(this.scene);
    this.rockDebris = new GroundRockDebrisManager(this.scene);

    this.abilities = new AbilityManager({
      scene: this.scene,
      camera: this.camera,
      environment: this.environment,
      particles: this.particles,
      lights: this.lights,
      decals: this.decals,
      fissures: this.fissures,
      bursts: this.bursts,
      shake: this.shake,
      flash: this.flash,
      shockwaves: this.shockwaves,
      rockDebris: this.rockDebris
    });
    this.abilities.ctx.abilities = this.abilities;

    /* ---- character ---- */
    this.character = new CharacterController(this.environment);
    this.scene.add(this.character.root);

    /* ---- input & targeting ---- */
    this.input = new InputManager(canvas);
    this._moveInput = new Vector2();
    this.dashCooldown = 0;
    this.baseDashCooldown = 4.5;
    this.aim = new AimController(this.camera);
    this.scene.add(this.aim.object3D);

    /* ---- post ---- */
    this.post = new PostProcessing(this.renderer, this.scene, this.camera);

    /* ---- UI & Mobile Controls ---- */
    this.loading = new LoadingScreen();
    this.hud = new HUD(document.getElementById('hud'));
    this.orientationGuide = new OrientationGuide(document.body);
    this.joystick = new VirtualJoystick(document.body);
    this.mobileControls = new MobileControls(document.body);

    this.mobileControls.onDash = () => this.performDash();
    this.mobileControls.onToggleAuto = () => this.toggleAutoCast();
    this.mobileControls.onCast = () => {
      if (!this.isHeroSelecting) {
        this._quickCastAbility(this.element);
      }
    };
    this.mobileControls.onSelectAbility = (element) => {
      if (!this.isHeroSelecting) {
        this._quickCastAbility(element);
      }
    };

    this.editor = new Editor({
      onClear: () => this.clearEffects(),
      onToast: (message) => this.hud.showToast(message)
    });

    /* ---- RPG Systems (MMORPG Open World Mode) ---- */
    this.currentHeroId = 'adventurer';
    this.unlockedSkills = new Set();

    this.playerData = new RPGPlayerData(this.currentHeroId);
    this.questManager = new QuestManager(this.playerData);
    this.npcManager = new NPCManager(this.scene, this.questManager);
    this.zoneManager = new WorldZoneManager((zone) => this.rpgHUD?.showZoneBanner(zone));

    this.dialogModal = new NPCDialogModal(document.body, {
      questManager: this.questManager,
      onQuestClaimed: () => this.rpgHUD?.updatePlayerStats()
    });

    this.inventoryModal = new InventoryModal(document.body, this.playerData, (heal) => {
      this.game?.healPlayer(heal);
      this.rpgHUD?.updatePlayerStats(this.game.playerHp, this.playerData.getEffectiveStats().maxHp);
    });

    this.devRoom = new DevRoomManager(this);
    this.abilities.ctx.devRoom = this.devRoom;
    this.abilities.ctx.character = this.character;
    this.abilities.ctx.enemies = this.enemies;

    this.rpgHUD = new RPGHUD(document.body, {
      playerData: this.playerData,
      questManager: this.questManager,
      onOpenInventory: () => this.inventoryModal.toggle(),
      onOpenStats: () => this.inventoryModal.toggle(),
      onInteractNPC: (npc) => this.dialogModal.open(npc),
      onOpenDevRoom: () => this.devRoom.toggleDevRoom()
    });

    this.playerData.onLevelUp = (lvl) => {
      this.sound?.playLevelUp();
      this.rpgHUD?.showLevelUpBanner(lvl);
      this.floatingText.spawn(`🌟 LEVEL UP! Lv.${lvl}`, this.character.position, { color: '#ffd700', size: 24, isCrit: true });
    };

    /* ---- Game Systems (Combat & Enemy Loop) ---- */
    this.floatingText = new FloatingTextManager(this.scene, this.camera);
    this.enemies = new EnemyManager(this.scene, this.floatingText, this.particles);
    this.enemies.setCamera(this.camera);
    this.enemies.setSound(this.sound);
    this.enemies.setCombatEffects(this.bursts, this.shake, this.flash);
    this.enemies.setRPGContext(this.playerData, this.questManager, this.rpgHUD);
    this.abilities.ctx.enemies = this.enemies;

    this.game = new GameManager({
      scene: this.scene,
      camera: this.camera,
      shake: this.shake,
      flash: this.flash,
      hud: this.hud,
      floatingText: this.floatingText,
      particles: this.particles
    });
    this.enemies.setGameManager(this.game);

    this.enemies.onAttackPlayer = (dmg) => {
      if (this.character.isInvulnerable) {
        this.floatingText.spawn('DODGED! ⚡', this.character.position, { color: '#38bdf8', size: 16, isCrit: true });
        return;
      }
      this.game.damagePlayer(dmg);
      this.rpgHUD?.updatePlayerStats(this.game.playerHp, this.playerData.getEffectiveStats().maxHp);
    };

    this.nameplate = new PlayerNameplate(document.body);

    this.heroSelectModal = new HeroSelectModal(document.body, (heroId, playerName) => {
      this.startBattleWithHero(heroId, playerName);
    });

    this.game.onRestart = () => {
      this.clearEffects();
      this.enemies.reset();
      this.openHeroSelection();
    };

    this.autoCast = true;
    this.game.onToggleAuto = () => this.toggleAutoCast();
    this.game.setAutoCast(this.autoCast);

    this._bindEvents();
    this.selectHero(this.currentHeroId);

    /* ---- Real-Time MMORPG Multiplayer & Chat ---- */
    this.network = new NetworkManager(this.scene, this.abilities);
    this.chatOverlay = new ChatOverlay(this.network);

    /* ---- 3D Character Selection Showcase Pedestal ---- */
    this._createShowcasePedestal();

    this.isHeroSelecting = true;
    this._showcaseTimer = null;
    this._focusPoint = new Vector3();
    window.app = this;

    this.openHeroSelection();
  }

  _createShowcasePedestal() {
    const geo = new CylinderGeometry(1.6, 1.8, 0.12, 32);
    const mat = new MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x00d2ff,
      emissiveIntensity: 0.25
    });
    this.showcasePedestal = new Mesh(geo, mat);
    this.showcasePedestal.position.set(0, -0.06, 0);
    this.scene.add(this.showcasePedestal);
  }

  openHeroSelection() {
    this.isHeroSelecting = true;
    this.joystick?.setVisible(false);
    this.mobileControls?.setVisible(false);

    // Completely hide village NPCs & in-game HUDs during character selection
    this.npcManager?.setVisible(false);
    this.worldMap?.setVisible(false);
    this.flora?.setVisible(false);
    if (this.showcasePedestal) this.showcasePedestal.visible = true;

    const oldHud = document.getElementById('hud');
    if (oldHud) oldHud.style.display = 'none';
    const defenseUI = document.getElementById('game-defense-ui');
    if (defenseUI) defenseUI.style.display = 'none';
    if (this.rpgHUD?.root) this.rpgHUD.root.style.display = 'none';
    if (this.nameplate?.root) this.nameplate.root.style.display = 'none';
    if (this.game?.dom?.shopModal) this.game.dom.shopModal.style.display = 'none';
    if (this.game?.dom?.gameOverModal) this.game.dom.gameOverModal.style.display = 'none';

    // Position camera for AAA 3D Character Creation Chamber (Full-body framing)
    settings.camera.distance = 4.8;
    settings.camera.targetHeight = 0.9;
    this.rig.distance = 4.8;
    this.rig.camera.position.set(-0.7, 1.8, 4.8);
    this.rig.controls.target.set(-0.7, 0.85, 0);
    this.rig.controls.update();

    this.character.root.position.set(0, 0, 0);
    this.character.root.rotation.set(0, 0.35, 0);

    this.heroSelectModal.show();
    this.selectHero(this.currentHeroId);
    this.clearEffects();
  }

  previewHeroAttack(heroId = this.currentHeroId) {
    if (!HEROES_DATA[heroId]) return;
    const hero = HEROES_DATA[heroId];
    const element = hero.element;

    const origin = new Vector3(0, 0.5, 0.5);
    const direction = new Vector3(-0.25, 0, 0.96).normalize();
    
    // Per-element custom showcase distance so all effects explode in full view
    const showcaseDistances = {
      ice: 8.0,
      thunder: 8.0,
      meteor: 4.5,
      beam: 10.0,
      snare: 3.5,
      glacier: 3.5,
      blizzard: 4.0
    };
    const range = showcaseDistances[element] || 6.0;

    // Play character casting motion
    const animName = settings[element]?.castAnim || 'cast1';
    this.character.playCast(animName);

    // Trigger full VFX magic spell eruption
    this.abilities.cast(origin, direction, range, element);
    this.shake.add(0.25);
  }

  async selectHero(heroId) {
    if (!HEROES_DATA[heroId]) return;
    this.currentHeroId = heroId;
    const hero = HEROES_DATA[heroId];
    if (this.playerData) {
      this.playerData.heroId = heroId;
      this.rpgHUD?.updatePlayerStats();
    }

    // Clear previous hero residual VFX during showcase
    if (this.isHeroSelecting) {
      this.clearEffects();
    }

    // Load & Swap Real Fantasy 3D Hero Model
    await this.character.setHeroModel(heroId);
    this.character.root.position.set(0, 0, 0);
    this.character.root.rotation.set(0, 0.25, 0);

    // If fruit is equipped, unlock fruit skills. Otherwise, lock skills (Normal Adventurer)
    if (this.playerData?.currentFruit) {
      const fruit = DEVIL_FRUITS[this.playerData.currentFruit];
      const fruitSkills = fruit ? fruit.skills : [];
      this.allowedHeroSkills = new Set(fruitSkills);
      this.unlockedSkills.clear();
      fruitSkills.forEach(s => this.unlockedSkills.add(s));
      this.selectAbility(fruitSkills[0], { silent: true });
      this.hud.setExclusiveSkills(fruitSkills, this.unlockedSkills);
      this.mobileControls.setExclusiveSkills(fruitSkills, this.unlockedSkills);
    } else {
      this.allowedHeroSkills.clear();
      this.unlockedSkills.clear();
      this.hud.setExclusiveSkills([], this.unlockedSkills);
      this.mobileControls.setExclusiveSkills([], this.unlockedSkills);
    }
  }

  async startBattleWithHero(heroId, playerName = '황태민') {
    if (this._showcaseTimer) {
      clearInterval(this._showcaseTimer);
      this._showcaseTimer = null;
    }
    this.isHeroSelecting = false;
    this.game.state = 'playing';
    this.paused = false;
    this.heroSelectModal?.hide();
    this.playerName = playerName;

    // Start as Normal Human Adventurer (무능력자 시작 - 평타 전용)
    this.playerData.currentFruit = null;
    await this.selectHero('adventurer');

    // Automatic Landscape & Fullscreen on Mobile
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (_) {}

    // Transition from Character Creation Room to Sanctuary Village
    if (this.showcasePedestal) this.showcasePedestal.visible = false;
    this.npcManager?.setVisible(true);
    this.worldMap?.setVisible(true);
    this.flora?.setVisible(true);
    this.clearEffects();

    // Show MMORPG HUD, Nameplate & Controls
    if (this.rpgHUD?.root) this.rpgHUD.root.style.display = 'block';
    if (this.nameplate?.root) this.nameplate.root.style.display = 'block';
    this.joystick?.setVisible(true);
    this.mobileControls?.setVisible(true);

    // Update nameplate and HUD name & stats
    this.nameplate.setPlayerInfo(this.playerName, 'adventurer', this.playerData.level);
    this.rpgHUD?.updatePlayerStats();
    const hudNameEl = this.rpgHUD?.root.querySelector('.player-name-text');
    if (hudNameEl) hudNameEl.textContent = this.playerName;

    // Reset camera to standard wide battle angle behind character
    settings.camera.distance = 18.0;
    settings.camera.targetHeight = 1.2;
    this.rig.distance = 18.0;
    this.rig.camera.position.set(0, 12, 16);
    this.rig.controls.target.set(0, 1.2, 0);
    this.rig.controls.update();
    this.character.root.rotation.set(0, 0, 0);

    // MMORPG Entrance
    this.network?.setLocalHero('adventurer', this.playerName, this.playerData?.level || 1, this.playerData?.hp || 1570, this.playerData?.maxHp || 1570);
    this.game.showWaveBanner(`성소 마을 도착 — ${this.playerName}`, `일반 모험가로 모험 시작! 가방([I])의 악마의 열매를 먹어보세요!`);
    this.hud.showToast(`⚔️ [${this.playerName}] 모험 시작! 마우스 좌클릭/공격 버튼으로 물리 평타를 구사하세요!`, 3500);
    this.rpgHUD?.showZoneBanner(this.zoneManager.currentZone);
  }

  performBasicAttack(targetPos = null) {
    if (this.game.state !== 'playing' || this.paused) return;

    const now = performance.now() * 0.001;
    if (now - this.lastBasicAttackTime > 0.9) {
      this.basicAttackCombo = 0;
    }
    this.basicAttackCombo = (this.basicAttackCombo % 3) + 1;
    this.lastBasicAttackTime = now;

    // Turn toward target if provided
    if (targetPos) {
      const diff = targetPos.clone().sub(this.character.position);
      diff.y = 0;
      if (diff.lengthSq() > 0.01) {
        const yaw = Math.atan2(diff.x, diff.z);
        this.character.setFacing(yaw);
      }
    }

    // Play combo animation: 1: Slash -> 2: Punch -> 3: Kick
    const comboAnims = ['slash', 'punch', 'kick'];
    const animName = comboAnims[this.basicAttackCombo - 1] || 'slash';
    this.character.playCast(animName);
    this.character.castLunge();
    this.shake.add(0.12);

    // Audio & Swoosh
    this.sound?.playCast('fire');

    // Hit detection cone in front of character (radius 4.5m, 120 deg cone)
    const charPos = this.character.position;
    const forward = new Vector3(Math.sin(this.character.facing), 0, Math.cos(this.character.facing));
    const range = 4.5;
    const isCrit = this.basicAttackCombo === 3;

    const effectiveStats = this.playerData?.getEffectiveStats() || { str: 10 };
    const baseDmg = Math.floor(95 + Math.random() * 55 + (effectiveStats.str || 10) * 3.2);
    const finalDamage = isCrit ? Math.floor(baseDmg * 1.8) : baseDmg;

    // Physical impact particles
    const swingOrigin = charPos.clone().addScaledVector(forward, 1.5).add(new Vector3(0, 1.0, 0));
    this.bursts?.spawn(BurstMode.FIRE, swingOrigin, {
      radius: 0.2,
      endRadius: isCrit ? 2.2 : 1.4,
      life: 0.35,
      colorA: isCrit ? new Color(0xffd700) : new Color(0x38bdf8)
    });

    // Hit enemies
    let hitCount = 0;
    if (this.enemies && this.enemies.enemies) {
      for (const enemy of this.enemies.enemies) {
        if (enemy.isDead || !enemy.group?.visible) continue;
        const toEnemy = enemy.position.clone().sub(charPos);
        toEnemy.y = 0;
        const dist = toEnemy.length();
        if (dist <= range) {
          toEnemy.normalize();
          const dot = forward.dot(toEnemy);
          if (dot > 0.3) {
            enemy.takeDamage(finalDamage, isCrit);
            this.sound?.playHit(isCrit);
            this.floatingText?.spawn(
              isCrit ? `⚡ CRIT ${finalDamage}` : `💥 ${finalDamage}`,
              enemy.position.clone().add(new Vector3(0, 1.8, 0)),
              { color: isCrit ? '#ffd700' : '#ffffff', size: isCrit ? 18 : 14 }
            );
            enemy.position.addScaledVector(forward, isCrit ? 1.4 : 0.6);
            hitCount++;
          }
        }
      }
    }

    // Hit DevRoom dummies
    if (this.devRoom?.isInDevRoom && this.devRoom.dummies) {
      for (const dummy of this.devRoom.dummies) {
        const toDummy = dummy.position.clone().sub(charPos);
        toDummy.y = 0;
        if (toDummy.length() <= range) {
          toDummy.normalize();
          if (forward.dot(toDummy) > 0.3) {
            dummy.takeDamage(finalDamage, isCrit);
            this.floatingText?.spawn(
              isCrit ? `⚡ CRIT ${finalDamage}` : `💥 ${finalDamage}`,
              dummy.position.clone().add(new Vector3(0, 1.8, 0)),
              { color: isCrit ? '#ffd700' : '#ffffff', size: isCrit ? 18 : 14 }
            );
            hitCount++;
          }
        }
      }
    }
  }

  async eatFruit(fruitKey) {
    const fruitData = DEVIL_FRUITS[fruitKey];
    if (!fruitData) return;

    this.currentHeroId = fruitData.heroId;
    this.playerData.currentFruit = fruitKey;
    this.playerData.heroId = fruitData.heroId;

    // Swap 3D Model to Fruit Ability Avatar
    await this.character.setHeroModel(fruitData.heroId);

    // Unlock the 4 fruit skills
    const fruitSkills = fruitData.skills;
    this.allowedHeroSkills = new Set(fruitSkills);
    this.unlockedSkills.clear();
    fruitSkills.forEach(s => this.unlockedSkills.add(s));

    // Update HUD & Mobile Controls
    this.selectAbility(fruitSkills[0], { silent: true });
    this.hud.setExclusiveSkills(fruitSkills, this.unlockedSkills);
    this.mobileControls.setExclusiveSkills(fruitSkills, this.unlockedSkills);

    // Update Nameplate & Player Frame
    this.nameplate.setPlayerInfo(this.playerName, fruitData.heroId, this.playerData.level);
    this.rpgHUD?.updatePlayerStats();

    // Epic 3D Spiral Eruption Particles & Sound
    this.bursts?.spawn(BurstMode.FIRE, this.character.position.clone().add(new Vector3(0, 1, 0)), {
      radius: 0.5,
      endRadius: 4.5,
      life: 0.8,
      colorA: new Color(fruitData.color || '#a855f7')
    });
    this.shake.add(0.35);
    this.flash.trigger(fruitData.color || '#a855f7', 0.5);

    this.game.showWaveBanner(
      `🌟 악마의 열매 능력 각성!`,
      `[${fruitData.name}] ${fruitData.user}의 힘이 몸 안에 깃들었습니다!`
    );
    this.hud.showToast(`🍇 [${fruitData.name}] 복용 완료! 4가지 전용 스킬이 개방되었습니다!`, 3000);
  }

  async removeFruit() {
    this.currentHeroId = 'adventurer';
    this.playerData.currentFruit = null;
    this.playerData.heroId = 'adventurer';

    await this.character.setHeroModel('adventurer');

    this.allowedHeroSkills.clear();
    this.unlockedSkills.clear();

    this.hud.setExclusiveSkills([], this.unlockedSkills);
    this.mobileControls.setExclusiveSkills([], this.unlockedSkills);

    this.nameplate.setPlayerInfo(this.playerName, 'adventurer', this.playerData.level);
    this.rpgHUD?.updatePlayerStats();

    this.bursts?.spawn(BurstMode.WATER, this.character.position.clone().add(new Vector3(0, 1, 0)), {
      radius: 0.5,
      endRadius: 3.5,
      life: 0.7,
      colorA: new Color(0x38bdf8)
    });
    this.shake.add(0.2);

    this.game.showWaveBanner(`🌊 능력 정화 완료`, `악마의 열매 능력이 정화되어 일반 모험가로 환원되었습니다.`);
    this.hud.showToast(`🌊 능력이 정화되었습니다. 기본 평타로 전투합니다.`, 2500);
  }

  /** The ability currently in the slot. */
  get element() {
    return this.abilities.selected;
  }

  /* ------------------------------------------------------------------ */

  _bindEvents() {
    this.renderer.onResize((width, height, pixelRatio) => {
      this.rig.resize(width, height);
      this.post.setSize(width, height, pixelRatio);
      this.dust.setPixelRatio(pixelRatio);
    });

    let isMouseDown = false;
    let lastMouseX = 0;
    window.addEventListener('mousedown', (e) => {
      if (this.isHeroSelecting) {
        isMouseDown = true;
        lastMouseX = e.clientX;
      }
    });
    window.addEventListener('mousemove', (e) => {
      if (this.isHeroSelecting && isMouseDown) {
        const dx = e.clientX - lastMouseX;
        lastMouseX = e.clientX;
        this.character.root.rotation.y += dx * 0.015;
      }
    });
    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    this.input.on('pointer:move', (pointer) => {
      if (!this.isHeroSelecting && this.unlockedSkills.size > 0) this.aim.point(pointer);
    });
    this.input.on('pointer:confirm', (pointer) => {
      if (!this.isHeroSelecting) {
        if (this.unlockedSkills.size === 0 || !this.aim.isArmed) {
          this.performBasicAttack();
        } else {
          this.aim.point(pointer);
          this.aim.confirm();
        }
      }
    });
    this.input.on('action', (action, slot) => {
      if (this.isHeroSelecting) return;
      this._handleAction(action, slot);
    });

    this.mobileControls.onCast = () => {
      if (!this.isHeroSelecting) {
        if (this.unlockedSkills.size === 0 || !this.aim.isArmed) {
          this.performBasicAttack();
        } else {
          this.aim.confirm();
        }
      }
    };

    this.mobileControls.onLockedSkillTapped = () => {
      this.hud.showToast('⚠️ 악마의 열매를 복용해야 스킬을 사용할 수 있습니다! [I] 가방을 확인하세요.', 2200);
    };

    this.playerData.onFruitChanged = (fruitKey) => {
      if (fruitKey) {
        this.eatFruit(fruitKey);
      } else {
        this.removeFruit();
      }
    };

    this.aim.on('cast', (origin, direction, distance) => {
      if (!this.isHeroSelecting) this._cast(origin, direction, distance);
    });
    this.aim.on('reject', () => this.hud.showToast('Too close — aim further out'));

    this.hud.onAbility = (element) => {
      if (!this.isHeroSelecting) {
        if (this.unlockedSkills.size === 0) {
          this.hud.showToast('⚠️ 악마의 열매를 복용해야 스킬을 사용할 수 있습니다! [I] 가방을 확인하세요.', 2200);
        } else {
          this._quickCastAbility(element);
        }
      }
    };
  }

  _handleAction(action, slot) {
    if (this.isHeroSelecting) return;
    switch (action) {
      case 'ability': {
        if (this.unlockedSkills.size === 0) {
          this.hud.showToast('⚠️ 악마의 열매를 복용해야 스킬을 사용할 수 있습니다! [I] 가방을 확인하세요.', 2200);
          return;
        }
        const heroSkills = Array.from(this.unlockedSkills);
        const element = heroSkills[slot];
        if (element) {
          this._quickCastAbility(element);
        }
        break;
      }
      case 'dash':
        this.performDash();
        break;
      case 'cancel':
        this.aim.cancel();
        break;
      case 'toggleHelp':
        this.hud.toggleHelp();
        break;
      case 'toggleEditor':
        this.editor.toggle();
        break;
      case 'clear':
        this.clearEffects();
        this.hud.showToast('Effects cleared');
        break;
      case 'toggle_auto':
        this.toggleAutoCast();
        break;
      case 'toggleDevRoom':
        this.devRoom?.toggleDevRoom();
        break;
      case 'togglePause':
        this.paused = !this.paused;
        this.hud.setPaused(this.paused);
        this.hud.showToast(this.paused ? 'Paused — the editor still applies' : 'Resumed');
        break;
      default:
        break;
    }
  }

  toggleAutoCast() {
    this.autoCast = !this.autoCast;
    this.game.setAutoCast(this.autoCast);
    this.mobileControls?.setAutoBattleState(this.autoCast);
    this.hud.showToast(this.autoCast ? '🤖 AUTO BATTLE: ON' : '✋ MANUAL BATTLE: OFF');
  }

  performDash() {
    if (this.game.state === 'shop') {
      this.game.closeShopAndNextWave();
      return;
    }
    if (this.game.state !== 'playing' || this.paused) return;

    if (this.dashCooldown > 0) {
      this.hud.showToast(`⚡ Blink recharging (${this.dashCooldown.toFixed(1)}s)`);
      return;
    }

    // Determine dash direction from movement input or facing direction
    const dashDir = new Vector3();
    if (this._moveInput.lengthSq() > 0.01 && this.camera) {
      const camDir = this.camera.getWorldDirection(new Vector3());
      camDir.y = 0;
      camDir.normalize();
      const camRight = new Vector3(-camDir.z, 0, camDir.x);
      dashDir.addScaledVector(camRight, this._moveInput.x).addScaledVector(camDir, this._moveInput.y).normalize();
    } else {
      dashDir.copy(this.character.forwardAxis).applyAxisAngle(new Vector3(0, 1, 0), this.character.facing);
    }

    const { startPos, targetPos } = this.character.performDash(dashDir, 35.0);

    // Instantly translate camera target and position to eliminate lag/snapping
    const deltaX = targetPos.x - startPos.x;
    const deltaZ = targetPos.z - startPos.z;
    if (this.rig && this.rig.controls) {
      this.rig.controls.target.x += deltaX;
      this.rig.controls.target.z += deltaZ;
      this.rig.camera.position.x += deltaX;
      this.rig.camera.position.z += deltaZ;
    }

    // Apply cooldown
    this.dashCooldown = 1.0;
    this.hud.setDashCooldown(this.dashCooldown, 1.0);
    this.mobileControls.setDashCooldown(this.dashCooldown, 1.0);

    // Visual & audio-visual effects
    this.shake.add(0.15, 1.2, 20);
    this.flash.trigger(new Color('#38bdf8'), 0.2);

    // Spawn origin spark burst & target ring
    this.bursts.spawn(BurstMode.STORM, startPos, { radius: 0.8, endRadius: 3.2, life: 0.25, intensity: 2.5 });
    this.bursts.spawn(BurstMode.FROST, targetPos, { radius: 0.8, endRadius: 3.5, life: 0.3, intensity: 2.0 });

    // Spawn floating dodge text
    this.floatingText.spawn('⚡ BLINK!', targetPos, { color: '#38bdf8', size: 20, isCrit: true });

    // Damage and stun/knockback enemies around start & target
    if (this.enemies) {
      const dmg = Math.floor(120 * (this.game?.damageMultiplier ?? 1.0));
      for (const enemy of this.enemies.enemies) {
        if (enemy.isDead) continue;
        const dStart = enemy.position.distanceTo(startPos);
        const dTarget = enemy.position.distanceTo(targetPos);
        if (dStart <= 3.0 || dTarget <= 3.0) {
          const knockDir = new Vector3().subVectors(enemy.position, dTarget <= 3.0 ? targetPos : startPos).normalize().multiplyScalar(6);
          enemy.takeDamage(dmg, true, {
            slow: 0.3,
            slowDuration: 2.0,
            knockback: knockDir
          });
          this.floatingText.spawn(`${dmg} ⚡`, enemy.position, { color: '#38bdf8' });
        }
      }
    }
  }

  /**
   * Put an ability in the slot. The aim indicator and the HUD both follow,
   * because `range` and `minRange` are the ability's, not the app's.
   */
  selectAbility(element, options = {}) {
    if (!ELEMENTS.includes(element)) return;
    this.abilities.select(element);
    this.aim.setElement(element);
    this.hud.setElement(element, options);
  }

  /** Select an ability and arm it, unless it is still cooling down. */
  armAbility(element = this.element) {
    if (this.allowedHeroSkills && !this.allowedHeroSkills.has(element)) {
      this.hud.showToast('❌ 이 캐릭터는 사용할 수 없는 속성의 스킬입니다!');
      return;
    }
    if (!this.unlockedSkills.has(element)) {
      this.hud.showToast('🔒 아직 배우지 않은 스킬입니다!');
      return;
    }
    if ((this.cooldowns.get(element) ?? 0) > 0) {
      this.hud.showToast('Not ready');
      return;
    }
    // Selecting before arming means the arrow is already drawn to the new
    // ability's range on the frame it appears.
    if (element !== this.element) this.selectAbility(element);
    this.aim.arm();
  }

  _quickCastAbility(element) {
    if (this.isHeroSelecting) return;
    if (this.allowedHeroSkills && !this.allowedHeroSkills.has(element)) {
      this.hud.showToast('❌ 이 캐릭터는 사용할 수 없는 속성의 스킬입니다!');
      return;
    }
    if (!this.unlockedSkills.has(element)) {
      this.hud.showToast('🔒 아직 배우지 않은 스킬입니다!');
      return;
    }
    const cd = (this.devRoom?.isInDevRoom && this.devRoom?.infiniteCooldown) ? 0 : (this.cooldowns.get(element) ?? 0);
    if (cd > 0) {
      const meta = ELEMENT_META[element];
      this.hud.showToast(`⏳ [${meta?.nameKo || meta?.label || element}] 쿨다운 중 (${cd.toFixed(1)}초)`);
      return;
    }

    if (element !== this.element) this.selectAbility(element);
    this.aim.arm();
    this.aim._resolve();

    const origin = this.character.position.clone();
    origin.y = 0;
    const direction = this.aim.direction.clone();
    if (!direction.lengthSq() || (Math.abs(direction.x) < 1e-4 && Math.abs(direction.z) < 1e-4)) {
      const fYaw = this.character.facing;
      direction.set(Math.sin(fYaw), 0, Math.cos(fYaw)).normalize();
    }
    const cfg = settings[element] || {};
    const distance = Math.max(cfg.minRange || 2.0, Math.min(this.aim.distance || ((cfg.range || 25.0) * 0.6), cfg.range || 25.0));

    this._cast(origin, direction, distance, element);
    this.aim.cancel();
  }

  _cast(origin, direction, distance, forcedElement) {
    const element = forcedElement || this.element;
    this.abilities.cast(origin, direction, distance, element);
    this.network?.sendSpellCast(origin, direction, distance, element);
    const isDevInf = this.devRoom?.isInDevRoom && this.devRoom?.infiniteCooldown;
    const cdMult = isDevInf ? 0 : (this.game?.cooldownMultiplier ?? 1.0);
    const cd = (settings[element]?.cooldown || 3.0) * cdMult;
    this.cooldowns.set(element, Math.max(0, cd));

    // Snap character to cast direction and play visceral animation
    const castYaw = Math.atan2(direction.x, direction.z);
    this.character.setFacing(castYaw);
    this.character.playCast(settings[element]?.castAnim || 'cast1');
    this.character.castLunge();
  }

  /** Smart Auto-Cast targeting a world coordinate */
  _castAuto(element, targetPos) {
    if (!targetPos) return;
    const origin = this.character.position.clone();
    origin.y = 0;

    const diff = new Vector3().subVectors(targetPos, origin);
    diff.y = 0;
    const dist = diff.length();
    if (dist < 0.05) return;

    const dir = diff.clone().normalize();
    const cfg = settings[element] || {};
    const clampedDist = Math.max(cfg.minRange || 1.0, Math.min(dist, cfg.range || 25));

    this.abilities.cast(origin, dir, clampedDist, element);
    this.network?.sendSpellCast(origin, dir, clampedDist, element);

    const cdMult = this.game?.cooldownMultiplier ?? 1.0;
    this.cooldowns.set(element, Math.max(0, (cfg.cooldown || 3.0) * cdMult));

    // Turn character toward targeted enemy
    const angle = Math.atan2(dir.x, dir.z);
    this.character.setFacing(angle);
    this.character.playCast(cfg.castAnim || 'cast1');
    this.character.castLunge();
  }

  clearEffects() {
    this.aim.cancel();
    this.abilities.clear();
    this.particles.reset();
    this.decals.clear();
    this.fissures.clear();
    this.bursts.clear();
    this.lights.reset();
    this.shake.reset();
    this.flash.reset();
  }

  /* ------------------------------------------------------------------ */

  /** Load assets, warm the shader cache, then start the loop. */
  async load() {
    const assets = new AssetLoader();

    this.loading.setProgress(0.05, '황태민의 마법 세계를 불러오는 중… (5%)');
    const hdr = await assets.loadHDR(HDR_URL);
    await this.environment.loadEnvironment(hdr);
    frame.uEnvMap.value = this.environment.equirect;

    this.loading.setProgress(0.35, '신비로운 성소 전장 조성 중… (35%)');
    await this.ground.loadTextures(assets);

    this.loading.setProgress(0.5, '영웅 캐릭터 및 원소 마법 소환 중… (50%)');
    await this.character.load(assets);
    this.selectHero(this.currentHeroId);

    this.loading.setProgress(0.85, '초고화질 셰이더 및 시각 효과 준비 중… (85%)');
    // Compile everything up front so the first cast never stutters.
    await this.renderer.gl.compileAsync(this.scene, this.camera);

    this.loading.setProgress(1, '황태민의 멋진 게임 시작 준비 완료! ✨');
    this.loading.hide();

    // Launch 3D Hero Showcase & Selection Mode
    this.openHeroSelection();

    this.start();
  }

  start() {
    this.time.reset();
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      this.frame();
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this._raf);
  }

  /* ------------------------------------------------------------------ */

  frame() {
    const gl = this.renderer.gl;
    gl.info.reset();

    const raw = this.time.tick();
    const dt = this.paused ? 0 : raw * settings.global.timeScale;
    this.elapsed += dt;

    /* ---- shared uniforms ---- */
    frame.uTime.value = this.elapsed;
    frame.uDelta.value = dt;
    frame.uShaderIntensity.value = settings.global.shaderIntensity;
    frame.uGlobalGlow.value = settings.global.glow;
    frame.uCameraNear.value = this.camera.near;
    frame.uCameraFar.value = this.camera.far;

    /* ---- simulation ---- */
    this.renderer.syncSettings();

    this.environment.setFocus(this.character.position.x, this.character.position.z);
    this.environment.update();

    if (this.isHeroSelecting) {
      this.character.root.position.set(0, 0, 0);
      this.character.update(raw);
    } else {
      // Targeting runs on *real* time so the arrow keeps sweeping and animating
      // while the sandbox is paused — pausing freezes the effects, not the UI.
      this.aim.setOrigin(this.character.position);
      this.aim.update(raw);

      // Movement (WASD + Virtual Joystick)
      this.character.moveSpeed = 26.0 * (this.game?.speedMultiplier ?? 1.0);
      this._moveInput.set(0, 0);
      if (this.input.isKeyDown('KeyA') || this.input.isKeyDown('ArrowLeft')) this._moveInput.x -= 1;
      if (this.input.isKeyDown('KeyD') || this.input.isKeyDown('ArrowRight')) this._moveInput.x += 1;
      if (this.input.isKeyDown('KeyW') || this.input.isKeyDown('ArrowUp')) this._moveInput.y += 1;
      if (this.input.isKeyDown('KeyS') || this.input.isKeyDown('ArrowDown')) this._moveInput.y -= 1;

      // Add mobile touch virtual joystick vector
      if (this.joystick && this.joystick.isActive) {
        this._moveInput.x += this.joystick.value.x;
        this._moveInput.y += this.joystick.value.y;
      }
      if (this._moveInput.lengthSq() > 1.0) {
        this._moveInput.normalize();
      }

      if (!this.paused && this.game.state === 'playing') {
        this.character.updateMovement(this._moveInput, dt, this.camera, this.aim.isArmed);
      }

      if (settings.character.turnToAim && this.aim.isArmed) {
        this.character.turnToward(this.aim.facing, settings.character.turnRate, raw);
      }
      this.character.update(dt);
    }

    for (const [element, remaining] of this.cooldowns) {
      if (remaining > 0) this.cooldowns.set(element, Math.max(0, remaining - raw));
    }
    if (this.dashCooldown > 0) {
      this.dashCooldown = Math.max(0, this.dashCooldown - raw);
    }

    this.ground.update(this.elapsed);
    this.dust.update(this.elapsed, this.character.position);
    this.skyDome?.update(this.elapsed, this.character.position);
    this.worldMap?.update(dt, this.elapsed);

    this.abilities.update(dt);

    /* ---- Real-Time Multiplayer Network Update ---- */
    const currentAnim = this._moveInput.lengthSq() > 0.01 ? 'run' : 'idle';
    this.network?.update(dt, this.character.position, this.character.facing, currentAnim, this.playerData?.hp);

    /* ---- Smart Auto-Cast Attack Loop ---- */
    if (this.autoCast && this.game.state === 'playing' && !this.paused && !this.aim.isArmed) {
      for (const element of ELEMENTS) {
        if (this.unlockedSkills.has(element) && (this.cooldowns.get(element) ?? 0) <= 0.001) {
          const range = settings[element]?.range || 24;
          if (['ice', 'thunder', 'beam', 'wind_blade', 'fire_fist', 'earth_spike', 'void_orb'].includes(element)) {
            const nearest = this.enemies.findNearestEnemy(this.character.position, range);
            if (nearest) {
              this._castAuto(element, nearest.position);
              break; // Cast 1 spell per frame for rhythmic spellcasting
            }
          } else {
            const cluster = this.enemies.findDenseCluster(this.character.position, range, 6.0);
            if (cluster) {
              this._castAuto(element, cluster);
              break;
            }
          }
        }
      }
    }

    /* ---- MMORPG World, NPC, Nameplate & Minimap Loop ---- */
    if (this.npcManager) {
      this.npcManager.update(dt, this.character.position);
      const nearbyNPC = this.npcManager.getNearbyNPC(this.character.position);
      this.rpgHUD?.setNearbyNPC(nearbyNPC);
    }
    if (this.zoneManager) {
      this.zoneManager.update(this.character.position);
    }
    if (this.rpgHUD && this.game.state === 'playing') {
      this.rpgHUD.updateMinimap(this.character.position, this.enemies.enemies, this.npcManager?.npcs || []);
      const effectiveMaxHp = this.playerData.getEffectiveStats().maxHp;
      this.rpgHUD.updatePlayerStats(this.game.playerHp, effectiveMaxHp);
    }

    /* ---- Enemy & Combat Loop ---- */
    if (this.game.state === 'playing' && !this.paused) {
      if (this.devRoom?.isInDevRoom) {
        this.devRoom.update(dt);
        for (const ability of this.abilities.active) {
          for (const dummy of this.devRoom.dummies) {
            const hitDist = ability.targetPos ? ability.targetPos.distanceTo(dummy.position) : 999;
            if (hitDist <= (ability.zoneRadius || 6.5)) {
              dummy.takeDamage(Math.floor(450 + Math.random() * 200), true);
            }
          }
        }
      } else {
        this.enemies.update(dt, this.character.position);
        for (const ability of this.abilities.active) {
          this.enemies.processAbilityHits(ability, dt);
        }
        this.game.updateStats(this.enemies.wave, this.enemies.score, this.enemies.kills);
      }
    }

    this.particles.flush();
    this.decals.update(dt);
    this.fissures.update(dt);
    this.bursts.update(dt);
    this.lights.update(dt);
    this.shockwaves.update(dt);
    this.rockDebris.update(dt);
    this.ground?.update(this.elapsed);
    this.water?.update(this.elapsed);

    /* ---- environment & sun tracking ---- */
    this.environment.setFocus(this.character.position.x, this.character.position.z);
    this.environment.update();

    /* ---- camera ---- */
    const focus = this.abilities.focus;
    if (focus) this.rig.lookAt(focus.position, MathUtils.clamp(1 - focus.u * 0.4, 0, 1));
    this.rig.setAnchor(this.character.position.x, 0, this.character.position.z);
    this.shake.update(raw);
    this.flash.update(raw);
    this.rig.update(raw);

    /* ---- 3D Projected Screen UI (100% Lockstep Synchronization) ---- */
    if (this.nameplate) {
      this.nameplate.update(this.character.position, this.camera, this.isHeroSelecting);
      const effectiveMaxHp = this.playerData.getEffectiveStats().maxHp;
      this.nameplate.updateHp(this.game.playerHp, effectiveMaxHp);
    }
    this.floatingText.update(dt);

    this.contactShadows.setPosition(this.character.position.x, this.character.position.z);
    this.contactShadows.render(this.scene);

    /* ---- render ---- */
    // Exactly one cascade shadow update per frame (see Renderer).
    gl.shadowMap.needsUpdate = true;
    this.post.sync(this.elapsed, this.flash);
    this.post.render();

    /* ---- readouts & mobile HUD sync ---- */
    const cdMult = this.game?.cooldownMultiplier ?? 1.0;
    for (const element of ELEMENTS) {
      const cd = this.cooldowns.get(element) ?? 0;
      const maxCd = (settings[element]?.cooldown || 3.0) * cdMult;
      this.hud.setCooldown(element, cd, maxCd);
      this.mobileControls.setSkillCooldown(element, cd, maxCd);
    }
    this.hud.setDashCooldown(this.dashCooldown, this.baseDashCooldown * cdMult);
    this.mobileControls.setDashCooldown(this.dashCooldown, this.baseDashCooldown * cdMult);
    this.mobileControls.setActiveSkill(this.element);

    this.hud.setArmed(this.aim.isArmed);
    this.hud.update(raw, () => ({
      particles: this.particles.countLive(this.elapsed),
      calls: gl.info.render.calls,
      spikes: this.abilities.active.reduce((total, ability) => total + ability.instanceCount, 0),
      abilities: this.abilities.active.length
    }));
  }

  /* ------------------------------------------------------------------ */

  dispose() {
    this.stop();
    this.game?.dispose();
    this.enemies?.dispose();
    this.floatingText?.dispose();
    this.input.dispose();
    this.aim.dispose();
    this.abilities.dispose();
    this.particles.dispose();
    this.decals.dispose();
    this.fissures.dispose();
    this.bursts.dispose();
    this.lights.dispose();
    this.character.dispose();
    this.ground.dispose();
    this.dust.dispose();
    this.contactShadows.dispose();
    this.post.dispose();
    this.environment.dispose();
    this.editor.dispose();
    this.rig.dispose();
    this.renderer.dispose();
  }
}
