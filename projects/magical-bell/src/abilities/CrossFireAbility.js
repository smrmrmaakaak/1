import {
  Group,
  Mesh,
  BoxGeometry,
  Vector3,
  Quaternion
} from 'three';
import { Ability } from './Ability.js';
import { createRealFlameMaterial } from '../materials/RealFlameMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { randRange } from '../utils/math.js';

const _pos = new Vector3();
const _emit = {};

/**
 * [Ace X] 십자화 (十字火 - Cross Fire)
 * 양손 검지를 십자로 교차하여 전방으로 빛의 속도로 쏘아내는 타오르는 십자 화염 빔 & 폭발.
 */
export class CrossFireAbility extends Ability {
  constructor(context) {
    super('cross_fire', context);
    this.targetPos = new Vector3();
  }

  createShaders() {
    this.group.matrixAutoUpdate = true;
    this.flameMaterial = createRealFlameMaterial({ intensity: 3.4, speed: 6.0, turbulence: 1.6 });

    // Cross Fire Mesh (십자 형태의 화염 빔)
    this.crossGroup = new Group();
    this.crossGroup.matrixAutoUpdate = true;

    // Horizontal Beam
    const hBar = new Mesh(new BoxGeometry(2.4, 0.45, 0.45), this.flameMaterial);
    // Vertical Beam
    const vBar = new Mesh(new BoxGeometry(0.45, 2.4, 0.45), this.flameMaterial);

    this.crossGroup.add(hBar, vBar);
    setLayerRecursive(this.crossGroup, LAYER.VFX);
    this.crossGroup.renderOrder = 10;

    this.group.add(this.crossGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.sparks = particles.get('fire.sparks', {
      capacity: 2500,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.2
    });
  }

  get impactDuration() {
    return 0.5;
  }

  get fadeDuration() {
    return 0.4;
  }

  onSpawn() {
    this.crossGroup.visible = true;
    this.group.position.set(0, 0, 0);
    this.hasExploded = false;
    this.ctx.shake.rumble(0.3, 0.18);
  }

  onTravel(dt) {
    this.pointAt(this.u, _pos);
    _pos.y = 1.2;

    this.crossGroup.position.copy(_pos);
    const rot = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), this.direction);
    this.crossGroup.quaternion.copy(rot);
    this.crossGroup.rotateZ(this.age * 8.0); // Spinning blazing cross!

    // Trailing sparks
    if (this.sparks && Math.random() < 0.85) {
      _emit.position = _pos;
      _emit.velocity = new Vector3(randRange(-2, 2), randRange(-1, 3), randRange(-2, 2))
        .addScaledVector(this.direction, -10);
      _emit.color = getColor('#ffaa00');
      _emit.size = randRange(0.25, 0.5);
      _emit.life = randRange(0.2, 0.4);
      this.sparks.emit(2, _emit);
    }
  }

  onImpact() {
    if (this.hasExploded) return;
    this.hasExploded = true;
    this.crossGroup.visible = false;

    this.pointAt(1.0, this.targetPos);
    const impactPos = _pos.copy(this.targetPos).setY(0.8);
    const g = settings.global;

    // Cross Fiery Burst
    this.ctx.bursts.spawn(BurstMode.FIRE, impactPos, {
      radius: 1.2,
      endRadius: 5.2 * g.explosionIntensity,
      life: 0.5,
      intensity: 2.8,
      opacity: 0.9,
      colorA: getColor('#ffffff'),
      colorB: getColor('#ff5500'),
      colorC: getColor('#990000')
    });

    this.ctx.decals.spawn(DecalType.SCORCH, impactPos, {
      radius: 4.2,
      life: 4.5,
      intensity: 1.8,
      colorA: getColor('#140200'),
      colorB: getColor('#ff4400')
    });

    // 50 Sparks
    if (this.sparks) {
      for (let i = 0; i < 50; i++) {
        _emit.position = impactPos;
        _emit.velocity = new Vector3(randRange(-12, 12), randRange(3, 14), randRange(-12, 12));
        _emit.color = getColor(Math.random() < 0.4 ? '#ffdd44' : '#ff4400');
        _emit.size = randRange(0.3, 0.6);
        _emit.life = randRange(0.5, 0.9);
        this.sparks.emit(1, _emit);
      }
    }

    this.ctx.shake.add(0.5 * g.cameraShake, 1 / 0.4, 20);
    this.ctx.flash.trigger(getColor('#fff5cc'), 0.35);
  }

  onFade(dt, t) {
    this.crossGroup.visible = false;
  }

  onDestroy() {
    this.crossGroup.visible = false;
  }

  dispose() {
    this.flameMaterial?.dispose();
    super.dispose();
  }
}
