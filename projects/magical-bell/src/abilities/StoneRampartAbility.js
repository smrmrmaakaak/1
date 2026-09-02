import {
  Group,
  Mesh,
  BoxGeometry,
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
 * [Whitebeard X] 스톤 램파트 (Stone Rampart / 대기 가르기 지면 융기 성벽)
 * 거대한 암석 방벽들이 전방에 성벽처럼 솟아올라 적의 공격을 차단하고 광역 충격을 줍니다.
 */
export class StoneRampartAbility extends Ability {
  constructor(context) {
    super('stone_rampart', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.pillars = [];
    this.wallGroup = new Group();

    this.stoneMat = new MeshStandardMaterial({
      color: 0x4e342e,
      roughness: 0.9,
      metalness: 0.1
    });

    this.energyMat = new MeshStandardMaterial({
      color: 0xccff00,
      emissive: 0x84cc16,
      emissiveIntensity: 4.0,
      roughness: 0.2
    });

    // 5 interlocking megalith pillars
    for (let i = 0; i < 5; i++) {
      const pillar = new Group();
      const h = 3.5 + Math.random() * 1.5;
      const box = new Mesh(new BoxGeometry(1.2, h, 1.2), this.stoneMat);
      box.position.y = h * 0.5;
      box.rotation.y = randRange(-0.2, 0.2);

      const seam = new Mesh(new BoxGeometry(0.2, h * 0.9, 1.25), this.energyMat);
      seam.position.y = h * 0.5;

      pillar.add(box, seam);
      this.wallGroup.add(pillar);
      this.pillars.push({ node: pillar, height: h });
    }

    setLayerRecursive(this.wallGroup, LAYER.VFX);
    this.group.add(this.wallGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.dustParticles = particles.get('earth.dust', {
      capacity: 3000,
      shape: ParticleShape.SMOKE,
      softFade: 0.3
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);

    const right = new Vector3(-direction.z, 0, direction.x).normalize();
    this.pillars.forEach((p, idx) => {
      const offset = (idx - 2) * 1.3;
      const pos = this.targetPos.clone().addScaledVector(right, offset);
      p.node.position.set(pos.x, -p.height, pos.z);
    });

    this.ctx.shake.add(0.7);
    this.ctx.lights.point(this.targetPos.x, 3.0, this.targetPos.z, '#a3e635', 10.0, 20.0, 0.8);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 5.5, DecalType.CRACK, 5.5);
    this.ctx.bursts.trigger(this.targetPos, 6.0, BurstMode.SPHERE, 0.5, '#bef264');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Rise up quickly
    const riseP = Math.min(1.0, p / 0.2);
    this.pillars.forEach(p => {
      p.node.position.y = -p.height + riseP * p.height;
    });

    if (p < 0.3) {
      for (let i = 0; i < 3; i++) {
        _emit.position = this.targetPos.clone().add(new Vector3(randRange(-3, 3), 0.2, randRange(-1, 1)));
        _emit.velocity = new Vector3(randRange(-3, 3), randRange(3, 8), randRange(-3, 3));
        _emit.size = randRange(0.6, 1.2);
        _emit.lifetime = randRange(0.5, 1.0);
        _emit.color = '#6d4c41';
        this.dustParticles.emit(_emit);
      }
    }

    if (p > 0.75) {
      const sinkP = (p - 0.75) / 0.25;
      this.pillars.forEach(p => {
        p.node.position.y = -sinkP * p.height;
      });
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
