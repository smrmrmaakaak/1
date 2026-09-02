import {
  Group,
  Mesh,
  ConeGeometry,
  BoxGeometry,
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
const _pos = new Vector3();

/**
 * [Enel C] 6천만 볼트 뇌룡 (60,000,000V Lightning Dragon / 뇌룡 앙골)
 * 거대한 3D 뇌룡이 벼락과 함께 소환되어 포효하며 전방으로 굽이치며 돌진하여 적을 집어삼키고 방전 폭발을 일으킵니다.
 */
export class LightningDragonAbility extends Ability {
  constructor(context) {
    super('chain_lightning', context);
  }

  createShaders() {
    this.dragonGroup = new Group();
    this.dragonGroup.matrixAutoUpdate = true;

    this.lightningMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 7.0,
      roughness: 0.05,
      metalness: 0.95
    });

    this.hornMat = new MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xeab308,
      emissiveIntensity: 6.0,
      roughness: 0.1
    });

    // 1. Procedural 3D Lightning Dragon Head
    this.headNode = new Group();
    // Skull
    const skull = new Mesh(new BoxGeometry(1.8, 1.4, 2.8), this.lightningMat);
    skull.position.z = 1.0;
    // Lower Jaw
    const jaw = new Mesh(new BoxGeometry(1.5, 0.6, 2.4), this.lightningMat);
    jaw.position.set(0, -0.7, 1.2);
    // Dragon Horns
    const hornL = new Mesh(new ConeGeometry(0.35, 2.2, 5), this.hornMat);
    hornL.position.set(0.8, 1.2, -0.4);
    hornL.rotation.set(-0.5, 0, 0.4);
    const hornR = new Mesh(new ConeGeometry(0.35, 2.2, 5), this.hornMat);
    hornR.position.set(-0.8, 1.2, -0.4);
    hornR.rotation.set(-0.5, 0, -0.4);
    // Glowing Eyes
    const eyeL = new Mesh(new SphereGeometry(0.25, 8, 8), this.hornMat);
    eyeL.position.set(0.7, 0.4, 1.6);
    const eyeR = new Mesh(new SphereGeometry(0.25, 8, 8), this.hornMat);
    eyeR.position.set(-0.7, 0.4, 1.6);

    this.headNode.add(skull, jaw, hornL, hornR, eyeL, eyeR);
    this.dragonGroup.add(this.headNode);

    // 2. 6 Dragon Body Spine Segments
    this.bodySegments = [];
    for (let i = 0; i < 6; i++) {
      const seg = new Mesh(new BoxGeometry(1.5 - i * 0.15, 1.2 - i * 0.12, 1.6), this.lightningMat);
      this.dragonGroup.add(seg);
      this.bodySegments.push(seg);
    }

    setLayerRecursive(this.dragonGroup, LAYER.VFX);
    this.group.add(this.dragonGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.lightningSparks = particles.get('thunder.sparks', {
      capacity: 4500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.1
    });
  }

  get impactDuration() {
    return 1.4;
  }

  get fadeDuration() {
    return 0.6;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.dragonGroup.visible = true;

    this.ctx.flash.trigger(0.85);
    this.ctx.shake.add(0.9);
  }

  onTravel(dt) {
    const u = this.u; // 0..1
    this.pointAt(u, _pos);
    // Dragon undulates up and down in a serpentine motion
    _pos.y = 1.8 + Math.sin(u * Math.PI * 4.0) * 1.5;

    this.headNode.position.copy(_pos);
    this.headNode.rotation.y = Math.atan2(this.direction.x, this.direction.z) + Math.cos(u * 12.0) * 0.4;
    this.headNode.rotation.x = Math.sin(u * 12.0) * 0.3;

    // Body segments follow the head trail
    this.bodySegments.forEach((seg, idx) => {
      const delayU = Math.max(0, u - (idx + 1) * 0.05);
      const segPos = new Vector3();
      this.pointAt(delayU, segPos);
      segPos.y = 1.8 + Math.sin(delayU * Math.PI * 4.0) * 1.5;
      seg.position.copy(segPos);
      seg.rotation.y = this.headNode.rotation.y;
    });

    // Lightning sparks crackling off the dragon
    if (this.lightningSparks && Math.random() < 0.9) {
      for (let i = 0; i < 4; i++) {
        _emit.position = _pos.clone().add(new Vector3(randRange(-1.5, 1.5), randRange(-1, 1), randRange(-1.5, 1.5)));
        _emit.velocity = new Vector3(randRange(-6, 6), randRange(-2, 6), randRange(-6, 6));
        _emit.size = randRange(0.3, 0.7);
        _emit.lifetime = randRange(0.2, 0.5);
        _emit.color = '#38bdf8';
        this.lightningSparks.emit(1, _emit);
      }
    }
  }

  onImpact() {
    this.dragonGroup.visible = false;
    const impactPos = _pos.copy(this.targetPosition).setY(1.0);

    this.ctx.flash.trigger(0.95);
    this.ctx.shake.add(1.3);
    this.ctx.lights.point(impactPos.x, 3.0, impactPos.z, '#38bdf8', 18.0, 35.0, 1.2);
    this.ctx.decals.spawn(impactPos.x, impactPos.z, 10.0, DecalType.ARC, 5.0);
    this.ctx.bursts.trigger(impactPos, 14.0, BurstMode.STORM, 0.7, '#38bdf8');
  }

  onDestroy() {
    this.dragonGroup.visible = false;
  }
}
