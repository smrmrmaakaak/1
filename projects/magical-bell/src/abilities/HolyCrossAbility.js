import {
  Group,
  Mesh,
  BoxGeometry,
  CylinderGeometry,
  TorusGeometry,
  MeshStandardMaterial,
  Vector3,
  Quaternion
} from 'three';
import { Ability } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { randRange } from '../utils/math.js';

const _emit = {};

/**
 * [Kizaru X] 천총운검 (天叢雲剣 - Ama no Murakumo / Holy Cross)
 * 허공에서 찬란한 황금빛 광검(천총운검)을 소환하여 전방을 X자로 베어가르며 지면에 거대 황금 십자 성흔 대폭발을 일으킵니다.
 */
export class HolyCrossAbility extends Ability {
  constructor(context) {
    super('holy_cross', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.crossGroup = new Group();
    this.crossGroup.matrixAutoUpdate = true;

    this.holyMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 6.5,
      roughness: 0.05,
      metalness: 0.95
    });

    this.bladeMat = new MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfbbf24,
      emissiveIntensity: 8.0,
      roughness: 0.1
    });

    // 1. Procedural 3D Golden Light Sword (Ama no Murakumo)
    this.swordNode = new Group();
    // Long Golden Blade
    const bladeMesh = new Mesh(new BoxGeometry(0.3, 7.5, 0.15), this.bladeMat);
    bladeMesh.position.y = 3.75;
    // Cross Guard
    const guardMesh = new Mesh(new BoxGeometry(1.8, 0.25, 0.3), this.holyMat);
    // Hilt & Pommel
    const hiltMesh = new Mesh(new CylinderGeometry(0.12, 0.12, 1.2, 12), this.holyMat);
    hiltMesh.position.y = -0.6;
    const pommelMesh = new Mesh(new TorusGeometry(0.3, 0.08, 8, 16), this.holyMat);
    pommelMesh.position.y = -1.2;

    this.swordNode.add(bladeMesh, guardMesh, hiltMesh, pommelMesh);
    this.crossGroup.add(this.swordNode);

    // 2. Colossal Ground Holy Cross Energy Beams
    this.barV = new Mesh(new BoxGeometry(1.6, 0.25, 14.0), this.holyMat);
    this.barV.position.y = 0.1;
    this.barH = new Mesh(new BoxGeometry(14.0, 0.25, 1.6), this.holyMat);
    this.barH.position.y = 0.1;
    this.crossGroup.add(this.barV, this.barH);

    setLayerRecursive(this.crossGroup, LAYER.VFX);
    this.group.add(this.crossGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.lightGlitter = particles.get('light.glitter', {
      capacity: 4500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.1
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.crossGroup.position.copy(this.targetPos);
    this.crossGroup.visible = true;

    this.holyMat.emissiveIntensity = 6.5;
    this.bladeMat.emissiveIntensity = 8.0;

    // Sword starts high in the sky and descends diagonally
    this.swordNode.position.set(0, 10.0, 0);
    this.swordNode.rotation.set(Math.PI / 4, 0, Math.PI / 4);
    this.swordNode.visible = true;

    this.ctx.flash.trigger(0.85);
    this.ctx.shake.add(0.8);
    this.ctx.lights.point(this.targetPos.x, 2.5, this.targetPos.z, '#fef08a', 16.0, 30.0, 1.0);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 10.0, DecalType.SCORCH, 5.5);
    this.ctx.bursts.trigger(this.targetPos, 10.0, BurstMode.SPHERE, 0.6, '#fde047');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Sword Slash Animation
    if (this.swordNode.visible) {
      this.swordNode.position.y = Math.max(0.5, 10.0 * (1.0 - p * 2.5));
      this.swordNode.rotation.z += dt * 15.0;
      if (p > 0.45) {
        this.swordNode.visible = false;
      }
    }

    // Expanding Cross Holy Beams
    const scale = 1.0 + p * 4.2;
    this.barV.scale.set(1.0, 1.0, scale);
    this.barH.scale.set(scale, 1.0, 1.0);

    // Radiant Gold Sparkles along Cross
    for (let i = 0; i < 7; i++) {
      const isH = Math.random() < 0.5;
      const off = randRange(-7, 7) * p;
      _emit.position = this.targetPos.clone().add(isH ? new Vector3(off, 0.2, 0) : new Vector3(0, 0.2, off));
      _emit.velocity = new Vector3(randRange(-3, 3), randRange(4, 12), randRange(-3, 3));
      _emit.size = randRange(0.3, 0.7);
      _emit.lifetime = randRange(0.3, 0.8);
      _emit.color = '#ffffff';
      this.lightGlitter.emit(1, _emit);
    }

    if (p > 0.5) {
      const fade = (1.0 - p) / 0.5;
      this.holyMat.emissiveIntensity = 6.5 * fade;
      this.bladeMat.emissiveIntensity = 8.0 * fade;
    }
  }

  onDestroy() {
    this.crossGroup.visible = false;
  }
}
