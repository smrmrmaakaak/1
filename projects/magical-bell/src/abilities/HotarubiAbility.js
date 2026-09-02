import {
  Group,
  Mesh,
  SphereGeometry,
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
 * [Ace X] 형화 화달마 (螢火 火達磨 - Hotarubi Hidaruma)
 * 수십 개의 녹황색 반딧불 도깨비불을 소환하여 적에게 쇄도시키고 일제히 화염으로 폭발시키는 원작 시그니처기.
 */
export class HotarubiAbility extends Ability {
  constructor(context) {
    super('cross_fire', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.fireflyGroup = new Group();
    this.fireflyGroup.matrixAutoUpdate = true;
    this.fireflies = [];

    this.fireflyMat = new MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0x84cc16,
      emissiveIntensity: 6.0,
      roughness: 0.1
    });

    // 24 Glowing Fireflies (Hotarubi)
    for (let i = 0; i < 24; i++) {
      const fly = new Mesh(new SphereGeometry(0.35, 12, 12), this.fireflyMat);
      this.fireflyGroup.add(fly);
      this.fireflies.push({
        mesh: fly,
        offset: new Vector3(randRange(-3, 3), randRange(1, 3.5), randRange(-3, 3)),
        wobbleSpeed: randRange(8, 16)
      });
    }

    setLayerRecursive(this.fireflyGroup, LAYER.VFX);
    this.group.add(this.fireflyGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.sparks = particles.get('fire.sparks', {
      capacity: 3500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.15
    });
  }

  get impactDuration() {
    return 1.3;
  }

  get fadeDuration() {
    return 0.5;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.fireflyGroup.visible = true;

    this.fireflies.forEach(f => {
      f.mesh.position.copy(origin).add(f.offset);
    });

    this.ctx.flash.trigger(0.7);
    this.ctx.shake.add(0.6);
  }

  onTravel(dt) {
    const u = this.u; // 0..1
    this.pointAt(u, _pos);

    // Fireflies converge from chaotic cloud into the target point
    this.fireflies.forEach((f, idx) => {
      const startPos = this.origin.clone().add(f.offset);
      const wobble = new Vector3(
        Math.sin(this.age * f.wobbleSpeed + idx) * (1.0 - u) * 2.0,
        Math.cos(this.age * f.wobbleSpeed + idx) * (1.0 - u) * 1.5,
        Math.sin(this.age * f.wobbleSpeed * 0.7 + idx) * (1.0 - u) * 2.0
      );
      f.mesh.position.lerpVectors(startPos, this.targetPos, u).add(wobble);

      // Trailing green/yellow sparks
      if (Math.random() < 0.3) {
        _emit.position = f.mesh.position;
        _emit.velocity = new Vector3(randRange(-1, 1), randRange(1, 4), randRange(-1, 1));
        _emit.size = randRange(0.2, 0.45);
        _emit.lifetime = randRange(0.2, 0.4);
        _emit.color = '#bef264';
        this.sparks.emit(1, _emit);
      }
    });
  }

  onImpact() {
    this.fireflyGroup.visible = false;
    const impactPos = _pos.copy(this.targetPos).setY(1.0);

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.add(1.2);
    this.ctx.lights.point(impactPos.x, 3.0, impactPos.z, '#ff4400', 16.0, 32.0, 1.2);
    this.ctx.decals.spawn(impactPos.x, impactPos.z, 9.0, DecalType.SCORCH, 5.0);
    this.ctx.bursts.trigger(impactPos, 12.0, BurstMode.FIRE, 0.7, '#ff5500');
  }

  onDestroy() {
    this.fireflyGroup.visible = false;
  }
}
