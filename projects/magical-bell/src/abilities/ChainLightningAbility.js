import {
  Group,
  Mesh,
  CylinderGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  Vector3,
  Color
} from 'three';
import { Ability } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { settings } from '../config/settings.js';
import { randRange, lerp } from '../utils/math.js';

const _pos = new Vector3();
const _emit = {};

/**
 * [Enel C] 체인 라이트닝 (Chain Lightning / 뇌룡 연쇄 방전)
 * 3갈래의 고전압 번개 아크가 지그재그로 전방 적들에게 연쇄 타격하며 폭발합니다.
 */
export class ChainLightningAbility extends Ability {
  constructor(context) {
    super('chain_lightning', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.branches = [];
    this.lightningGroup = new Group();
    this.lightningMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfbbf24,
      emissiveIntensity: 4.5,
      roughness: 0.1,
      metalness: 0.8
    });

    // 3 Dynamic Lightning Bolt Meshes
    for (let b = 0; b < 3; b++) {
      const branch = new Group();
      const segments = [];
      for (let s = 0; s < 8; s++) {
        const seg = new Mesh(new CylinderGeometry(0.12, 0.12, 1.5, 6), this.lightningMat);
        branch.add(seg);
        segments.push(seg);
      }
      this.lightningGroup.add(branch);
      this.branches.push({ group: branch, segments });
    }

    setLayerRecursive(this.lightningGroup, LAYER.VFX);
    this.group.add(this.lightningGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.lightningSparks = particles.get('thunder.sparks', {
      capacity: 2500,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.1
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);

    this.lightningMat.opacity = 1.0;
    this.lightningMat.emissiveIntensity = 4.5;

    // Initial Flash & Light
    this.ctx.flash.trigger(0.35);
    this.ctx.shake.add(0.4);
    this.ctx.lights.point(origin.x, origin.y + 1.5, origin.z, '#fbbf24', 8.0, 15.0, 0.4);

    // Ground Decal
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 3.5, DecalType.SCORCH, 4.0);
    this.ctx.bursts.trigger(this.targetPos, 4.0, BurstMode.SPHERE, 0.4, '#fbbf24');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Update lightning branch zig-zag points
    this.branches.forEach((b, bIdx) => {
      const angleOffset = (bIdx - 1) * 0.4;
      const curDir = this.direction.clone().applyAxisAngle(new Vector3(0, 1, 0), angleOffset);
      const start = this.origin.clone().add(new Vector3(0, 1.2, 0));
      const end = this.origin.clone().addScaledVector(curDir, this.distance).add(new Vector3(0, 0.5, 0));

      b.segments.forEach((seg, sIdx) => {
        const t1 = sIdx / b.segments.length;
        const t2 = (sIdx + 1) / b.segments.length;
        const p1 = new Vector3().lerpVectors(start, end, t1);
        const p2 = new Vector3().lerpVectors(start, end, t2);

        // Add random jitter
        p2.x += randRange(-0.4, 0.4);
        p2.y += randRange(-0.3, 0.3);
        p2.z += randRange(-0.4, 0.4);

        seg.position.copy(p1).add(p2).multiplyScalar(0.5);
        seg.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        seg.scale.set(1.0, p1.distanceTo(p2) / 1.5, 1.0);
      });

      // Sparks along the bolt
      if (Math.random() < 0.6) {
        _emit.position = start.clone().lerp(end, Math.random());
        _emit.velocity = new Vector3(randRange(-3, 3), randRange(1, 5), randRange(-3, 3));
        _emit.size = randRange(0.2, 0.4);
        _emit.lifetime = randRange(0.2, 0.5);
        _emit.color = '#fef08a';
        this.lightningSparks.emit(_emit);
      }
    });

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.lightningMat.opacity = fade;
      this.lightningMat.emissiveIntensity = 4.5 * fade;
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
  }
}
