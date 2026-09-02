import {
  Group,
  Mesh,
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
 * [Blackbeard Q] 보이드 오브 (Void Orb / 암혈흑구)
 * 적을 관통하며 모든 빛을 흡수하는 암흑 공허 구체를 전방으로 발사합니다.
 */
export class VoidOrbAbility extends Ability {
  constructor(context) {
    super('void_orb', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.rings = [];
    this.orbGroup = new Group();

    this.darkMat = new MeshStandardMaterial({
      color: 0x0a0015,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x581c87,
      emissiveIntensity: 3.0
    });

    this.haloMat = new MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0xc084fc,
      emissiveIntensity: 4.5,
      transparent: true,
      opacity: 0.8
    });

    // Pitch Black Core Sphere
    this.core = new Mesh(new SphereGeometry(1.2, 24, 24), this.darkMat);
    this.orbGroup.add(this.core);

    // Swirling Dark Energy Rings
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new Mesh(new TorusGeometry(1.6 + i * 0.3, 0.12, 10, 24), this.haloMat);
      this.orbGroup.add(ring);
      this.rings.push(ring);
    }

    setLayerRecursive(this.orbGroup, LAYER.VFX);
    this.group.add(this.orbGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.darkTendrils = particles.get('dark.tendrils', {
      capacity: 3500,
      shape: ParticleShape.SMOKE,
      curl: true,
      softFade: 0.3
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.orbGroup.position.copy(origin).add(new Vector3(0, 1.2, 0));

    this.ctx.shake.add(0.4);
    this.ctx.lights.point(origin.x, 2.0, origin.z, '#a855f7', 8.0, 15.0, 0.8);
    this.ctx.bursts.trigger(origin, 3.5, BurstMode.SPHERE, 0.4, '#7e22ce');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Fly forward to target
    this.orbGroup.position.lerpVectors(
      this.origin.clone().add(new Vector3(0, 1.2, 0)),
      this.targetPos.clone().add(new Vector3(0, 1.2, 0)),
      p
    );

    // Spin dark energy rings
    this.rings.forEach((r, idx) => {
      r.rotation.x += dt * (3.0 + idx * 2.0);
      r.rotation.y += dt * (2.0 + idx * 1.5);
    });

    // Dark smoke tendrils in wake
    for (let i = 0; i < 4; i++) {
      _emit.position = this.orbGroup.position.clone().add(new Vector3(randRange(-0.5, 0.5), randRange(-0.5, 0.5), randRange(-0.5, 0.5)));
      _emit.velocity = new Vector3(randRange(-2, 2), randRange(-1, 3), randRange(-2, 2));
      _emit.size = randRange(0.4, 0.9);
      _emit.lifetime = randRange(0.4, 0.8);
      _emit.color = '#3b0764';
      this.darkTendrils.emit(_emit);
    }

    if (p > 0.95 && !this._exploded) {
      this._exploded = true;
      this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 4.5, DecalType.SCORCH, 5.0);
      this.ctx.bursts.trigger(this.targetPos, 6.0, BurstMode.SPHERE, 0.5, '#9333ea');
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
    this._exploded = false;
  }
}
