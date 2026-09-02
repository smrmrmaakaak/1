import {
  Group,
  Mesh,
  ConeGeometry,
  BoxGeometry,
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
 * [Whitebeard Q] 어스 스파이크 (Earth Spike / 진동 대지 파쇄 펀치)
 * 대기를 부수는 지진 충격파와 함께 지면을 뚫고 거대한 암석 가시들이 일렬로 솟구칩니다.
 */
export class EarthSpikeAbility extends Ability {
  constructor(context) {
    super('earth_spike', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.spikes = [];
    this.spikeGroup = new Group();

    this.rockMat = new MeshStandardMaterial({
      color: 0x5d4037,
      roughness: 0.85,
      metalness: 0.15
    });

    this.crackMat = new MeshStandardMaterial({
      color: 0xa3e635,
      emissive: 0x84cc16,
      emissiveIntensity: 3.5,
      roughness: 0.2
    });

    // Generate 7 rising rock spikes
    for (let i = 0; i < 7; i++) {
      const rockNode = new Group();
      const cone = new Mesh(new ConeGeometry(0.8 + i * 0.1, 2.5 + i * 0.4, 6), this.rockMat);
      cone.rotation.y = Math.random() * Math.PI;
      cone.rotation.z = randRange(-0.2, 0.2);
      cone.position.y = 1.2;

      const innerGlow = new Mesh(new BoxGeometry(0.3, 1.8, 0.3), this.crackMat);
      innerGlow.position.y = 0.9;

      rockNode.add(cone, innerGlow);
      this.spikeGroup.add(rockNode);
      this.spikes.push(rockNode);
    }

    setLayerRecursive(this.spikeGroup, LAYER.VFX);
    this.group.add(this.spikeGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.dustParticles = particles.get('earth.dust', {
      capacity: 2500,
      shape: ParticleShape.SMOKE,
      softFade: 0.3
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);

    this.spikes.forEach((spike, idx) => {
      const t = (idx + 1) / (this.spikes.length + 1);
      const pos = origin.clone().addScaledVector(direction, distance * t);
      spike.position.set(pos.x, -2.5, pos.z);
    });

    // Screen Shake & Sound
    this.ctx.shake.add(0.6);
    this.ctx.lights.point(this.targetPos.x, 2.0, this.targetPos.z, '#bef264', 8.0, 15.0, 0.6);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 4.0, DecalType.CRACK, 5.0);
    this.ctx.bursts.trigger(this.targetPos, 5.0, BurstMode.SPHERE, 0.4, '#a3e635');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Sequential spike eruption
    this.spikes.forEach((spike, idx) => {
      const spikeStart = idx / this.spikes.length * 0.4;
      const spikeP = Math.min(1.0, Math.max(0.0, (p - spikeStart) / 0.15));

      if (spikeP > 0) {
        spike.position.y = -2.5 + spikeP * 2.5;

        // Dust puff
        if (spikeP < 0.5 && Math.random() < 0.5) {
          _emit.position = spike.position.clone().add(new Vector3(randRange(-0.5, 0.5), 0.2, randRange(-0.5, 0.5)));
          _emit.velocity = new Vector3(randRange(-2, 2), randRange(2, 6), randRange(-2, 2));
          _emit.size = randRange(0.4, 0.8);
          _emit.lifetime = randRange(0.4, 0.8);
          _emit.color = '#8d6e63';
          this.dustParticles.emit(_emit);
        }
      }
    });

    if (p > 0.7) {
      const fade = (1.0 - p) / 0.3;
      this.spikes.forEach(s => s.position.y -= dt * 3.0);
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
