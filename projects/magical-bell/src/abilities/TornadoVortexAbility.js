import {
  Group,
  Mesh,
  CylinderGeometry,
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
 * [Dragon C] 토네이도 볼텍스 (Tornado Vortex / 거대 소용돌이 회오리바람)
 * 전장의 적들을 중심으로 끌어당겨 공중으로 회전시키는 거대한 토네이도를 소환합니다.
 */
export class TornadoVortexAbility extends Ability {
  constructor(context) {
    super('tornado_vortex', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.spirals = [];
    this.tornadoGroup = new Group();

    this.tornadoMat = new MeshStandardMaterial({
      color: 0xa7f3d0,
      emissive: 0x059669,
      emissiveIntensity: 3.5,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2
    });

    // Funnel cone shape (깔때기 형태의 회오리 기둥)
    this.funnel = new Mesh(new CylinderGeometry(3.5, 0.8, 16, 20, 1, true), this.tornadoMat);
    this.funnel.position.y = 8.0;
    this.tornadoGroup.add(this.funnel);

    // Spiraling wind rings
    for (let i = 0; i < 5; i++) {
      const ring = new Mesh(new TorusGeometry(1.0 + i * 0.6, 0.15, 8, 24), this.tornadoMat);
      ring.position.y = 1.0 + i * 3.0;
      ring.rotation.x = Math.PI / 2;
      this.tornadoGroup.add(ring);
      this.spirals.push(ring);
    }

    setLayerRecursive(this.tornadoGroup, LAYER.VFX);
    this.group.add(this.tornadoGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.windSparks = particles.get('wind.tornado', {
      capacity: 4500,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.2
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.tornadoGroup.position.copy(this.targetPos);

    this.tornadoMat.opacity = 0.7;

    this.ctx.shake.add(0.7);
    this.ctx.lights.point(this.targetPos.x, 3.0, this.targetPos.z, '#34d399', 12.0, 22.0, 0.8);
    this.ctx.bursts.trigger(this.targetPos, 7.0, BurstMode.SPHERE, 0.5, '#10b981');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Fast vortex spinning
    this.funnel.rotation.y += dt * 8.0;
    this.spirals.forEach((s, idx) => {
      s.rotation.z += dt * (10.0 + idx * 2.0);
    });

    // Swirling upward particle stream
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const height = randRange(0.5, 14.0);
      const r = 0.8 + (height / 16.0) * 2.8;
      _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, height, Math.sin(angle) * r));
      _emit.velocity = new Vector3(-Math.sin(angle) * 12, randRange(4, 12), Math.cos(angle) * 12);
      _emit.size = randRange(0.25, 0.5);
      _emit.lifetime = randRange(0.3, 0.7);
      _emit.color = '#ecfdf5';
      this.windSparks.emit(_emit);
    }

    if (p > 0.7) {
      const fade = (1.0 - p) / 0.3;
      this.tornadoMat.opacity = 0.7 * fade;
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
