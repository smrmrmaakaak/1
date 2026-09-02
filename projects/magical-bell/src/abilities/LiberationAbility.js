import {
  Group,
  Mesh,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  DodecahedronGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  DoubleSide,
  Vector3,
  Color
} from 'three';
import { Ability } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { BlackbeardVault } from './BlackbeardVault.js';
import { createYamiVortexMaterial } from '../materials/YamiVortexMaterial.js';
import { randRange, saturate } from '../utils/math.js';
import { getColor } from '../utils/color.js';

const _emit = {};
const NUM_DEBRIS = 32;

/**
 * [Blackbeard R] 해방 (解放 - Liberation / 리버레이션)
 * - 원작 바나로 섬 325화 완벽 재현: [E - 블랙홀]로 집어삼킨 모든 개체와 마을 잔해를 하늘 높이 뿜어내어 전방 폭포수 융단폭격!
 * - [E] 블랙홀로 삼킨 적/허수아비가 있을 시, 그 실제 개체들이 공중으로 솟구쳐 날아가 바닥에 처박히며 극대 피해 + 2.5초 스턴!
 * - 32개의 3D 파괴 가옥 지붕/석조 기둥/거대 암석 파편이 포물선을 그리며 낙하하여 연쇄 대폭발 발생
 */
export class LiberationAbility extends Ability {
  constructor(context) {
    super('void_singularity', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.casterPos = new Vector3();
    this.swallowedLaunched = [];
    this.hasExploded = false;
    this.debrisList = [];

    // Master Group
    this.liberationGroup = new Group();
    this.liberationGroup.name = 'Blackbeard_Liberation_Master';
    this.liberationGroup.matrixAutoUpdate = true;

    // 1. Skyward Dark Vortex Geyser (칠흑의 암흑 간헐천)
    this.geyserMat = createYamiVortexMaterial();
    const geyserGeo = new CylinderGeometry(4.5, 1.2, 32.0, 32, 16, true);
    geyserGeo.translate(0, 16.0, 0);
    this.geyserMesh = new Mesh(geyserGeo, this.geyserMat);
    this.geyserMesh.renderOrder = 999;
    this.liberationGroup.add(this.geyserMesh);

    // 2. 3D Banaro Island Town Debris Materials
    this.woodMat = new MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.85,
      metalness: 0.1
    });

