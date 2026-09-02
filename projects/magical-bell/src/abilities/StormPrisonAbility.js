import {
  Group,
  Mesh,
  CylinderGeometry,
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
 * [Dragon C] 돌풍 감옥 (突風監獄 - Storm Prison / 진공 결계)
 * 8개의 고속 회전하는 돌풍 기둥을 지면에 세워 적들을 가두고 공중으로 띄워 올립니다.
 */
export class StormPrisonAbility extends Ability {
  constructor(context) {
    super('tornado_vortex', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.prisonGroup = new Group();
    this.prisonGroup.matrixAutoUpdate = true;

    this.windMat = new MeshStandardMaterial({
      color: 0xa7f3d0,
      emissive: 0x059669,
      emissiveIntensity: 6.0,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1
    });

    this.ringMat = new MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 7.0
    });

    // 8 Rotating Wind Tornado Columns
    this.columns = [];
    for (let i = 0; i < 8; i++) {
      const col = new Mesh(new CylinderGeometry(0.3, 0.9, 10.0, 8), this.windMat);
      const angle = (i * Math.PI * 2) / 8;
      col.position.set(Math.cos(angle) * 5.5, 5.0, Math.sin(angle) * 5.5);
      this.prisonGroup.add(col);
      this.columns.push({ mesh: col, angle });
    }

    // 2 Spinning Outer Wind Rings
    this.ring1 = new Mesh(new TorusGeometry(5.8, 0.25, 6, 32), this.ringMat);
    this.ring2 = new Mesh(new TorusGeometry(5.8, 0.25, 6, 32), this.ringMat);
    this.ring1.rotation.x = Math.PI / 2;
    this.ring2.rotation.x = Math.PI / 2;
    this.ring1.position.y = 1.0;
    this.ring2.position.y = 8.5;
    this.prisonGroup.add(this.ring1, this.ring2);

    setLayerRecursive(this.prisonGroup, LAYER.VFX);
    this.group.add(this.prisonGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.windSparks = particles.get('wind.burst', {
      capacity: 4000,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.15
    });
  }

  get impactDuration() {
    return 1.6;
  }

  get fadeDuration() {
    return 0.6;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.prisonGroup.position.copy(this.targetPos);
    this.prisonGroup.visible = true;

    this.windMat.opacity = 0.8;
    this.windMat.emissiveIntensity = 6.0;

    this.ctx.flash.trigger(0.8);
    this.ctx.shake.add(0.9);
    this.ctx.lights.point(this.targetPos.x, 3.5, this.targetPos.z, '#34d399', 18.0, 36.0, 1.2);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 12.0, DecalType.CRACK, 5.5);
    this.ctx.bursts.trigger(this.targetPos, 14.0, BurstMode.AIR, 0.7, '#10b981');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Wind pillars orbit around center
    this.columns.forEach(c => {
      c.angle += dt * 5.0;
      c.mesh.position.set(Math.cos(c.angle) * 5.5, 5.0, Math.sin(c.angle) * 5.5);
      c.mesh.rotation.y -= dt * 10.0;
    });

    this.ring1.rotation.z += dt * 8.0;
    this.ring2.rotation.z -= dt * 8.0;

    // Upward suction wind sparks
    if (this.windSparks && Math.random() < 0.9) {
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = randRange(1.0, 5.0);
        _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, randRange(0.2, 8.0), Math.sin(angle) * r));
        _emit.velocity = new Vector3(-Math.sin(angle) * 8, randRange(6, 16), Math.cos(angle) * 8);
        _emit.size = randRange(0.3, 0.7);
        _emit.lifetime = randRange(0.3, 0.6);
        _emit.color = '#a7f3d0';
        this.windSparks.emit(1, _emit);
      }
    }

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.windMat.opacity = 0.8 * fade;
      this.windMat.emissiveIntensity = 6.0 * fade;
    }
  }

  onDestroy() {
    this.prisonGroup.visible = false;
  }
}
