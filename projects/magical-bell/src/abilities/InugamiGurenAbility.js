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
import { createRealFlameMaterial } from '../materials/RealFlameMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { randRange } from '../utils/math.js';

const _emit = {};
const _pos = new Vector3();

/**
 * [Akainu R] 견신홍련 (犬噛紅蓮 - Inugami Guren / 3D 마그마 맹견 돌진 물어뜯기)
 * - 팔을 끓어오르는 3D 거대 마그마 맹견 형상으로 변형하여 전방 지면을 질주
 * - 턱을 쩍 벌리며(Snapping Jaws) 쇄도하여 적을 물어뜯고 작열하는 마그마 대폭발 발생
 */
export class InugamiGurenAbility extends Ability {
  constructor(context) {
    super('hellfire', context);
  }

  createShaders() {
    this.houndGroup = new Group();
    this.houndGroup.matrixAutoUpdate = true;

    this.flameMaterial = createRealFlameMaterial({ intensity: 6.0, speed: 6.5, turbulence: 2.8 });

    this.magmaMat = new MeshStandardMaterial({
      color: 0x1f0603,
      emissive: 0xff3b00,
      emissiveIntensity: 6.5,
      roughness: 0.25
    });

    this.fangMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffe600,
      emissiveIntensity: 8.0,
      roughness: 0.1
    });

    this.eyeMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffcc00,
      emissiveIntensity: 9.0
    });

    // 1. Procedural 3D Sculpted Magma Hound Head
    this.headNode = new Group();

    // Upper Skull & Snout
    const skull = new Mesh(new BoxGeometry(1.6, 1.1, 2.2), this.magmaMat);
    skull.position.set(0, 0.4, 0.4);
    const snout = new Mesh(new BoxGeometry(1.3, 0.8, 1.8), this.magmaMat);
    snout.position.set(0, 0.15, 1.8);

    // Upper Sharp Fangs
    const fangL1 = new Mesh(new ConeGeometry(0.16, 0.8, 4), this.fangMat);
    fangL1.position.set(0.5, -0.35, 2.3);
    fangL1.rotation.x = Math.PI;
    const fangR1 = new Mesh(new ConeGeometry(0.16, 0.8, 4), this.fangMat);
    fangR1.position.set(-0.5, -0.35, 2.3);
    fangR1.rotation.x = Math.PI;

    // Lower Snapping Jaw
    this.lowerJaw = new Group();
    const jawMesh = new Mesh(new BoxGeometry(1.2, 0.5, 2.0), this.magmaMat);
    jawMesh.position.set(0, 0, 0.8);
    // Lower Fangs
    const fangL2 = new Mesh(new ConeGeometry(0.15, 0.7, 4), this.fangMat);
    fangL2.position.set(0.45, 0.35, 1.5);
    const fangR2 = new Mesh(new ConeGeometry(0.15, 0.7, 4), this.fangMat);
    fangR2.position.set(-0.45, 0.35, 1.5);
    this.lowerJaw.add(jawMesh, fangL2, fangR2);
    this.lowerJaw.position.set(0, -0.35, 0.5);

    // Ferocious Pointed Ears
    const earL = new Mesh(new ConeGeometry(0.32, 1.2, 4), this.magmaMat);
    earL.position.set(0.75, 1.1, -0.2);
    earL.rotation.set(-0.35, 0, 0.45);
    const earR = new Mesh(new ConeGeometry(0.32, 1.2, 4), this.magmaMat);
    earR.position.set(-0.75, 1.1, -0.2);
    earR.rotation.set(-0.35, 0, -0.45);

    // Glowing Predator Eyes
    const eyeL = new Mesh(new SphereGeometry(0.22, 8, 8), this.eyeMat);
    eyeL.position.set(0.68, 0.65, 1.2);
    const eyeR = new Mesh(new SphereGeometry(0.22, 8, 8), this.eyeMat);
    eyeR.position.set(-0.68, 0.65, 1.2);

    // Raging Magma Mane Flame Body
    const flameBody = new Mesh(new SphereGeometry(1.8, 16, 16), this.flameMaterial);
    flameBody.position.set(0, 0.2, -0.6);

    this.headNode.add(skull, snout, fangL1, fangR1, this.lowerJaw, earL, earR, eyeL, eyeR, flameBody);
    this.houndGroup.add(this.headNode);

    setLayerRecursive(this.houndGroup, LAYER.VFX);
    this.group.add(this.houndGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.magmaSparks = particles.get('fire.sparks', {
      capacity: 4500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.15
    });

    this.magmaSmoke = particles.get('fire.smoke', {
      capacity: 3000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 0.8
    });
  }

  get impactDuration() {
    return 1.1; // Fast, violent hound charge
  }

  get fadeDuration() {
    return 0.5;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.houndGroup.visible = true;
    this.houndGroup.position.copy(origin);
    this.headNode.scale.set(1.0, 1.0, 1.0);

    this.magmaMat.emissiveIntensity = 6.5;
    this.fangMat.emissiveIntensity = 8.0;
    this.eyeMat.emissiveIntensity = 9.0;

    this.ctx.flash?.trigger(0.85);
    this.ctx.shake?.add(1.0);
    this.ctx.lights?.point?.(origin.x, 2.0, origin.z, '#ff4500', 16.0, 28.0, 0.8);
  }

  onTravel(dt) {
    const u = this.u; // 0..1
    this.pointAt(u, _pos);
    // Skims ground with aggressive bound motion
    _pos.y = 1.2 + Math.abs(Math.sin(u * Math.PI * 4.0)) * 0.45;

    this.headNode.position.copy(_pos);
    this.headNode.rotation.y = Math.atan2(this.direction.x, this.direction.z);
    this.headNode.rotation.x = Math.sin(u * 12.0) * 0.15;

    // Snapping jaws open and shut violently!
    if (this.lowerJaw) {
      this.lowerJaw.rotation.x = -Math.abs(Math.sin(u * 18.0)) * 0.65;
    }

    // Fiery volcanic particle trail behind the hound
    if (this.magmaSparks && Math.random() < 0.95) {
      for (let i = 0; i < 5; i++) {
        _emit.position = _pos.clone().add(new Vector3(randRange(-1, 1), randRange(-0.4, 0.4), randRange(-1, 1)));
        _emit.velocity = new Vector3(randRange(-4, 4), randRange(2, 7), randRange(-4, 4));
        _emit.size = randRange(0.35, 0.75);
        _emit.lifetime = randRange(0.25, 0.55);
        _emit.color = Math.random() < 0.5 ? '#ff3700' : '#ffaa00';
        this.magmaSparks.emit(1, _emit);
      }
    }
  }

  onImpact() {
    this.houndGroup.visible = false;
    const impactPos = _pos.copy(this.targetPosition).setY(1.0);

    this.ctx.flash?.trigger(0.95);
    this.ctx.shake?.add(1.5);
    this.ctx.lights?.point?.(impactPos.x, 3.5, impactPos.z, '#ff3700', 22.0, 42.0, 1.5);
    this.ctx.decals?.spawn?.(DecalType.SCORCH, impactPos, { radius: 6.0, life: 5.5 });
    this.ctx.bursts?.trigger?.(impactPos, 14.0, BurstMode.FIRE, 0.8, '#ff3700');

    // Massive beast bite explosion sparks
    if (this.magmaSparks) {
      for (let i = 0; i < 30; i++) {
        _emit.position = impactPos.clone().add(new Vector3(randRange(-1, 1), randRange(0, 2), randRange(-1, 1)));
        _emit.velocity = new Vector3(randRange(-12, 12), randRange(4, 16), randRange(-12, 12));
        _emit.size = randRange(0.4, 0.85);
        _emit.lifetime = randRange(0.4, 0.8);
        _emit.color = '#ff4500';
        this.magmaSparks.emit(1, _emit);
      }
    }
  }

  onDestroy() {
    this.houndGroup.visible = false;
  }
}
