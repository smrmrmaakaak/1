import {
  Group,
  Mesh,
  CircleGeometry,
  BoxGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  DoubleSide,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { createFluidLiquidDarknessMaterial } from '../materials/FluidLiquidDarknessMaterial.js';
import { BlackbeardVault } from './BlackbeardVault.js';
import { randRange, saturate } from '../utils/math.js';
import { getColor } from '../utils/color.js';

const _emit = {};

// Visual Effect Radius (90m Total Diameter - Massive Dark Ocean)
const VISUAL_RADIUS = 45.0;

// Attack Hitbox Radius
const HITBOX_RADIUS = 18.0;

/**
 * [Blackbeard E] 블랙홀 (暗穴道 - Black Hole / 90m 초대형 시각 이펙트)
 * - 개발자방/필드 몬스터 & 허수아비 전체 100% 완전 정지 및 나선형 중심 흡입
 * - 2.4초 동안 바닥 속(-4.0m)으로 물리적 침강 및 완전 삼킴
 * - 12개의 주변 맵 환경 오브젝트(나무 상자, 배럴, 석재 파편)도 함께 나선형으로 빨려 들어가 소멸
 */
export class BlackHoleAbility extends Ability {
  constructor(context) {
    super('shadow_grasp', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.trappedEntities = [];
    this.absorbedProps = [];
    this.lastDamageTick = 0;
    this.hasImploded = false;

    // Master VFX Group
    this.holeGroup = new Group();
    this.holeGroup.name = 'Blackbeard_Fluid_BlackHole_MassiveVisual';
    this.holeGroup.matrixAutoUpdate = true;

    // 1. 90m (45.0m Radius) Photorealistic 3D Fluid Liquid Darkness Mesh
    this.fluidMat = createFluidLiquidDarknessMaterial();

    const fluidGeo = new CircleGeometry(VISUAL_RADIUS, 128);
    fluidGeo.rotateX(-Math.PI / 2);
    this.fluidMesh = new Mesh(fluidGeo, this.fluidMat);
    this.fluidMesh.position.y = 0.18;
    this.fluidMesh.renderOrder = 999;

    // Pitch-black central abyss void (18m Radius)
    this.voidPureBlackMat = new MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 1.0,
      side: DoubleSide,
      depthWrite: false
    });

    const abyssCenterGeo = new CircleGeometry(18.0, 64);
    abyssCenterGeo.rotateX(-Math.PI / 2);
    this.abyssCenter = new Mesh(abyssCenterGeo, this.voidPureBlackMat);
    this.abyssCenter.position.y = 0.16;
    this.abyssCenter.renderOrder = 998;

    this.holeGroup.add(this.fluidMesh, this.abyssCenter);

    // 2. 12 Environmental Map Props Sucked into the Void (상자, 배럴, 바위)
    this.propMat = new MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.8
    });
    this.stonePropMat = new MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6
    });

    this.propsGroup = new Group();
    this.propsGroup.matrixAutoUpdate = true;

    for (let i = 0; i < 12; i++) {
      const isStone = i % 2 === 0;
      const geo = isStone ? new DodecahedronGeometry(randRange(0.8, 1.6)) : new BoxGeometry(randRange(1.0, 1.8), randRange(1.0, 1.8), randRange(1.0, 1.8));
      const pMesh = new Mesh(geo, isStone ? this.stonePropMat : this.propMat);
      pMesh.visible = false;
      this.propsGroup.add(pMesh);
      this.absorbedProps.push({
        mesh: pMesh,
        angle: (i / 12) * Math.PI * 2,
        dist: randRange(12.0, 18.0),
        rotSpeed: new Vector3(randRange(-4, 4), randRange(-4, 4), randRange(-4, 4)),
        initialY: randRange(0.2, 0.8)
      });
    }

    this.holeGroup.add(this.propsGroup);

    setLayerRecursive(this.holeGroup, LAYER.VFX);
    this.holeGroup.visible = false;
    this.ctx.scene.add(this.holeGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.voidDust = particles.get('void.sparks', {
      capacity: 5000,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.2
    });

    this.darkSmoke = particles.get('void.smoke', {
      capacity: 4000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 0.8
    });
  }

  get impactDuration() {
    return 3.2;
  }

  get fadeDuration() {
    return 0.8;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);

    const castDist = Math.max(8.0, Math.min(distance, 18.0));
    this.targetPos.copy(origin).addScaledVector(direction, castDist);
    this.targetPos.y = 0.05;

    this.holeGroup.position.copy(this.targetPos);
    this.holeGroup.scale.set(1.0, 1.0, 1.0);
    this.holeGroup.visible = true;

    this.trappedEntities = [];
    this.lastDamageTick = 0;
    this.hasImploded = false;

    // Reset Shader Opacities
    if (this.fluidMat.uniforms) this.fluidMat.uniforms.uOpacity.value = 1.0;
    this.voidPureBlackMat.opacity = 1.0;

    // Setup Absorbed Environmental Props
    for (const p of this.absorbedProps) {
      p.mesh.visible = true;
      p.mesh.position.set(
        Math.cos(p.angle) * p.dist,
        p.initialY,
        Math.sin(p.angle) * p.dist
      );
    }

    const player = this.ctx.abilities?.ctx?.character || window.app?.character;
    if (player) {
      player.setFacing?.(Math.atan2(direction.x, direction.z));
      player.playCast?.('cast2');
      player.castLunge?.();
    }

    // 1. Gather all active targetable entities (DUMMIES + REGULAR MONSTERS)
    const targetPool = [];
    const dummies = window.app?.devRoom?.dummies || this.ctx.devRoom?.dummies || [];
    for (const d of dummies) {
      if (d.alive !== false && !d.isDead) targetPool.push(d);
    }
    const regularEnemies = window.app?.enemies?.enemies || this.ctx.enemies?.enemies || [];
    for (const e of regularEnemies) {
      if (!e.isDead && e.hp > 0) targetPool.push(e);
    }

    // STRICT 100% STOP & TRAP
    for (const target of targetPool) {
      const dist = target.position.distanceTo(this.targetPos);
      if (dist <= HITBOX_RADIUS) {
        // Freeze AI and set sinking state immediately
        target.isSinking = true;
        target.isTrapped = true;
        target.freezeTimer = 5.0;

        this.trappedEntities.push({
          entity: target,
          initialY: target.position.y || 0,
          originalPos: target.position.clone(),
          isDummy: !!target.mesh && !target.group,
          swallowed: false
        });
      }
    }

    // Heavy dark flash, gravitational rumble, and deep purple abyss lighting
    this.ctx.flash?.triggerNegativeInvert?.(1.1, 0.35);
    this.ctx.shake?.rumble?.(2.0, 2.5);
    this.ctx.lights?.point?.(this.targetPos.x, 4.0, this.targetPos.z, '#7e22ce', 35.0, 70.0, 3.2);
  }

  update(dt) {
    super.update(dt);
    if (!this.holeGroup.visible) return;

    const progress = saturate(this.age / (this.impactDuration + this.fadeDuration));

    // Sucking fluid mist and dark suction motes into center
    if (this.voidDust && Math.random() < 0.95) {
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = randRange(3.0, VISUAL_RADIUS);
        const p = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, randRange(0.2, 4.0), Math.sin(angle) * r));
        _emit.position = p;
        _emit.velocity = this.targetPos.clone().sub(p).normalize().multiplyScalar(randRange(15, 35));
        _emit.size = randRange(0.8, 2.0);
        _emit.lifetime = randRange(0.4, 1.0);
        _emit.color = Math.random() < 0.6 ? '#7e22ce' : '#c084fc';
        this.voidDust.emit(1, _emit);
      }
    }

    // Heavy bubbling dark smoke rising organically from the fluid surface
    if (this.darkSmoke && Math.random() < 0.85) {
      const angle = Math.random() * Math.PI * 2;
      const r = randRange(1.0, VISUAL_RADIUS * 0.8);
      _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, 0.2, Math.sin(angle) * r));
      _emit.velocity = new Vector3(randRange(-1.0, 1.0), randRange(2.0, 6.0), randRange(-1.0, 1.0));
      _emit.size = randRange(2.2, 4.8);
      _emit.lifetime = randRange(1.0, 2.2);
      _emit.color = '#040008';
      this.darkSmoke.emit(1, _emit);
    }

    // 1. Inward Spiral Suction for Environmental Props
    const propSuctionProgress = saturate(this.age / 2.2);
    for (const p of this.absorbedProps) {
      if (propSuctionProgress < 1.0) {
        const curDist = p.dist * (1.0 - propSuctionProgress);
        const curAngle = p.angle + propSuctionProgress * 4.0;
        const curY = p.initialY - propSuctionProgress * 2.5;
        p.mesh.position.set(Math.cos(curAngle) * curDist, curY, Math.sin(curAngle) * curDist);
        p.mesh.rotation.x += p.rotSpeed.x * dt;
        p.mesh.rotation.y += p.rotSpeed.y * dt;
        p.mesh.rotation.z += p.rotSpeed.z * dt;
      } else {
        p.mesh.visible = false;
      }
    }

    // 2. Progressive Quicksand Sinking, Complete Freezing & Trapping (0.0s ~ 2.4s)
    const sinkProgress = saturate(this.age / 2.2);
    const sinkDepth = sinkProgress * 4.0;

    for (const item of this.trappedEntities) {
      const target = item.entity;
      if (!target || target.isDead) continue;

      // Keep target frozen & trapped
      target.freezeTimer = 4.0;
      target.isSinking = true;
      target.isTrapped = true;

      // Inward vortex suction towards center
      const currentPos = new Vector3().lerpVectors(item.originalPos, this.targetPos, sinkProgress * 0.55);
      const curY = item.initialY - sinkDepth;
      target.position.set(currentPos.x, curY, currentPos.z);

      // Directly update 3D group / mesh position
      if (target.group) {
        target.group.position.set(currentPos.x, curY, currentPos.z);
        const toCenter = this.targetPos.clone().sub(currentPos).normalize();
        target.group.rotation.x = toCenter.z * 0.3 * sinkProgress;
        target.group.rotation.z = -toCenter.x * 0.3 * sinkProgress;
      }
      if (target.mesh) {
        target.mesh.position.set(currentPos.x, curY, currentPos.z);
      }

      // When fully submerged beneath the floor (sinkProgress >= 0.88), swallow completely & record into Vault!
      if (sinkProgress >= 0.88 && !item.swallowed) {
        item.swallowed = true;
        BlackbeardVault.recordSwallowed(target);

        if (target.mesh) target.mesh.visible = false;
        if (target.group) target.group.visible = false;
        if (target.root) target.root.visible = false;

        // Spawn swallowing dark splash particles
        if (this.voidDust) {
          for (let i = 0; i < 40; i++) {
            _emit.position = target.position.clone().setY(0.2);
            _emit.velocity = new Vector3(randRange(-8, 8), randRange(4, 14), randRange(-8, 8));
            _emit.color = '#7e22ce';
            _emit.size = randRange(0.8, 1.8);
            _emit.lifetime = randRange(0.4, 0.9);
            this.voidDust.emit(1, _emit);
          }
        }
      }
    }

    // Periodic continuous dark erosion damage every 0.4s (총 1,800+ 피해)
    if (this.age - this.lastDamageTick >= 0.40 && this.age < 2.5) {
      this.lastDamageTick = this.age;
      for (const item of this.trappedEntities) {
        if (item.entity && item.entity.takeDamage && !item.entity.isDead) {
          item.entity.takeDamage(350, true, { isSinking: true });
        }
      }
    }

    // 3. Final Cataclysmic Implosion & Gravitational Eruption (at 2.8s)
    if (this.age >= 2.8 && !this.hasImploded) {
      this.hasImploded = true;
      this.ctx.flash?.triggerNegativeInvert?.(1.2, 0.35);
      this.ctx.shockwaves?.spawnShockwave(this.targetPos, 45.0, 0.7, 4.0);
      this.ctx.shake?.add?.(4.5, 1 / 0.9, 75);
      this.ctx.bursts?.trigger?.(this.targetPos, 32.0, BurstMode.AIR, 0.8, '#1e0836');

      // Deal final crushing damage
      for (const item of this.trappedEntities) {
        if (item.entity && item.entity.takeDamage && !item.entity.isDead) {
          item.entity.takeDamage(1000, true, { isSinking: true });
        }
      }
    }

    // 4. Fade out
    if (this.age > 2.8) {
      const fadeProgress = saturate((this.age - 2.8) / this.fadeDuration);
      const fade = 1.0 - fadeProgress;
      if (this.fluidMat.uniforms) this.fluidMat.uniforms.uOpacity.value = fade;
      this.voidPureBlackMat.opacity = fade;
    }

    if (progress >= 1.0) {
      this.holeGroup.visible = false;
      this._resetTrappedDummies();
    }
  }

  _resetTrappedDummies() {
    for (const item of this.trappedEntities) {
      const ent = item.entity;
      if (ent) {
        ent.isSinking = false;
        ent.isTrapped = false;
        ent.freezeTimer = 0;
        // Restore dummies only if not popped by Liberation
        if (item.isDummy) {
          ent.position.copy(item.originalPos);
          if (ent.mesh) {
            ent.mesh.position.copy(item.originalPos);
            ent.mesh.visible = true;
          }
        }
      }
    }
    this.trappedEntities = [];
  }

  onDestroy() {
    this.holeGroup.visible = false;
    this._resetTrappedDummies();
  }
}
