import {
  Group,
  Mesh,
  SphereGeometry,
  CylinderGeometry,
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
 * [Kizaru T / Ultimate] 팔척경곡옥 (八尺瓊曲玉 - Yasakani no Magatama)
 * 허공에 24개의 영롱한 3D 황금빛 곡옥(Magatama)들을 생성한 뒤 전방 지면에 광속 광탄 융단폭격을 쏟아붓습니다.
 */
export class DivineJudgmentAbility extends Ability {
  constructor(context) {
    super('divine_judgment', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.orbs = [];
    this.magatamaGroup = new Group();
    this.magatamaGroup.matrixAutoUpdate = true;

    this.magatamaMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 7.0,
      roughness: 0.05,
      metalness: 0.95
    });

    this.tailMat = new MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfbbf24,
      emissiveIntensity: 6.0,
      roughness: 0.1
    });

    // 24 Photon Magatama Light Projectiles
    for (let i = 0; i < 24; i++) {
      const orbNode = new Group();
      // Curved Magatama Head (Sphere)
      const head = new Mesh(new SphereGeometry(0.7, 16, 16), this.magatamaMat);
      // Tapered Curved Tail (Cylinder + Torus arc)
      const tail = new Mesh(new CylinderGeometry(0.08, 0.7, 3.2, 10), this.tailMat);
      tail.position.y = 1.6;
      tail.rotation.z = 0.2;

      orbNode.add(head, tail);
      this.magatamaGroup.add(orbNode);
      this.orbs.push({
        node: orbNode,
        offset: new Vector3(randRange(-9, 9), randRange(22, 40), randRange(-9, 9)),
        speed: randRange(45, 75),
        hasLanded: false
      });
    }

    setLayerRecursive(this.magatamaGroup, LAYER.VFX);
    this.group.add(this.magatamaGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.photonSparks = particles.get('light.magatama', {
      capacity: 6500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.1
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.magatamaGroup.position.copy(this.targetPos);
    this.magatamaGroup.visible = true;

    this.magatamaMat.emissiveIntensity = 7.0;
    this.tailMat.emissiveIntensity = 6.0;

    this.orbs.forEach(o => {
      o.node.position.copy(o.offset);
      o.node.visible = true;
      o.hasLanded = false;
    });

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.add(1.4);
    this.ctx.lights.point(this.targetPos.x, 3.0, this.targetPos.z, '#ffffff', 20.0, 40.0, 1.6);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 14.0, DecalType.SCORCH, 6.5);
    this.ctx.bursts.trigger(this.targetPos, 15.0, BurstMode.SPHERE, 0.7, '#fef08a');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Raining down magatamas at light speed
    this.orbs.forEach((o, idx) => {
      if (o.node.position.y > 0.3) {
        o.node.position.y -= o.speed * dt;
        o.node.position.x += Math.sin(p * 25.0 + idx) * 0.08;

        // Photon trail particles
        if (Math.random() < 0.6) {
          _emit.position = this.targetPos.clone().add(o.node.position);
          _emit.velocity = new Vector3(randRange(-2, 2), randRange(2, 6), randRange(-2, 2));
          _emit.size = randRange(0.3, 0.7);
          _emit.lifetime = randRange(0.2, 0.5);
          _emit.color = '#ffffff';
          this.photonSparks.emit(1, _emit);
        }
      } else if (!o.hasLanded) {
        o.hasLanded = true;
        o.node.visible = false;
        // Impact ground explosion per magatama
        const hitPos = this.targetPos.clone().add(new Vector3(o.node.position.x, 0.2, o.node.position.z));
        this.ctx.bursts.trigger(hitPos, 4.5, BurstMode.SPHERE, 0.35, '#fde047');
        this.ctx.decals.spawn(hitPos.x, hitPos.z, 3.0, DecalType.SCORCH, 3.5);
      }
    });

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.magatamaMat.emissiveIntensity = 7.0 * fade;
    }
  }

  onDestroy() {
    this.magatamaGroup.visible = false;
  }
}
