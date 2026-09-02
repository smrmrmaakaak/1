import {
  Group,
  Mesh,
  TorusGeometry,
  CylinderGeometry,
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
 * [Dragon X] 사이클론 버스트 (Cyclone Burst / 질풍 돌풍 파동)
 * 전방으로 급팽창하는 돌풍 구체를 발사하여 적들을 밀쳐내고 광역 에어본을 가합니다.
 */
export class CycloneBurstAbility extends Ability {
  constructor(context) {
    super('cyclone_burst', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.rings = [];
    this.burstGroup = new Group();

    this.cycloneMat = new MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 4.5,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1
    });

    // 3 Rotating Cyclone Rings
    for (let i = 0; i < 3; i++) {
      const ring = new Mesh(new TorusGeometry(2.0 + i * 0.5, 0.15, 8, 24), this.cycloneMat);
      ring.rotation.x = Math.PI / 2;
      this.burstGroup.add(ring);
      this.rings.push(ring);
    }

    setLayerRecursive(this.burstGroup, LAYER.VFX);
    this.group.add(this.burstGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.windRibbons = particles.get('wind.burst', {
      capacity: 3500,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.2
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.burstGroup.position.copy(this.targetPos);

    this.cycloneMat.opacity = 0.8;

    this.ctx.shake.add(0.5);
    this.ctx.lights.point(this.targetPos.x, 2.0, this.targetPos.z, '#6ee7b7', 9.0, 18.0, 0.6);
    this.ctx.bursts.trigger(this.targetPos, 6.0, BurstMode.SPHERE, 0.4, '#10b981');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Expanding spinning rings
    this.rings.forEach((r, idx) => {
      r.rotation.z += dt * (6.0 + idx * 3.0);
      r.scale.setScalar(1.0 + p * (4.0 + idx * 2.0));
    });

    // Swirling particles
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = randRange(1, 4) * (1 + p * 2);
      _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, randRange(0.2, 2.5), Math.sin(angle) * r));
      _emit.velocity = new Vector3(-Math.sin(angle) * 8, randRange(2, 6), Math.cos(angle) * 8);
      _emit.size = randRange(0.25, 0.5);
      _emit.lifetime = randRange(0.2, 0.5);
      _emit.color = '#d1fae5';
      this.windRibbons.emit(_emit);
    }

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.cycloneMat.opacity = 0.8 * fade;
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
