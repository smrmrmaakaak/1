import {
  Group,
  Mesh,
  CylinderGeometry,
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
 * [Akainu T / Ultimate] 헬파이어 카타클리즘 (Hellfire Cataclysm / 유성 화산 초광역 마그마 폭발)
 * 지면에서 거대한 마그마 화산 칼데라가 분출하며 작열하는 용암 암석들이 사방으로 튀어 오릅니다.
 */
export class HellfireAbility extends Ability {
  constructor(context) {
    super('hellfire', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.meteors = [];
    this.volcanoGroup = new Group();

    this.magmaMat = new MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff4500,
      emissiveIntensity: 5.5,
      roughness: 0.2,
      metalness: 0.1
    });

    this.crustMat = new MeshStandardMaterial({
      color: 0x1f140e,
      roughness: 0.9,
      metalness: 0.2
    });

    // Central Magma Core Caldera
    this.core = new Mesh(new CylinderGeometry(5.0, 6.5, 1.2, 24), this.magmaMat);
    this.core.position.y = 0.5;
    this.volcanoGroup.add(this.core);

    // Crust ring around caldera
    this.crustRing = new Mesh(new TorusGeometry(6.5, 0.8, 8, 24), this.crustMat);
    this.crustRing.rotation.x = Math.PI / 2;
    this.crustRing.position.y = 0.4;
    this.volcanoGroup.add(this.crustRing);

    // 8 Erupting Magma Boulders
    for (let i = 0; i < 8; i++) {
      const boulder = new Mesh(new SphereGeometry(0.9, 12, 12), this.magmaMat);
      this.volcanoGroup.add(boulder);
      this.meteors.push({
        mesh: boulder,
        angle: (i / 8) * Math.PI * 2,
        dist: randRange(3, 8),
        peakH: randRange(8, 14),
        hasHit: false
      });
    }

    setLayerRecursive(this.volcanoGroup, LAYER.VFX);
    this.group.add(this.volcanoGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.magmaSparks = particles.get('magma.sparks', {
      capacity: 5000,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.15
    });
    this.ashSmoke = particles.get('magma.ash', {
      capacity: 3500,
      shape: ParticleShape.SMOKE,
      softFade: 0.35
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.volcanoGroup.position.copy(this.targetPos);

    this.magmaMat.emissiveIntensity = 5.5;

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.add(1.3);
    this.ctx.lights.point(this.targetPos.x, 3.5, this.targetPos.z, '#ff4500', 18.0, 35.0, 1.4);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 12.0, DecalType.MAGMA, 8.0);
    this.ctx.bursts.trigger(this.targetPos, 12.0, BurstMode.SPHERE, 0.7, '#ff3300');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Erupting magma boulder arcs
    this.meteors.forEach(m => {
      const arcP = Math.min(1.0, p / 0.6);
      const curDist = m.dist * arcP;
      const curH = Math.sin(arcP * Math.PI) * m.peakH;

      m.mesh.position.set(
        Math.cos(m.angle) * curDist,
        curH + 0.5,
        Math.sin(m.angle) * curDist
      );

      // Trailing sparks & ash
      _emit.position = this.targetPos.clone().add(m.mesh.position);
      _emit.velocity = new Vector3(randRange(-3, 3), randRange(2, 6), randRange(-3, 3));
      _emit.size = randRange(0.3, 0.6);
      _emit.lifetime = randRange(0.2, 0.5);
      _emit.color = '#ffa500';
      this.magmaSparks.emit(_emit);
    });

    // Ash billowing from caldera
    for (let i = 0; i < 4; i++) {
      _emit.position = this.targetPos.clone().add(new Vector3(randRange(-3, 3), 0.5, randRange(-3, 3)));
      _emit.velocity = new Vector3(randRange(-2, 2), randRange(4, 10), randRange(-2, 2));
      _emit.size = randRange(0.8, 1.8);
      _emit.lifetime = randRange(0.6, 1.2);
      _emit.color = '#261c16';
      this.ashSmoke.emit(_emit);
    }

    if (p > 0.7) {
      const fade = (1.0 - p) / 0.3;
      this.magmaMat.emissiveIntensity = 5.5 * fade;
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
