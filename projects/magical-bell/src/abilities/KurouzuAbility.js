import {
  Group,
  Mesh,
  SphereGeometry,
  TorusGeometry,
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
import { createYamiVortexMaterial } from '../materials/YamiVortexMaterial.js';
import { randRange, saturate } from '../utils/math.js';
import { getColor } from '../utils/color.js';

const _emit = {};

/**
 * [Blackbeard Q] 암수 (闇水 - Kurouzu / Dark Water)
 * - 원작 바나로 섬 & 마린포드 100% 고증
 * - 검은수염 손끝에서 정확히 뿜어져 나오는 칠흑의 중력 깔때기 & 6중 나선 링
 * - 0.45초 동안 전방 35m의 몬스터와 허수아비를 코앞으로 강력하게 끌어당긴 뒤 8m 중력 붕괴 대폭발 (1,800+ CRIT & 스턴)!
 */
export class KurouzuAbility extends Ability {
  constructor(context) {
    super('void_orb', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.strikeDir = new Vector3(0, 0, -1);
    this.grabbedTargets = [];
    this.isPulling = false;
    this.hasNovaExploded = false;

    // Master VFX Group (Anchored at World Origin 0,0,0 so children use exact world coordinates)
    this.yamiGroup = new Group();
    this.yamiGroup.name = 'Blackbeard_Kurouzu_MasterGroup';
    this.yamiGroup.matrixAutoUpdate = true;

    // 1. Hand Liquid Darkness & Pitch-black Singularity
    this.handGroup = new Group();
    this.yamiHandMat = createYamiVortexMaterial({ swirlSpeed: 5.5, flowSpeed: 6.0, opacity: 1.0 });

    this.handDarkAura1 = new Mesh(new SphereGeometry(2.0, 24, 24), this.yamiHandMat);
    this.handDarkAura2 = new Mesh(new SphereGeometry(2.6, 20, 20), this.yamiHandMat);
    this.handDarkAura2.scale.set(1.1, 1.4, 1.1);

    // Pitch-black core singularity
    this.voidPureBlackMat = new MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 1.0,
      side: DoubleSide,
      depthWrite: false
    });
    this.handCore = new Mesh(new SphereGeometry(1.2, 20, 20), this.voidPureBlackMat);

    // Accretion Dark Spiral Rings
    this.yamiRingMat = createYamiVortexMaterial({ swirlSpeed: 9.0, flowSpeed: 7.0, opacity: 0.98 });
    this.handRing1 = new Mesh(new TorusGeometry(2.6, 0.22, 8, 32), this.yamiRingMat);
    this.handRing2 = new Mesh(new TorusGeometry(3.6, 0.18, 8, 32), this.yamiRingMat);
    this.handRing3 = new Mesh(new TorusGeometry(4.5, 0.12, 8, 32), this.yamiRingMat);
    this.handRing1.rotation.x = Math.PI / 2;
    this.handRing2.rotation.y = Math.PI / 2;

    this.handGroup.add(this.handDarkAura1, this.handDarkAura2, this.handCore, this.handRing1, this.handRing2, this.handRing3);
    this.yamiGroup.add(this.handGroup);

    // 2. Colossal Helical Gravity Vacuum Funnel (거대 칠흑 중력 깔때기 & 6중 회전 링)
    this.beamGroup = new Group();
    this.yamiBeamMat = createYamiVortexMaterial({ isBeam: true, swirlSpeed: 7.5, flowSpeed: 9.5, opacity: 0.98 });

    const coneGeo = new CylinderGeometry(0.8, 3.8, 1.0, 32, 12, true);
    coneGeo.rotateX(Math.PI / 2);
    coneGeo.translate(0, 0, 0.5);
    this.beamCone = new Mesh(coneGeo, this.yamiBeamMat);

    const innerBeamGeo = new CylinderGeometry(0.4, 2.0, 1.0, 24, 6, true);
    innerBeamGeo.rotateX(Math.PI / 2);
    innerBeamGeo.translate(0, 0, 0.5);
    this.beamInnerCore = new Mesh(innerBeamGeo, this.voidPureBlackMat);

    this.beamGroup.add(this.beamCone, this.beamInnerCore);

    // 6 Helical Tendril Ribbons
    this.tendrilRings = [];
    for (let i = 0; i < 6; i++) {
      const ring = new Mesh(new TorusGeometry(1.4 + i * 0.45, 0.18, 8, 28), this.yamiRingMat);
      this.tendrilRings.push(ring);
      this.beamGroup.add(ring);
    }

    this.beamGroup.visible = false;
    this.yamiGroup.add(this.beamGroup);

    // 3. Cataclysmic Gravitational Crush Detonation Nova (8m Nova Explosion)
    this.impactNova = new Group();
    this.novaSphere = new Mesh(new SphereGeometry(4.5, 32, 32), this.yamiHandMat);
    this.novaBlackCore = new Mesh(new SphereGeometry(3.0, 24, 24), this.voidPureBlackMat);
    this.novaRing1 = new Mesh(new TorusGeometry(7.0, 0.42, 8, 36), this.yamiRingMat);
    this.novaRing2 = new Mesh(new TorusGeometry(9.5, 0.28, 8, 36), this.yamiRingMat);
    this.novaRing1.rotation.x = Math.PI / 2;
    this.novaRing2.rotation.y = Math.PI / 2;

    this.impactNova.add(this.novaSphere, this.novaBlackCore, this.novaRing1, this.novaRing2);
    this.impactNova.visible = false;
    this.yamiGroup.add(this.impactNova);

    setLayerRecursive(this.yamiGroup, LAYER.VFX);
    this.yamiGroup.visible = false;
    this.ctx.scene.add(this.yamiGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.darkSparks = particles.get('void.sparks', {
      capacity: 6500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.15
    });

    this.darkSmoke = particles.get('void.smoke', {
      capacity: 5000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 0.8
    });
  }

  get impactDuration() {
    return 0.65;
  }

  get fadeDuration() {
    return 1.40;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);

    this.grabbedTargets = [];
    this.strikeDir.copy(direction).normalize();
    this.hasNovaExploded = false;

    // 1. Gather all active targetable entities (Dummies + Regular Monsters)
    const targetPool = [];
    const dummies = window.app?.devRoom?.dummies || this.ctx.devRoom?.dummies || [];
    for (const d of dummies) {
      if (d.alive !== false && !d.isDead) targetPool.push(d);
    }
    const regularEnemies = window.app?.enemies?.enemies || this.ctx.enemies?.enemies || [];
    for (const e of regularEnemies) {
      if (!e.isDead && e.hp > 0) targetPool.push(e);
    }

    const maxRange = 35.0;
    const player = this.ctx.abilities?.ctx?.character || window.app?.character;
    const playerPos = player ? player.position.clone() : origin.clone();

    // Find all enemies in front cone (35m range, forward angle) or closest targets
    for (const target of targetPool) {
      const d = target.position.distanceTo(playerPos);
      if (d <= maxRange) {
        const toTarget = target.position.clone().sub(playerPos).normalize();
        const dot = toTarget.dot(this.strikeDir);
        if (dot > -0.25) {
          const destOffset = new Vector3(randRange(-1.0, 1.0), 0, randRange(-1.0, 1.0));
          const dest = playerPos.clone().addScaledVector(this.strikeDir, 2.5).add(destOffset);
          dest.y = target.position.y || 0;

          // Freeze enemy immediately
          target.freezeTimer = 2.0;
          target.isTrapped = true;

          this.grabbedTargets.push({
            entity: target,
            startPos: target.position.clone(),
            destPos: dest
          });
        }
      }
    }

    // Turn character toward target direction and play cast animation
    if (player) {
      player.setFacing?.(Math.atan2(this.strikeDir.x, this.strikeDir.z));
      player.playCast?.('cast1');
      player.castLunge?.();
    }

    const handPos = playerPos.clone().addScaledVector(this.strikeDir, 1.0).setY(1.3);

    // Keep Master Group at world origin so child positions are pure world coordinates
    this.yamiGroup.position.set(0, 0, 0);
    this.yamiGroup.rotation.set(0, 0, 0);
    this.yamiGroup.visible = true;

    this.handGroup.position.copy(handPos);
    this.handGroup.scale.set(1.0, 1.0, 1.0);
    this.handGroup.visible = true;

    this.impactNova.visible = false;
    this.isPulling = this.grabbedTargets.length > 0;

    // Beam Aiming & Scaling from Hand to Target
    const beamEndPos = this.grabbedTargets.length > 0 ? this.grabbedTargets[0].startPos : playerPos.clone().addScaledVector(this.strikeDir, Math.min(distance, 20.0));
    this.beamGroup.position.copy(handPos);
    this.beamGroup.lookAt(beamEndPos);
    const dist = handPos.distanceTo(beamEndPos);
    this.beamGroup.scale.set(1.0, 1.0, Math.max(0.1, dist));
    this.beamGroup.visible = true;

    if (this.yamiHandMat.uniforms) this.yamiHandMat.uniforms.uOpacity.value = 1.0;
    if (this.yamiBeamMat.uniforms) this.yamiBeamMat.uniforms.uOpacity.value = 1.0;
    if (this.yamiRingMat.uniforms) this.yamiRingMat.uniforms.uOpacity.value = 1.0;
    this.voidPureBlackMat.opacity = 1.0;

    // Dark Inversion flash & Cataclysmic Camera rumble
    this.ctx.flash?.triggerNegativeInvert?.(1.0, 0.3);
    this.ctx.shake?.add?.(3.2, 1 / 0.8, 65);
    this.ctx.lights?.point?.(handPos.x, 2.5, handPos.z, '#7e22ce', 25.0, 50.0, 2.0);
  }

  update(dt) {
    super.update(dt);
    if (!this.yamiGroup.visible) return;

    const progress = saturate(this.age / (this.impactDuration + this.fadeDuration));

    const player = this.ctx.abilities?.ctx?.character || window.app?.character;
    const playerPos = player ? player.position.clone() : this.origin.clone();
    const handPos = playerPos.clone().addScaledVector(this.strikeDir, 1.0).setY(1.3);

    // Keep hand effect perfectly synced to Blackbeard's hand
    this.handGroup.position.copy(handPos);

    // High-speed dark vorticity rotation
    this.handRing1.rotation.z += dt * 25.0;
    this.handRing2.rotation.x -= dt * 28.0;
    this.handRing3.rotation.y += dt * 30.0;
    this.handDarkAura1.rotation.y += dt * 15.0;
    this.handDarkAura2.rotation.z -= dt * 14.0;

    // Tendril ring spiraling along beam
    this.tendrilRings.forEach((r, idx) => {
      r.position.z = (idx + 1) * 0.16;
      r.rotation.z += dt * (18.0 + idx * 5.0);
    });

    // 1. Violent High-Speed Target Pulling Phase (0.00s ~ 0.45s)
    const pullDuration = 0.45;
    if (this.isPulling && this.grabbedTargets.length > 0 && this.age <= pullDuration) {
      const pullProgress = saturate(this.age / pullDuration);
      const easeInQuad = pullProgress * pullProgress;

      for (const item of this.grabbedTargets) {
        const ent = item.entity;
        if (!ent || ent.isDead) continue;

        const currentPos = item.startPos.clone().lerp(item.destPos, easeInQuad);
        ent.position.copy(currentPos);
        if (ent.group) ent.group.position.copy(currentPos);
        if (ent.mesh) ent.mesh.position.copy(currentPos);
        if (ent.root) ent.root.position.copy(currentPos);
      }

      // Re-anchor Gravity Beam length directly from Hand to closest target
      const leadPos = this.grabbedTargets[0].entity.position;
      const curDist = handPos.distanceTo(leadPos);
      this.beamGroup.position.copy(handPos);
      this.beamGroup.scale.set(1.0, 1.0, Math.max(0.1, curDist));
      this.beamGroup.lookAt(leadPos);

      // Inward dark spark suction particles rushing to hand
      if (this.darkSparks && Math.random() < 0.95) {
        for (let i = 0; i < 10; i++) {
          const t = Math.random();
          const p = this.grabbedTargets[0].startPos.clone().lerp(handPos, t);
          _emit.position = p.add(new Vector3(randRange(-0.8, 0.8), randRange(-0.4, 0.8), randRange(-0.8, 0.8)));
          _emit.velocity = handPos.clone().sub(p).normalize().multiplyScalar(randRange(20, 40));
          _emit.color = Math.random() < 0.6 ? '#7e22ce' : '#c084fc';
          _emit.size = randRange(1.0, 2.2);
          _emit.lifetime = randRange(0.25, 0.6);
          this.darkSparks.emit(1, _emit);
        }
      }
    }

    // 2. Impact Detonation Phase (at 0.45s when targets arrive right in front of Blackbeard)
    if (this.age >= pullDuration && !this.hasNovaExploded) {
      this.hasNovaExploded = true;
      this.beamGroup.visible = false;
      const impactPos = playerPos.clone().addScaledVector(this.strikeDir, 2.5);
      this.impactNova.position.copy(impactPos).setY(1.2);
      this.impactNova.scale.set(0.8, 0.8, 0.8);
      this.impactNova.visible = true;

      // Dark Gravitational Shockwave & Flash
      this.ctx.flash?.triggerNegativeInvert?.(1.2, 0.35);
      this.ctx.shockwaves?.spawnShockwave(impactPos, 24.0, 0.7, 3.5);
      this.ctx.shake?.add?.(4.0, 1 / 0.9, 70);
      this.ctx.bursts?.trigger?.(impactPos, 20.0, BurstMode.AIR, 0.8, '#1e0836');
      this.ctx.decals?.spawn?.(DecalType.SCORCH, impactPos, { radius: 14.0, life: 8.0 });
      this.ctx.lights?.point?.(impactPos.x, 3.0, impactPos.z, '#7e22ce', 25.0, 50.0, 2.5);

      // Deal 1,800 Critical Damage to all grabbed targets
      for (const item of this.grabbedTargets) {
        const ent = item.entity;
        if (ent && ent.takeDamage && !ent.isDead) {
          ent.takeDamage(1800, true);
        }
      }
    }

    // Expand Impact Nova
    if (this.impactNova.visible) {
      const novaAge = this.age - pullDuration;
      const novaProgress = saturate(novaAge / 0.40);
      const novaScale = 0.8 + novaProgress * 2.2;
      this.impactNova.scale.set(novaScale, novaScale, novaScale);

      this.novaRing1.rotation.z += dt * 25.0;
      this.novaRing2.rotation.y += dt * 22.0;

      // Heavy boiling dark smoke billowing out from impact
      if (this.darkSmoke && Math.random() < 0.85) {
        for (let i = 0; i < 5; i++) {
          const impactPos = playerPos.clone().addScaledVector(this.strikeDir, 2.5);
          _emit.position = impactPos.clone().add(new Vector3(randRange(-2.0, 2.0), randRange(0.2, 2.0), randRange(-2.0, 2.0)));
          _emit.velocity = new Vector3(randRange(-3.0, 3.0), randRange(2.5, 7.0), randRange(-3.0, 3.0));
          _emit.size = randRange(2.0, 4.2);
          _emit.lifetime = randRange(0.8, 1.8);
          _emit.color = '#05000a';
          this.darkSmoke.emit(1, _emit);
        }
      }
    }

    // 3. Hand Aura Decay
    if (this.age > 0.60) {
      const f = saturate((this.age - 0.60) / this.fadeDuration);
      const fade = 1.0 - f;
      this.handGroup.scale.set(fade, fade, fade);
      if (this.yamiHandMat.uniforms) this.yamiHandMat.uniforms.uOpacity.value = fade;
      if (this.yamiRingMat.uniforms) this.yamiRingMat.uniforms.uOpacity.value = fade;
      this.voidPureBlackMat.opacity = fade;
    }

    if (progress >= 1.0) {
      this.yamiGroup.visible = false;
      this._releaseTargets();
    }
  }

  _releaseTargets() {
    for (const item of this.grabbedTargets) {
      const ent = item.entity;
      if (ent) {
        ent.freezeTimer = 0;
        ent.isTrapped = false;
      }
    }
    this.grabbedTargets = [];
  }

  onDestroy() {
    this.yamiGroup.visible = false;
    this._releaseTargets();
  }
}
