import {
  Group,
  Mesh,
  CylinderGeometry,
  PlaneGeometry,
  TorusGeometry,
  Vector3,
  Color,
  MathUtils
} from 'three';
import { Ability } from './Ability.js';
import { settings } from '../config/settings.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { RateEmitter } from '../particles/ParticleEngine.js';
import { LAYER } from '../core/Layers.js';
import { getColor } from '../utils/color.js';
import { frame } from '../core/FrameUniforms.js';
import { createInfernoPillarMaterial, createInfernoRuneMaterial } from '../materials/InfernoMaterial.js';

const _pos = new Vector3();
const _dir = new Vector3();
const _emit = {};

/**
 * AAA-Grade Hellfire Cataclysm (헬파이어 카타클리즘)
 * - 3D Vertex Displaced Volumetric Vortex Pillar
 * - Glowing Multi-Rune Magma Pentagram
 * - Quad Swirling Fire Spiral Arcs
 * - Multi-tiered Black-body Heat Particles (Core Spark, Lava Embers, Smoldering Plumes)
 * - Ground Scorching & Screen Shake
 */
export class InfernoAbility extends Ability {
  constructor(context) {
    super('inferno', context);

    this.group.matrixAutoUpdate = true;
    this.targetPos = new Vector3();
    this.zoneRadius = 8.5;

    this._buildInfernoMeshes();
  }

  get impactDuration() {
    return 4.8;
  }

  get fadeDuration() {
    return 1.4;
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.embers = particles.get('inferno.embers', {
      capacity: 3500,
      shape: ParticleShape.CHIP,
      additive: true,
      lit: true,
      softFade: 0.2
    });

    this.smoke = particles.get('inferno.smoke', {
      capacity: 3000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.2
    });

    this.flames = particles.get('inferno.flames', {
      capacity: 3200,
      shape: ParticleShape.SOFT,
      additive: true,
      curl: true,
      softFade: 0.35
    });

    this.emberEmitter = new RateEmitter(140);
    this.flameEmitter = new RateEmitter(90);
    this.smokeEmitter = new RateEmitter(40);
  }

  _buildInfernoMeshes() {
    // 1. Procedural Magma Pentagram Rune Ground Mesh
    this.runeMaterial = createInfernoRuneMaterial();
    this.runeMesh = new Mesh(new PlaneGeometry(18.0, 18.0, 1, 1), this.runeMaterial);
    this.runeMesh.rotation.x = -Math.PI / 2;
    this.runeMesh.position.y = 0.12;
    this.group.add(this.runeMesh);

    // 2. High-Grade Procedural Vertex-Displaced Volumetric Inferno Pillar
    this.pillarMaterial = createInfernoPillarMaterial();
    this.pillarMesh = new Mesh(
      new CylinderGeometry(3.6, 7.2, 34.0, 36, 40, true),
      this.pillarMaterial
    );
    this.pillarMesh.position.y = 17.0;
    this.group.add(this.pillarMesh);

    // 3. Inner White-Hot Core Flame Column
    this.coreMaterial = createInfernoPillarMaterial();
    this.coreMaterial.uniforms.uColorOuter.value.set('#ffbb00');
    this.coreMaterial.uniforms.uColorMid.value.set('#ffffff');
    this.coreMaterial.uniforms.uTwistSpeed.value = 6.5;
    this.coreMesh = new Mesh(
      new CylinderGeometry(1.6, 3.2, 30.0, 24, 24, true),
      this.coreMaterial
    );
    this.coreMesh.position.y = 15.0;
    this.group.add(this.coreMesh);

    // 4. Quad Orbiting Flame Rings / Spirals
    this.spirals = [];
    for (let i = 0; i < 3; i++) {
      const ringMat = createInfernoRuneMaterial();
      ringMat.uniforms.uPulseSpeed.value = 8.0 + i * 2.0;
      const ring = new Mesh(new TorusGeometry(3.5 + i * 1.5, 0.28, 8, 32), ringMat);
      ring.rotation.x = Math.PI / 3 + i * 0.2;
      ring.position.y = 2.0 + i * 4.0;
      this.group.add(ring);
      this.spirals.push({ mesh: ring, mat: ringMat, speed: 3.5 + i * 2.0, baseHeight: 2.0 + i * 4.0 });
    }

    this.group.traverse((c) => {
      c.layers.set(LAYER.WORLD);
      c.layers.enable(LAYER.VFX);
    });
  }

  onSpawn() {
    this.targetPos.copy(this.origin).addScaledVector(this.direction, this.length);
    this.targetPos.y = 0;

    this.group.position.copy(this.targetPos);
    this.group.updateMatrixWorld(true);
    this.group.visible = true;

    // Reset Material States
    this.runeMaterial.uniforms.uOpacity.value = 1.0;
    this.pillarMaterial.uniforms.uErosion.value = 0.85; // hidden at start
    this.coreMaterial.uniforms.uErosion.value = 0.85;

    this.embers?.setGradient(
      getColor('#ffffff'),
      getColor('#ffcc00'),
      getColor('#ff4400'),
      getColor('#880000')
    );

    this.flames?.setGradient(
      getColor('#ffffff'),
      getColor('#ff9900'),
      getColor('#ff2200'),
      getColor('#440000')
    );

    this.smoke?.setGradient(
      getColor('#441100'),
      getColor('#2b0500'),
      getColor('#1a0400'),
      getColor('#000000')
    );

    // Origin flame burst
    this.ctx.bursts?.spawn(BurstMode.FIRE, this.origin, {
      radius: 0.8,
      endRadius: 4.2,
      life: 0.35,
      intensity: 3.0
    });
  }

