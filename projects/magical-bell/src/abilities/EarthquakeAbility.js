import {
  Group,
  Mesh,
  TorusGeometry,
  RingGeometry,
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
 * [Whitebeard C] 어스퀘이크 (Earthquake / 천지진동 해진 광역 지진파)
 * 지면을 강타하여 3중 지진 충격파와 함께 반경 12미터 내의 모든 지면을 뒤흔듭니다.
 */
export class EarthquakeAbility extends Ability {
  constructor(context) {
    super('earthquake', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.rings = [];
    this.quakeGroup = new Group();

    this.shockMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xa3e635,
      emissiveIntensity: 5.0,
      roughness: 0.2
    });

    // 4 expanding concentric ground rings
    for (let i = 0; i < 4; i++) {
      const ring = new Mesh(new TorusGeometry(1.5, 0.25, 8, 32), this.shockMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.15;
      this.quakeGroup.add(ring);
      this.rings.push(ring);
    }

    setLayerRecursive(this.quakeGroup, LAYER.VFX);
    this.group.add(this.quakeGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.dustParticles = particles.get('earth.dust', {
      capacity: 4000,
      shape: ParticleShape.SMOKE,
      softFade: 0.25
    });
    this.shards = particles.get('earth.shards', {
      capacity: 2000,
      shape: ParticleShape.SPARK,
      softFade: 0.1
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.quakeGroup.position.copy(this.targetPos);

    this.shockMat.emissiveIntensity = 5.0;

    // Huge screen rumble & ground rupture
    this.ctx.shake.add(1.1);
    this.ctx.lights.point(this.targetPos.x, 2.5, this.targetPos.z, '#a3e635', 12.0, 25.0, 1.0);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 9.0, DecalType.CRACK, 6.0);
    this.ctx.bursts.trigger(this.targetPos, 10.0, BurstMode.SPHERE, 0.6, '#bef264');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Expanding shock rings
    this.rings.forEach((r, idx) => {
      const delay = idx * 0.12;
      const ringP = Math.max(0.0, (p - delay) / (1.0 - delay));
      const rad = ringP * (8.0 + idx * 2.5);
      r.scale.set(rad, rad, 1.0);
      r.visible = ringP > 0 && ringP < 0.9;
    });

    // Erupting dust & rock shards
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = randRange(1, 8) * p;
      _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * dist, 0.2, Math.sin(angle) * dist));
      _emit.velocity = new Vector3(randRange(-4, 4), randRange(4, 12), randRange(-4, 4));
      _emit.size = randRange(0.4, 0.9);
      _emit.lifetime = randRange(0.4, 0.8);
      _emit.color = '#84cc16';
      this.shards.emit(_emit);
    }

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.shockMat.emissiveIntensity = 5.0 * fade;
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
