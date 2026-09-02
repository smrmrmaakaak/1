import {
  Group,
  Mesh,
  CylinderGeometry,
  TorusGeometry,
  SphereGeometry,
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
 * [Enel T / Ultimate] 썬더 저지먼트 (Thunder Judgment / 신의 심판 2억 볼트 벼락 기둥)
 * 천상 구름을 뚫고 지상으로 거대한 3D 번개 기둥과 충격파 링이 쏟아져 내립니다.
 */
export class ThunderJudgmentAbility extends Ability {
  constructor(context) {
    super('thunder_judgment', context);
    this.targetPos = new Vector3();
  }

  createShaders() {
    this.pillarGroup = new Group();

    this.coreMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 6.0,
      roughness: 0.1,
      metalness: 0.9
    });

    this.glowMat = new MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 3.5,
      transparent: true,
      opacity: 0.75,
      roughness: 0.2
    });

    // Central Pillar (중심 번개 기둥)
    this.pillar = new Mesh(new CylinderGeometry(1.2, 1.2, 35, 16), this.coreMat);
    this.pillar.position.y = 17.5;
    this.pillarGroup.add(this.pillar);

    // Outer Glow Cylinder
    this.outerPillar = new Mesh(new CylinderGeometry(2.4, 2.4, 35, 16, 1, true), this.glowMat);
    this.outerPillar.position.y = 17.5;
    this.pillarGroup.add(this.outerPillar);

    // Expanding Shockwave Torus Rings
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new Mesh(new TorusGeometry(1.5, 0.2, 10, 24), this.coreMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.2 + i * 0.4;
      this.pillarGroup.add(ring);
      this.rings.push(ring);
    }

    setLayerRecursive(this.pillarGroup, LAYER.VFX);
    this.group.add(this.pillarGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.lightningSparks = particles.get('thunder.sparks', {
      capacity: 3500,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.1
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.pillarGroup.position.copy(this.targetPos);

    this.coreMat.emissiveIntensity = 6.0;
    this.glowMat.opacity = 0.75;
    this.pillar.scale.set(1.0, 1.0, 1.0);

    // Blinding Screen Flash & Heavy Camera Shake
    this.ctx.flash.trigger(0.2);
    this.ctx.shake.add(0.9);
    this.ctx.lights.point(this.targetPos.x, 3.0, this.targetPos.z, '#fef08a', 4.0, 15.0, 1.2);

    // Ground Decals & Explosive Bursts & Shockwaves
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 6.5, DecalType.SCORCH, 6.0);
    this.ctx.bursts.trigger(this.targetPos, 8.0, BurstMode.SPHERE, 0.6, '#fef08a');
    this.ctx.shockwaves?.spawnShockwave(this.targetPos, 18.0, 0.65, 1.8);
    this.ctx.rockDebris?.spawnExplosion(this.targetPos, 12, 16.0, 0xfef08a);
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Expanding rings
    this.rings.forEach((r, idx) => {
      const scale = 1.0 + p * (6.0 + idx * 2.0);
      r.scale.set(scale, scale, 1.0);
    });

    // Intense lightning sparks around the pillar base
    for (let i = 0; i < 6; i++) {
      _emit.position = this.targetPos.clone().add(new Vector3(randRange(-3, 3), randRange(0.2, 4), randRange(-3, 3)));
      _emit.velocity = new Vector3(randRange(-8, 8), randRange(4, 15), randRange(-8, 8));
      _emit.size = randRange(0.25, 0.55);
      _emit.lifetime = randRange(0.3, 0.7);
      _emit.color = '#ffffff';
      this.lightningSparks.emit(_emit);
    }

    if (p > 0.4) {
      const fade = (1.0 - p) / 0.6;
      this.coreMat.emissiveIntensity = 6.0 * fade;
      this.glowMat.opacity = 0.75 * fade;
      this.pillar.scale.set(fade, 1.0, fade);
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
