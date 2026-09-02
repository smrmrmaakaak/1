import {
  Group,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  TorusGeometry,
  MeshStandardMaterial,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { randRange } from '../utils/math.js';

const _emit = {};

/**
 * [Whitebeard T / Ultimate] 일기당천 (一騎當千 - Heaven Splitter / 공간 파쇄 대붕괴)
 * 대기와 하늘 전체를 산산조각 내는 거대 패왕색 공간 파쇄 격타로 전장 전체의 지각을 붕괴시키는 최종 파멸 궁극기.
 */
export class HeavenSplitterAbility extends Ability {
  constructor(context) {
    super('gigantic_megalith', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.splitterGroup = new Group();
    this.splitterGroup.matrixAutoUpdate = true;

    // Pure Radiant Space Shatter White Material
    this.pureWhiteMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 10.0,
      roughness: 0.0
    });

    // Dark Conqueror Haki Red-Black Material
    this.darkHakiMat = new MeshStandardMaterial({
      color: 0x260000,
      emissive: 0xdc2626,
      emissiveIntensity: 8.0,
      wireframe: true
    });

    // 24 Massive Sky-Ripping Shatter Glass Planes
    this.fractures = [];
    for (let i = 0; i < 24; i++) {
      const frac = new Mesh(new BoxGeometry(randRange(0.2, 0.4), randRange(6.0, 16.0), randRange(1.0, 3.5)), this.pureWhiteMat);
      frac.position.set(randRange(-10, 10), randRange(4, 18), randRange(-10, 10));
      frac.rotation.set(randRange(-0.8, 0.8), randRange(-0.8, 0.8), randRange(-1.5, 1.5));
      this.splitterGroup.add(frac);
      this.fractures.push(frac);
    }

    // 4 Expanding Cataclysmic Shock Spheres
    this.shockSpheres = [];
    for (let i = 0; i < 4; i++) {
      const sphere = new Mesh(new SphereGeometry(5.0 + i * 4.0, 16, 16), this.darkHakiMat);
      this.splitterGroup.add(sphere);
      this.shockSpheres.push(sphere);
    }

    setLayerRecursive(this.splitterGroup, LAYER.VFX);
    this.group.add(this.splitterGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.hakiSparks = particles.get('quake.shards', {
      capacity: 6500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.1
    });

    this.cataclysmSmoke = particles.get('earth.dust', {
      capacity: 4000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.0
    });
  }

  get impactDuration() {
    return 2.0;
  }

  get fadeDuration() {
    return 1.0;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.splitterGroup.position.copy(this.targetPos);
    this.splitterGroup.visible = true;

    this.pureWhiteMat.emissiveIntensity = 10.0;
    this.darkHakiMat.emissiveIntensity = 8.0;

    this.ctx.flash.trigger(1.0);
    this.ctx.shake.rumble(1.5, 0.9);
    this.ctx.lights.point(this.targetPos.x, 5.0, this.targetPos.z, '#ffffff', 25.0, 60.0, 2.0);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 24.0, DecalType.CRACK, 7.5);
    this.ctx.bursts.trigger(this.targetPos, 28.0, BurstMode.AIR, 1.2, '#ffffff');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Expanding cataclysmic spheres
    this.shockSpheres.forEach((s, idx) => {
      const scale = 1.0 + p * (5.0 + idx * 3.0);
      s.scale.set(scale, scale, scale);
      s.rotation.y += dt * (3.0 + idx);
      s.rotation.z += dt * (2.0 - idx);
    });

    // Vibrating space fractures tearing the sky apart
    this.fractures.forEach((f, idx) => {
      f.position.x += Math.sin(this.age * 60.0 + idx) * 0.08;
      f.position.y += Math.cos(this.age * 60.0 + idx) * 0.08;
      f.scale.setScalar(1.0 + p * 1.5);
    });

    // Intense Conqueror's red-black sparks
    if (this.hakiSparks && Math.random() < 0.95) {
      for (let i = 0; i < 6; i++) {
        _emit.position = this.targetPos.clone().add(new Vector3(randRange(-12, 12), randRange(1, 16), randRange(-12, 12)));
        _emit.velocity = new Vector3(randRange(-12, 12), randRange(-4, 12), randRange(-12, 12));
        _emit.size = randRange(0.5, 1.2);
        _emit.lifetime = randRange(0.2, 0.6);
        _emit.color = Math.random() < 0.5 ? '#ef4444' : '#ffffff';
        this.hakiSparks.emit(1, _emit);
      }
    }

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.pureWhiteMat.emissiveIntensity = 10.0 * fade;
      this.darkHakiMat.emissiveIntensity = 8.0 * fade;
    }
  }

  onDestroy() {
    this.splitterGroup.visible = false;
  }
}
