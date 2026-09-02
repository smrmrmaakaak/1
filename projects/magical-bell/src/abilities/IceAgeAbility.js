import {
  Group,
  Mesh,
  PlaneGeometry,
  ConeGeometry,
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  DoubleSide,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { createRealisticIceFloorMaterial } from '../materials/RealisticIceFloorMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { randRange, saturate } from '../utils/math.js';
import { getColor } from '../utils/color.js';

const _emit = {};
const NUM_INNER_PEAKS = 6;
const NUM_OUTER_PEAKS = 10;
const NUM_ICE_CHUNKS = 48;

/**
 * [Aokiji T / Ultimate] 아이스 에이지 (氷河時代 - Ice Age / 빙하시대)
 * 대지와 바다 전체를 순식간에 하얗게 얼려버리는 실사 3D 입체 빙하 궁극기.
 * - 물리적 요철과 깊이감을 가진 44m 초광역 3D 버텍스 디스플레이스먼트 빙결 지판
 * - 바닥에 솟아오른 48개의 실제 3D 각진 얼음 조각과 파편 융기
 * - 16개 초대형 3D 빙하 거목 산맥 융기 (최대 18m)
 * - 적군 즉시 전신 동결 및 3D 빙결 결정 감옥 (Cryostasis Flash Freeze)
 * - 바닥을 기어가는 극저온 드라이아이스 냉기 안개 & 다이아몬드 더스트
 */
export class IceAgeAbility extends Ability {
  constructor(context) {
    super('avalanche', context);
  }

  createShaders() {
    this.targetPos = new Vector3();

    // Master Group
    this.iceGroup = new Group();
    this.iceGroup.name = 'Aokiji_IceAge_Master';
    this.iceGroup.matrixAutoUpdate = true;

    // 1. AAA Volumetric Procedural Glacier Floor Shader
    this.floorMaterial = createRealisticIceFloorMaterial();

    const floorGeo = new PlaneGeometry(44.0, 44.0, 96, 96);
    floorGeo.rotateX(-Math.PI / 2);
    this.floorMesh = new Mesh(floorGeo, this.floorMaterial);
    this.floorMesh.position.y = 0.05;
    this.floorMesh.renderOrder = 998;
    this.iceGroup.add(this.floorMesh);

    // 2. High-Specular 3D Crystal Materials for Peaks and Ice Slabs
    this.glacierMat = new MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.2,
      roughness: 0.08,
      metalness: 0.85,
      transparent: true,
      opacity: 0.95,
      side: DoubleSide,
      depthWrite: true
    });

    this.frostRimeMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x7dd3fc,
      emissiveIntensity: 3.8,
      roughness: 0.05,
      metalness: 0.90,
      transparent: true,
      opacity: 0.98,
      side: DoubleSide,
      depthWrite: true
    });

    // 3. 48 Physical 3D Jagged Ice Chunks & Tilted Slabs on the Ground
    this.chunksGroup = new Group();
    this.chunksGroup.matrixAutoUpdate = true;
    this.iceChunks = [];

    for (let i = 0; i < NUM_ICE_CHUNKS; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = randRange(2.0, 19.5);
      const w = randRange(0.8, 2.2);
      const h = randRange(0.3, 1.4);
      const d = randRange(0.8, 2.0);

      const chunkMesh = new Mesh(new BoxGeometry(w, h, d), Math.random() < 0.6 ? this.glacierMat : this.frostRimeMat);
      chunkMesh.position.set(Math.cos(angle) * dist, -2.0, Math.sin(angle) * dist);
      chunkMesh.rotation.set(randRange(-0.3, 0.3), randRange(0, Math.PI), randRange(-0.3, 0.3));

      this.chunksGroup.add(chunkMesh);
      this.iceChunks.push({ mesh: chunkMesh, targetY: h * 0.45, dist });
    }
    this.iceGroup.add(this.chunksGroup);

    // 4. 16 Colossal 3D Glacial Monolith Mountains (Inner + Outer Rings)
    this.peaksGroup = new Group();
    this.peaksGroup.matrixAutoUpdate = true;
    this.glacierPeaks = [];

    // Inner Ring: 6 Glacial Spires (8m ~ 12m tall, radius 8m ~ 13m)
    for (let i = 0; i < NUM_INNER_PEAKS; i++) {
      const gNode = new Group();
      const angle = (i * Math.PI * 2) / NUM_INNER_PEAKS + randRange(-0.15, 0.15);
      const dist = randRange(8.0, 13.0);
      const height = randRange(9.0, 12.5);
      const radius = randRange(2.0, 3.2);

      const peakGeo = new ConeGeometry(radius, height, 7);
      const peakMesh = new Mesh(peakGeo, this.glacierMat);
      peakMesh.position.y = height * 0.5;
      peakMesh.rotation.y = randRange(0, Math.PI);
      peakMesh.rotation.z = randRange(-0.12, 0.12);

      const shard1 = new Mesh(new BoxGeometry(1.4, height * 0.55, 1.4), this.frostRimeMat);
      shard1.position.set(1.4, height * 0.28, 1.0);
      shard1.rotation.set(0.25, 0.4, 0.2);

      const shard2 = new Mesh(new BoxGeometry(1.2, height * 0.45, 1.2), this.frostRimeMat);
      shard2.position.set(-1.2, height * 0.22, -1.1);
      shard2.rotation.set(-0.3, 0.2, -0.25);

      gNode.add(peakMesh, shard1, shard2);
      gNode.position.set(Math.cos(angle) * dist, -20.0, Math.sin(angle) * dist);
      this.peaksGroup.add(gNode);
      this.glacierPeaks.push({ node: gNode, targetY: 0, height, dist, angle });
    }

    // Outer Ring: 10 Massive Glacial Monoliths (12m ~ 18m tall, radius 16m ~ 23m)
    for (let i = 0; i < NUM_OUTER_PEAKS; i++) {
      const gNode = new Group();
      const angle = (i * Math.PI * 2) / NUM_OUTER_PEAKS + randRange(-0.12, 0.12);
      const dist = randRange(16.0, 23.0);
      const height = randRange(13.0, 18.0);
      const radius = randRange(2.8, 4.2);

      const peakGeo = new ConeGeometry(radius, height, 8);
      const peakMesh = new Mesh(peakGeo, this.glacierMat);
      peakMesh.position.y = height * 0.5;
      peakMesh.rotation.y = randRange(0, Math.PI);
      peakMesh.rotation.z = randRange(-0.18, 0.18);

      const blade1 = new Mesh(new BoxGeometry(1.8, height * 0.65, 1.8), this.frostRimeMat);
      blade1.position.set(1.8, height * 0.32, 1.4);
      blade1.rotation.set(0.3, 0.5, 0.2);

      const blade2 = new Mesh(new BoxGeometry(1.5, height * 0.5, 1.5), this.frostRimeMat);
      blade2.position.set(-1.6, height * 0.25, -1.5);
      blade2.rotation.set(-0.35, 0.3, -0.3);

      const blade3 = new Mesh(new BoxGeometry(1.2, height * 0.4, 1.2), this.frostRimeMat);
      blade3.position.set(0.5, height * 0.2, -2.0);
      blade3.rotation.set(0.2, -0.4, 0.3);

      gNode.add(peakMesh, blade1, blade2, blade3);
      gNode.position.set(Math.cos(angle) * dist, -25.0, Math.sin(angle) * dist);
      this.peaksGroup.add(gNode);
      this.glacierPeaks.push({ node: gNode, targetY: 0, height, dist, angle });
    }
    this.iceGroup.add(this.peaksGroup);

    // 5. Cryostasis Enemy Ice Prisons Group
    this.prisonGroup = new Group();
    this.prisonGroup.matrixAutoUpdate = true;
    this.icePrisons = [];

    for (let i = 0; i < 8; i++) {
      const pNode = new Group();
      const boxGeo = new CylinderGeometry(1.3, 1.6, 3.8, 6);
      boxGeo.translate(0, 1.9, 0);
      const boxMesh = new Mesh(boxGeo, this.frostRimeMat);
      boxMesh.rotation.y = randRange(0, Math.PI);

      const capGeo = new ConeGeometry(1.4, 1.8, 6);
      const capMesh = new Mesh(capGeo, this.glacierMat);
      capMesh.position.y = 4.2;

      pNode.add(boxMesh, capMesh);
      pNode.visible = false;
      this.prisonGroup.add(pNode);
      this.icePrisons.push(pNode);
    }
    this.iceGroup.add(this.prisonGroup);

    setLayerRecursive(this.iceGroup, LAYER.VFX);
    this.iceGroup.visible = false;
    this.ctx.scene.add(this.iceGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.frostMist = particles.get('ice.mist', {
      capacity: 5000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 1.2
    });

    this.frostShards = particles.get('ice.shards', {
      capacity: 4000,
      shape: ParticleShape.CHIP,
      additive: true,
      lit: true,
      softFade: 0.25
    });

    this.diamondDust = particles.get('ice.sparks', {
      capacity: 4000,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.15
    });
  }

  get impactDuration() {
    return 2.5;
  }

  get fadeDuration() {
    return 7.0;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);

    const strikeDir = direction.clone().normalize();
    this.targetPos.copy(origin).addScaledVector(strikeDir, Math.min(distance, 10.0));

    this.iceGroup.position.copy(this.targetPos);
    this.iceGroup.scale.set(1.0, 1.0, 1.0);
    this.iceGroup.visible = true;

    // Reset floor shader expansion
    this.floorMaterial.uniforms.uProgress.value = 0.01;
    this.floorMaterial.uniforms.uOpacity.value = 1.0;

    // Reset chunks beneath ground
    this.iceChunks.forEach(c => {
      c.mesh.position.y = -2.0;
    });

    // Reset glacier peaks beneath ground
    this.glacierPeaks.forEach(g => {
      g.node.position.y = -g.height * 1.2;
      g.node.scale.set(1.0, 1.0, 1.0);
    });

    this.glacierMat.opacity = 0.95;
    this.glacierMat.emissiveIntensity = 2.2;
    this.frostRimeMat.opacity = 0.98;
    this.frostRimeMat.emissiveIntensity = 3.8;

    const player = this.ctx.abilities?.ctx?.character;
    if (player) {
      player.playCast?.('cast2');
      player.castLunge?.();
    }

    this.ctx.flash?.trigger?.(getColor('#cffafe'), 0.35);
    this.ctx.shake?.add?.(3.2, 1 / 1.2, 60);
    this.ctx.lights?.point?.(this.targetPos.x, 3.5, this.targetPos.z, '#7dd3fc', 5.0, 30.0, 1.5);

    this.ctx.shockwaves?.spawnShockwave(this.targetPos, 36.0, 1.2, 3.2);
    this.ctx.rockDebris?.spawnExplosion(this.targetPos, 24, 25.0, 0x38bdf8);
    this.ctx.bursts?.trigger?.(this.targetPos, 32.0, BurstMode.FROST, 1.2, '#38bdf8');
    this.ctx.decals?.spawn?.(DecalType.FROST, this.targetPos, { radius: 24.0, life: 9.0 });

    this._freezeAllEnemiesInRange();

    if (this.diamondDust) {
      for (let i = 0; i < 120; i++) {
        _emit.position = this.targetPos.clone().add(new Vector3(randRange(-6, 6), randRange(0.2, 2.0), randRange(-6, 6)));
        _emit.velocity = new Vector3(randRange(-18, 18), randRange(8, 26), randRange(-18, 18));
        _emit.color = Math.random() < 0.6 ? '#ffffff' : '#38bdf8';
        _emit.size = randRange(0.8, 1.8);
        _emit.lifetime = randRange(0.8, 1.6);
        this.diamondDust.emit(1, _emit);
      }
    }
  }

  _freezeAllEnemiesInRange() {
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

    const maxRadius = 38.0;
    let prisonIdx = 0;

    for (const enemy of targetPool) {
      const d = enemy.position.distanceTo(this.targetPos);
      if (d <= maxRadius) {
        if (enemy.takeDamage) {
          enemy.takeDamage(2500, true);
        }

        if (prisonIdx < this.icePrisons.length) {
          const prison = this.icePrisons[prisonIdx];
          const localPos = enemy.position.clone().sub(this.targetPos);
          prison.position.copy(localPos);
          prison.position.y = 0;
          prison.visible = true;
          prisonIdx++;
        }
      }
    }
  }

  update(dt) {
    super.update(dt);
    if (!this.iceGroup.visible) return;

    const totalDuration = this.impactDuration + this.fadeDuration;
    const progress = saturate(this.age / totalDuration);

    // 1. Organic Glaciation Floor Expansion (0.01 -> 1.0 across first 0.45s)
    const floorEase = Math.min(1.0, this.age * 2.2);
    this.floorMaterial.uniforms.uProgress.value = floorEase;

    // 2. Physical 3D Ice Chunks Eruption (bursting out from the ice floor)
    this.iceChunks.forEach(c => {
      const chunkDelay = (c.dist / 20.0) * 0.35;
      const cProgress = saturate((this.age - chunkDelay) / 0.3);
      const ease = Math.sin(cProgress * Math.PI * 0.5);
      c.mesh.position.y = -2.0 + (2.0 + c.targetY) * ease;
    });

    // 3. Glacial Mountain Monoliths Violent Eruption (rising within 0.6s)
    this.glacierPeaks.forEach((g, idx) => {
      const startDelay = idx * 0.025;
      const peakProgress = saturate((this.age - startDelay) / 0.55);
      const easeOutBack = Math.sin(peakProgress * Math.PI * 0.5);
      g.node.position.y = -g.height * 1.2 + g.height * 1.2 * easeOutBack;
    });

    // 4. Continuous Cryogenic Fog & Diamond Dust Blizzard
    if (this.frostMist && Math.random() < 0.92) {
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = randRange(2.0, 22.0) * floorEase;
        _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, randRange(0.2, 3.5), Math.sin(angle) * r));
        _emit.velocity = new Vector3(randRange(-3, 3), randRange(1, 6), randRange(-3, 3));
        _emit.size = randRange(2.5, 6.0);
        _emit.lifetime = randRange(1.2, 2.5);
        _emit.color = Math.random() < 0.5 ? '#e0f2fe' : '#bae6fd';
        this.frostMist.emit(1, _emit);
      }
    }

    if (this.diamondDust && Math.random() < 0.85) {
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = randRange(1.0, 20.0) * floorEase;
        _emit.position = this.targetPos.clone().add(new Vector3(Math.cos(angle) * r, randRange(0.5, 5.0), Math.sin(angle) * r));
        _emit.velocity = new Vector3(randRange(-2, 2), randRange(2, 7), randRange(-2, 2));
        _emit.size = randRange(0.6, 1.4);
        _emit.lifetime = randRange(0.8, 1.8);
        _emit.color = '#ffffff';
        this.diamondDust.emit(1, _emit);
      }
    }

    // 5. Gradual Glacial Thaw across final 3 seconds
    if (progress > 0.65) {
      const fadeProgress = (progress - 0.65) / 0.35;
      const remaining = 1.0 - Math.pow(fadeProgress, 1.5);

      this.floorMaterial.uniforms.uOpacity.value = remaining;
      this.glacierMat.opacity = 0.95 * remaining;
      this.glacierMat.emissiveIntensity = 2.2 * remaining;
      this.frostRimeMat.opacity = 0.98 * remaining;
      this.frostRimeMat.emissiveIntensity = 3.8 * remaining;
    }

    if (progress >= 1.0) {
      this.iceGroup.visible = false;
      this.icePrisons.forEach(p => (p.visible = false));
    }
  }

  onDestroy() {
    this.iceGroup.visible = false;
    this.icePrisons.forEach(p => (p.visible = false));
  }
}
