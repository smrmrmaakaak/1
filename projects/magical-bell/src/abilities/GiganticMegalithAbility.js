import {
  Group,
  Mesh,
  DodecahedronGeometry,
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
 * [Whitebeard T / Ultimate] 기간틱 메가리스 (Gigantic Megalith / 섬을 뒤흔드는 일격)
 * 공중에서 초대형 산악 크기의 거석이 낙하하여 대지를 박살내고 지축을 뒤흔듭니다.
 */
export class GiganticMegalithAbility extends Ability {
  constructor(context) {
    super('gigantic_megalith', context);
    this.targetPos = new Vector3();
  }

  createShaders() {
    this.megalithGroup = new Group();

    this.rockMat = new MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.85,
      metalness: 0.2
    });

    this.glowMat = new MeshStandardMaterial({
      color: 0xccff00,
      emissive: 0xa3e635,
      emissiveIntensity: 6.0,
      roughness: 0.1
    });

    // Giant 3D Mountain Boulder
    this.boulder = new Mesh(new DodecahedronGeometry(5.0, 2), this.rockMat);
    this.boulder.scale.set(1.4, 1.1, 1.2);
    this.megalithGroup.add(this.boulder);

    // Shockwave Ring on impact
    this.impactRing = new Mesh(new TorusGeometry(4.0, 0.4, 12, 32), this.glowMat);
    this.impactRing.rotation.x = Math.PI / 2;
    this.impactRing.position.y = 0.2;
    this.megalithGroup.add(this.impactRing);

    setLayerRecursive(this.megalithGroup, LAYER.VFX);
    this.group.add(this.megalithGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.debris = particles.get('earth.debris', {
      capacity: 4500,
      shape: ParticleShape.SPARK,
      softFade: 0.1
    });
    this.smoke = particles.get('earth.smoke', {
      capacity: 3500,
      shape: ParticleShape.SMOKE,
      softFade: 0.4
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.megalithGroup.position.copy(this.targetPos);
    this.boulder.position.set(0, 30.0, 0);

    // Target Ground Marker
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 10.0, DecalType.CRACK, 8.0);
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Fast drop down from the sky (0.0 -> 0.35)
    if (p < 0.35) {
      const dropP = p / 0.35;
      this.boulder.position.y = 30.0 * (1.0 - dropP * dropP) + 1.5;
      this.boulder.rotation.x += dt * 3.0;
      this.boulder.rotation.y += dt * 4.0;
      this.impactRing.visible = false;
    } else if (p < 0.4) {
      // Landed Impact Moment!
      if (!this._impacted) {
        this._impacted = true;
        this.ctx.flash.trigger(0.9);
        this.ctx.shake.add(1.4);
        this.ctx.lights.point(this.targetPos.x, 3.0, this.targetPos.z, '#ccff00', 16.0, 35.0, 1.2);
        this.ctx.bursts.trigger(this.targetPos, 12.0, BurstMode.SPHERE, 0.7, '#bef264');
      }
      this.boulder.position.y = 1.5;
      this.impactRing.visible = true;
      this.impactRing.scale.setScalar((p - 0.35) * 40.0);
    } else {
      // Shatter & sink into earth
      const fadeP = (p - 0.4) / 0.6;
      this.boulder.position.y = 1.5 - fadeP * 5.0;
      this.impactRing.scale.setScalar(2.0 + fadeP * 12.0);

      // Billowing dust clouds
      for (let i = 0; i < 6; i++) {
        _emit.position = this.targetPos.clone().add(new Vector3(randRange(-5, 5), randRange(0.5, 3), randRange(-5, 5)));
        _emit.velocity = new Vector3(randRange(-8, 8), randRange(4, 16), randRange(-8, 8));
        _emit.size = randRange(0.8, 2.0);
        _emit.lifetime = randRange(0.6, 1.4);
        _emit.color = '#5d4037';
        this.smoke.emit(_emit);
      }
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
    this._impacted = false;
  }
}