    this.stoneMat = new MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.2
    });

    this.darkRockMat = new MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x581c87,
      emissiveIntensity: 2.5,
      roughness: 0.3,
      metalness: 0.7
    });

    // 3. 32 Procedural Town Debris Meshes (목조 지붕, 석조 기둥, 암흑 암석)
    this.debrisGroup = new Group();
    this.debrisGroup.matrixAutoUpdate = true;

    for (let i = 0; i < NUM_DEBRIS; i++) {
      let geo;
      let mat;
      const type = i % 3;

      if (type === 0) {
        // Wood beam / roof plank
        geo = new BoxGeometry(randRange(0.6, 1.2), randRange(3.0, 6.0), randRange(0.6, 1.2));
        mat = this.woodMat;
      } else if (type === 1) {
        // Shattered stone temple pillar
        geo = new CylinderGeometry(randRange(0.6, 1.1), randRange(0.6, 1.1), randRange(2.5, 5.0), 8);
        mat = this.stoneMat;
      } else {
        // Jagged dark matter boulder
        geo = new DodecahedronGeometry(randRange(1.0, 2.4));
        mat = this.darkRockMat;
      }

      const mesh = new Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.visible = false;
      this.debrisGroup.add(mesh);

      this.debrisList.push({
        mesh: mesh,
        startOffset: new Vector3(randRange(-2, 2), 0, randRange(-2, 2)),
        peakHeight: randRange(24.0, 36.0),
        landOffset: new Vector3(randRange(-10, 10), 0, randRange(-10, 10)),
        rotSpeed: new Vector3(randRange(-6, 6), randRange(-6, 6), randRange(-6, 6)),
        hasImpacted: false
      });
    }

    this.liberationGroup.add(this.debrisGroup);

    setLayerRecursive(this.liberationGroup, LAYER.VFX);
    this.liberationGroup.visible = false;
    this.ctx.scene.add(this.liberationGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.liberationSparks = particles.get('void.sparks', {
      capacity: 6500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.15
    });

    this.darkSmoke = particles.get('void.smoke', {
      capacity: 4500,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 0.8
    });
  }

  get impactDuration() {
    return 2.4;
  }

  get fadeDuration() {
    return 1.0;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);

    this.casterPos.copy(origin);
    const castDist = Math.max(10.0, Math.min(distance, 26.0));
    this.targetPos.copy(origin).addScaledVector(direction, castDist);
    this.targetPos.y = 0.05;

    this.liberationGroup.position.copy(origin);
    this.liberationGroup.visible = true;
    this.hasExploded = false;

    // Reset Geyser
    this.geyserMesh.scale.set(0.1, 0.1, 0.1);
    this.geyserMesh.visible = true;

    // Retrieve all swallowed entities from Vault!
    const swallowedVault = BlackbeardVault.popAll();
    this.swallowedLaunched = [];

    // Cast Animation & Roar
    const player = this.ctx.abilities?.ctx?.character;
    if (player) {
      player.setFacing?.(Math.atan2(direction.x, direction.z));
      player.playCast?.('cast2');
      player.castLunge?.();
    }

    // Process Swallowed Entities for Skyward Launch!
    for (let i = 0; i < swallowedVault.length; i++) {
      const item = swallowedVault[i];
      const ent = item.entity;
      if (!ent) continue;

      if (ent.mesh) ent.mesh.visible = true;
      if (ent.root) ent.root.visible = true;

      this.swallowedLaunched.push({
        entity: ent,
        originalPos: item.originalPos || ent.position.clone(),
        peakHeight: randRange(26.0, 34.0),
        landPos: this.targetPos.clone().add(new Vector3(randRange(-6, 6), 0, randRange(-6, 6))),
        hasImpacted: false
      });
    }

    // Reset 32 Debris Pieces
    for (const d of this.debrisList) {
      d.mesh.visible = true;
      d.mesh.position.set(d.startOffset.x, 0, d.startOffset.z);
      d.hasImpacted = false;
    }

    // Camera Shake, Dark Invert Flash & Sound FX
    this.ctx.flash?.triggerNegativeInvert?.(1.2, 0.4);
    this.ctx.shake?.rumble?.(2.5, 2.5);
    this.ctx.lights?.point?.(origin.x, 6.0, origin.z, '#c084fc', 35.0, 60.0, 3.5);

    const count = this.swallowedLaunched.length;
    if (count > 0) {
      this.ctx.floatingText?.spawn?.(`💥 LIBERATION! (삼켜진 ${count}개체 대방출!)`, origin.clone().add(new Vector3(0, 3.0, 0)), {
        color: '#ff0055',
        size: 32,
        isCrit: true
      });
    } else {
      this.ctx.floatingText?.spawn?.('💥 LIBERATION! (어둠의 잔해 폭격)', origin.clone().add(new Vector3(0, 3.0, 0)), {
        color: '#c084fc',
        size: 26,
        isCrit: true
      });
    }
  }

  update(dt) {
    super.update(dt);
    if (!this.liberationGroup.visible) return;

    const progress = saturate(this.age / (this.impactDuration + this.fadeDuration));

    // 1. Skyward Geyser Eruption (0.0s ~ 0.8s)
    if (this.age < 0.8) {
      const gProgress = saturate(this.age / 0.4);
      const gScale = Math.sin((gProgress * Math.PI) / 2);
      this.geyserMesh.scale.set(gScale * 1.5, gScale * 1.8, gScale * 1.5);
    } else {
      const gFade = saturate((this.age - 0.8) / 0.5);
      this.geyserMesh.scale.set(1.5 * (1.0 - gFade), 1.8 * (1.0 - gFade), 1.5 * (1.0 - gFade));
      if (gFade >= 1.0) this.geyserMesh.visible = false;
    }

    // Sucking & Erupting Particle Flares
    if (this.liberationSparks && Math.random() < 0.9) {
      for (let i = 0; i < 14; i++) {
        const p = this.casterPos.clone().add(new Vector3(randRange(-2, 2), randRange(0.5, 4.0), randRange(-2, 2)));
        _emit.position = p;
        _emit.velocity = new Vector3(randRange(-4, 4), randRange(20, 45), randRange(-4, 4));
        _emit.size = randRange(1.0, 2.4);
        _emit.lifetime = randRange(0.4, 0.9);
        _emit.color = Math.random() < 0.6 ? '#7e22ce' : '#e9d5ff';
        this.liberationSparks.emit(1, _emit);
      }
    }

    // 2. Parabolic Physics Trajectory for 32 Debris (0.0s ~ 1.8s)
    const flightTime = 1.6;
    const t = saturate(this.age / flightTime);

    for (const d of this.debrisList) {
      if (t < 1.0) {
        // Parabolic arc: Start -> Peak -> Land at targetPos
        const currentXZ = new Vector3().lerpVectors(
          d.startOffset,
          this.targetPos.clone().sub(this.casterPos).add(d.landOffset),
          t
        );
        // Parabolic Y: 4 * peak * t * (1 - t)
        const currentY = Math.max(0.1, 4.0 * d.peakHeight * t * (1.0 - t));

        d.mesh.position.set(currentXZ.x, currentY, currentXZ.z);
        d.mesh.rotation.x += d.rotSpeed.x * dt;
        d.mesh.rotation.y += d.rotSpeed.y * dt;
        d.mesh.rotation.z += d.rotSpeed.z * dt;
      } else if (!d.hasImpacted) {
        d.hasImpacted = true;
        d.mesh.position.y = 0.2;

        // Ground Impact FX
        const impactWorld = this.casterPos.clone().add(d.mesh.position);
        this.ctx.decals?.spawn?.(DecalType.CRACK, impactWorld, { radius: randRange(2.5, 4.5), life: 4.0 });
        this.ctx.bursts?.trigger?.(impactWorld, randRange(4.0, 7.0), BurstMode.AIR, 0.4, '#581c87');
      }
    }

    // 3. Parabolic Trajectory for Swallowed Entities (0.0s ~ 1.6s)
    for (const s of this.swallowedLaunched) {
      const ent = s.entity;
      if (!ent) continue;

      if (t < 1.0) {
        const curPos = new Vector3().lerpVectors(this.casterPos, s.landPos, t);
        curPos.y = Math.max(0.2, 4.0 * s.peakHeight * t * (1.0 - t));
        ent.position.copy(curPos);
        if (ent.group) {
          ent.group.visible = true;
          ent.group.position.copy(curPos);
        }
        if (ent.mesh) {
          ent.mesh.visible = true;
          ent.mesh.position.copy(curPos);
        }
      } else if (!s.hasImpacted) {
        s.hasImpacted = true;
        ent.position.copy(s.landPos);
        ent.position.y = 0.0;
        if (ent.group) ent.group.position.copy(s.landPos);
        if (ent.mesh) ent.mesh.position.copy(s.landPos);

        // Stun & Crash Impact
        this.ctx.shake?.add?.(3.5, 1 / 0.8, 60);
        this.ctx.decals?.spawn?.(DecalType.SCORCH, s.landPos, { radius: 6.0, life: 6.0 });
        this.ctx.bursts?.trigger?.(s.landPos, 12.0, BurstMode.AIR, 0.6, '#9333ea');

        if (ent.takeDamage) {
          const dmg = 2800 + this.swallowedLaunched.length * 400;
          ent.takeDamage(dmg, true);
          this.ctx.floatingText?.spawn?.('💫 STUNNED! (2.5s)', s.landPos.clone().add(new Vector3(0, 2.5, 0)), {
            color: '#facc15',
            size: 22,
            isCrit: true
          });
        }
      }
    }

    // 4. Cataclysmic Bombardment Detonation (at 1.6s)
    if (this.age >= 1.6 && !this.hasImploded) {
      this.hasImploded = true;

      this.ctx.flash?.triggerNegativeInvert?.(1.3, 0.4);
      this.ctx.shockwaves?.spawnShockwave(this.targetPos, 35.0, 0.8, 4.5);
      this.ctx.shake?.add?.(5.0, 1 / 1.0, 80);
      this.ctx.bursts?.trigger?.(this.targetPos, 28.0, BurstMode.AIR, 0.9, '#2e0854');
      this.ctx.decals?.spawn?.(DecalType.SCORCH, this.targetPos, { radius: 26.0, life: 8.0 });

      // Deal Massive Damage to all enemies in 16m Target Zone
      const targetPool = [];
      if (this.ctx.abilities?.ctx?.devRoom?.isInDevRoom) {
        const dummies = this.ctx.abilities.ctx.devRoom.dummies || [];
        for (const d of dummies) {
          if (d.alive !== false && !d.isDead) targetPool.push(d);
        }
      }
      const regularEnemies = this.ctx.abilities?.ctx?.enemies?.enemies || [];
      for (const e of regularEnemies) {
        if (!e.isDead && e.hp > 0) targetPool.push(e);
      }

      const hitRadius = 16.0;
      const baseDmg = 2400 + this.swallowedLaunched.length * 500;
      for (const target of targetPool) {
        const d = target.position.distanceTo(this.targetPos);
        if (d <= hitRadius && target.takeDamage) {
          target.takeDamage(baseDmg, true);
        }
      }
    }

    // 5. Fade out Debris
    if (this.age > 2.4) {
      const fProgress = saturate((this.age - 2.4) / this.fadeDuration);
      const fScale = 1.0 - fProgress;
      this.debrisGroup.scale.set(fScale, fScale, fScale);
    }

    if (progress >= 1.0) {
      this.liberationGroup.visible = false;
      this._restoreSwallowedDummies();
    }
  }

  _restoreSwallowedDummies() {
    for (const s of this.swallowedLaunched) {
      const ent = s.entity;
      if (ent) {
        ent.isSinking = false;
        ent.isTrapped = false;
        ent.freezeTimer = 0;
        ent.position.copy(s.originalPos);
        if (ent.mesh) {
          ent.mesh.position.copy(s.originalPos);
          ent.mesh.visible = true;
        }
        if (ent.group) {
          ent.group.position.copy(s.originalPos);
          ent.group.visible = true;
        }
        if (ent.root) ent.root.visible = true;
      }
    }
    this.swallowedLaunched = [];
  }

  onDestroy() {
    this.liberationGroup.visible = false;
    this._restoreSwallowedDummies();
  }
}
