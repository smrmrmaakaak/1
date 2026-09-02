import {
  Group,
  Mesh,
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
import { randRange, lerp } from '../utils/math.js';

const _emit = {};
const _pos = new Vector3();

/**
 * [Enel T / Ultimate] 뇌영 (雷迎 - Raigo / 2억 볼트 뇌신 거대 번개 구체)
 * 하늘에 14m 급의 암흑 뇌운 번개 구체를 소환하여 지상으로 투하하는 섬 파괴급 초광역 뇌격 궁극기.
 */
export class RaigoAbility extends Ability {
  constructor(context) {
    super('thunder_judgment', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.raigoGroup = new Group();
    this.raigoGroup.matrixAutoUpdate = true;

    // Dark Thundercloud Material
    this.coreMat = new MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0284c7,
      emissiveIntensity: 4.5,
      roughness: 0.3
    });

    // Lightning Arc Outer Lattice
    this.arcMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 8.0,
      wireframe: true
    });

    this.ringMat = new MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0x38bdf8,
      emissiveIntensity: 6.0,
      roughness: 0.1
    });

    // Giant 14m Raigo Sphere
    this.coreSphere = new Mesh(new SphereGeometry(7.0, 24, 24), this.coreMat);
    this.arcSphere = new Mesh(new SphereGeometry(7.4, 16, 16), this.arcMat);
    this.raigoGroup.add(this.coreSphere, this.arcSphere);

    // 3 Spinning Lightning Rings
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new Mesh(new TorusGeometry(8.2 + i * 1.2, 0.35, 8, 36), this.ringMat);
      ring.rotation.x = (i * Math.PI) / 3;
      this.raigoGroup.add(ring);
      this.rings.push(ring);
    }

    setLayerRecursive(this.raigoGroup, LAYER.VFX);
    this.group.add(this.raigoGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.lightningSparks = particles.get('thunder.sparks', {
      capacity: 5500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.1
    });

    this.darkSmoke = particles.get('thunder.smoke', {
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
    return 1.0;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.raigoGroup.position.copy(this.targetPos);
    this.raigoGroup.visible = true;

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.rumble(0.8, 0.6);
  }

  onTravel(dt) {
    const u = this.u; // 0..1
    this.pointAt(u, _pos);
    const arcHeight = Math.sin(u * Math.PI) * 5.0 + (1.0 - u) * 20.0;
    _pos.y = Math.max(1.5, arcHeight);

    this.raigoGroup.position.copy(_pos);
    this.raigoGroup.rotation.y += dt * 3.0;
    this.raigoGroup.rotation.z += dt * 2.0;

    this.rings.forEach((r, idx) => {
      r.rotation.x += dt * (3.5 + idx * 2.0);
      r.rotation.y += dt * (2.5 - idx);
    });

    const scale = lerp(0.7, 1.8, u);
    this.raigoGroup.scale.setScalar(scale);

    // Continuous lightning strikes discharging down to the floor
    if (this.lightningSparks && Math.random() < 0.95) {
      for (let i = 0; i < 6; i++) {
        _emit.position = _pos.clone().add(new Vector3(randRange(-5, 5), randRange(-5, 5), randRange(-5, 5)));
        _emit.velocity = new Vector3(randRange(-10, 10), randRange(-12, 4), randRange(-10, 10));
        _emit.size = randRange(0.4, 0.9);
        _emit.lifetime = randRange(0.2, 0.5);
        _emit.color = '#38bdf8';
        this.lightningSparks.emit(1, _emit);
      }
    }
  }

  onImpact() {
    this.raigoGroup.visible = false;
    const impactPos = _pos.copy(this.targetPos).setY(1.0);

    this.ctx.flash.trigger(1.0);
    this.ctx.shake.add(1.8);
    this.ctx.lights.point(impactPos.x, 4.0, impactPos.z, '#38bdf8', 25.0, 50.0, 1.8);
    this.ctx.decals.spawn(impactPos.x, impactPos.z, 18.0, DecalType.ARC, 7.0);
    this.ctx.bursts.trigger(impactPos, 25.0, BurstMode.STORM, 1.2, '#0284c7');
  }

  onDestroy() {
    this.raigoGroup.visible = false;
  }
}