  onTravel(dt) {
    // Rune spinning and charging on ground
    this.runeMesh.rotation.z += dt * 3.5;

    // Inward spiraling ember particles toward target center
    if (this.embers) {
      for (let i = 0; i < 4; i++) {
        const rad = 4.0 + Math.random() * 3.0;
        const ang = Math.random() * Math.PI * 2;
        _emit.position = _pos.set(
          this.targetPos.x + Math.cos(ang) * rad,
          0.3,
          this.targetPos.z + Math.sin(ang) * rad
        );
        _emit.direction = _dir.set(-Math.cos(ang), 0.6, -Math.sin(ang)).normalize();
        _emit.speed = 9.0;
        _emit.speedVariance = 0.5;
        _emit.size = 0.3;
        _emit.life = 0.45;
        _emit.spin = 10;
        _emit.time = frame.uTime.value;
        this.embers.emit(2, _emit);
      }
    }
  }

  onImpact() {
    // Eruption: Fully reveal pillar and core
    this.pillarMaterial.uniforms.uErosion.value = 0.0;
    this.coreMaterial.uniforms.uErosion.value = 0.0;

    // Environmental Impact: Powerful screen shake and volcanic flash
    this.ctx.shake?.add(0.65, 5.2, 45);
    if (this.ctx.flash) {
      this.ctx.flash.trigger(new Color('#ff5500'), 0.55);
    }

    // Ground Scorch Decal & Massive Volumetric Burst Sphere
    this.ctx.decals?.spawn(DecalType.SCORCH, this.targetPos, 8.0, 6.0);
    this.ctx.bursts?.spawn(BurstMode.FIRE, this.targetPos, {
      radius: 2.0,
      endRadius: 14.0,
      life: 0.65,
      intensity: 5.0,
      opacity: 0.95,
      colorA: getColor('#ffffff'),
      colorB: getColor('#ffaa00'),
      colorC: getColor('#ff2200')
    });

    // Explosive Spark Dispersion (200+ physics particles)
    if (this.embers) {
      for (let i = 0; i < 8; i++) {
        _emit.position = _pos.copy(this.targetPos).setY(1.0);
        _emit.radius = 1.8;
        _emit.direction = _dir.set(
          (Math.random() - 0.5) * 2.5,
          Math.random() * 2.8 + 1.2,
          (Math.random() - 0.5) * 2.5
        ).normalize();
        _emit.speed = 18.0 + Math.random() * 14.0;
        _emit.speedVariance = 0.7;
        _emit.spread = 0.95;
        _emit.size = 0.55;
        _emit.sizeVariance = 0.7;
        _emit.life = 2.2;
        _emit.spin = 15;
        _emit.time = frame.uTime.value;
        this.embers.emit(30, _emit);
      }
    }
  }

  onFade(dt, progress) {
    const time = frame.uTime.value;

    // Rotate and animate meshes
    this.runeMesh.rotation.z += dt * 1.5;
    this.pillarMesh.rotation.y += dt * 4.0;
    this.coreMesh.rotation.y -= dt * 6.0;

    // Animate spirals rising upward
    this.spirals.forEach((sp, idx) => {
      sp.mesh.rotation.z += dt * sp.speed;
      sp.mesh.position.y = sp.baseHeight + Math.sin(time * 3.0 + idx) * 1.5;
      sp.mat.uniforms.uOpacity.value = Math.max(0, 1.0 - progress);
    });

    // Dissolve erosion
    const erosion = MathUtils.clamp(progress * 1.3 - 0.2, 0.0, 1.0);
    this.pillarMaterial.uniforms.uErosion.value = erosion;
    this.coreMaterial.uniforms.uErosion.value = erosion;
    this.runeMaterial.uniforms.uOpacity.value = Math.max(0, 1.0 - progress * 1.1);

    // Continuous Boiling Flame Plumes & Dark Smoke
    const activeRadius = this.zoneRadius * (1.0 - progress * 0.4);

    if (this.flames && progress < 0.85) {
      _emit.position = _pos.copy(this.targetPos).setY(0.5);
      _emit.radius = activeRadius * 0.8;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = 9.0;
      _emit.speedVariance = 0.8;
      _emit.spread = 0.7;
      _emit.size = 1.2 * (1.0 - progress * 0.6);
      _emit.sizeVariance = 0.5;
      _emit.life = 1.0;
      _emit.spin = 8;
      _emit.time = time;
      this.flames.emit(12, _emit);
    }

    if (this.smoke && progress < 0.9) {
      _emit.position = _pos.copy(this.targetPos).setY(2.0 + progress * 8.0);
      _emit.radius = activeRadius * 0.6;
      _emit.direction = _dir.set(0, 1, 0);
      _emit.speed = 5.0;
      _emit.speedVariance = 0.6;
      _emit.spread = 0.8;
      _emit.size = 2.0 + progress * 1.5;
      _emit.sizeVariance = 0.6;
      _emit.life = 1.8;
      _emit.spin = 4;
      _emit.time = time;
      this.smoke.emit(6, _emit);
    }
  }

  onDestroy() {
    this.runeMaterial.uniforms.uOpacity.value = 0;
    this.pillarMaterial.uniforms.uErosion.value = 1.0;
    this.coreMaterial.uniforms.uErosion.value = 1.0;
    this.group.visible = false;
  }
}
