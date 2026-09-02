import {
  Group,
  Mesh,
  SphereGeometry,
  TorusGeometry,
  CylinderGeometry,
  PlaneGeometry,
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
import { randRange } from '../utils/math.js';

const _emit = {};
const _toCenter = new Vector3();
const DOMAIN_RADIUS = 22.5;
const DOMAIN_DURATION = 7.0;

/**
 * [Blackbeard T / Ultimate] 흑암 성역 (Dark Domain: 룸 / 7초 절대 결계)
 * - 직경 45m (반경 22.5m) 거대한 반구형 칠흑 암흑 결계 룸 생성
 * - 7.0초 동안 내부의 적은 시야 차단(Blind) 및 모든 스킬/능력 완전 봉인 (SILENCE)
 * - 탈출/진입 불가 절대 물리 결계 (Inescapable Boundary)
 * - 7.0초 후 중심부 수축(Implosion) 및 초대형 암흑 초신성 폭발(Cataclysm Nova) 피날레
 */
export class DarkDomainAbility extends Ability {
  constructor(context) {
    super('abyss_eruption', context);
    this.radius = DOMAIN_RADIUS;
    this.duration = DOMAIN_DURATION;
  }

  get impactDuration() {
    return 6.5;
  }

  get fadeDuration() {
    return 0.8;
  }

  createShaders() {
    this.radius = DOMAIN_RADIUS;
    this.duration = DOMAIN_DURATION;
    this.center = new Vector3();
    this.targetPos = new Vector3();
    this.domainGroup = new Group();
    this.silencedEnemies = new Set();

    // 1. Sleek Obsidian Violet Void Dome Shell Material
    this.domeMat = new MeshStandardMaterial({
      color: 0x090114,
      emissive: 0x6b21a8,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.85,
      transparent: true,
      opacity: 0.42,
      side: DoubleSide,
      depthWrite: false
    });

    // 1-B. Hexagonal Wireframe Energy Grid
    this.wireframeMat = new MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 1.25,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });

    // 2. Glowing Violet Boundary Edge Ring & Obelisks
    this.boundaryMat = new MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0xa855f7,
      emissiveIntensity: 1.5,
      roughness: 0.25,
      metalness: 0.75
    });

    // 3. Swirling Void Ground Floor Mist Material
    this.floorMistMat = new MeshStandardMaterial({
      color: 0x05000a,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.65,
      side: DoubleSide,
      depthWrite: false
    });

    // Outer Half-Sphere Void Dome (Radius 22.5m, Height 22.5m)
    this.domeMesh = new Mesh(
      new SphereGeometry(this.radius, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.5),
      this.domeMat
    );
    this.domainGroup.add(this.domeMesh);

    // Wireframe Grid Overlay for Clear High-Tech / Arcane Silhouette
    this.wireframeDome = new Mesh(
      new SphereGeometry(this.radius * 1.005, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
      this.wireframeMat
    );
    this.domainGroup.add(this.wireframeDome);

    // Ground Boundary Containment Ring (Torus)
    this.boundaryRing = new Mesh(
      new TorusGeometry(this.radius, 0.45, 12, 64),
      this.boundaryMat
    );
    this.boundaryRing.rotation.x = Math.PI / 2;
    this.boundaryRing.position.y = 0.2;
    this.domainGroup.add(this.boundaryRing);

    // Orbital Tilted Void Rings (Apex Crown)
    this.orbitalRing1 = new Mesh(
      new TorusGeometry(4.5, 0.2, 8, 48),
      this.boundaryMat
    );
    this.orbitalRing1.position.y = 15.5;
    this.orbitalRing1.rotation.x = Math.PI / 3;
    this.domainGroup.add(this.orbitalRing1);

    // 8 Boundary Runestone Obelisks along circumference
    this.obelisks = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const obelisk = new Mesh(
        new CylinderGeometry(0.35, 0.7, 5.5, 6),
        this.boundaryMat
      );
      obelisk.position.set(
        Math.cos(angle) * this.radius,
        2.75,
        Math.sin(angle) * this.radius
      );
      this.domainGroup.add(obelisk);
      this.obelisks.push(obelisk);
    }

    // Inner Swirling Dark Floor Disc
    this.floorDisc = new Mesh(
      new CylinderGeometry(this.radius * 0.98, this.radius * 0.98, 0.1, 32),
      this.floorMistMat
    );
    this.floorDisc.position.y = 0.05;
    this.domainGroup.add(this.floorDisc);

    // Apex Void Crystal Core (Floating at dome apex y=16m, clean battle ground sightlines)
    this.monolithCore = new Mesh(
      new SphereGeometry(0.75, 12, 12),
      this.boundaryMat
    );
    this.monolithCore.position.y = 16.0;
    this.domainGroup.add(this.monolithCore);

    setLayerRecursive(this.domainGroup, LAYER.VFX);
    this.group.add(this.domainGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.voidSparks = particles.get('dark.domain', {
      capacity: 6000,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.2
    });
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.center.copy(origin).addScaledVector(direction, distance);
    this.center.y = 0;
    this.domainGroup.position.copy(this.center);
    this.domainGroup.scale.set(1, 1, 1);

    this.silencedEnemies.clear();
    this.timer = 0;

    this.domeMat.opacity = 0.45;
    this.domeMat.emissiveIntensity = 0.75;
    this.boundaryMat.emissiveIntensity = 1.5;

    // Cinematic Audio-Visual Trigger
    this.ctx.flash?.trigger(0.25);
    this.ctx.shake?.add(0.8, 0.8, 14);
    this.ctx.lights?.point(this.center.x, 4.0, this.center.z, '#a855f7', 3.5, 30.0, 2.5);
    this.ctx.decals?.spawn(this.center.x, this.center.z, this.radius * 1.8, DecalType.VOID, 7.5);
  }

  update(dt) {
    super.update(dt);
    this.timer += dt;
    const p = Math.min(1.0, this.timer / this.duration);

    // 1. Rotate Dome, Boundary Ring, Wireframe & Crystal
    this.domeMesh.rotation.y += dt * 0.35;
    this.wireframeDome.rotation.y -= dt * 0.2;
    this.boundaryRing.rotation.z -= dt * 0.6;
    this.orbitalRing1.rotation.y += dt * 0.8;
    this.monolithCore.rotation.y += dt * 1.2;
    this.floorDisc.rotation.y += dt * 0.25;

    // Pulse emissive glow (Heartbeat of the Domain)
    const pulse = Math.sin(this.timer * 3.0) * 0.2 + 1.0;
    this.boundaryMat.emissiveIntensity = 1.5 * pulse;
    this.wireframeMat.emissiveIntensity = 1.35 * pulse;

    // 2. Continuous Swirling Void Mist Particles
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (this.radius - 1.5);
      _emit.position = this.center.clone().add(new Vector3(
        Math.cos(angle) * r,
        randRange(0.2, 8.0),
        Math.sin(angle) * r
      ));
      _emit.velocity = new Vector3(
        -Math.sin(angle) * randRange(3.0, 7.0),
        randRange(1.0, 4.0),
        Math.cos(angle) * randRange(3.0, 7.0)
      );
      _emit.size = randRange(0.4, 0.9);
      _emit.lifetime = randRange(0.6, 1.2);
      _emit.color = '#c084fc';
      this.voidSparks.emit(_emit);
    }

    // 3. Absolute Barrier Physics & Silence Debuff
    if (this.ctx.enemies) {
      const enemies = this.ctx.enemies.enemies;
      for (const enemy of enemies) {
        if (enemy.isDead) continue;

        _toCenter.subVectors(enemy.position, this.center);
        _toCenter.y = 0;
        const dist = _toCenter.length();

        // [Inside Domain] -> Trapped + Silenced + Continuous Void DoT
        if (dist < this.radius) {
          // Silence debuff (Cannot cast abilities / blinded)
          enemy.isSilenced = true;
          enemy.silenceTimer = 0.6;
          enemy.slowTimer = 0.6;
          enemy.slowFactor = 0.4;

          if (!this.silencedEnemies.has(enemy)) {
            this.silencedEnemies.add(enemy);
            this.ctx.floatingText?.spawn('🤐 SILENCE (스킬 봉인)', enemy.position, { color: '#a855f7', size: 20 });
          }

          // Continuous Void Corruption DoT
          const dotDmg = Math.floor(75 * dt * (this.ctx.game?.damageMultiplier ?? 1.0));
          if (dotDmg > 0) {
            enemy.takeDamage(dotDmg, false);
          }

          // Inescapable Barrier: Push back if trying to breach wall
          if (dist > this.radius - 1.2) {
            _toCenter.normalize().multiplyScalar(this.radius - 1.2);
            enemy.position.x = this.center.x + _toCenter.x;
            enemy.position.z = this.center.z + _toCenter.z;
            enemy.knockback.set(-_toCenter.x * 2, 0, -_toCenter.z * 2);
          }
        }
        // [Outside Domain] -> Cannot Enter Barrier
        else if (dist < this.radius + 1.2) {
          _toCenter.normalize().multiplyScalar(this.radius + 1.3);
          enemy.position.x = this.center.x + _toCenter.x;
          enemy.position.z = this.center.z + _toCenter.z;
          enemy.knockback.set(_toCenter.x * 3, 0, _toCenter.z * 3);
        }
      }
    }

    // 4. Player Containment (Inside gets God Buff)
    if (this.ctx.character) {
      const charPos = this.ctx.character.position;
      const dChar = Math.hypot(charPos.x - this.center.x, charPos.z - this.center.z);
      if (dChar < this.radius) {
        // Blackbeard is Emperor inside Domain: Speed +30%
        this.ctx.character.moveSpeed = 34.0;
      }
    }

    // 5. Implosion & Cataclysm Nova Finale (Last 0.5s)
    if (this.timer >= this.duration - 0.5) {
      const implosionProgress = (this.timer - (this.duration - 0.5)) / 0.5;
      const scale = Math.max(0.05, 1.0 - implosionProgress * 0.95);
      this.domainGroup.scale.set(scale, scale, scale);
      this.domeMat.emissiveIntensity = 3.5 + implosionProgress * 15.0; // Glow intensely right before burst
    }

    // 6. Finale Cataclysm Burst Trigger
    if (this.timer >= this.duration && !this._hasExploded) {
      this._hasExploded = true;
      this._triggerCataclysmFinale();
    }
  }

  _triggerCataclysmFinale() {
    this.ctx.flash?.trigger(1.0);
    this.ctx.shake?.add(2.0, 1.5, 25);
    this.ctx.bursts?.trigger(this.center, 28.0, BurstMode.SPHERE, 1.2, '#c084fc');
    this.ctx.decals?.spawn(this.center.x, this.center.z, 24.0, DecalType.SCORCH, 9.0);

    // Deal massive Cataclysm Damage to all trapped enemies
    if (this.ctx.enemies) {
      const burstDmg = Math.floor(1850 * (this.ctx.game?.damageMultiplier ?? 1.0));
      for (const enemy of this.ctx.enemies.enemies) {
        if (enemy.isDead) continue;
        const d = Math.hypot(enemy.position.x - this.center.x, enemy.position.z - this.center.z);
        if (d <= this.radius + 2.0) {
          const knockUp = new Vector3(
            (enemy.position.x - this.center.x) * 1.5,
            randRange(12.0, 20.0),
            (enemy.position.z - this.center.z) * 1.5
          );
          enemy.takeDamage(burstDmg, true, {
            knockback: knockUp,
            stun: 2.0
          });
          this.ctx.floatingText?.spawn(`💥 ${burstDmg} CRIT!`, enemy.position, { color: '#ffd700', size: 28, isCrit: true });
        }
      }
    }
  }

  destroy() {
    super.destroy();
    this.group.visible = false;
    this.silencedEnemies.clear();
    this._hasExploded = false;
  }
}
