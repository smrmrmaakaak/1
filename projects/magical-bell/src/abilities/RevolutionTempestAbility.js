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
 * [Dragon T / Ultimate] 혁명의 천벌 (革命の天罰 - Revolution Tempest / 천재지변 초강풍 뇌우)
 * 거대한 에메랄드 용오름과 천둥번개가 결합된 초특급 천재지변 폭풍우로 전장 전체를 휩쓰는 궁극기.
 */
export class RevolutionTempestAbility extends Ability {
  constructor(context) {
    super('tempest_catastrophe', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.tempestGroup = new Group();
    this.tempestGroup.matrixAutoUpdate = true;

    this.windMat = new MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: 0x059669,
      emissiveIntensity: 6.5,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1
    });

    this.stormMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x34d399,
      emissiveIntensity: 7.0
    });

    // 25m Giant Tempest Funnel
    this.funnel = new Mesh(new CylinderGeometry(14.0, 1.2, 30.0, 24, 1, true), this.windMat);
    this.funnel.position.y = 15.0;
    this.tempestGroup.add(this.funnel);

    // 4 Spiraling Lightning Wind Rings
    this.spirals = [];
    for (let i = 0; i < 4; i++) {
      const ring = new Mesh(new TorusGeometry(3.5 + i * 2.8, 0.35, 8, 36), this.stormMat);
      ring.position.y = 3.0 + i * 6.5;
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
      capacity: 6500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.1
    });
  }

  get impactDuration() {
    return 2.2;
  }

  get fadeDuration() {
    return 0.8;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.tempestGroup.position.copy(this.targetPos);
    this.tempestGroup.visible = true;

    this.windMat.opacity = 0.85;
    this.windMat.emissiveIntensity = 6.5;
    this.stormMat.emissiveIntensity = 7.0;

    this.ctx.flash.trigger(0.95);
    this.ctx.shake.rumble(1.5, 0.9);
    this.ctx.lights.point(this.targetPos.x, 5.0, this.targetPos.z, '#34d399', 25.0, 50.0, 1.8);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 20.0, DecalType.CRACK, 7.0);
    this.ctx.bursts.trigger(this.targetPos, 24.0, BurstMode.AIR, 1.2, '#059669');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Hurricane rotation
    this.funnel.rotation.y -= dt * 12.0;
    this.spirals.forEach((s, idx) => {
      s.rotation.z += dt * (15.0 + idx * 4.0);
      s.rotation.x = Math.PI / 2 + Math.sin(p * 10.0 + idx) * 0.25;
    });

    // Intense cyclone particle storm
    if (this.tempestSparks && Math.random() < 0.95) {
      for (let i = 0; i < 7; i++) {
        const angle = Math.random() * Math.PI * 2;
        const height = randRange(0.5, 28.0);
        const r = 1.5 + (height / 30.0) * 8.0;
        _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, height, Math.sin(angle) * r));
        _emit.velocity = new Vector3(-Math.sin(angle) * 22, randRange(8, 26), Math.cos(angle) * 22);
        _emit.size = randRange(0.35, 0.85);
        _emit.lifetime = randRange(0.3, 0.7);
        _emit.color = '#dcfce7';
        this.tempestSparks.emit(1, _emit);
      }
    }

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.windMat.opacity = 0.85 * fade;
      this.windMat.emissiveIntensity = 6.5 * fade;
      this.stormMat.emissiveIntensity = 7.0 * fade;
    }
  }

  onDestroy() {
    this.tempestGroup.visible = false;
  }
}
