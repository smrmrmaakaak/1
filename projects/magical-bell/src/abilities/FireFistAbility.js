import {
  Group,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  TorusGeometry,
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
import { saturate, randRange, lerp } from '../utils/math.js';

const _pos = new Vector3();
const _emit = {};

/**
 * [Ace Q / Signature] 불주먹 (火拳 - Hiken / Fire Fist)
 * 진짜 거대한 작열하는 화염 거인 주먹이 전방으로 굉음을 내며 돌진하여 모든 것을 불태우는 에이스의 대표 기술.
 * - 정교하게 조각된 3D 화염 거인 주먹 (손바닥, 4개 손가락 마디, 엄지손가락, 손목 소용돌이)
 * - 고화질 3D FBM 활활 타오르는 화염 셰이더 (RealFlameMaterial)
 * - 거대 화염 충격파 및 지면 폭발
 */
export class FireFistAbility extends Ability {
  constructor(context) {
    super('fire_fist', context);
    this.targetPos = new Vector3();
  }

  createShaders() {
    this.group.matrixAutoUpdate = true;
    this.flameMaterial = createRealFlameMaterial({ intensity: 3.5, speed: 5.5, turbulence: 1.5 });

    // 1. Giant Burning Fist Group (거대 화염 주먹)
    this.fistGroup = new Group();
    this.fistGroup.matrixAutoUpdate = true;

    // Palm / Hand Core (손바닥 중심)
    const palm = new Mesh(new BoxGeometry(1.6, 1.4, 1.8), this.flameMaterial);
    palm.position.set(0, 0, 0);
    this.fistGroup.add(palm);

    // 4 Clenched Flaming Knuckles / Fingers (4개의 쥐어진 손가락 마디)
    for (let i = 0; i < 4; i++) {
      const xOff = (i - 1.5) * 0.36;
      const finger = new Mesh(new BoxGeometry(0.32, 0.55, 1.1), this.flameMaterial);
      finger.position.set(xOff, 0.32, 1.05);
      finger.rotation.x = -Math.PI / 6;

      const fingertip = new Mesh(new SphereGeometry(0.22, 10, 10), this.flameMaterial);
      fingertip.position.set(xOff, 0.1, 1.5);

      this.fistGroup.add(finger, fingertip);
    }

    // Clenched Flaming Thumb (엄지손가락)
    const thumb = new Mesh(new BoxGeometry(0.4, 0.9, 0.45), this.flameMaterial);
    thumb.position.set(-0.85, 0.15, 0.4);
    thumb.rotation.z = Math.PI / 4;
    thumb.rotation.y = -Math.PI / 8;
    this.fistGroup.add(thumb);

    // Fiery Forearm Vortex (손목 뒤로 소용돌이치는 거대 화염 슬리브)
    const forearm = new Mesh(new CylinderGeometry(1.8, 0.5, 3.8, 18, 8, true), this.flameMaterial);
    forearm.rotation.x = Math.PI / 2;
    forearm.position.set(0, 0, -2.1);
    this.fistGroup.add(forearm);

    // Swirling Flame Shock Ring (주먹 주변을 휘감는 화염 고리)
    const flameRing = new Mesh(new TorusGeometry(1.8, 0.3, 12, 24), this.flameMaterial);
    flameRing.position.set(0, 0, -0.7);
    this.fistGroup.add(flameRing);
    this.flameRing = flameRing;

    setLayerRecursive(this.fistGroup, LAYER.VFX);
    this.fistGroup.renderOrder = 12;

    this.group.add(this.fistGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;

    // Blazing Fire Sparks
    this.flameSparks = particles.get('fire.sparks', {
      capacity: 3500,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.2
    });

    // Billowing Dark Ash Smoke
    this.flameSmoke = particles.get('fire.smoke', {
      capacity: 2500,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 0.8
    });
  }

  get impactDuration() {
    return 0.6;
  }

  get fadeDuration() {
    return 0.45;
  }

  onSpawn() {
    this.fistGroup.visible = true;
    this.group.position.set(0, 0, 0);
    this.hasHit = false;

    // Cast rumble
    this.ctx.shake.rumble(0.4, 0.2);
  }

  onTravel(dt) {
    this.pointAt(this.u, _pos);
    _pos.y = 1.35; // Chest height punch trajectory!

    this.fistGroup.position.copy(_pos);

    // Orient forward towards target direction
    const rot = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), this.direction);
    this.fistGroup.quaternion.copy(rot);

    // Roaring spin on the trailing vortex ring
    if (this.flameRing) {
      this.flameRing.rotation.z = this.age * 12.0;
    }

    // Scale up slightly as momentum gathers
    const scale = lerp(0.9, 1.45, this.u);
    this.fistGroup.scale.setScalar(scale);

    // Continuous trailing blazing sparks (활활 타오르는 화염 파티클 분출)
    if (this.flameSparks && Math.random() < 0.9) {
      for (let i = 0; i < 4; i++) {
        _emit.position = _pos.clone().add(new Vector3(randRange(-0.8, 0.8), randRange(-0.6, 0.6), randRange(-0.8, 0.8)));
        _emit.velocity = new Vector3(randRange(-3, 3), randRange(1, 6), randRange(-3, 3))
          .addScaledVector(this.direction, -14);
        _emit.color = getColor(i % 2 === 0 ? '#ffea50' : '#ff4400');
        _emit.size = randRange(0.3, 0.65);
        _emit.life = randRange(0.3, 0.65);
        this.flameSparks.emit(1, _emit);
      }
    }

    // Trailing dark smoke puff
    if (this.flameSmoke && Math.random() < 0.35) {
      _emit.position = _pos.clone().add(new Vector3(randRange(-0.5, 0.5), 0, randRange(-0.5, 0.5)));
      _emit.velocity = new Vector3(randRange(-1, 1), randRange(1, 3), randRange(-1, 1)).addScaledVector(this.direction, -8);
      _emit.color = getColor('#1a0401');
      _emit.size = randRange(1.2, 2.2);
      _emit.life = randRange(0.8, 1.4);
      this.flameSmoke.emit(1, _emit);
    }
  }

  onImpact() {
    if (this.hasHit) return;
    this.hasHit = true;
    this.fistGroup.visible = false;

    this.pointAt(1.0, this.targetPos);
    const impactPos = _pos.copy(this.targetPos).setY(1.0);
    const g = settings.global;

    // 1. Massive Colossal Fire Fist Eruption Sphere
    this.ctx.bursts.spawn(BurstMode.FIRE, impactPos, {
      radius: 1.5,
      endRadius: 6.8 * g.explosionIntensity,
      life: 0.6,
      intensity: 3.2,
      opacity: 0.95,
      colorA: getColor('#ffffff'),
      colorB: getColor('#ff6600'),
      colorC: getColor('#990000')
    });

    // 2. Fiery Ground Crater Decal
    this.ctx.decals.spawn(DecalType.SCORCH, impactPos, {
      radius: 5.5,
      life: 5.0,
      intensity: 2.0,
      colorA: getColor('#120300'),
      colorB: getColor('#ff4400')
    });

    // 3. 70 Explosive Blazing Fire Sparks
    if (this.flameSparks) {
      for (let i = 0; i < 70; i++) {
        _emit.position = impactPos;
        _emit.velocity = new Vector3(randRange(-14, 14), randRange(4, 18), randRange(-14, 14));
        _emit.color = getColor(Math.random() < 0.4 ? '#fff077' : Math.random() < 0.75 ? '#ff6600' : '#cc0000');
        _emit.size = randRange(0.35, 0.75);
        _emit.life = randRange(0.6, 1.2);
        this.flameSparks.emit(1, _emit);
      }
    }

    // 4. Volcanic Smoke Plumes
    if (this.flameSmoke) {
      for (let i = 0; i < 20; i++) {
        _emit.position = impactPos;
        _emit.velocity = new Vector3(randRange(-5, 5), randRange(2, 7), randRange(-5, 5));
        _emit.color = getColor('#1c0502');
        _emit.size = randRange(1.8, 3.2);
        _emit.life = randRange(1.0, 1.8);
        this.flameSmoke.emit(1, _emit);
      }
    }

    // 5. Heavy Camera Impact Shake & Flash
    this.ctx.shake.add(0.8 * g.cameraShake, 1 / 0.45, 25);
    this.ctx.flash.trigger(getColor('#ffffff'), 0.45);
  }

  onFade(dt, t) {
    this.fistGroup.visible = false;
  }

  onDestroy() {
    this.fistGroup.visible = false;
  }

  dispose() {
    this.flameMaterial?.dispose();
    super.dispose();
  }
}
