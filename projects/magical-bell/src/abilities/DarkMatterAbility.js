import {
  Group,
  Mesh,
  SphereGeometry,
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
const _pos = new Vector3();

/**
 * [Blackbeard X] 다크 매터 (闇物質 - Dark Matter / 중력 붕괴 암흑탄)
 * 지면의 잔해와 칠흑의 어둠을 집결시켜 거대한 암흑 탄환을 던져 폭발시키는 스킬.
 */
export class DarkMatterAbility extends Ability {
  constructor(context) {
    super('shadow_grasp', context);
  }

  createShaders() {
    this.matterGroup = new Group();
    this.matterGroup.matrixAutoUpdate = true;

    this.darkMat = new MeshStandardMaterial({
      color: 0x09090b,
      emissive: 0x3b0764,
      emissiveIntensity: 5.5,
      roughness: 0.2
    });

    this.rockMat = new MeshStandardMaterial({
      color: 0x27272a,
      emissive: 0x7e22ce,
      emissiveIntensity: 6.0,
      roughness: 0.8
    });

    // Central Dark Matter Sphere
    this.core = new Mesh(new SphereGeometry(2.2, 16, 16), this.darkMat);
    this.matterGroup.add(this.core);

    // 8 Orbiting Crushed Rocks
    this.rocks = [];
    for (let i = 0; i < 8; i++) {
      const rock = new Mesh(new BoxGeometry(0.8, 0.8, 0.8), this.rockMat);
      this.matterGroup.add(rock);
      this.rocks.push({ mesh: rock, angle: (i * Math.PI * 2) / 8, r: randRange(2.5, 3.5), speed: randRange(6, 12) });
    }

    setLayerRecursive(this.matterGroup, LAYER.VFX);
    this.group.add(this.matterGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.voidSparks = particles.get('void.sparks', {
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
    this.matterGroup.visible = true;

    this.ctx.flash.trigger(0.7);
    this.ctx.shake.add(0.8);
  }

  onTravel(dt) {
    const u = this.u; // 0..1
    this.pointAt(u, _pos);
    const arcHeight = Math.sin(u * Math.PI) * 4.0 + (1.0 - u) * 4.0;
    _pos.y = Math.max(1.0, arcHeight);

    this.matterGroup.position.copy(_pos);
    this.core.rotation.y += dt * 4.0;

    this.rocks.forEach(r => {
      r.angle += dt * r.speed;
      r.mesh.position.set(Math.cos(r.angle) * r.r, Math.sin(r.angle * 1.5) * 0.8, Math.sin(r.angle) * r.r);
      r.mesh.rotation.x += dt * 5.0;
      r.mesh.rotation.y += dt * 4.0;
    });

    if (this.voidSparks && Math.random() < 0.8) {
      _emit.position = _pos;
      _emit.velocity = new Vector3(randRange(-4, 4), randRange(2, 6), randRange(-4, 4));
      _emit.size = randRange(0.3, 0.7);
      _emit.lifetime = randRange(0.2, 0.5);
      _emit.color = '#7e22ce';
      this.voidSparks.emit(1, _emit);
    }
  }

  onImpact() {
    this.matterGroup.visible = false;
    const impactPos = _pos.copy(this.targetPosition).setY(1.0);

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.add(1.3);
    this.ctx.lights.point(impactPos.x, 3.0, impactPos.z, '#7e22ce', 18.0, 36.0, 1.2);
    this.ctx.decals.spawn(impactPos.x, impactPos.z, 11.0, DecalType.SCORCH, 5.5);
    this.ctx.bursts.trigger(impactPos, 14.0, BurstMode.AIR, 0.7, '#3b0764');
  }

  onDestroy() {
    this.matterGroup.visible = false;
  }
}
