import {
  Group,
  Mesh,
  BoxGeometry,
  ConeGeometry,
  TorusGeometry,
  MeshStandardMaterial,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { randRange, saturate } from '../utils/math.js';

const _emit = {};

/**
 * [Whitebeard C] 지진 해진 (島搖 震天動地 - Island Shaker / 천지 분할)
 * 지면을 양손으로 뒤흔들어 4방향의 대지가 솟구치고 동심원 지진 충격파가 전장을 뒤흔듭니다.
 */
export class IslandShakerAbility extends Ability {
  constructor(context) {
    super('earthquake', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.quakeGroup = new Group();
    this.quakeGroup.matrixAutoUpdate = true;

    this.rockMat = new MeshStandardMaterial({
      color: 0x475569,
      emissive: 0x3b82f6,
      emissiveIntensity: 4.5,
      roughness: 0.8
    });

    this.glowMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x93c5fd,
      emissiveIntensity: 7.0
    });

    // 4 Uplifting Massive Ground Blocks
    this.pillars = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const r = randRange(4.5, 9.5);
      const pillar = new Mesh(new BoxGeometry(3.0, 7.0, 3.0), this.rockMat);
      pillar.position.set(Math.cos(angle) * r, -5.0, Math.sin(angle) * r);
      pillar.rotation.set(randRange(-0.3, 0.3), randRange(0, Math.PI), randRange(-0.3, 0.3));
      this.quakeGroup.add(pillar);
      this.pillars.push({ mesh: pillar, angle, r, targetY: randRange(1.5, 4.0) });
    }

    // 2 Giant Vibrational Shock Rings
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new Mesh(new TorusGeometry(4.0 + i * 2.5, 0.25, 6, 32), this.glowMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      this.quakeGroup.add(ring);
      this.rings.push(ring);
    }

    setLayerRecursive(this.quakeGroup, LAYER.VFX);
    this.group.add(this.quakeGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.dust = particles.get('earth.dust', {
      capacity: 4500,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.0
    });

    this.shards = particles.get('quake.shards', {
      capacity: 3500,
      shape: ParticleShape.CHIP,
      additive: false,
      lit: true,
      softFade: 0.2
    });
  }

  get impactDuration() {
    return 1.6;
  }

  get fadeDuration() {
    return 0.8;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.quakeGroup.position.copy(this.targetPos);
    this.quakeGroup.visible = true;

    this.pillars.forEach(p => {
      p.mesh.position.y = -5.0;
    });

    this.rockMat.emissiveIntensity = 4.5;
    this.glowMat.emissiveIntensity = 7.0;

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.rumble(1.2, 0.7);
    this.ctx.lights.point(this.targetPos.x, 3.0, this.targetPos.z, '#60a5fa', 20.0, 40.0, 1.4);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 15.0, DecalType.CRACK, 6.5);
    this.ctx.bursts.trigger(this.targetPos, 16.0, BurstMode.EARTH, 0.9, '#3b82f6');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Rock pillars thrust upwards
    this.pillars.forEach((pillar, idx) => {
      const riseProgress = saturate((p - idx * 0.05) / 0.35);
      pillar.mesh.position.y = -5.0 + (5.0 + pillar.targetY) * Math.sin(riseProgress * Math.PI * 0.5);
    });

    // Expanding shock rings
    this.rings.forEach((r, idx) => {
      const scale = 1.0 + p * (4.0 + idx * 2.0);
      r.scale.set(scale, scale, scale);
    });

    // Ground dust & flying debris
    if (this.dust && Math.random() < 0.9) {
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = randRange(1, 12);
        _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, 0.2, Math.sin(angle) * r));
        _emit.velocity = new Vector3(randRange(-3, 3), randRange(3, 8), randRange(-3, 3));
        _emit.size = randRange(1.8, 3.5);
        _emit.lifetime = randRange(0.6, 1.4);
        _emit.color = '#94a3b8';
        this.dust.emit(1, _emit);
      }
    }

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.rockMat.emissiveIntensity = 4.5 * fade;
      this.glowMat.emissiveIntensity = 7.0 * fade;
    }
  }

  onDestroy() {
    this.quakeGroup.visible = false;
  }
}
