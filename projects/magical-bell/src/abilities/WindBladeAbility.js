import {
  Group,
  Mesh,
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
 * [Dragon Q] 윈드 블레이드 (Wind Blade / 진공 초승달 칼바람)
 * 초고속으로 전방을 베어가르는 3D 에메랄드 진공 검기를 발사합니다.
 */
export class WindBladeAbility extends Ability {
  constructor(context) {
    super('wind_blade', context);
    this.targetPos = new Vector3();
  }

  createShaders() {
    this.bladeGroup = new Group();

    this.windMat = new MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: 0x10b981,
      emissiveIntensity: 5.0,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1
    });

    // 3 Crescent Wind Arc Blades
    for (let i = 0; i < 3; i++) {
      const arc = new Mesh(new TorusGeometry(1.8 + i * 0.4, 0.08, 8, 24, Math.PI * 0.75), this.windMat);
      arc.rotation.z = Math.PI * 0.62;
      arc.rotation.x = Math.PI / 2;
      arc.position.z = -i * 0.4;
      this.bladeGroup.add(arc);
    }

    setLayerRecursive(this.bladeGroup, LAYER.VFX);
    this.group.add(this.bladeGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.windRibbons = particles.get('wind.ribbons', {
      capacity: 3000,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.2
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.bladeGroup.position.copy(origin).add(new Vector3(0, 1.2, 0));
    this.bladeGroup.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), direction);

    this.ctx.shake.add(0.35);
    this.ctx.lights.point(origin.x, 1.5, origin.z, '#34d399', 7.0, 12.0, 0.4);
    this.ctx.bursts.trigger(origin, 3.0, BurstMode.SPHERE, 0.3, '#10b981');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Swift flight forward
    this.bladeGroup.position.lerpVectors(
      this.origin.clone().add(new Vector3(0, 1.2, 0)),
      this.targetPos.clone().add(new Vector3(0, 1.2, 0)),
      p
    );

    // Wind trail particles
    for (let i = 0; i < 4; i++) {
      _emit.position = this.bladeGroup.position.clone().add(new Vector3(randRange(-0.8, 0.8), randRange(-0.3, 0.3), randRange(-0.8, 0.8)));
      _emit.velocity = new Vector3(randRange(-3, 3), randRange(1, 4), randRange(-3, 3));
      _emit.size = randRange(0.2, 0.4);
      _emit.lifetime = randRange(0.2, 0.5);
      _emit.color = '#a7f3d0';
      this.windRibbons.emit(1, _emit);
    }

    if (p > 0.95 && !this._impacted) {
      this._impacted = true;
      this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 3.5, DecalType.CRACK, 4.0);
      this.ctx.bursts.trigger(this.targetPos, 5.0, BurstMode.SPHERE, 0.4, '#34d399');
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
    this._impacted = false;
  }
}
