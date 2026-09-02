import {
  Group,
  Mesh,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Vector3
} from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { randRange, saturate } from '../utils/math.js';

const _emit = {};
const NUM_CRACKS = 36;

/**
 * [Whitebeard Q] 마린포드 484화 — 아카이누 멱살 포획 & 명부 대기분쇄격 (Seismic Skull Crusher)
 * 0.05초 초고속 순간이동 후 즉각적인 지진 주먹 강타 + 3D 대기 균열 + 마린포드 레드/블루 네거티브 색반전
 */
export class AirQuakeAbility extends Ability {
  constructor(context) {
    super('earth_spike', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.strikeDir = new Vector3(0, 0, -1);
    this.grabbedTarget = null;
    this.hasSlammed = false;

    // 1. Gura Gura Tremor Fist Sphere
    this.fistGroup = new Group();
    this.fistGroup.name = 'AirQuake_FistGroup';
    this.fistGroup.matrixAutoUpdate = true;

    this.fistSphere = new Mesh(
      new SphereGeometry(0.95, 20, 20),
      new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
    );
    this.fistRing1 = new Mesh(
      new TorusGeometry(1.3, 0.16, 8, 24),
      new MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.95 })
    );
    this.fistRing2 = new Mesh(
      new TorusGeometry(1.8, 0.10, 8, 24),
      new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
    );
    this.fistRing1.rotation.x = Math.PI / 2;
    this.fistRing2.rotation.y = Math.PI / 2;

    this.fistGroup.add(this.fistSphere, this.fistRing1, this.fistRing2);
    setLayerRecursive(this.fistGroup, LAYER.VFX);
    this.fistGroup.visible = false;
    this.ctx.scene.add(this.fistGroup);

    // 2. Colossal 3D Shattered Air Crack Shards
    this.quakeGroup = new Group();
    this.quakeGroup.name = 'AirQuake_QuakeGroup';
    this.quakeGroup.matrixAutoUpdate = true;

