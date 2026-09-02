import {
  Group,
  Mesh,
  SphereGeometry,
  CylinderGeometry,
  Vector3,
  Quaternion
} from 'three';
import { Ability } from './Ability.js';
import { createFlameMaterial } from '../materials/FlameMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, randRange, lerp } from '../utils/math.js';

const _pos = new Vector3();
const _dir = new Vector3();
const _emit = {};

/**
 * [Ace Q] 화건 (火銃 - Fire Gun)
 * 양손 손끝에서 고속으로 3연발 쏘아지는 작열하는 화염 탄환.
 * 빠른 속도로 적을 관통/타격하며 화염 폭발을 일으킵니다.
 */
export class FireGunAbility extends Ability {
  constructor(context) {
    super('fire_gun', context);
    this.targetPos = new Vector3();
  }

  createShaders() {
    this.flameMaterial = createFlameMaterial();
    this.bulletMeshes = [];

    // 3 Fiery Projectile Bullets
    this.bulletGroup = new Group();
    this.bulletGroup.matrixAutoUpdate = true;

    for (let i = 0; i < 3; i++) {
      const bGroup = new Group();
      const head = new Mesh(new SphereGeometry(0.35, 12, 12), this.flameMaterial);
      const tail = new Mesh(new CylinderGeometry(0.05, 0.3, 1.8, 8), this.flameMaterial);
      tail.rotation.x = Math.PI / 2;
      tail.position.z = -0.9;
      bGroup.add(head, tail);

      bGroup.layers.set(LAYER.VFX);
      bGroup.renderOrder = 10;
      this.bulletGroup.add(bGroup);
      this.bulletMeshes.push(bGroup);
    }

    this.group.add(this.bulletGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.flameSparks = particles.get('fire.sparks', {
      capacity: 2500,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.2
    });
  }

  get impactDuration() {
    return 0.45;
  }

  get fadeDuration() {
    return 0.35;
  }

  onSpawn() {
    this.bulletGroup.visible = true;
    this.group.position.set(0, 0, 0);

    // Initial cast sound / shake
    this.ctx.shake.rumble(0.25, 0.15);
    this.hasExploded = false;
  }

  onTravel(dt) {
    // Animate the 3 bullets in staggered formation
    const progress = this.u; // 0..1
    const rot = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), this.direction);

    for (let i = 0; i < 3; i++) {
      const b = this.bulletMeshes[i];
      const stagger = i * 0.12;
      const bU = saturate((progress - stagger) / (1.0 - stagger));

      if (progress < stagger) {
        b.visible = false;
      } else {
        b.visible = true;
        this.pointAt(bU, _pos);
        // Slight lateral offset for multi-bullet spread
        const sideOffset = (i - 1) * 0.35;
        _pos.addScaledVector(this.side, sideOffset).setY(1.1);
        b.position.copy(_pos);
        b.quaternion.copy(rot);

        // Emit fiery bullet sparks
        if (this.flameSparks && Math.random() < 0.8) {
          _emit.position = _pos;
          _emit.velocity = new Vector3(randRange(-2, 2), randRange(-1, 3), randRange(-2, 2))
            .addScaledVector(this.direction, -12);
          _emit.color = getColor(i % 2 === 0 ? '#ffaa00' : '#ff4400');
          _emit.size = randRange(0.2, 0.4);
          _emit.life = randRange(0.2, 0.4);
          this.flameSparks.emit(2, _emit);
        }
      }
    }
  }

  onImpact() {
    if (this.hasExploded) return;
    this.hasExploded = true;
    this.bulletGroup.visible = false;

    this.pointAt(1.0, this.targetPos);
    const impactPos = _pos.copy(this.targetPos).setY(0.8);
    const g = settings.global;

    // Explosive Fireball Burst
    this.ctx.bursts.spawn(BurstMode.FIRE, impactPos, {
      radius: 1.0,
      endRadius: 4.2 * g.explosionIntensity,
      life: 0.45,
      intensity: 2.5,
      opacity: 0.9,
      colorA: getColor('#ffffff'),
      colorB: getColor('#ff7700'),
      colorC: getColor('#bb1100')
    });

    // Scorch Mark Decal
    this.ctx.decals.spawn(DecalType.SCORCH, impactPos, {
      radius: 3.5,
      life: 4.0,
      intensity: 1.5,
      colorA: getColor('#1a0500'),
      colorB: getColor('#ff4400')
    });

    // 40 Fire Sparks
    if (this.flameSparks) {
      for (let i = 0; i < 40; i++) {
        _emit.position = impactPos;
        _emit.velocity = new Vector3(randRange(-10, 10), randRange(2, 12), randRange(-10, 10));
        _emit.color = getColor(Math.random() < 0.5 ? '#ffcc00' : '#ff3300');
        _emit.size = randRange(0.25, 0.55);
        _emit.life = randRange(0.4, 0.8);
        this.flameSparks.emit(1, _emit);
      }
    }

    this.ctx.shake.add(0.4 * g.cameraShake, 1 / 0.35, 18);
    this.ctx.flash.trigger(getColor('#ffeedd'), 0.3);
  }

  onFade(dt, t) {
    this.bulletGroup.visible = false;
  }

  onDestroy() {
    this.bulletGroup.visible = false;
  }

  dispose() {
    this.flameMaterial?.dispose();
    super.dispose();
  }
}
