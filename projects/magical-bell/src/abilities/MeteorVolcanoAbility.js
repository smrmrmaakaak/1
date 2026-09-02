import {
  Group,
  Mesh,
  InstancedMesh,
  InstancedBufferAttribute,
  Object3D,
  Quaternion,
  CylinderGeometry,
  MeshStandardMaterial,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { createMeteorMaterial } from '../materials/MeteorMaterial.js';
import { createAsteroidGeometry } from '../assets/ProceduralGeometry.js';
import { createLiquidLavaMaterial } from '../materials/LiquidLavaMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER } from '../core/Layers.js';
import { randRange, saturate, lerp } from '../utils/math.js';

const _emit = {};
const _dummy = new Object3D();
const _spin = new Quaternion();
const _heading = new Vector3(0, -1, 0);
const METEOR_COUNT = 30;
const SKY_HEIGHT = 30.0;

/**
 * [Akainu T / Ultimate] 유성 화산 (流星火山 - Meteor Volcano)
 * 1. E 스킬(신더 폴/명구)과 100% 동일한 고화질 3D 마그마 암석(createAsteroidGeometry + createMeteorMaterial) 및 타오르는 마그마 균열 셰이더를
 *    '하늘로 솟구쳐 올라갈 때'와 '하늘에서 떨어질 때' 양쪽 모두에 완벽 적용.
 * 2. 3D 입체 두께(두께 0.45m)를 가진 볼륨형 액체 용암 분화구 및 화산암 테두리(Basalt Rim) 생성 (Z-Index 및 RenderOrder 9999로 지면 파묻힘 완전 해결).
 * 3. 시전 시 캐릭터의 몸에서 30발의 정품 3D 마그마 암석 유성탄이 0.065초 간격으로 상공(Y=30m)을 향해 불꽃을 뿜으며 솟구쳐 오름.
 * 4. 상공에 도달한 30발의 거대 마그마 유성탄이 캐릭터 주변 반경 14m 내의 랜덤 지면 좌표로 고속 강하(포물선/사선 낙하).
 * 5. 지면 착탄 시 30회 연쇄 대폭발을 일으키며, 각 착탄 지점에 10초 동안 지속되는 끓어오르는 용암 분화구 장판 생성 (DoT 피해).
 */
export class MeteorVolcanoAbility extends Ability {
  constructor(context) {
    super('inferno', context);
    this.centerPos = new Vector3();
    this.group.matrixAutoUpdate = true;
  }

  createShaders() {
    this.group.layers.enable(LAYER.WORLD);
    this.group.layers.enable(LAYER.VFX);

    // 1. Exact E-Skill Meteor Material & Procedural Asteroid Geometry
    this.meteorMaterial = createMeteorMaterial(this.ctx.environment);
    this.meteorGeometry = createAsteroidGeometry({
      seed: 11.7,
      detail: 3,
      lumpiness: 0.32,
      noiseScale: 1.8,
      roughness: 0.22,
      cuts: 12,
      cutDepth: 0.35,
      craters: 8,
      craterDepth: 0.25,
      craterSize: 0.6
    });

    this.seeds = new InstancedBufferAttribute(new Float32Array(METEOR_COUNT), 1);
    this.heats = new InstancedBufferAttribute(new Float32Array(METEOR_COUNT), 1);
    for (let i = 0; i < METEOR_COUNT; i++) {
      this.seeds.array[i] = Math.random() * 10;
      this.heats.array[i] = 1.0;
    }
    this.meteorGeometry.setAttribute('aSeed', this.seeds);
    this.meteorGeometry.setAttribute('aHeat', this.heats);

    this.meteorRocks = new InstancedMesh(this.meteorGeometry, this.meteorMaterial, METEOR_COUNT);
    this.meteorRocks.castShadow = true;
    this.meteorRocks.receiveShadow = true;
    this.meteorRocks.frustumCulled = false;
    this.meteorRocks.layers.set(LAYER.WORLD);
    this.meteorRocks.renderOrder = 2;
    this.group.add(this.meteorRocks);

    // 2. Thick 3D Volumetric Liquid Lava Craters & Basalt Crust Rims
    this.craterMaterial = createLiquidLavaMaterial();
    this.rimMaterial = new MeshStandardMaterial({
      color: 0x140502,
      emissive: 0x550a00,
      emissiveIntensity: 0.6,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true
    });

    this.meteors = [];

    for (let i = 0; i < METEOR_COUNT; i++) {
      const craterGroup = new Group();
      craterGroup.matrixAutoUpdate = true;
      craterGroup.visible = false;

      // Raised 3D Liquid Magma Cylinder (0.45m thick!)
      const lavaGeo = new CylinderGeometry(2.0, 2.3, 0.45, 32);
      const lavaMesh = new Mesh(lavaGeo, this.craterMaterial);
      lavaMesh.position.set(0, 0.22, 0);
      lavaMesh.layers.enable(LAYER.WORLD);
      lavaMesh.layers.enable(LAYER.VFX);
      lavaMesh.renderOrder = 9999;

      // Outer Rocky Basalt Crater Rim
      const rimGeo = new CylinderGeometry(2.35, 2.75, 0.35, 24, 1, true);
      const rimMesh = new Mesh(rimGeo, this.rimMaterial);
      rimMesh.position.set(0, 0.17, 0);
      rimMesh.layers.enable(LAYER.WORLD);
      rimMesh.renderOrder = 9998;

      craterGroup.add(lavaMesh, rimMesh);
      this.group.add(craterGroup);

      const p = Math.acos(randRange(-1, 1));
      const a = Math.random() * Math.PI * 2;
      const s = Math.sin(p);
      const spinAxis = new Vector3(s * Math.cos(a), Math.cos(p), s * Math.sin(a));

      this.meteors.push({
        index: i,
        craterGroup,
        lavaMesh,
        spinAxis,
        spinRate: randRange(4.0, 8.0),
        rockScale: randRange(2.2, 3.4), // 4.4m ~ 6.8m colossal E-skill asteroids
        craterRadius: randRange(1.6, 2.4),
        launchTime: i * 0.065, // 0.0s ~ 1.95s
        riseDuration: 0.45,
        fallDuration: 0.65,
        riseStart: new Vector3(),
        skyApex: new Vector3(),
        landPos: new Vector3(),
        hasRisen: false,
        hasImpacted: false
      });
    }

    this.group.traverse((node) => {
      node.layers.enable(LAYER.WORLD);
      node.layers.enable(LAYER.VFX);
    });
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.volcanoSparks = particles.get('meteor.sparks', {
      capacity: 12000,
      shape: ParticleShape.STREAK,
      additive: true,
      stretch: true,
      softFade: 0.25
    });

    this.volcanoEmbers = particles.get('meteor.embers', {
      capacity: 15000,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.4
    });

    this.volcanoSmoke = particles.get('meteor.smoke', {
      capacity: 10000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.2
    });
  }

  get impactDuration() {
    return 10.0;
  }

  get fadeDuration() {
    return 2.0;
  }

  onSpawn() {
    this.centerPos.copy(this.origin);

    this.group.position.set(0, 0, 0);
    this.group.visible = true;

    this.group.traverse((node) => {
      node.layers.enable(LAYER.WORLD);
      node.layers.enable(LAYER.VFX);
    });

    if (this.craterMaterial?.uniforms?.uOpacity) {
      this.craterMaterial.uniforms.uOpacity.value = 1.0;
    }

    // Hide all meteor rock instances initially
    _dummy.position.set(0, -999, 0);
    _dummy.scale.set(0, 0, 0);
    _dummy.updateMatrix();
    for (let i = 0; i < METEOR_COUNT; i++) {
      this.meteorRocks.setMatrixAt(i, _dummy.matrix);
      this.heats.array[i] = 1.0;
    }
    this.meteorRocks.instanceMatrix.needsUpdate = true;
    this.heats.needsUpdate = true;

    this.meteors.forEach((m) => {
      m.hasRisen = false;
      m.hasImpacted = false;
      m.craterGroup.visible = false;

      // 1. Launch from caster's body (Chest / Hands)
      const handSide = (m.index % 2 === 0 ? 1 : -1) * 0.65;
      m.riseStart.set(
        this.centerPos.x + handSide + randRange(-0.25, 0.25),
        1.4,
        this.centerPos.z + randRange(-0.25, 0.25)
      );

      // 2. High Sky Apex (Y = 28m ~ 34m) with upward spread
      m.skyApex.set(
        m.riseStart.x + randRange(-4.0, 4.0),
        SKY_HEIGHT + randRange(-2.0, 4.0),
        m.riseStart.z + randRange(-4.0, 4.0)
      );

      // 3. COMPLETELY RANDOM landing ground coordinate across 14m radius battlefield
      const angle = Math.random() * Math.PI * 2;
      const dist = randRange(2.5, 14.5);
      m.landPos.set(
        this.centerPos.x + Math.cos(angle) * dist,
        0.52, // Proud elevation at Y=0.52m to eliminate clipping/z-fighting
        this.centerPos.z + Math.sin(angle) * dist
      );
    });

    this.ctx.flash?.trigger(0.15);
    this.ctx.shake?.rumble(1.5, 1.2);
    this.ctx.lights?.point?.(this.centerPos.x, 2.0, this.centerPos.z, '#ff4400', 3.0, 10.0, 1.0);
  }

  onTravel(dt) {
    this._tickVolcano(dt);
  }

  onImpact() {
    this._tickVolcano(0);
  }

  onFade(dt, t) {
    this._tickVolcano(dt);

    const fade = 1.0 - saturate(t > 1 ? t - 1 : 0);
    if (this.craterMaterial?.uniforms?.uOpacity) {
      this.craterMaterial.uniforms.uOpacity.value = fade;
    }
  }

  update(dt) {
    super.update(dt);
    this._tickVolcano(dt);
  }

  _tickVolcano(dt) {
    // Sync E-Skill Meteor Material Shader uniforms
    if (this.meteorMaterial?.userData?.sync) {
      _heading.set(0, -1, 0);
      this.meteorMaterial.userData.sync(1.0, _heading);
    }

    let matrixNeedsUpdate = false;

    for (let i = 0; i < this.meteors.length; i++) {
      const m = this.meteors[i];

      // =========================================================================
      // PHASE 1: Rising straight up into the clouds WITH EXACT E-SKILL 3D ASTEROID ROCK!
      // =========================================================================
      const timeSinceLaunch = this.age - m.launchTime;

      if (timeSinceLaunch >= 0 && timeSinceLaunch < m.riseDuration && !m.hasRisen) {
        const riseT = saturate(timeSinceLaunch / m.riseDuration);
        const easeRise = 1.0 - Math.pow(1.0 - riseT, 2.0); // Fast explosive rocket launch up

        const curX = lerp(m.riseStart.x, m.skyApex.x, riseT);
        const curZ = lerp(m.riseStart.z, m.skyApex.z, riseT);
        const curY = lerp(m.riseStart.y, m.skyApex.y, easeRise);

        // Update InstancedMesh Matrix - EXACT E-SKILL 3D ASTEROID ROCK RISING!
        _dummy.position.set(curX, curY, curZ);
        _spin.setFromAxisAngle(m.spinAxis, this.age * m.spinRate);
        _dummy.quaternion.copy(_spin);
        _dummy.scale.setScalar(m.rockScale * 0.95);
        _dummy.updateMatrix();

        this.meteorRocks.setMatrixAt(i, _dummy.matrix);
        this.heats.array[i] = 1.0; // Glowing hot incandescent magma seams!
        matrixNeedsUpdate = true;

        // Upward rocket launch flame trail & sparks below the rising meteor
        if (this.volcanoSparks && Math.random() < 0.95) {
          _emit.position = new Vector3(curX, curY - 0.6, curZ);
          _emit.velocity = new Vector3(randRange(-2, 2), randRange(-12, -4), randRange(-2, 2));
          _emit.size = randRange(0.4, 0.85);
          _emit.lifetime = randRange(0.2, 0.4);
          _emit.color = '#ff5500';
          this.volcanoSparks.emit(1, _emit);
        }

        if (this.volcanoEmbers && Math.random() < 0.85) {
          _emit.position = new Vector3(curX, curY - 0.8, curZ);
          _emit.velocity = new Vector3(randRange(-1.5, 1.5), randRange(-6, -1), randRange(-1.5, 1.5));
          _emit.size = randRange(0.35, 0.65);
          _emit.lifetime = randRange(0.3, 0.5);
          _emit.color = '#ff9900';
          this.volcanoEmbers.emit(1, _emit);
        }
      }

      // =========================================================================
      // PHASE 2: Plunging down WITH EXACT E-Skill 3D Asteroid & Glowing Lava Cracks!
      // =========================================================================
      const fallStartTime = m.launchTime + m.riseDuration;
      const timeSinceFall = this.age - fallStartTime;

      if (timeSinceFall >= 0 && timeSinceFall < m.fallDuration && !m.hasImpacted) {
        m.hasRisen = true;
        const fallT = saturate(timeSinceFall / m.fallDuration);
        const easeFall = fallT * fallT; // Downward gravity acceleration

        const curX = lerp(m.skyApex.x, m.landPos.x, fallT);
        const curZ = lerp(m.skyApex.z, m.landPos.z, fallT);
        const curY = lerp(m.skyApex.y, m.landPos.y, easeFall);

        // Update InstancedMesh Matrix - EXACT E-SKILL 3D ASTEROID ROCK FALLING!
        _dummy.position.set(curX, curY, curZ);
        _spin.setFromAxisAngle(m.spinAxis, this.age * m.spinRate);
        _dummy.quaternion.copy(_spin);
        _dummy.scale.setScalar(m.rockScale);
        _dummy.updateMatrix();

        this.meteorRocks.setMatrixAt(i, _dummy.matrix);
        this.heats.array[i] = saturate(0.75 + fallT * 0.25); // Maximum incandescent white/orange heat
        matrixNeedsUpdate = true;

        // Blazing flying falling trail (Embers & Sparks behind the rock)
        if (this.volcanoSparks && Math.random() < 0.95) {
          _emit.position = new Vector3(curX, curY + 0.8, curZ);
          _emit.velocity = new Vector3(randRange(-3, 3), randRange(4, 12), randRange(-3, 3));
          _emit.size = randRange(0.5, 0.9);
          _emit.lifetime = randRange(0.25, 0.45);
          _emit.color = Math.random() < 0.6 ? '#ff4400' : '#fff0aa';
          this.volcanoSparks.emit(1, _emit);
        }

        if (this.volcanoEmbers && Math.random() < 0.9) {
          _emit.position = new Vector3(curX, curY + 1.2, curZ);
          _emit.velocity = new Vector3(randRange(-2, 2), randRange(2, 6), randRange(-2, 2));
          _emit.size = randRange(0.4, 0.7);
          _emit.lifetime = randRange(0.3, 0.6);
          _emit.color = '#ff8800';
          this.volcanoEmbers.emit(1, _emit);
        }
      }

      // =========================================================================
      // PHASE 3: Ground Impact Detonation & 10s Thick 3D Molten Lava Crater
      // =========================================================================
      if (timeSinceFall >= m.fallDuration && !m.hasImpacted) {
        m.hasImpacted = true;

        // Hide rock instance on impact
        _dummy.position.set(0, -999, 0);
        _dummy.scale.set(0, 0, 0);
        _dummy.updateMatrix();
        this.meteorRocks.setMatrixAt(i, _dummy.matrix);
        matrixNeedsUpdate = true;

        // Activate 10-Second 3D Volumetric Crater Group
        m.craterGroup.position.copy(m.landPos);
        m.craterGroup.scale.set(m.craterRadius, 1.0, m.craterRadius);
        m.craterGroup.visible = true;

        // Impact Explosion FX
        this.ctx.shake?.add(0.35);
        this.ctx.lights?.point?.(m.landPos.x, 1.5, m.landPos.z, '#ff4400', 2.5, 8.0, 0.6);
        this.ctx.decals?.spawn?.(DecalType.CRACK, m.landPos, { radius: m.craterRadius * 2.2, life: 10.0 });
        this.ctx.bursts?.trigger?.(m.landPos, m.craterRadius * 2.5, BurstMode.FIRE, 0.6, '#ff3700');

        // Refraction Shockwave & Heat Haze & 3D Basalt Debris
        this.ctx.shockwaves?.spawnShockwave(m.landPos, m.craterRadius * 2.2, 0.55, 1.4);
        this.ctx.shockwaves?.spawnHeatHaze(m.landPos, m.craterRadius * 1.3, 10.0);
        this.ctx.rockDebris?.spawnExplosion(m.landPos, 8, 11.0, 0x661100);

        // Flying Volcanic Debris & Sparks
        if (this.volcanoSparks) {
          for (let k = 0; k < 12; k++) {
            _emit.position = m.landPos.clone().add(new Vector3(0, 0.4, 0));
            _emit.velocity = new Vector3(randRange(-9, 9), randRange(6, 16), randRange(-9, 9));
            _emit.size = randRange(0.35, 0.75);
            _emit.lifetime = randRange(0.35, 0.65);
            _emit.color = '#ff5500';
            this.volcanoSparks.emit(1, _emit);
          }
        }

        if (this.volcanoSmoke) {
          for (let k = 0; k < 4; k++) {
            _emit.position = m.landPos.clone().add(new Vector3(0, 0.5, 0));
            _emit.velocity = new Vector3(randRange(-1.5, 1.5), randRange(2.5, 5.5), randRange(-1.5, 1.5));
            _emit.size = randRange(2.0, 3.8);
            _emit.lifetime = randRange(1.2, 2.0);
            _emit.color = '#140503';
            this.volcanoSmoke.emit(1, _emit);
          }
        }
      }

      // Continuous 10-Second Boiling Molten Lava Pool Bubbles & Sparks
      if (m.hasImpacted && m.craterGroup.visible) {
        if (this.volcanoSparks && Math.random() < 0.18) {
          const randAngle = Math.random() * Math.PI * 2;
          const randR = Math.random() * (m.craterRadius * 1.5);
          _emit.position = m.landPos.clone().add(new Vector3(
            Math.cos(randAngle) * randR,
            0.45,
            Math.sin(randAngle) * randR
          ));
          _emit.velocity = new Vector3(0, randRange(1.0, 3.0), 0);
          _emit.size = randRange(0.2, 0.4);
          _emit.lifetime = randRange(0.2, 0.45);
          _emit.color = '#ff6a00';
          this.volcanoSparks.emit(1, _emit);
        }
      }
    }

    if (matrixNeedsUpdate) {
      this.meteorRocks.instanceMatrix.needsUpdate = true;
      this.heats.needsUpdate = true;
    }
  }

  onDestroy() {
    this.meteors.forEach((m) => {
      m.craterGroup.visible = false;
    });

    _dummy.position.set(0, -999, 0);
    _dummy.scale.set(0, 0, 0);
    _dummy.updateMatrix();
    for (let i = 0; i < METEOR_COUNT; i++) {
      this.meteorRocks.setMatrixAt(i, _dummy.matrix);
    }
    this.meteorRocks.instanceMatrix.needsUpdate = true;
  }
}
