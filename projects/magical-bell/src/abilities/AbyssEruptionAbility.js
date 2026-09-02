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
 * [Blackbeard T / Ultimate] 아비스 이럽션 (Abyss Eruption / 다크니스 리버레이션)
 * 심연 차원문을 개방하여 칠흑의 공허 폭풍과 원혼들을 솟구치게 만들어 전장을 초토화합니다.
 */
export class AbyssEruptionAbility extends Ability {
  constructor(context) {
    super('abyss_eruption', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.spirals = [];
    this.eruptionGroup = new Group();

    this.darkPillarMat = new MeshStandardMaterial({
      color: 0x050014,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x581c87,
      emissiveIntensity: 3.5,
      transparent: true,
      opacity: 0.9
    });

    this.abyssGlowMat = new MeshStandardMaterial({
      color: 0xe9d5ff,
      emissive: 0xc084fc,
      emissiveIntensity: 6.0,
      roughness: 0.1
    });

    // Giant Dark Geyser Pillar
    this.pillar = new Mesh(new CylinderGeometry(3.5, 5.0, 24, 20, 1, true), this.darkPillarMat);
    this.pillar.position.y = 12;
    this.eruptionGroup.add(this.pillar);

    // Spiraling Void Torus Vortexes
    for (let i = 0; i < 4; i++) {
      const torus = new Mesh(new TorusGeometry(3.0 + i * 0.8, 0.25, 10, 32), this.abyssGlowMat);
      torus.position.y = 2.0 + i * 4.0;
      torus.rotation.x = Math.PI / 2;
      this.eruptionGroup.add(torus);
      this.spirals.push(torus);
    }

    setLayerRecursive(this.eruptionGroup, LAYER.VFX);
    this.group.add(this.eruptionGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.abyssSparks = particles.get('dark.eruption', {
      capacity: 5000,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.15
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.eruptionGroup.position.copy(this.targetPos);

    this.darkPillarMat.opacity = 0.9;
    this.abyssGlowMat.emissiveIntensity = 6.0;

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.add(1.3);
    this.ctx.lights.point(this.targetPos.x, 4.0, this.targetPos.z, '#e9d5ff', 18.0, 35.0, 1.4);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 10.0, DecalType.SCORCH, 7.0);
    this.ctx.bursts.trigger(this.targetPos, 12.0, BurstMode.SPHERE, 0.7, '#c084fc');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Spiral rotation & ascent
    this.spirals.forEach((s, idx) => {
      s.rotation.z += dt * (4.0 + idx * 2.0);
      s.position.y += dt * 5.0;
      if (s.position.y > 22.0) s.position.y = 2.0;
    });

    // Massive dark geyser sparks upward
    for (let i = 0; i < 8; i++) {
      _emit.position = this.targetPos.clone().add(new Vector3(randRange(-3, 3), randRange(0.2, 3), randRange(-3, 3)));
      _emit.velocity = new Vector3(randRange(-6, 6), randRange(10, 25), randRange(-6, 6));
      _emit.size = randRange(0.3, 0.7);
      _emit.lifetime = randRange(0.4, 0.9);
      _emit.color = '#f3e8ff';
      this.abyssSparks.emit(_emit);
    }

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.darkPillarMat.opacity = 0.9 * fade;
      this.abyssGlowMat.emissiveIntensity = 6.0 * fade;
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
