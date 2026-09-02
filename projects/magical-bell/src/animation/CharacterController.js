import {
  AnimationMixer,
  AnimationClip,
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  TorusGeometry,
  LoopOnce,
  LoopRepeat,
  MathUtils,
  Vector3,
  Color
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { settings, CAST_ANIMATIONS } from '../config/settings.js';
import { LAYER } from '../core/Layers.js';
import { disposeObject } from '../utils/dispose.js';
import { HEROES_DATA } from '../characters/ProceduralHeroFactory.js';

const HERO_MODELS = {
  arthur: './models/Mage.glb',
  raiden: './models/Paladin.glb',
  akainu: './models/Knight.glb',
  ignis: './models/Knight.glb',
  ace: './models/Rogue.glb',
  lumina: './models/Ranger.glb',
  tesla: './models/Rogue_Hooded.glb',
  boreas: './models/Barbarian.glb',
  sera: './models/Skeleton_Warrior.glb',
  adventurer: './models/Knight.glb'
};

let _heroLoader = new GLTFLoader();
_heroLoader.setMeshoptDecoder(MeshoptDecoder);
let _ktx2Loader = new KTX2Loader().setTranscoderPath('./basis/');
let _ktx2Initialized = false;

function initKTX2(rendererWrapper) {
  if (rendererWrapper && !_ktx2Initialized) {
    try {
      const glRenderer = rendererWrapper.gl || rendererWrapper;
      _ktx2Loader.detectSupport(glRenderer);
      _heroLoader.setKTX2Loader(_ktx2Loader);
      _ktx2Initialized = true;
    } catch (e) {
      console.warn('[CharacterController] Failed to initialize KTX2Loader:', e);
    }
  }
}

const TARGET_HEIGHT = 1.85;
const LOWER_BODY_KEYWORDS = ['leg', 'foot', 'toe', 'heel', 'knee', 'ik-foot', 'ik-toe', 'hips.position'];

function isLowerBodyTrack(trackName) {
  const lower = trackName.toLowerCase();
  return LOWER_BODY_KEYWORDS.some((kw) => lower.includes(kw));
}

export class CharacterController {
  constructor(environment) {
    this.environment = environment;
    this.root = new Group();
    this.root.name = 'Character';

    this.tilt = new Group();
    this.tilt.name = 'CharacterTilt';
    this.root.add(this.tilt);

    this.assets = null;
    this.model = null;
    this.mixer = null;
    this.actions = new Map();
    this._currentAction = null;
    this._castAction = null;
    this._cachedGLTFs = new Map();

    this.height = 1.85;
    this.headPosition = new Vector3(0, 1.6, 0);
    this.forwardAxis = new Vector3(0, 0, 1);
    this._forwardYaw = 0;
    this._lunge = 0;
    this._rightAxis = new Vector3(1, 0, 0);

    /* ---- Movement State (Hyper-Speed Sprint for 75km Open World) ---- */
    this.moveSpeed = 26.0;
    this.velocity = new Vector3();
    this.isMoving = false;
    this._moveDir = new Vector3();

    /* ---- Dash & Invulnerability ---- */
    this.isInvulnerable = false;
    this.iFrameTimer = 0;
    this.currentHeroId = 'arthur';
  }

  async load(assets) {
    this.assets = assets;
    if (this.environment?.renderer) {
      initKTX2(this.environment.renderer);
    }

    // Load initial Arthur model directly (instant load)
    await this.setHeroModel('arthur');

    // Preload remaining heroes in the background without blocking boot
    const otherHeroes = Object.entries(HERO_MODELS).filter(([id]) => id !== 'arthur');
    for (const [id, url] of otherHeroes) {
      _heroLoader.load(url, (gltf) => {
        this._cachedGLTFs.set(id, gltf);
      }, undefined, (err) => console.warn(`[CharacterController] Background preload failed for ${id}:`, err));
    }

    return this;
  }

  async setHeroModel(heroId) {
    if (this.environment?.renderer) {
      initKTX2(this.environment.renderer);
    }
    this.currentHeroId = heroId;
    const modelUrl = HERO_MODELS[heroId] || HERO_MODELS.arthur;

    let gltf = this._cachedGLTFs.get(heroId);
    if (!gltf) {
      try {
        gltf = await new Promise((resolve, reject) => {
          _heroLoader.load(modelUrl, resolve, undefined, reject);
        });
        this._cachedGLTFs.set(heroId, gltf);
      } catch (err) {
        console.error(`[CharacterController] Failed to load model for ${heroId}:`, err);
      }
    }

    if (!gltf) return;

    // Clean previous model and stop mixer
    if (this.model) {
      this.tilt.remove(this.model);
      if (this.mixer) {
        this.mixer.stopAllAction();
      }
      this.actions.clear();
      this._currentAction = null;
      this._castAction = null;
      this.model = null;
    }

    // Clone SkinnedMesh skeleton
    const model = SkeletonUtils.clone(gltf.scene);

    model.traverse((child) => {
      // Hide overlapping weapons/props
      if (child.name === 'Spellbook_open' || child.name === '1H_Wand') {
        child.visible = false;
      }

      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        child.layers.set(LAYER.WORLD);
        child.layers.enable(LAYER.CONTACT);
        if (child.material) {
          child.material.roughness = 0.45;
          child.material.metalness = 0.15;
          if (this.environment) {
            this.environment.registerShadowCaster(child.material);
          }
        }
      }
    });

    this._attachOnePieceAccessories(model, heroId);

    // KayKit models are natively 1.0 scale (approx 1.8m height)
    model.scale.setScalar(1.0);
    model.position.set(0, 0, 0);

    this.tilt.add(model);
    this.model = model;

    // Setup Animation Mixer & Actions
    this.mixer = new AnimationMixer(model);

    if (gltf.animations && gltf.animations.length > 0) {
      gltf.animations.forEach((clip) => {
        const action = this.mixer.clipAction(clip);
        const name = clip.name;

        if (name.includes('Attack') || name.includes('Spellcast') || name.includes('Shoot') || name.includes('Throw') || name.includes('Dodge')) {
          action.setLoop(LoopOnce, 1);
          action.clampWhenFinished = true;

          // Upper-body track clip for moving attacks
          const upperTracks = clip.tracks.filter((t) => !isLowerBodyTrack(t.name));
          if (upperTracks.length > 0) {
            const upperClip = new AnimationClip(`${name}_upper`, clip.duration, upperTracks);
            const upperAction = this.mixer.clipAction(upperClip);
            upperAction.setLoop(LoopOnce, 1);
            upperAction.clampWhenFinished = true;
            this.actions.set(`${name}_upper`, upperAction);
          }
        } else {
          action.setLoop(LoopRepeat, Infinity);
        }
        this.actions.set(name, action);
      });
    }

    // Play default Idle animation
    this._playBestAction(['Idle', 'Unarmed_Idle', '2H_Melee_Idle', 'Walking_A']);
  }

  _playBestAction(names, blendDuration = 0.15) {
    if (!this.mixer) return;
    let target = null;
    for (const name of names) {
      if (this.actions.has(name)) {
        target = this.actions.get(name);
        break;
      }
    }
    if (!target && this.actions.size > 0) {
      target = this.actions.values().next().value;
    }
    if (!target || target === this._currentAction) return;

    if (this._currentAction) {
      target.reset();
      target.play();
      target.crossFadeFrom(this._currentAction, blendDuration, false);
    } else {
      target.reset().play();
    }
    this._currentAction = target;
  }

  playCast(customAnimName) {
    this.castLunge();

    const animMap = {
      cast1: 'Spellcast_Shoot',
      cast2: 'Spellcast_Raise',
      cast3: 'Spellcast_Long',
      punch: 'Unarmed_Melee_Attack_Punch_A',
      kick: 'Unarmed_Melee_Attack_Kick',
      slash: '1H_Melee_Attack_Slice_Horizontal',
      spin: '2H_Melee_Attack_Spin',
      shoot: '1H_Ranged_Shoot',
      throw: 'Throw'
    };

    let targetName = animMap[customAnimName] || customAnimName;

    // Ordered candidate fallback list
    const candidateNames = [
      targetName,
      'Unarmed_Melee_Attack_Kick',
      'Unarmed_Melee_Attack_Kick_upper',
      'Spellcast_Shoot',
      'Spellcast_Raise',
      'Spellcast_Long',
      '1H_Melee_Attack_Slice_Horizontal',
      'Unarmed_Melee_Attack_Punch_A',
      '1H_Melee_Attack_Chop',
      '2H_Melee_Attack_Spin',
      'Throw'
    ].filter(Boolean);

    let baseName = null;
    for (const name of candidateNames) {
      if (this.actions.has(name)) {
        baseName = name;
        break;
      }
    }

    if (!baseName) return;

    // Moving attack: Play on upper body so legs keep walking/running
    if (this.isMoving && this.actions.has(`${baseName}_upper`)) {
      const upperAction = this.actions.get(`${baseName}_upper`);
      upperAction.reset();
      upperAction.setEffectiveTimeScale(1.6);
      upperAction.play();
      this._castAction = upperAction;
      this._castTimer = 0.55;
      return;
    }

    const castAction = this.actions.get(baseName);
    if (!castAction) return;

    this._castAction = castAction;
    this._castTimer = 0.65;

    castAction.reset();
    castAction.setEffectiveTimeScale(1.4);
    castAction.play();

    if (this._currentAction && this._currentAction !== castAction) {
      castAction.crossFadeFrom(this._currentAction, 0.08, false);
    }
    this._currentAction = castAction;
  }

  get isCasting() {
    return this._castTimer > 0 || this._lunge > 0.05;
  }

  setFacing(yaw) {
    this.root.rotation.y = yaw - this._forwardYaw;
  }

  get facing() {
    return this.root.rotation.y + this._forwardYaw;
  }

  set facing(val) {
    this.setFacing(val);
  }

  turnToward(yaw, rate, dt) {
    const current = this.facing;
    const delta = MathUtils.euclideanModulo(yaw - current + Math.PI, Math.PI * 2) - Math.PI;
    this.setFacing(current + delta * (1 - Math.pow(MathUtils.clamp(rate, 1e-6, 1), dt)));
  }

  castLunge() {
    this._lunge = 1;
  }

  _applyLunge(dt) {
    const lungeDist = (settings.character?.castLunge ?? 0.2) * this._lunge;
    const leanAngle = (settings.character?.castLean ?? 0.15) * this._lunge;
    this.tilt.position.set(0, 0, lungeDist);
    this.tilt.rotation.x = leanAngle;
    const recoverRate = settings.character?.castRecover ?? 0.35;
    this._lunge = Math.max(0, this._lunge - dt * (1 / Math.max(0.001, recoverRate)));
  }

  updateMovement(input, dt, camera, isAiming = false) {
    if (input.lengthSq() < 0.01) {
      this.isMoving = false;
      this.velocity.set(0, 0, 0);
      return;
    }

    this.isMoving = true;

    // Calculate movement vector relative to camera
    const moveDir = new Vector3();
    if (camera) {
      const camDir = camera.getWorldDirection(new Vector3());
      camDir.y = 0;
      camDir.normalize();
      const camRight = new Vector3(-camDir.z, 0, camDir.x);
      moveDir.addScaledVector(camRight, input.x).addScaledVector(camDir, input.y).normalize();
    } else {
      moveDir.set(input.x, 0, input.y).normalize();
    }

    this._moveDir.copy(moveDir);
    this.velocity.copy(moveDir).multiplyScalar(this.moveSpeed);

    // Apply translation
    this.root.position.addScaledVector(this.velocity, dt);

    // Open-world boundary clamping (3,500m Mega Open World)
    const maxR = 3500.0;
    const r = Math.hypot(this.root.position.x, this.root.position.z);
    if (r > maxR) {
      this.root.position.x = (this.root.position.x / r) * maxR;
      this.root.position.z = (this.root.position.z / r) * maxR;
    }

    // Turn toward movement direction
    if (!isAiming) {
      const targetYaw = Math.atan2(moveDir.x, moveDir.z);
      this.turnToward(targetYaw, 18.0, dt);
    }
  }

  performDash(direction, distance = 14.0) {
    const startPos = this.root.position.clone();
    const targetPos = this.root.position.clone().addScaledVector(direction, distance);

    const maxR = 3500.0;
    const r = Math.hypot(targetPos.x, targetPos.z);
    if (r > maxR) {
      targetPos.x = (targetPos.x / r) * maxR;
      targetPos.z = (targetPos.z / r) * maxR;
    }

    this.root.position.copy(targetPos);
    this.isInvulnerable = true;
    this.iFrameTimer = 0.35;

    const dashYaw = Math.atan2(direction.x, direction.z);
    this.setFacing(dashYaw);

    if (this.isMoving) {
      this._playBestAction(['Running_A', 'Walking_A', 'Walking_B'], 0.05);
    } else {
      this._playBestAction(['Idle', 'Unarmed_Idle', '2H_Melee_Idle'], 0.1);
    }

    return { startPos, targetPos };
  }

  update(dt) {
    this._applyLunge(dt);

    if (this.iFrameTimer > 0) {
      this.iFrameTimer -= dt;
      if (this.iFrameTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    if (this._castTimer > 0) {
      this._castTimer -= dt;
      if (this._castTimer <= 0) {
        this._castAction = null;
      }
    }

    // Dynamic animation state blending
    if (this.mixer) {
      if (this.isMoving) {
        this._playBestAction(['Running_A', 'Walking_A', 'Walking_B'], 0.12);
      } else if (!this.isCasting) {
        this._playBestAction(['Idle', 'Unarmed_Idle', '2H_Melee_Idle'], 0.2);
      }
      this.mixer.timeScale = settings.global.animationSpeed || 1.0;
      this.mixer.update(dt);
    }
  }

  get position() {
    return this.root.position;
  }

  _fitToStandardSize(model, targetHeight = TARGET_HEIGHT) {
    model.updateMatrixWorld(true);
    const box = new Box3().setFromObject(model);
    const size = new Vector3();
    box.getSize(size);

    if (size.y > 0.001) {
      const scaleFactor = targetHeight / size.y;
      model.scale.setScalar(scaleFactor);
      model.updateMatrixWorld(true);
    }
  }

  _applyOnePieceStyling(model, heroId) {
    const pal = {
      arthur: { primary: 0x80d8ff, emissive: 0x0091ea },
      raiden: { primary: 0xffd54f, emissive: 0xff8f00 },
      akainu: { primary: 0xd32f2f, emissive: 0xbf360c },
      ignis: { primary: 0xd32f2f, emissive: 0xbf360c },
      ace: { primary: 0xff6d00, emissive: 0xe65100 },
      lumina: { primary: 0xffea00, emissive: 0xfbc02d },
      tesla: { primary: 0x00c853, emissive: 0x1b5e20 },
      boreas: { primary: 0xffffff, emissive: 0x37474f },
      sera: { primary: 0x7c4dff, emissive: 0x311b92 }
    }[heroId];

    if (!pal) return;

    model.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) => m.clone());
        } else {
          child.material = child.material.clone();
        }
        const mat = child.material;
        if (mat.color && child.name.toLowerCase().includes('cape')) {
          mat.color.setHex(pal.primary);
        }
      }
    });
  }

  _attachOnePieceAccessories(model, heroId) {
    const headBone = model.getObjectByName('head');
    const chestBone = model.getObjectByName('chest');
    const handR = model.getObjectByName('handr');
    if (heroId === 'ace') {
      this._attachAceAccessories(model);
      return;
    }

    // 2. 아카이누 (Akainu - Knight.glb)
    if (heroId === 'akainu' || heroId === 'ignis') {
      model.traverse((c) => {
        const n = c.name;
        if (n.includes('Sword') || n.includes('Shield') || n.includes('1H_') || n.includes('2H_') || n.includes('Helmet')) {
          c.visible = false;
        }
        if (c.isMesh && c.name.toLowerCase().includes('hair') && c.material) {
          if (c.material.color) c.material.color.setHex(0x1a1a1a);
        }
      });
      // Marine Admiral Officer Visor Cap (해군 원수 캡 모자)
      if (headBone) {
        const capGroup = new Group();
        capGroup.name = 'Akainu_Cap';
        const whiteMat = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const visorMat = new MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2 });
        const goldMat = new MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.9 });

        const crown = new Mesh(new CylinderGeometry(0.52, 0.48, 0.24, 24), whiteMat);
        crown.position.set(0, 0.12, 0.02);

        const visor = new Mesh(new CylinderGeometry(0.56, 0.56, 0.03, 20, 1, false, -Math.PI * 0.3, Math.PI * 0.6), visorMat);
        visor.rotation.x = 0.24;
        visor.position.set(0, 0.04, 0.24);

        const badge = new Mesh(new SphereGeometry(0.06, 8, 8), goldMat);
        badge.scale.set(1.0, 1.0, 0.3);
        badge.position.set(0, 0.12, 0.50);

        capGroup.add(crown, visor, badge);
        capGroup.position.set(0, 0.52, 0.02);
        headBone.add(capGroup);
      }
      // Red Rose Corsage
      if (chestBone) {
        const roseMat = new MeshStandardMaterial({ color: 0xc62828, roughness: 0.3 });
        const rose = new Mesh(new SphereGeometry(0.075, 10, 10), roseMat);
        rose.scale.set(1.0, 1.0, 0.5);
        rose.position.set(0.18, 0.10, 0.24);
        chestBone.add(rose);
      }
    }

    // 3. 아오키지 (Aokiji - Mage.glb)
    if (heroId === 'arthur') {
      model.traverse((c) => {
        if (c.name.includes('Spellbook') || c.name.includes('1H_Wand') || c.name.includes('2H_Staff') || c.name === 'Mage_Hat') {
          c.visible = false;
        }
      });
      // Green Sleeping Eye Mask (수면 안대)
      if (headBone) {
        const maskGroup = new Group();
        maskGroup.name = 'Aokiji_EyeMask';
        const greenMat = new MeshStandardMaterial({ color: 0x00897b, roughness: 0.4 });
        const mask = new Mesh(new BoxGeometry(0.38, 0.09, 0.05), greenMat);
        mask.position.set(0, 0.18, 0.38);
        maskGroup.add(mask);
        maskGroup.position.set(0, 0.38, 0);
        headBone.add(maskGroup);
      }
      // Ice Saber (아이스 세이버)
      if (handR) {
        const iceMat = new MeshStandardMaterial({ color: 0x80d8ff, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.9 });
        const saber = new Mesh(new CylinderGeometry(0.025, 0.008, 1.3, 8), iceMat);
        saber.position.set(0, 0.55, 0);
        handR.add(saber);
      }
    }

    // 4. 에넬 (Enel - Paladin.glb)
    if (heroId === 'raiden') {
      model.traverse((c) => {
        if (c.name.includes('Shield') || c.name.includes('Sword') || c.name.includes('1H_') || c.name.includes('2H_')) {
          c.visible = false;
        }
      });
      // Taiko Drum Ring behind back (태고 북 고리)
      if (chestBone) {
        const ringGroup = new Group();
        ringGroup.name = 'Enel_Drums';
        const goldMat = new MeshStandardMaterial({ color: 0xffd54f, roughness: 0.2, metalness: 0.8 });
        const drumMat = new MeshStandardMaterial({ color: 0xfff8e1, roughness: 0.4 });

        const ring = new Mesh(new TorusGeometry(0.60, 0.03, 12, 24), goldMat);
        ringGroup.add(ring);

        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
          const drum = new Mesh(new CylinderGeometry(0.11, 0.11, 0.13, 12), drumMat);
          drum.rotation.z = angle + Math.PI * 0.5;
          drum.position.set(Math.cos(angle) * 0.60, Math.sin(angle) * 0.60, 0);
          ringGroup.add(drum);
        }
        ringGroup.position.set(0, 0.15, -0.30);
        chestBone.add(ringGroup);
      }
      // Golden Staff (황금 봉)
      if (handR) {
        const goldMat = new MeshStandardMaterial({ color: 0xffd54f, roughness: 0.2, metalness: 0.9 });
        const staff = new Mesh(new CylinderGeometry(0.03, 0.03, 1.7, 12), goldMat);
        staff.position.set(0, 0.4, 0);
        handR.add(staff);
      }
    }

    // 5. 키자루 (Kizaru - Ranger.glb)
    if (heroId === 'lumina') {
      model.traverse((c) => {
        const n = c.name;
        if (n.includes('Bow') || n.includes('Arrow') || n.includes('Quiver') || n.includes('1H_') || n.includes('2H_')) {
          c.visible = false;
        }
      });
      // Gold Sunglasses (선글라스)
      if (headBone) {
        const glassesGroup = new Group();
        glassesGroup.name = 'Kizaru_Sunglasses';
        const goldMat = new MeshStandardMaterial({ color: 0xffc107, roughness: 0.2, metalness: 0.8 });
        const glassMat = new MeshStandardMaterial({ color: 0xff9800, roughness: 0.1, transparent: true, opacity: 0.8 });

        const lensL = new Mesh(new BoxGeometry(0.13, 0.07, 0.03), glassMat);
        lensL.position.set(-0.11, 0.06, 0.40);
        const lensR = new Mesh(new BoxGeometry(0.13, 0.07, 0.03), glassMat);
        lensR.position.set(0.11, 0.06, 0.40);
        const bridge = new Mesh(new BoxGeometry(0.10, 0.02, 0.02), goldMat);
        bridge.position.set(0, 0.06, 0.40);

        glassesGroup.add(lensL, lensR, bridge);
        glassesGroup.position.set(0, 0.38, 0);
        headBone.add(glassesGroup);
      }
    }

    // 6. 흰수염 (Whitebeard - Barbarian.glb)
    if (heroId === 'boreas') {
      model.traverse((c) => {
        const n = c.name;
        if (n.includes('Axe') || n.includes('Club') || n.includes('1H_') || n.includes('2H_') || n.includes('Shield') || n === 'Barbarian_Hat' || n === 'Barbarian_Cape' || n === 'Mug') {
          c.visible = false;
        }
      });
      // Giant Crescent White Mustache (진짜 흰수염의 초승달 흰 수염)
      if (headBone) {
        const stacheGroup = new Group();
        stacheGroup.name = 'Whitebeard_Mustache';
        const whiteMat = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.05 });
        const bandMat = new MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });

        // Smooth Curved Crescent Torus Arc (유려하게 양 끝이 위로 솟은 흰수염)
        const crescentArc = new Mesh(new TorusGeometry(0.30, 0.022, 12, 32, Math.PI * 0.85), whiteMat);
        crescentArc.rotation.z = Math.PI * 1.0;
        crescentArc.rotation.x = -0.15;
        crescentArc.position.set(0, -0.09, 0.45);

        const bandana = new Mesh(new CylinderGeometry(0.48, 0.50, 0.15, 20), bandMat);
        bandana.position.set(0, 0.28, 0.02);

        stacheGroup.add(crescentArc, bandana);
        stacheGroup.position.set(0, 0.32, 0);
        headBone.add(stacheGroup);
      }
      // Giant Naginata Halberd (최상명검 나기나타)
      if (handR) {
        const woodMat = new MeshStandardMaterial({ color: 0x3e2723, roughness: 0.6 });
        const steelMat = new MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.2, metalness: 0.8 });

        const pole = new Mesh(new CylinderGeometry(0.035, 0.035, 2.0, 10), woodMat);
        pole.position.set(0, 0.4, 0);
        const blade = new Mesh(new BoxGeometry(0.07, 0.7, 0.025), steelMat);
        blade.position.set(0, 1.4, 0);
        pole.add(blade);
        handR.add(pole);
      }
    }

    // 7. 검은수염 (Blackbeard - Soldier.glb)
    if (heroId === 'sera') {
      model.traverse((c) => {
        const n = c.name;
        if (n.includes('Sword') || n.includes('Shield') || n.includes('Spear') || n.includes('1H_') || n.includes('2H_') || n.includes('Helmet')) {
          c.visible = false;
        }
      });
      // Pirate Captain Hat (선장 모자)
      if (headBone) {
        const bbGroup = new Group();
        bbGroup.name = 'Blackbeard_Hat';
        const hatMat = new MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
        const hatCrown = new Mesh(new CylinderGeometry(0.42, 0.48, 0.24, 20), hatMat);
        hatCrown.position.set(0, 0.16, 0);
        const hatBrim = new Mesh(new CylinderGeometry(0.70, 0.75, 0.05, 3), hatMat);
        hatBrim.position.set(0, 0.06, 0);
        hatBrim.rotation.y = Math.PI * 0.17;
        bbGroup.add(hatCrown, hatBrim);
        bbGroup.position.set(0, 0.52, 0);
        headBone.add(bbGroup);
      }
    }

    // 8. 드래곤 (Dragon - Rogue_Hooded.glb)
    if (heroId === 'tesla') {
      model.traverse((c) => {
        const n = c.name;
        if (n.includes('Knife') || n.includes('Crossbow') || n.includes('Throwable') || n.includes('1H_') || n.includes('2H_')) {
          c.visible = false;
        }
      });
    }
  }

  _attachAceAccessories(model) {
    const headBone = model.getObjectByName('head');
    const chestBone = model.getObjectByName('chest');

    model.traverse((child) => {
      const n = child.name;
      if (
        n.includes('Knife') ||
        n.includes('Dagger') ||
        n.includes('Crossbow') ||
        n.includes('Throwable') ||
        n.includes('1H_') ||
        n.includes('2H_') ||
        n.includes('Spellbook') ||
        n === 'Rogue_Cape'
      ) {
        child.visible = false;
      }
    });

    // Ace's Signature Fitted Orange Cowboy Hat (머리에 딱 맞고 멋진 카우보이 모자)
    if (headBone) {
      const hatGroup = new Group();
      hatGroup.name = 'Ace_Hat';

      const hatMat = new MeshStandardMaterial({ color: 0xe65100, roughness: 0.4, metalness: 0.1 });
      const bandMat = new MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
      const badgeSmileMat = new MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.2, emissive: 0x00838f, emissiveIntensity: 0.6 });
      const badgeFrownMat = new MeshStandardMaterial({ color: 0xff1744, roughness: 0.2, emissive: 0xb71c1c, emissiveIntensity: 0.6 });

      const brim = new Mesh(new CylinderGeometry(0.70, 0.76, 0.035, 24), hatMat);
      brim.position.set(0, 0.04, 0);

      const crown = new Mesh(new CylinderGeometry(0.46, 0.50, 0.32, 24), hatMat);
      crown.position.set(0, 0.18, 0);

      const band = new Mesh(new CylinderGeometry(0.50, 0.50, 0.07, 24), bandMat);
      band.position.set(0, 0.07, 0);

      const badgeSmile = new Mesh(new SphereGeometry(0.06, 8, 8), badgeSmileMat);
      badgeSmile.scale.set(1.0, 1.0, 0.35);
      badgeSmile.position.set(-0.16, 0.07, 0.50);

      const badgeFrown = new Mesh(new SphereGeometry(0.06, 8, 8), badgeFrownMat);
      badgeFrown.scale.set(1.0, 1.0, 0.35);
      badgeFrown.position.set(0.16, 0.07, 0.50);

      hatGroup.add(brim, crown, band, badgeSmile, badgeFrown);
      hatGroup.position.set(0, 0.50, 0.02);
      hatGroup.rotation.x = 0.04;

      hatGroup.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          node.layers.set(LAYER.WORLD);
          node.layers.enable(LAYER.CONTACT);
        }
      });

      headBone.add(hatGroup);
    }

    // 3. Red Beaded Necklace (붉은 염주 목걸이)
    if (chestBone) {
      const neckGroup = new Group();
      neckGroup.name = 'Ace_Necklace';
      const beadMat = new MeshStandardMaterial({ color: 0xd50000, roughness: 0.2, metalness: 0.3 });

      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const bead = new Mesh(new SphereGeometry(0.045, 8, 8), beadMat);
        bead.position.set(Math.cos(angle) * 0.26, 0.16, Math.sin(angle) * 0.22 + 0.06);
        neckGroup.add(bead);
      }
      neckGroup.position.set(0, 0.18, 0);

      neckGroup.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          node.layers.set(LAYER.WORLD);
          node.layers.enable(LAYER.CONTACT);
        }
      });

      chestBone.add(neckGroup);
    }
  }

  dispose() {
    this.mixer?.stopAllAction();
    this.mixer = null;
    this.actions.clear();
  }
}