    this.coreMat = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      side: DoubleSide,
      depthWrite: false
    });

    this.cyanMat = new MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95,
      side: DoubleSide,
      depthWrite: false
    });

    this.impactCore = new Mesh(new SphereGeometry(1.6, 24, 24), this.coreMat);
    this.shockRing1 = new Mesh(new TorusGeometry(2.2, 0.25, 8, 32), this.coreMat);
    this.shockRing2 = new Mesh(new TorusGeometry(3.6, 0.18, 8, 32), this.cyanMat);
    this.shockRing3 = new Mesh(new TorusGeometry(5.4, 0.12, 8, 32), this.cyanMat);
    this.shockRing1.rotation.x = Math.PI / 2;
    this.shockRing2.rotation.y = Math.PI / 2;
    this.shockRing3.rotation.z = Math.PI / 2;

    this.quakeGroup.add(this.impactCore, this.shockRing1, this.shockRing2, this.shockRing3);

    // 36 Bold 3D Fractured Space Crack Ribbons
    this.crackBranches = [];
    for (let i = 0; i < NUM_CRACKS; i++) {
      const branch = new Group();
      const segCount = 5;
      let prevPos = new Vector3(0, 0, 0);

      const angle = (i / NUM_CRACKS) * Math.PI * 2 + randRange(-0.12, 0.12);
      const elevation = randRange(-0.85, 0.85);
      const dir = new Vector3(Math.cos(angle), elevation, Math.sin(angle)).normalize();

      for (let s = 0; s < segCount; s++) {
        const segLen = randRange(2.2, 3.8);
        const segWidth = randRange(0.55, 1.0) * (1.0 - (s / segCount) * 0.4);

        const segGeo = new PlaneGeometry(segWidth, segLen);
        const mesh = new Mesh(segGeo, s % 2 === 0 ? this.coreMat : this.cyanMat);

        const jitter = new Vector3(randRange(-0.5, 0.5), randRange(-0.5, 0.5), randRange(-0.5, 0.5));
        const currentPos = prevPos.clone().addScaledVector(dir, segLen * 0.85).add(jitter);

        const mid = prevPos.clone().add(currentPos).multiplyScalar(0.5);
        mesh.position.copy(mid);

        const segDir = currentPos.clone().sub(prevPos).normalize();
        mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), segDir);

        branch.add(mesh);
        prevPos = currentPos;
      }

      this.quakeGroup.add(branch);
      this.crackBranches.push(branch);
    }

    setLayerRecursive(this.quakeGroup, LAYER.VFX);
    this.quakeGroup.visible = false;
    this.ctx.scene.add(this.quakeGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.quakeShards = particles.get('quake.shards', {
      capacity: 4000,
      shape: ParticleShape.CHIP,
      additive: true,
      softFade: 0.15
    });
  }

  get impactDuration() {
    return 0.35;
  }

  get fadeDuration() {
    return 1.20;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);

    this.hasSlammed = false;
    this.grabbedTarget = null;
    this.strikeDir.copy(direction).normalize();

    // 1. Gather all active targetable entities (Dummies or regular Enemies)
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
      this.targetPos.copy(origin).addScaledVector(this.strikeDir, Math.min(distance, 5.0));
    }

    // 2. Instant Flash Blink Player Character right in front of target face
    const player = this.ctx.abilities?.ctx?.character;
    if (player) {
      const approachOffset = this.strikeDir.clone().multiplyScalar(-1.7);
      const teleportPos = this.targetPos.clone().add(approachOffset);
      teleportPos.y = player.position.y;
      player.position.copy(teleportPos);
      player.setFacing?.(Math.atan2(this.strikeDir.x, this.strikeDir.z));
      // Play heavy punch animation
      player.playCast?.('punch');
      player.castLunge?.();
    }

    // 3. Immediately trigger the seismic punch & shattered space explosion!
    this._executeSeismicPunch();
  }

  _executeSeismicPunch() {
    this.hasSlammed = true;

    const impactPos = this.targetPos.clone().setY(1.3);

    // 1. Position and display Gura Gura Tremor Aura on fist
    const player = this.ctx.abilities?.ctx?.character;
    const pPos = player ? player.position : this.origin;
    const fistPos = pPos.clone().addScaledVector(this.strikeDir, 1.2).setY(1.5);
    this.fistGroup.position.copy(fistPos);
    this.fistGroup.scale.set(1.2, 1.2, 1.2);
    this.fistGroup.visible = true;

    // 2. Position and display 3D Shattered Air Cracks & Rings
    this.quakeGroup.position.copy(impactPos);
    this.quakeGroup.scale.set(0.6, 0.6, 0.6);
    this.quakeGroup.visible = true;

    // 3. 🔥 [Marineford Ep 484 Signature]: Authentic Red & Cyan Negative Color Inversion
    this.ctx.flash?.triggerNegativeInvert?.(1.0, 0.35);

    // 4. 🌀 Screen-Space Distortion Refraction Shockwave
    this.ctx.shockwaves?.spawnShockwave(impactPos, 20.0, 0.6, 2.5);

    // 5. 🪨 Physics 3D Basalt Rock Debris Erupting
    this.ctx.rockDebris?.spawnExplosion(impactPos, 20, 22.0, 0xffffff);

    // 6. Cataclysmic Camera Shake & Ground Decals & Bursts
    this.ctx.shake?.add?.(3.0, 1 / 1.0, 65);
    this.ctx.decals?.spawn?.(DecalType.CRACK, impactPos, { radius: 14.0, life: 8.0 });
    this.ctx.bursts?.trigger?.(impactPos, 16.0, BurstMode.SPHERE, 0.6, '#ffffff');
    this.ctx.lights?.point?.(impactPos.x, 2.5, impactPos.z, '#00f0ff', 8.0, 24.0, 0.9);

    // 7. Deal Massive Critical Damage to target
    if (this.grabbedTarget && this.grabbedTarget.takeDamage) {
      this.grabbedTarget.takeDamage(1500, true);
    }

    // High velocity sparks
    if (this.quakeShards) {
      for (let i = 0; i < 80; i++) {
        _emit.position = impactPos.clone().add(new Vector3(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1)));
        _emit.velocity = new Vector3(randRange(-25, 25), randRange(8, 30), randRange(-25, 25));
        _emit.color = Math.random() < 0.6 ? '#ffffff' : '#00f0ff';
        _emit.size = randRange(0.8, 1.6);
        _emit.lifetime = randRange(0.5, 1.2);
        this.quakeShards.emit(1, _emit);
      }
    }
  }

  update(dt) {
    super.update(dt);

    if (!this.quakeGroup.visible) return;

    const progress = saturate(this.age / (this.impactDuration + this.fadeDuration));

    // Rapid expansion of shattered space
    const scaleEase = Math.min(1.0, this.age * 4.0);
    const curScale = 0.6 + scaleEase * 3.6;
    this.quakeGroup.scale.set(curScale, curScale, curScale);

    // High-speed tremor rotations & vibration
    const jitter = (Math.random() - 0.5) * 0.25 * (1.0 - progress);
    this.impactCore.position.set(jitter, jitter, jitter);
    this.shockRing1.rotation.z += dt * 18.0;
    this.shockRing2.rotation.x += dt * 20.0;
    this.shockRing3.rotation.y += dt * 22.0;

    // Fist sphere shrink & fade
    if (this.fistGroup.visible) {
      this.fistRing1.rotation.z += dt * 20.0;
      this.fistRing2.rotation.x += dt * 24.0;
      if (this.age > 0.45) {
        this.fistGroup.visible = false;
      }
    }

    // Gradual fade
    const fade = 1.0 - Math.pow(progress, 1.4);
    this.coreMat.opacity = fade;
    this.cyanMat.opacity = fade * 0.95;

    if (progress >= 1.0) {
      this.quakeGroup.visible = false;
    }
  }

  onDestroy() {
    this.fistGroup.visible = false;
    this.quakeGroup.visible = false;
  }
}
