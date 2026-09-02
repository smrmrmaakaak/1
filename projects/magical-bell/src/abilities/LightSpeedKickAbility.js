import {
  Group,
  Mesh,
  SphereGeometry,
  TorusGeometry,
  PlaneGeometry,
  CylinderGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { randRange, saturate } from '../utils/math.js';
import { getColor } from '../utils/color.js';

const _emit = {};

/**
 * [Kizaru Z/Q Skill] 「빛의 속도로 차여본 적 있나?」 (Have you ever been kicked at the speed of light?)
 * - 원작 샤본디 제도 명장면 100% 재현
 * - 광속 분해 텔레포트 ➔ 발끝 8갈래 십자 스타버스트 & 광자 압축 ➔ 광속 킥 강타 ➔ 초고출력 관통 레이저 및 황금빛 플라즈마 대폭발
 */
export class LightSpeedKickAbility extends Ability {
  constructor(context) {
    super('beam', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.strikeDir = new Vector3(0, 0, -1);
    this.grabbedTarget = null;

    // 1. Kicking Foot Photonic Flare Group
    this.footGroup = new Group();
    this.footGroup.name = 'Kizaru_FootPhotonGroup';
    this.footGroup.matrixAutoUpdate = true;

    this.goldCoreMat = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      side: DoubleSide,
      depthWrite: false
    });

    this.goldGlowMat = new MeshBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0.95,
      side: DoubleSide,
      depthWrite: false
    });

    this.goldAmberMat = new MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.85,
      side: DoubleSide,
      depthWrite: false
    });

    // Foot Charging Photonic Sphere & Rings
    this.footSphere = new Mesh(new SphereGeometry(1.2, 20, 20), this.goldCoreMat);
    this.footRing1 = new Mesh(new TorusGeometry(1.6, 0.18, 8, 28), this.goldGlowMat);
    this.footRing2 = new Mesh(new TorusGeometry(2.2, 0.12, 8, 28), this.goldAmberMat);
    this.footRing1.rotation.x = Math.PI / 2;
    this.footRing2.rotation.y = Math.PI / 2;

    this.footGroup.add(this.footSphere, this.footRing1, this.footRing2);

    // 8-Ray Brilliant Cross Starburst Flare (키자루 시그니처 십자 섬광)
    this.starGroup = new Group();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const rayGeo = new PlaneGeometry(0.4, 6.0);
      const rayMesh = new Mesh(rayGeo, i % 2 === 0 ? this.goldCoreMat : this.goldGlowMat);
      rayMesh.rotation.z = angle;
      this.starGroup.add(rayMesh);
    }
    this.footGroup.add(this.starGroup);

    setLayerRecursive(this.footGroup, LAYER.VFX);
    this.footGroup.visible = false;
    this.ctx.scene.add(this.footGroup);

    // 2. Piercing Laser Beam Column & Nuclear Golden Plasma Detonation
    this.laserGroup = new Group();
    this.laserGroup.name = 'Kizaru_LaserImpactGroup';
    this.laserGroup.matrixAutoUpdate = true;

    const beamGeo = new CylinderGeometry(0.85, 2.0, 22.0, 24, 1, true);
    beamGeo.translate(0, 11.0, 0);
    this.beamCore = new Mesh(beamGeo, this.goldCoreMat);
    this.beamOuter = new Mesh(new CylinderGeometry(1.5, 3.2, 22.0, 24, 1, true), this.goldGlowMat);
    this.beamOuter.geometry.translate(0, 11.0, 0);

    this.impactSphere = new Mesh(new SphereGeometry(3.2, 24, 24), this.goldGlowMat);
    this.impactRing = new Mesh(new TorusGeometry(5.0, 0.3, 8, 36), this.goldCoreMat);
    this.impactRing.rotation.x = Math.PI / 2;

    this.laserGroup.add(this.beamCore, this.beamOuter, this.impactSphere, this.impactRing);
    setLayerRecursive(this.laserGroup, LAYER.VFX);
    this.laserGroup.visible = false;
    this.ctx.scene.add(this.laserGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.lightPhotons = particles.get('spark.gold', {
      capacity: 4500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.15
    });
  }

  get impactDuration() {
    return 0.35;
  }

  get fadeDuration() {
    return 1.40;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);

    this.grabbedTarget = null;
    this.strikeDir.copy(direction).normalize();

    // 1. Gather all active targetable entities
    const targetPool = [];
    if (this.ctx.abilities?.ctx?.devRoom?.isInDevRoom) {
      const dummies = this.ctx.abilities.ctx.devRoom.dummies || [];
      for (const d of dummies) {
        if (d.alive !== false && !d.isDead) targetPool.push(d);
      }
    } else {
      const regularEnemies = this.ctx.abilities?.ctx?.enemies?.enemies || [];
      for (const e of regularEnemies) {
        if (e.alive) targetPool.push(e);
      }
    }

    const maxRange = 35.0;
    let bestEnemy = null;
    let bestDist = 999;
    let bestDot = 0.05;

    for (const target of targetPool) {
      const d = target.position.distanceTo(origin);
      if (d <= maxRange) {
        const toTarget = target.position.clone().sub(origin).normalize();
        const dot = toTarget.dot(this.strikeDir);
        if (dot > bestDot && d < bestDist) {
          bestDist = d;
          bestEnemy = target;
        }
      }
    }

    if (bestEnemy) {
      this.grabbedTarget = bestEnemy;
      this.targetPos.copy(bestEnemy.position);
    } else {
      this.targetPos.copy(origin).addScaledVector(this.strikeDir, Math.min(distance, 6.0));
    }

    // 2. Light Dissolve Teleport: Blink player directly in front of target
    const player = this.ctx.abilities?.ctx?.character;
    if (player) {
      // Golden teleport flash at departure point
      if (this.lightPhotons) {
        for (let i = 0; i < 40; i++) {
          _emit.position = player.position.clone().add(new Vector3(randRange(-0.8, 0.8), randRange(0.2, 2.0), randRange(-0.8, 0.8)));
          _emit.velocity = new Vector3(randRange(-12, 12), randRange(4, 18), randRange(-12, 12));
          _emit.color = Math.random() < 0.7 ? '#fff9c4' : '#fde047';
          _emit.size = randRange(0.6, 1.4);
          _emit.lifetime = randRange(0.4, 0.9);
          this.lightPhotons.emit(1, _emit);
        }
      }

      // Teleport in front of target
      const approachOffset = this.strikeDir.clone().multiplyScalar(-1.7);
      const teleportPos = this.targetPos.clone().add(approachOffset);
      teleportPos.y = player.position.y;
      player.position.copy(teleportPos);
      player.setFacing?.(Math.atan2(this.strikeDir.x, this.strikeDir.z));

      // Play high-speed Kick Animation
      player.playCast?.('kick');
      player.castLunge?.();
    }

    // 3. Immediately trigger the Light Speed Kick and Laser Nuclear Detonation!
    this._executeLightSpeedKick();
  }

  _executeLightSpeedKick() {
    const impactPos = this.targetPos.clone().setY(1.2);

    // 1. Position and display Kicking Foot Photonic Starburst
    const player = this.ctx.abilities?.ctx?.character;
    const pPos = player ? player.position : this.origin;
    const footPos = pPos.clone().addScaledVector(this.strikeDir, 1.2).setY(1.4);
    this.footGroup.position.copy(footPos);
    this.footGroup.scale.set(1.4, 1.4, 1.4);
    this.footGroup.visible = true;

    // 2. Position Laser Impact Detonation
    this.laserGroup.position.copy(impactPos);
    this.laserGroup.scale.set(0.6, 0.6, 0.6);
    this.laserGroup.visible = true;

    // 3. 🌟 Screen-Space Golden Flash & Cataclysmic Camera Shake
    this.ctx.flash?.trigger?.(getColor('#fef08a'), 0.35);
    this.ctx.shake?.add?.(3.2, 1 / 1.0, 65);
    this.ctx.lights?.point?.(impactPos.x, 3.0, impactPos.z, '#fde047', 10.0, 35.0, 1.8);

    // 4. 🌀 High-Velocity Distortion Shockwave & Golden Plasma Burst
    this.ctx.shockwaves?.spawnShockwave(impactPos, 22.0, 0.7, 3.2);
    this.ctx.bursts?.trigger?.(impactPos, 18.0, BurstMode.SPHERE, 0.8, '#fde047');
    this.ctx.decals?.spawn?.(DecalType.CRACK, impactPos, { radius: 15.0, life: 8.0 });
    this.ctx.rockDebris?.spawnExplosion(impactPos, 18, 22.0, 0xfde047);

    // 5. Deal Massive 2,000+ Critical Damage
    if (this.grabbedTarget && this.grabbedTarget.takeDamage) {
      this.grabbedTarget.takeDamage(2000, true);
    }

    // High velocity golden photons
    if (this.lightPhotons) {
      for (let i = 0; i < 90; i++) {
        _emit.position = impactPos.clone().add(new Vector3(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1)));
        _emit.velocity = new Vector3(randRange(-28, 28), randRange(6, 32), randRange(-28, 28));
        _emit.color = Math.random() < 0.6 ? '#ffffff' : '#fef08a';
        _emit.size = randRange(0.8, 1.8);
        _emit.lifetime = randRange(0.5, 1.3);
        this.lightPhotons.emit(1, _emit);
      }
    }
  }

  update(dt) {
    super.update(dt);
    if (!this.laserGroup.visible && !this.footGroup.visible) return;

    const progress = saturate(this.age / (this.impactDuration + this.fadeDuration));

    // High-speed photonic rotations
    this.footRing1.rotation.z += dt * 25.0;
    this.footRing2.rotation.x += dt * 28.0;
    this.starGroup.rotation.z += dt * 18.0;

    // Laser group expansion
    const scaleEase = Math.min(1.0, this.age * 4.5);
    const curScale = 0.6 + scaleEase * 3.4;
    this.laserGroup.scale.set(curScale, curScale, curScale);
    this.impactRing.rotation.z += dt * 15.0;

    // Foot group quick fadeout
    if (this.age > 0.40) {
      this.footGroup.visible = false;
    }

    // Gradual fade of laser detonation
    const fade = 1.0 - Math.pow(progress, 1.4);
    this.goldCoreMat.opacity = fade;
    this.goldGlowMat.opacity = fade * 0.95;
    this.goldAmberMat.opacity = fade * 0.85;

    if (progress >= 1.0) {
      this.laserGroup.visible = false;
      this.footGroup.visible = false;
    }
  }

  onDestroy() {
    this.footGroup.visible = false;
    this.laserGroup.visible = false;
  }
}
