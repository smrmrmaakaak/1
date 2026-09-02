import {
  Group,
  Mesh,
  MeshStandardMaterial,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  TorusGeometry,
  AnimationMixer,
  LoopOnce,
  LoopRepeat,
  Vector3,
  Sprite,
  SpriteMaterial,
  CanvasTexture,
  Color
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { LAYER } from '../core/Layers.js';
import { disposeObject } from '../utils/dispose.js';
import { HEROES_DATA } from '../characters/ProceduralHeroFactory.js';
import { lerp } from '../utils/math.js';

const HERO_MODELS = {
  arthur: './models/Mage.glb',
  raiden: './models/Paladin.glb',
  akainu: './models/Knight.glb',
  ignis: './models/Knight.glb',
  ace: './models/Rogue.glb',
  lumina: './models/Ranger.glb',
  tesla: './models/Rogue_Hooded.glb',
  boreas: './models/Barbarian.glb',
  sera: './models/Skeleton_Warrior.glb'
};

const _loader = new GLTFLoader();
_loader.setMeshoptDecoder(MeshoptDecoder);
const _gltfCache = new Map();

async function loadGLTF(path) {
  if (_gltfCache.has(path)) return _gltfCache.get(path);
  const gltf = await _loader.loadAsync(path);
  _gltfCache.set(path, gltf);
  return gltf;
}

export class RemotePlayer {
  constructor(id, data, scene, abilities) {
    this.id = id;
    this.scene = scene;
    this.abilities = abilities;

    this.root = new Group();
    this.root.name = `RemotePlayer_${id}`;
    this.scene.add(this.root);

    this.position = new Vector3(data.x || 0, data.y || 0, data.z || 0);
    this.targetPosition = new Vector3().copy(this.position);
    this.root.position.copy(this.position);

    this.facing = data.facing || 0;
    this.targetFacing = this.facing;
    this.root.rotation.y = this.facing;

    this.heroId = data.heroId || 'akainu';
    this.name = data.name || '동료 모험가';
    this.level = data.level || 1;
    this.hp = data.hp || 100;
    this.maxHp = data.maxHp || 100;
    this.anim = data.anim || 'idle';

    this.mixer = null;
    this.actions = new Map();
    this._currentAction = null;

    // Chat bubble state
    this.chatText = '';
    this.chatTimer = 0;

    // 3D Canvas Nameplate Sprite
    this._initNameplate();

    // Load 3D Model
    this._loadModel(this.heroId);
  }

  _initNameplate() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 256;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new CanvasTexture(this.canvas);
    this.spriteMat = new SpriteMaterial({ map: this.texture, transparent: true, depthWrite: false });
    this.sprite = new Sprite(this.spriteMat);
    this.sprite.position.set(0, 2.7, 0);
    this.sprite.scale.set(3.2, 1.6, 1.0);
    this.sprite.layers.enable(LAYER.WORLD);
    this.sprite.layers.enable(LAYER.VFX);
    this.root.add(this.sprite);

    this._updateNameplate();
  }

  _updateNameplate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 512, 256);

    const heroMeta = HEROES_DATA[this.heroId] || {};
    const title = heroMeta.title || '파티원';
    const color = heroMeta.color || '#ff8800';

    // 1. Speech Bubble (if chatting)
    if (this.chatTimer > 0 && this.chatText) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(40, 20, 432, 70, 16);
      ctx.fill();
      ctx.stroke();

      // Speech bubble arrow
      ctx.beginPath();
      ctx.moveTo(240, 90);
      ctx.lineTo(256, 105);
      ctx.lineTo(272, 90);
      ctx.fill();

      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayText = this.chatText.length > 20 ? this.chatText.slice(0, 19) + '…' : this.chatText;
      ctx.fillText(displayText, 256, 55);
    }

    // 2. Name & Title Badge
    ctx.fillStyle = 'rgba(10, 15, 25, 0.75)';
    ctx.beginPath();
    ctx.roundRect(80, 120, 352, 50, 12);
    ctx.fill();

    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(`[Lv.${this.level}] ${this.name} (${title})`, 256, 152);

    // 3. HP Bar
    const barX = 106;
    const barY = 180;
    const barW = 300;
    const barH = 16;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(barX, barY, barW, barH);

    const hpRatio = Math.max(0, Math.min(1, this.hp / (this.maxHp || 1)));
    ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * hpRatio, barH - 4);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    this.texture.needsUpdate = true;
  }

  showChat(text) {
    this.chatText = text;
    this.chatTimer = 5.0; // Show speech bubble for 5 seconds
    this._updateNameplate();
  }

  async _loadModel(heroId) {
    const modelPath = HERO_MODELS[heroId] || './models/Knight.glb';
    try {
      const gltf = await loadGLTF(modelPath);
      const model = SkeletonUtils.clone(gltf.scene);

      model.traverse((child) => {
        if (child.name === 'Spellbook_open' || child.name === '1H_Wand') {
          child.visible = false;
        }
        if (child.isMesh || child.isSkinnedMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.layers.set(LAYER.WORLD);
          if (child.material) {
            child.material.roughness = 0.45;
            child.material.metalness = 0.15;
          }
        }
      });

      this._attachOnePieceAccessories(model, heroId);

      model.scale.setScalar(1.0);
      this.root.add(model);
      this.model = model;

      this.mixer = new AnimationMixer(model);
      if (gltf.animations) {
        gltf.animations.forEach((clip) => {
          const action = this.mixer.clipAction(clip);
          if (clip.name.includes('Attack') || clip.name.includes('Spellcast') || clip.name.includes('Shoot')) {
            action.setLoop(LoopOnce, 1);
            action.clampWhenFinished = true;
          } else {
            action.setLoop(LoopRepeat, Infinity);
          }
          this.actions.set(clip.name, action);
        });
      }

      this._playBestAction(['Idle', 'Unarmed_Idle', 'Walking_A']);
    } catch (e) {
      console.warn(`[RemotePlayer] Failed to load model for ${heroId}:`, e);
    }
  }

  _attachOnePieceAccessories(model, heroId) {
    const navyCoatMat = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1 });
    const epauletMat = new MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 });
    const capMat = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.1 });

    if (heroId === 'akainu' || heroId === 'ignis' || heroId === 'raiden') {
      const coat = new Mesh(new BoxGeometry(0.72, 1.05, 0.12), navyCoatMat);
      coat.position.set(0, 0.95, -0.22);
      coat.rotation.x = 0.08;
      coat.castShadow = true;
      coat.layers.set(LAYER.WORLD);
      model.add(coat);

      [-0.32, 0.32].forEach((x) => {
        const epaulet = new Mesh(new BoxGeometry(0.18, 0.06, 0.22), epauletMat);
        epaulet.position.set(x, 1.42, -0.05);
        epaulet.layers.set(LAYER.WORLD);
        model.add(epaulet);
      });

      const cap = new Mesh(new CylinderGeometry(0.19, 0.21, 0.14, 16), capMat);
      cap.position.set(0, 1.82, 0.02);
      cap.rotation.x = -0.05;
      cap.layers.set(LAYER.WORLD);
      model.add(cap);
    }
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
    if (!target && this.actions.size > 0) target = this.actions.values().next().value;
    if (!target || target === this._currentAction) return;

    if (this._currentAction) {
      target.reset().play();
      target.crossFadeFrom(this._currentAction, blendDuration, false);
    } else {
      target.reset().play();
    }
    this._currentAction = target;
  }

  updateState(data) {
    if (data.x !== undefined && data.z !== undefined) {
      this.targetPosition.set(data.x, data.y || 0, data.z);
    }
    if (data.facing !== undefined) {
      this.targetFacing = data.facing;
    }
    if (data.hp !== undefined) {
      this.hp = data.hp;
      this.maxHp = data.maxHp || this.maxHp;
      this._updateNameplate();
    }
    if (data.level !== undefined && data.level !== this.level) {
      this.level = data.level;
      this._updateNameplate();
    }
    if (data.anim && data.anim !== this.anim) {
      this.anim = data.anim;
      if (this.anim === 'run') {
        this._playBestAction(['Run', 'Running_A', 'Walking_A']);
      } else if (this.anim === 'idle') {
        this._playBestAction(['Idle', 'Unarmed_Idle']);
      } else if (this.anim.startsWith('cast')) {
        this._playBestAction(['Spellcast_Shoot', 'Spellcast_Raise', '1H_Melee_Attack_Slice_Horizontal']);
      }
    }
  }

  castSpell(spellData) {
    if (!this.abilities) return;
    const origin = new Vector3(spellData.origin.x, spellData.origin.y, spellData.origin.z);
    const direction = new Vector3(spellData.direction.x, spellData.direction.y, spellData.direction.z);
    const distance = spellData.distance || 6.0;
    const element = spellData.element || 'ice';

    this.abilities.cast(origin, direction, distance, element);
    this._playBestAction(['Spellcast_Shoot', 'Spellcast_Raise', '1H_Melee_Attack_Slice_Horizontal'], 0.05);
  }

  update(dt) {
    // Smooth position interpolation
    this.position.lerp(this.targetPosition, Math.min(1.0, dt * 12.0));
    this.root.position.copy(this.position);

    // Smooth rotation interpolation
    let diff = this.targetFacing - this.facing;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.facing += diff * Math.min(1.0, dt * 14.0);
    this.root.rotation.y = this.facing;

    // Animation mixer
    if (this.mixer) this.mixer.update(dt);

    // Chat bubble timer
    if (this.chatTimer > 0) {
      this.chatTimer -= dt;
      if (this.chatTimer <= 0) {
        this.chatText = '';
        this._updateNameplate();
      }
    }
  }

  destroy() {
    if (this.root && this.scene) {
      this.scene.remove(this.root);
      disposeObject(this.root);
    }
    if (this.texture) this.texture.dispose();
    if (this.spriteMat) this.spriteMat.dispose();
  }
}
