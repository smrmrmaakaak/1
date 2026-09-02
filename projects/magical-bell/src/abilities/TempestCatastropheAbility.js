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
 * [Dragon T / Ultimate] 템페스트 카타스트로피 (Tempest Catastrophe / 천재지변 용오름 폭풍)
 * 뇌우와 거대 돌풍이 결합된 초대형 용오름이 전장 전체를 집어삼킵니다.
 */
export class TempestCatastropheAbility extends Ability {
  constructor(context) {
    super('tempest_catastrophe', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.spirals = [];
    this.tempestGroup = new Group();

    this.windMat = new MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 4.5,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1
    });

    this.stormMat = new MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: 0xa7f3d0,
      emissiveIntensity: 6.0,
      roughness: 0.1
    });

    // Colossal Hurricane Funnel
    this.funnel = new Mesh(new CylinderGeometry(6.0, 1.5, 30, 24, 1, true), this.windMat);
    this.funnel.position.y = 15.0;
    this.tempestGroup.add(this.funnel);

    // Multiple swirling storm bands
    for (let i = 0; i < 6; i++) {
      const ring = new Mesh(new TorusGeometry(2.0 + i * 1.0, 0.25, 8, 32), this.stormMat);
      ring.position.y = 2.0 + i * 4.5;
      ring.rotation.x = Math.PI / 2;
      this.tempestGroup.add(ring);
      this.spirals.push(ring);
    }

    setLayerRecursive(this.tempestGroup, LAYER.VFX);
    this.group.add(this.tempestGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.tempestSparks = particles.get('wind.tempest', {
      capacity: 5500,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.15
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.tempestGroup.position.copy(this.targetPos);

    this.windMat.opacity = 0.8;
    this.stormMat.emissiveIntensity = 6.0;

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.add(1.3);
    this.ctx.lights.point(this.targetPos.x, 4.0, this.targetPos.z, '#6ee7b7', 18.0, 35.0, 1.4);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 12.0, DecalType.CRACK, 7.0);
    this.ctx.bursts.trigger(this.targetPos, 14.0, BurstMode.SPHERE, 0.8, '#34d399');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Hurricane rotation
    this.funnel.rotation.y -= dt * 10.0;
    this.spirals.forEach((s, idx) => {
      s.rotation.z += dt * (12.0 + idx * 3.0);
      s.rotation.x = Math.PI / 2 + Math.sin(p * 8.0 + idx) * 0.2;
    });

    // Intense cyclone particle storm
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const height = randRange(0.5, 25.0);
      const r = 1.5 + (height / 30.0) * 5.0;
      _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, height, Math.sin(angle) * r));
      _emit.velocity = new Vector3(-Math.sin(angle) * 18, randRange(6, 20), Math.cos(angle) * 18);
      _emit.size = randRange(0.3, 0.7);
      _emit.lifetime = randRange(0.3, 0.8);
      _emit.color = '#f0fdf4';
      this.tempestSparks.emit(_emit);
    }

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.windMat.opacity = 0.8 * fade;
      this.stormMat.emissiveIntensity = 6.0 * fade;
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
