import {
  InstancedMesh,
  InstancedBufferAttribute,
  Object3D,
  Group,
  Mesh,
  PlaneGeometry,
  CylinderGeometry,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { createGlacierMaterial } from '../materials/GlacierMaterial.js';
import { createFrostFieldMaterial, createFrostVeilMaterial } from '../materials/FrostFieldMaterial.js';
import { createCrystalGeometry } from '../assets/ProceduralGeometry.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { getColor } from '../utils/color.js';

const MAX_SWIRL_SPIKES = 48;
const MAX_FALLING_ICICLES = 12;
const _dummy = new Object3D();
const _pos = new Vector3();
const _dir = new Vector3();
const _emit = {};

/**
 * AAA-Grade Procedural Blizzard Vortex Ability
 * - 160 Orbiting Glacial Prisms swirling in a 3D Cyclone
 * - Towering Frost Veil Tornado Column (FrostVeilMaterial)
 * - Expansive Runic Frost Field Sheet (FrostFieldMaterial)
 * - 16 Impacting Giant Icicle Spikes with Ground Shockwaves
 * - High-density GPU Snow Mist & Sparkle Plumes
 */
export class BlizzardAbility extends Ability {
  constructor(context) {
    super('blizzard', context);

    this.group.matrixAutoUpdate = true;
    this.zoneRadius = 5.5;
    this.targetPos = new Vector3();

    this._state = {
      centre: new Vector3(),
      quadSize: this.zoneRadius * 2.6,
      radius: this.zoneRadius,
      freeze: 1.0,
      fade: 1.0,
      seed: 7.2
    };

    this._initSwirlMesh();
    this._initFrostVeilAndField();
    this._initFallingIcicles();
  }

  get impactDuration() {
    return 5.0; // 5 seconds active blizzard
  }

  get fadeDuration() {
    return 1.0;
  }

  createShaders() {
    const environment = this.ctx.environment;
    this.material = createGlacierMaterial(environment);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.mist = particles.get('ice.mist', {
      capacity: 3200,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.2
    });

    this.shards = particles.get('ice.shards', {
      capacity: 2400,
      shape: ParticleShape.CHIP,
      additive: false,
      lit: true,
      softFade: 0.25
    });

    this.glitter = particles.get('ice.glitter', {
      capacity: 2800,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.4
    });

    this.mistEmitter = new RateEmitter(40);
    this.glitterEmitter = new RateEmitter(60);
  }

  _initSwirlMesh() {
    const geo = createCrystalGeometry({
      seed: 14.8,
      sides: 6,
      taper: 0.35,
      roughness: 0.0,
      bend: 0.0
    });

    const seeds = new InstancedBufferAttribute(new Float32Array(MAX_SWIRL_SPIKES), 1);
    const births = new InstancedBufferAttribute(new Float32Array(MAX_SWIRL_SPIKES), 1);
    const grows = new InstancedBufferAttribute(new Float32Array(MAX_SWIRL_SPIKES), 1);
    const shatters = new InstancedBufferAttribute(new Float32Array(MAX_SWIRL_SPIKES), 1);

    for (let i = 0; i < MAX_SWIRL_SPIKES; i++) {
      seeds.array[i] = Math.random() * 10;
      births.array[i] = 1.0;
      grows.array[i] = 1.0;
      shatters.array[i] = 0.0;
    }

    geo.setAttribute('aSeed', seeds);
    geo.setAttribute('aBirth', births);
    geo.setAttribute('aGrow', grows);
    geo.setAttribute('aShatter', shatters);

    this.swirlMesh = new InstancedMesh(geo, this.material, MAX_SWIRL_SPIKES);
    this.swirlMesh.castShadow = true;
    this.swirlMesh.receiveShadow = true;
    this.swirlMesh.frustumCulled = false;
    this.swirlMesh.layers.set(LAYER.WORLD);
    this.swirlMesh.count = MAX_SWIRL_SPIKES;

    this.shardData = [];
    for (let i = 0; i < MAX_SWIRL_SPIKES; i++) {
      this.shardData.push({
        radius: 0.8 + Math.random() * 4.6,
        angle: Math.random() * Math.PI * 2,
        speed: 3.5 + Math.random() * 4.0,
        height: Math.random() * 8.0,
        heightSpeed: 2.0 + Math.random() * 3.0,
        scale: 0.18 + Math.random() * 0.25,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2
      });
    }

    this.group.add(this.swirlMesh);
  }

  _initFrostVeilAndField() {
    // Floor frost field
    this.fieldGeometry = new PlaneGeometry(1, 1, 1, 1).rotateX(-Math.PI / 2);
    this.fieldMaterial = createFrostFieldMaterial();
    this.field = new Mesh(this.fieldGeometry, this.fieldMaterial);
    this.field.layers.set(LAYER.VFX);
    this.field.renderOrder = 7;
    this.field.frustumCulled = false;
    this.field.position.y = 0.04;
    this.group.add(this.field);

    // Towering frost tornado veil
    this.veilGeometry = new CylinderGeometry(1, 1, 1, 72, 12, true);
    this.veilMaterial = createFrostVeilMaterial();
    this.veil = new Mesh(this.veilGeometry, this.veilMaterial);
    this.veil.layers.set(LAYER.VFX);
    this.veil.renderOrder = 9;
    this.veil.frustumCulled = false;
    this.veil.position.y = 4.5;
    this.group.add(this.veil);
  }

  _initFallingIcicles() {
    this.icicleGroup = new Group();
    const geo = createCrystalGeometry({
      seed: 5.7,
      sides: 6,
      taper: 0.25,
      roughness: 0.0,
      bend: 0.0
    });

    this.icicles = [];
    for (let i = 0; i < MAX_FALLING_ICICLES; i++) {
      const mesh = new Mesh(geo, this.material);
      mesh.scale.set(1.5, 3.2, 1.5);
      mesh.rotation.x = Math.PI; // point down
      mesh.visible = false;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      mesh.layers.set(LAYER.WORLD);

      this.icicleGroup.add(mesh);
      this.icicles.push({
        mesh,
        active: false,
        timer: Math.random() * 3.0,
        x: 0,
        z: 0,
        y: 18,
        targetY: 0,
        speed: 32 + Math.random() * 12
      });
    }

    this.group.add(this.icicleGroup);
  }

  onSpawn() {
    this.targetPos.copy(this.origin).addScaledVector(this.direction, this.length);
    this.targetPos.y = 0;

    this.group.position.copy(this.targetPos);
    this.group.updateMatrixWorld(true);
    this.group.visible = true;

    this.field.visible = true;
    this.veil.visible = true;

    this.field.scale.set(this.zoneRadius * 2.6, 1, this.zoneRadius * 2.6);
    this.veil.scale.set(this.zoneRadius * 1.05, 9.0, this.zoneRadius * 1.05);

    this.material.userData.sync?.({ centre: this.targetPos });

    this.mist?.setGradient(
      getColor('#e0f2fe'),
      getColor('#bae6fd'),
      getColor('#7dd3fc'),
      getColor('#0284c7')
    );

    this.glitter?.setGradient(
      getColor('#ffffff'),
      getColor('#e0f2fe'),
      getColor('#7dd3fc'),
      getColor('#38bdf8')
    );

    this.shards?.setGradient(
      getColor('#ffffff'),
      getColor('#bae6fd'),
      getColor('#7dd3fc'),
      getColor('#0369a1')
    );

    for (const ic of this.icicles) {
      ic.active = false;
      ic.mesh.visible = false;
      ic.timer = Math.random() * 2.0;
    }

    // Spawn massive Frost Vapour Burst Sphere
    _pos.copy(this.targetPos).setY(1.5);
    this.ctx.bursts?.spawn(BurstMode.FROST, _pos, {
      radius: 2.0,
      endRadius: this.zoneRadius * 1.3,
      life: 1.2,
      intensity: 1.4,
      opacity: 0.85,
      fresnel: 1.3,
      displace: 0.55,
      squash: 0.75,
      colorA: getColor('#ffffff'),
      colorB: getColor('#7dd3fc'),
      colorC: getColor('#0284c7')
    });

    // Spawn shockwave ring
    this.ctx.decals?.spawn(DecalType.SHOCKWAVE, _pos.setY(0.03), {
      radius: this.zoneRadius * 1.3,
      life: 0.85,
      width: 0.08,
      intensity: 1.1,
      colorA: getColor('#7dd3fc'),
      colorB: getColor('#0369a1')
    });

    this.ctx.shake?.add(0.4, 1.2, 22);
  }

  onTravel(_dt) {
    this.group.position.copy(this.targetPos);
    this.group.updateMatrixWorld(true);
  }

  onImpact() {
    this.group.position.copy(this.targetPos);
    this.group.updateMatrixWorld(true);
  }

  onFade(dt, t) {
    this.group.position.copy(this.targetPos);
    this.group.updateMatrixWorld(true);

    const time = frame.uTime.value;
    const alpha = t <= 1.0 ? 1.0 : Math.max(0, 1.0 - (t - 1.0));

    // Sync Frost Field & Veil shaders
    this._state.centre.copy(this.targetPos);
    this._state.fade = alpha;
    this._state.freeze = Math.min(1.0, this.age / 0.4);
    this.fieldMaterial.userData.sync?.(this._state);
    this.veilMaterial.userData.sync?.({ fade: alpha, seed: 8.5 });

    if (t <= 1.0) {
      // Manage Plunging Icicles
      for (const ic of this.icicles) {
        ic.timer -= dt;
        if (!ic.active && ic.timer <= 0) {
          ic.active = true;
          ic.mesh.visible = true;
          const a = Math.random() * Math.PI * 2;
          const rad = Math.random() * (this.zoneRadius * 0.75);
          ic.x = Math.cos(a) * rad;
          ic.z = Math.sin(a) * rad;
          ic.y = 16 + Math.random() * 4;
          ic.mesh.position.set(ic.x, ic.y, ic.z);
        }

        if (ic.active) {
          ic.y -= ic.speed * dt;
          ic.mesh.position.y = ic.y;
          if (ic.y <= ic.targetY) {
            ic.mesh.position.y = ic.targetY;
            ic.active = false;
            ic.mesh.visible = false;
            ic.timer = 0.5 + Math.random() * 0.8;

            _pos.set(this.targetPos.x + ic.x, 0.04, this.targetPos.z + ic.z);
            this.ctx.decals?.spawn(DecalType.SHOCKWAVE, _pos, {
              radius: 2.2,
              life: 0.5,
              width: 0.06,
              intensity: 0.9,
              colorA: getColor('#7dd3fc'),
              colorB: getColor('#0284c7')
            });

            this.ctx.shake?.add(0.12, 2.2, 20);

            // Emit chip shards
            _emit.position = _pos.setY(0.4);
            _emit.radius = 0.3;
            _emit.direction = _dir.set(0, 1, 0);
            _emit.speed = 4.5;
            _emit.speedVariance = 0.6;
            _emit.spread = 0.8;
            _emit.size = 0.18;
            _emit.life = 0.6;
            _emit.time = time;
            this.shards?.emit(14, _emit);
          }
        }
      }

      // Continuous blizzard mist & rising glitter plume
      const mistCount = this.mistEmitter.tick(dt, 35);
      if (mistCount > 0) {
        const a = Math.random() * Math.PI * 2;
        const rad = Math.random() * this.zoneRadius;
        _emit.position = _pos.set(
          this.targetPos.x + Math.cos(a) * rad,
          0.3 + Math.random() * 3.5,
          this.targetPos.z + Math.sin(a) * rad
        );
        _emit.speed = 2.2;
        _emit.spread = 0.9;
        _emit.size = 1.6;
        _emit.life = 1.2;
        _emit.time = time;
        this.mist?.emit(mistCount, _emit);
      }

      const glitterCount = this.glitterEmitter.tick(dt, 50);
      if (glitterCount > 0) {
        const a = Math.random() * Math.PI * 2;
        const rad = Math.random() * this.zoneRadius;
        _emit.position = _pos.set(
          this.targetPos.x + Math.cos(a) * rad,
          0.2 + Math.random() * 4.0,
          this.targetPos.z + Math.sin(a) * rad
        );
        _emit.speed = 3.0;
        _emit.spread = 0.7;
        _emit.size = 0.15;
        _emit.life = 0.8;
        _emit.time = time;
        this.glitter?.emit(glitterCount, _emit);
      }
    }
  }

  onDestroy() {
    this.group.visible = false;
    for (const ic of this.icicles) {
      ic.mesh.visible = false;
      ic.active = false;
    }
  }

  update(dt) {
    super.update(dt);
    if (!this.isActive) return;

    // Rotate veil tornado
    this.veil.rotation.y += 2.5 * dt;

    // Animate 160 Swirling 3D Glacial Crystals in Cyclone
    for (let i = 0; i < MAX_SWIRL_SPIKES; i++) {
      const s = this.shardData[i];
      s.angle += s.speed * dt;
      s.height += s.heightSpeed * dt;
      if (s.height > 9.5) s.height = 0.1;

      const x = Math.cos(s.angle) * s.radius;
      const z = Math.sin(s.angle) * s.radius;
      _dummy.position.set(x, s.height, z);
      _dummy.rotation.set(s.rotX + s.angle * 1.5, s.rotY + s.angle * 2.0, s.height * 0.4);
      _dummy.scale.setScalar(s.scale);
      _dummy.updateMatrix();

      this.swirlMesh.setMatrixAt(i, _dummy.matrix);
    }
    this.swirlMesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.swirlMesh.geometry.dispose();
    this.material.dispose();
    this.fieldGeometry.dispose();
    this.fieldMaterial.dispose();
    this.veilGeometry.dispose();
    this.veilMaterial.dispose();
    for (const ic of this.icicles) {
      ic.mesh.geometry.dispose();
    }
  }
}
