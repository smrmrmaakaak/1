import {
  Group,
  Mesh,
  IcosahedronGeometry,
  TorusGeometry,
  CylinderGeometry,
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
 * [Kizaru C] 야타의 거울 (八咫鏡 - Yata no Kagami / Sanctuary Dome)
 * 찬란한 12면체 황금빛 거울 프리즘 돔을 펼쳐 광속 반사와 굴절 광선 결계를 전개합니다.
 */
export class SanctuaryDomeAbility extends Ability {
  constructor(context) {
    super('sanctuary_dome', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.domeGroup = new Group();
    this.domeGroup.matrixAutoUpdate = true;

    // Outer Refractive Mirror Glass Material
    this.mirrorMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 5.5,
      transparent: true,
      opacity: 0.65,
      roughness: 0.0,
      metalness: 0.95,
      wireframe: false
    });

    // Inner Neon Wireframe Lattice
    this.wireMat = new MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfbbf24,
      emissiveIntensity: 8.0,
      wireframe: true
    });

    this.ringMat = new MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xfbbf24,
      emissiveIntensity: 6.0,
      roughness: 0.1
    });

    // 1. Faceted 12-sided Mirror Dome (Radius 6.5)
    this.outerDome = new Mesh(new IcosahedronGeometry(6.5, 1), this.mirrorMat);
    this.outerDome.position.y = 0.5;
    this.innerDome = new Mesh(new IcosahedronGeometry(6.4, 2), this.wireMat);
    this.innerDome.position.y = 0.5;
    this.domeGroup.add(this.outerDome, this.innerDome);

    // 2. Rotating Celestial Light Rings
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new Mesh(new TorusGeometry(6.6 + i * 0.3, 0.18, 8, 36), this.ringMat);
      ring.rotation.x = Math.PI / 2 + (i * Math.PI) / 6;
      this.domeGroup.add(ring);
      this.rings.push(ring);
    }

    setLayerRecursive(this.domeGroup, LAYER.VFX);
    this.group.add(this.domeGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.sparkles = particles.get('light.dome', {
      capacity: 4000,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.2
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.domeGroup.position.copy(this.targetPos);
    this.domeGroup.visible = true;

    this.mirrorMat.opacity = 0.65;
    this.mirrorMat.emissiveIntensity = 5.5;

    this.ctx.shake.add(0.5);
    this.ctx.lights.point(this.targetPos.x, 3.5, this.targetPos.z, '#faf5ff', 15.0, 26.0, 1.2);
    this.ctx.bursts.trigger(this.targetPos, 8.5, BurstMode.SPHERE, 0.5, '#fef08a');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Prismatic rotations
    this.outerDome.rotation.y += dt * 1.5;
    this.innerDome.rotation.y -= dt * 2.2;
    this.innerDome.rotation.x += dt * 1.1;

    this.rings.forEach((r, idx) => {
      r.rotation.z += dt * (3.0 + idx * 1.5);
    });

    const pulse = 1.0 + Math.sin(p * 12.0) * 0.08;
    this.outerDome.scale.set(pulse, pulse, pulse);

    // Light sparkles floating upwards from mirror facets
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = randRange(0.5, 6.2);
      _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, randRange(0.2, 5.5), Math.sin(angle) * r));
      _emit.velocity = new Vector3(Math.cos(angle) * 2, randRange(2, 6), Math.sin(angle) * 2);
      _emit.size = randRange(0.25, 0.6);
      _emit.lifetime = randRange(0.4, 0.8);
      _emit.color = '#ffffff';
      this.sparkles.emit(1, _emit);
    }

    if (p > 0.6) {
      const fade = (1.0 - p) / 0.4;
      this.mirrorMat.opacity = 0.65 * fade;
      this.mirrorMat.emissiveIntensity = 5.5 * fade;
      this.ringMat.emissiveIntensity = 6.0 * fade;
    }
  }

  onDestroy() {
    this.domeGroup.visible = false;
  }
}
