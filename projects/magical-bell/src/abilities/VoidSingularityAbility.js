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
import { randRange } from '../utils/math.js';

const _emit = {};

/**
 * [Blackbeard C] 보이드 싱귤래리티 (Void Singularity / 중력 왜곡 블랙홀)
 * 거대한 중력 특이점을 소환하여 반경 내의 모든 적과 사물을 중심으로 빨아들이며 지속 암흑 피해를 입힙니다.
 */
export class VoidSingularityAbility extends Ability {
  constructor(context) {
    super('void_singularity', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.rings = [];
    this.blackHoleGroup = new Group();

    this.blackHoleMat = new MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.0,
      metalness: 1.0,
      emissive: 0x3b0764,
      emissiveIntensity: 2.0
    });

    this.accretionMat = new MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 5.0,
      transparent: true,
      opacity: 0.85
    });

    // Central Event Horizon Sphere
    this.core = new Mesh(new SphereGeometry(1.6, 32, 32), this.blackHoleMat);
    this.core.position.y = 2.0;
    this.blackHoleGroup.add(this.core);

    // Accretion Disks (강착원반 고리)
    for (let i = 0; i < 4; i++) {
      const ring = new Mesh(new TorusGeometry(2.4 + i * 0.7, 0.12, 10, 32), this.accretionMat);
      ring.position.y = 2.0;
      ring.rotation.x = Math.PI / 3 + i * 0.2;
      this.blackHoleGroup.add(ring);
      this.rings.push(ring);
    }

    setLayerRecursive(this.blackHoleGroup, LAYER.VFX);
    this.group.add(this.blackHoleGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.suctionParticles = particles.get('dark.suction', {
      capacity: 4000,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.2
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.blackHoleGroup.position.copy(this.targetPos);

    this.ctx.shake.add(0.8);
    this.ctx.lights.point(this.targetPos.x, 3.0, this.targetPos.z, '#c084fc', 12.0, 25.0, 1.0);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 8.0, DecalType.SCORCH, 6.0);
    this.ctx.bursts.trigger(this.targetPos, 7.0, BurstMode.SPHERE, 0.5, '#7e22ce');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Rapid spinning accretion disks
    this.rings.forEach((r, idx) => {
      r.rotation.z += dt * (5.0 + idx * 2.0);
      r.rotation.y += dt * 3.0;
    });

    // Inward particle suction stream
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = randRange(3.5, 7.5);
      const start = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, randRange(0.5, 4.0), Math.sin(angle) * r));
      const inwardVel = this.blackHoleGroup.position.clone().add(new Vector3(0, 2, 0)).sub(start).normalize().multiplyScalar(12.0);

      _emit.position = start;
      _emit.velocity = inwardVel;
      _emit.size = randRange(0.2, 0.5);
      _emit.lifetime = randRange(0.3, 0.6);
      _emit.color = '#e9d5ff';
      this.suctionParticles.emit(_emit);
    }

    if (p > 0.75) {
      const collapseP = (1.0 - p) / 0.25;
      this.core.scale.setScalar(collapseP);
      this.rings.forEach(r => r.scale.setScalar(collapseP));
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
