import {
  Group,
  Mesh,
  CylinderGeometry,
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

/**
 * [Blackbeard X] 섀도우 그래스프 (Shadow Grasp / 바닥에서 솟아나는 암흑 촉수)
 * 대상 지점의 바닥에서 암흑의 그림자 촉수들이 솟아올라 적을 결박하고 공허 피해를 줍니다.
 */
export class ShadowGraspAbility extends Ability {
  constructor(context) {
    super('shadow_grasp', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.tentacles = [];
    this.tentacleGroup = new Group();

    this.shadowMat = new MeshStandardMaterial({
      color: 0x050010,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x7e22ce,
      emissiveIntensity: 3.5
    });

    // 8 dark void tendrils
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tNode = new Group();
      const h = 3.5 + Math.random() * 1.5;
      const cyl = new Mesh(new CylinderGeometry(0.08, 0.35, h, 8), this.shadowMat);
      cyl.position.y = h * 0.5;
      cyl.rotation.z = randRange(-0.3, 0.3);
      cyl.rotation.x = randRange(-0.3, 0.3);

      tNode.add(cyl);
      tNode.position.set(Math.cos(angle) * 2.2, 0, Math.sin(angle) * 2.2);
      this.tentacleGroup.add(tNode);
      this.tentacles.push({ node: tNode, height: h });
    }

    setLayerRecursive(this.tentacleGroup, LAYER.VFX);
    this.group.add(this.tentacleGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.darkMist = particles.get('dark.mist', {
      capacity: 3000,
      shape: ParticleShape.SMOKE,
      softFade: 0.35
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.tentacleGroup.position.copy(this.targetPos);

    this.ctx.shake.add(0.5);
    this.ctx.lights.point(this.targetPos.x, 2.0, this.targetPos.z, '#c084fc', 9.0, 18.0, 0.8);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 6.0, DecalType.SCORCH, 6.0);
    this.ctx.bursts.trigger(this.targetPos, 5.0, BurstMode.SPHERE, 0.4, '#a855f7');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Tendril emergence & writhing
    const riseP = Math.min(1.0, p / 0.25);
    this.tentacles.forEach((t, idx) => {
      t.node.position.y = -t.height + riseP * t.height;
      t.node.rotation.y += dt * 2.0;
      t.node.rotation.x = Math.sin(p * 10.0 + idx) * 0.25;
    });

    if (p < 0.6) {
      for (let i = 0; i < 3; i++) {
        _emit.position = this.targetPos.clone().add(new Vector3(randRange(-2, 2), 0.2, randRange(-2, 2)));
        _emit.velocity = new Vector3(randRange(-1, 1), randRange(1, 4), randRange(-1, 1));
        _emit.size = randRange(0.6, 1.2);
        _emit.lifetime = randRange(0.4, 0.8);
        _emit.color = '#2e1065';
        this.darkMist.emit(_emit);
      }
    }

    if (p > 0.75) {
      const sinkP = (p - 0.75) / 0.25;
      this.tentacles.forEach(t => {
        t.node.position.y = -sinkP * t.height;
      });
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
