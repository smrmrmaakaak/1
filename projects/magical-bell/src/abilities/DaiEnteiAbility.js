import {
  Group,
  Mesh,
  SphereGeometry,
  RingGeometry,
  TorusGeometry,
  MeshStandardMaterial,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { createRealFlameMaterial } from '../materials/RealFlameMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, randRange, lerp } from '../utils/math.js';

const _pos = new Vector3();
const _emit = {};

/**
 * [Ace T / Ultimate] 대염계 염제 (大炎戒 炎帝 - Dai Entei)
 * 머리 위로 10m 급의 초대형 태양 화염구를 소환하여 전방에 투하하는 초광역 태양 폭멸 궁극기.
 * - 3배 이상 거대화된 3D 태양 구체 & 다중 회전 코로나 플레어 링
 * - 착탄 후 지면에 7초간 지속되는 거대 화염 잔류 웅덩이 (Burning Ground) 생성
 * - 불길 위에 진입한 모든 적에게 지속 화염 피해 (DoT Area Damage) & 연소 상태이상
 */
export class DaiEnteiAbility extends Ability {
  constructor(context) {
    super('dai_entei', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.group.matrixAutoUpdate = true;
    this.flameMaterial = createRealFlameMaterial({ intensity: 5.5, speed: 6.0, turbulence: 2.5 });

    // 1. Colossal 3X Solar Fire Sphere Group
    this.sunGroup = new Group();
    this.sunGroup.matrixAutoUpdate = true;

    // Giant Core (Radius 9.5)
    const sunGeo = new SphereGeometry(9.5, 32, 32);
    this.sunMesh = new Mesh(sunGeo, this.flameMaterial);
    this.sunGroup.add(this.sunMesh);

    // Inner Radiant Plasma Shell
    this.innerGlowMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffd700,
      emissiveIntensity: 6.0,
      roughness: 0.1
    });
    this.innerMesh = new Mesh(new SphereGeometry(7.5, 24, 24), this.innerGlowMat);
    this.sunGroup.add(this.innerMesh);

    // 3 Rotating Solar Flare Torus Rings
    this.coronaRings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new TorusGeometry(11.0 + i * 1.5, 0.45, 12, 36);
      const ringMesh = new Mesh(ringGeo, this.flameMaterial);
      ringMesh.rotation.x = (i * Math.PI) / 3;
      ringMesh.rotation.y = (i * Math.PI) / 4;
      this.sunGroup.add(ringMesh);
      this.coronaRings.push(ringMesh);
    }

    setLayerRecursive(this.sunGroup, LAYER.VFX);
    this.sunMesh.renderOrder = 15;
    this.group.add(this.sunGroup);

    // 2. Persistent Ground Burning Fire Ring Mesh
    this.burningGroundGroup = new Group();
    this.burningGroundGroup.matrixAutoUpdate = true;

    this.groundLavaMat = new MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff6600,
      emissiveIntensity: 4.5,
      transparent: true,
      opacity: 0.9
    });

    const groundRingGeo = new RingGeometry(0.5, 16.0, 36);
    groundRingGeo.rotateX(-Math.PI / 2);
    this.groundRingMesh = new Mesh(groundRingGeo, this.groundLavaMat);
    this.groundRingMesh.position.y = 0.05;
    this.burningGroundGroup.add(this.groundRingMesh);

    setLayerRecursive(this.burningGroundGroup, LAYER.VFX);
    this.burningGroundGroup.visible = false;
    this.group.add(this.burningGroundGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.solarSparks = particles.get('fire.sparks', {
      capacity: 4500,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.25
    });

    this.solarSmoke = particles.get('fire.smoke', {
      capacity: 3000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 0.8
    });
  }

  get impactDuration() {
    return 1.8;
  }

  get fadeDuration() {
    return 7.0; // 7 seconds burning ground field
  }

  onSpawn() {
    this.sunGroup.visible = true;
    this.burningGroundGroup.visible = false;
    this.group.position.set(0, 0, 0);
    this.hasDetonated = false;
    this.ctx.shake.rumble(0.8, 0.5);
    this.ctx.flash.trigger(getColor('#ffe066'), 0.8);
  }

  onTravel(dt) {
    // Sun descends in a dramatic parabolic arc toward targetPos
    const u = this.u; // 0..1
    this.pointAt(u, _pos);
    // Starts high in the sky (y=16m) and descends to impact
    const arcHeight = Math.sin(u * Math.PI) * 6.0 + (1.0 - u) * 16.0;
    _pos.y = Math.max(2.0, arcHeight);

    this.sunGroup.position.copy(_pos);
    this.sunGroup.rotation.y = this.age * 3.5;
    this.sunGroup.rotation.z = this.age * 2.0;

    this.coronaRings.forEach((r, idx) => {
      r.rotation.x += dt * (2.5 + idx);
      r.rotation.y += dt * (3.0 - idx);
    });

    // Massive 3X scale expansion
    const scale = lerp(0.8, 2.2, u);
    this.sunGroup.scale.setScalar(scale);

    // Continuous coronal mass ejection sparks
    if (this.solarSparks && Math.random() < 0.95) {
      for (let i = 0; i < 5; i++) {
        _emit.position = _pos.clone().add(new Vector3(randRange(-6, 6), randRange(-6, 6), randRange(-6, 6)));
        _emit.velocity = new Vector3(randRange(-8, 8), randRange(-4, 10), randRange(-8, 8));
        _emit.color = getColor('#ffbb00');
        _emit.size = randRange(0.6, 1.4);
        _emit.life = randRange(0.4, 0.9);
        this.solarSparks.emit(1, _emit);
      }
    }
  }

  onImpact() {
    if (this.hasDetonated) return;
    this.hasDetonated = true;
    this.sunGroup.visible = false;

    this.pointAt(1.0, this.targetPos);
    const impactPos = _pos.copy(this.targetPos).setY(1.0);
    const g = settings.global;

    // Enable Burning Ground Field
    this.burningGroundGroup.position.copy(this.targetPos);
    this.burningGroundGroup.visible = true;
    this.groundLavaMat.opacity = 0.95;
    this.groundLavaMat.emissiveIntensity = 5.0;

    // Cataclysmic 28-meter Solar Explosion
    this.ctx.bursts.spawn(BurstMode.FIRE, impactPos, {
      radius: 4.0,
      endRadius: 28.0 * (g?.explosionIntensity || 1.0),
      life: 1.4,
      intensity: 5.0,
      opacity: 0.98,
      colorA: getColor('#ffffff'),
      colorB: getColor('#ff7700'),
      colorC: getColor('#aa0000')
    });

    // Vast Ground Solar Scorch Decal (Radius 18m, Life 7s)
    this.ctx.decals.spawn(DecalType.SCORCH, impactPos, {
      radius: 18.0,
      life: 7.0,
      intensity: 3.0,
      colorA: getColor('#100200'),
      colorB: getColor('#ff4400')
    });

    // 150 Blazing Solar Embers
    if (this.solarSparks) {
      for (let i = 0; i < 150; i++) {
        _emit.position = impactPos;
        _emit.velocity = new Vector3(randRange(-25, 25), randRange(8, 32), randRange(-25, 25));
        _emit.color = getColor(Math.random() < 0.4 ? '#fff088' : Math.random() < 0.8 ? '#ff6600' : '#ff0000');
        _emit.size = randRange(0.6, 1.6);
        _emit.life = randRange(1.0, 2.5);
        this.solarSparks.emit(1, _emit);
      }
    }

    // Volcanic Solar Ash Plumes
    if (this.solarSmoke) {
      for (let i = 0; i < 60; i++) {
        _emit.position = impactPos;
        _emit.velocity = new Vector3(randRange(-15, 15), randRange(6, 18), randRange(-15, 15));
        _emit.color = getColor('#1f0602');
        _emit.size = randRange(3.5, 7.0);
        _emit.life = randRange(1.8, 3.5);
        this.solarSmoke.emit(1, _emit);
      }
    }

    this.ctx.shake.add(1.5 * (g?.cameraShake || 1.0), 1 / 0.9, 45);
    this.ctx.flash.trigger(getColor('#ffffff'), 0.2);
    this.ctx.shockwaves?.spawnShockwave(impactPos, 26.0, 0.75, 1.8);
    this.ctx.shockwaves?.spawnHeatHaze(impactPos, 8.0, 7.0);
    this.ctx.rockDebris?.spawnExplosion(impactPos, 16, 20.0, 0xff4400);
  }

  onFade(dt, t) {
    this.sunGroup.visible = false;

    // Fade out burning ground field across 7 seconds
    if (this.burningGroundGroup.visible) {
      const progress = saturate(this.fadeTime / this.fadeDuration);
      const remaining = 1.0 - progress;
      this.groundLavaMat.opacity = 0.9 * remaining;
      this.groundLavaMat.emissiveIntensity = 4.5 * remaining;
      this.groundRingMesh.rotation.z += dt * 0.5;

      // Continuous rising fire geysers from the burning ground
      if (this.solarSparks && Math.random() < 0.85) {
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = randRange(0.5, 14.0);
          _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, 0.2, Math.sin(angle) * r));
          _emit.velocity = new Vector3(randRange(-1.5, 1.5), randRange(4, 12), randRange(-1.5, 1.5));
          _emit.color = getColor('#ff6600');
          _emit.size = randRange(0.4, 0.9);
          _emit.life = randRange(0.5, 1.2);
          this.solarSparks.emit(1, _emit);
        }
      }
    }
  }

  onDestroy() {
    this.sunGroup.visible = false;
    this.burningGroundGroup.visible = false;
  }

  dispose() {
    this.flameMaterial?.dispose();
    this.innerGlowMat?.dispose();
    this.groundLavaMat?.dispose();
    super.dispose();
  }
}
