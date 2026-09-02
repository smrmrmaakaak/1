import {
  Group,
  Mesh,
  BoxGeometry,
  ConeGeometry,
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
const _pos = new Vector3();

/**
 * [Dragon X] 용의 숨결 (龍の息吹 - Dragon Breath / 돌풍 파동포)
 * 포효하는 3D 에메랄드 용 머리 형상의 고압 돌풍 파동을 전방으로 발사하여 적들을 날려버립니다.
 */
export class DragonBreathAbility extends Ability {
  constructor(context) {
    super('cyclone_burst', context);
  }

  createShaders() {
    this.dragonGroup = new Group();
    this.dragonGroup.matrixAutoUpdate = true;

    this.windMat = new MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: 0x10b981,
      emissiveIntensity: 6.5,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1
    });

    this.eyeMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 8.0
    });

    // 1. Procedural 3D Wind Dragon Head
    this.headNode = new Group();
    const snout = new Mesh(new BoxGeometry(1.8, 1.4, 2.8), this.windMat);
    snout.position.z = 1.0;
    const lowerJaw = new Mesh(new BoxGeometry(1.5, 0.6, 2.4), this.windMat);
    lowerJaw.position.set(0, -0.7, 1.2);
    const hornL = new Mesh(new ConeGeometry(0.35, 2.0, 5), this.windMat);
    hornL.position.set(0.8, 1.1, -0.4);
    hornL.rotation.set(-0.5, 0, 0.4);
    const hornR = new Mesh(new ConeGeometry(0.35, 2.0, 5), this.windMat);
    hornR.position.set(-0.8, 1.1, -0.4);
    hornR.rotation.set(-0.5, 0, -0.4);
    const eyeL = new Mesh(new SphereGeometry(0.25, 8, 8), this.eyeMat);
    eyeL.position.set(0.7, 0.4, 1.6);
    const eyeR = new Mesh(new SphereGeometry(0.25, 8, 8), this.eyeMat);
    eyeR.position.set(-0.7, 0.4, 1.6);

    this.headNode.add(snout, lowerJaw, hornL, hornR, eyeL, eyeR);
    this.dragonGroup.add(this.headNode);

    setLayerRecursive(this.dragonGroup, LAYER.VFX);
    this.group.add(this.dragonGroup);
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
    return 1.3;
  }

  get fadeDuration() {
    return 0.5;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.dragonGroup.visible = true;

    this.ctx.flash.trigger(0.8);
    this.ctx.shake.add(0.9);
  }

  onTravel(dt) {
    const u = this.u; // 0..1
    this.pointAt(u, _pos);
    _pos.y = 1.6;

    this.headNode.position.copy(_pos);
    this.headNode.rotation.y = Math.atan2(this.direction.x, this.direction.z);
    this.headNode.rotation.x = Math.sin(u * 12.0) * 0.2;

    if (this.windSparks && Math.random() < 0.9) {
      for (let i = 0; i < 4; i++) {
        _emit.position = _pos.clone().add(new Vector3(randRange(-1.5, 1.5), randRange(-0.8, 0.8), randRange(-1.5, 1.5)));
        _emit.velocity = new Vector3(randRange(-6, 6), randRange(2, 8), randRange(-6, 6));
        _emit.size = randRange(0.35, 0.75);
        _emit.lifetime = randRange(0.2, 0.5);
        _emit.color = '#6ee7b7';
        this.windSparks.emit(1, _emit);
      }
    }
  }

  onImpact() {
    this.dragonGroup.visible = false;
    const impactPos = _pos.copy(this.targetPosition).setY(1.0);

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.add(1.3);
    this.ctx.lights.point(impactPos.x, 3.0, impactPos.z, '#10b981', 18.0, 36.0, 1.2);
    this.ctx.decals.spawn(impactPos.x, impactPos.z, 10.0, DecalType.CRACK, 5.0);
    this.ctx.bursts.trigger(impactPos, 14.0, BurstMode.AIR, 0.7, '#10b981');
  }

  onDestroy() {
    this.dragonGroup.visible = false;
  }
}
