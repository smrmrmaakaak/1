import {
  Group,
  Mesh,
  InstancedMesh,
  CylinderGeometry,
  DodecahedronGeometry,
  ConeGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  Color,
  Object3D,
  Vector3
} from 'three';
import { LAYER } from '../core/Layers.js';

const _dummy = new Object3D();

/**
 * AAA-Grade Procedural Foliage, Multi-Species Forests, Boulders & Shrines for 75km Continent.
 */
export class ProceduralFlora {
  constructor(scene) {
    this.scene = scene;
    this.root = new Group();
    this.root.name = 'ProceduralFlora';
    this.scene.add(this.root);

    this._spawnDawnMeadowForests();
    this._spawnRockBoulders();
    this._spawnSanctuaryTownFlora();
    this._spawnCanyonFirePillars();
    this._spawnGlacialCrystalShrines();
  }

  setVisible(visible) {
    this.root.visible = visible;
  }

  _spawnDawnMeadowForests() {
    // 1. Green Pines, Golden Oaks & Sakura Blossoms (Z: 400m ~ 22,000m)
    const trunkGeo = new CylinderGeometry(1.2, 2.4, 16.0, 6);
    const trunkMat = new MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });

    // Green Pine Leaves
    const pineLeafGeo = new ConeGeometry(9.0, 18.0, 6);
    const pineLeafMat = new MeshStandardMaterial({ color: 0x15803d, roughness: 0.75, flatShading: true });

    // Golden Autumn Leaves
    const oakLeafGeo = new DodecahedronGeometry(8.5, 1);
    const oakLeafMat = new MeshStandardMaterial({ color: 0xeab308, roughness: 0.8, flatShading: true });

    // Pink Sakura Leaves
    const sakuraLeafGeo = new IcosahedronGeometry(8.0, 1);
    const sakuraLeafMat = new MeshStandardMaterial({ color: 0xf472b6, roughness: 0.7, flatShading: true });

    const pineCount = 600;
    const oakCount = 400;
    const sakuraCount = 250;

    const pineTrunk = new InstancedMesh(trunkGeo, trunkMat, pineCount);
    const pineLeaf = new InstancedMesh(pineLeafGeo, pineLeafMat, pineCount);

    const oakTrunk = new InstancedMesh(trunkGeo, trunkMat, oakCount);
    const oakLeaf = new InstancedMesh(oakLeafGeo, oakLeafMat, oakCount);

    const sakuraTrunk = new InstancedMesh(trunkGeo, trunkMat, sakuraCount);
    const sakuraLeaf = new InstancedMesh(sakuraLeafGeo, sakuraLeafMat, sakuraCount);

    [pineTrunk, pineLeaf, oakTrunk, oakLeaf, sakuraTrunk, sakuraLeaf].forEach((m) => {
      m.castShadow = true;
      m.receiveShadow = true;
    });

    // Populate Pines
    for (let i = 0; i < pineCount; i++) {
      const x = (Math.random() - 0.5) * 20000;
      const z = 450 + Math.random() * 21000;
      const s = 1.0 + Math.random() * 1.8;

      _dummy.position.set(x, 8.0 * s, z);
      _dummy.scale.set(s, s, s);
      _dummy.rotation.y = Math.random() * Math.PI * 2;
      _dummy.updateMatrix();
      pineTrunk.setMatrixAt(i, _dummy.matrix);

      _dummy.position.set(x, (8.0 + 10.0) * s, z);
      _dummy.updateMatrix();
      pineLeaf.setMatrixAt(i, _dummy.matrix);
    }

    // Populate Golden Oaks
    for (let i = 0; i < oakCount; i++) {
      const x = (Math.random() - 0.5) * 16000;
      const z = 600 + Math.random() * 18000;
      const s = 1.2 + Math.random() * 1.6;

      _dummy.position.set(x, 8.0 * s, z);
      _dummy.scale.set(s, s, s);
      _dummy.rotation.y = Math.random() * Math.PI * 2;
      _dummy.updateMatrix();
      oakTrunk.setMatrixAt(i, _dummy.matrix);

      _dummy.position.set(x, (8.0 + 9.0) * s, z);
      _dummy.updateMatrix();
      oakLeaf.setMatrixAt(i, _dummy.matrix);
    }

    // Populate Sakura Trees
    for (let i = 0; i < sakuraCount; i++) {
      const x = (Math.random() - 0.5) * 10000;
      const z = 300 + Math.random() * 12000;
      const s = 1.1 + Math.random() * 1.5;

      _dummy.position.set(x, 7.5 * s, z);
      _dummy.scale.set(s, s, s);
      _dummy.rotation.y = Math.random() * Math.PI * 2;
      _dummy.updateMatrix();
      sakuraTrunk.setMatrixAt(i, _dummy.matrix);

      _dummy.position.set(x, (7.5 + 8.5) * s, z);
      _dummy.updateMatrix();
      sakuraLeaf.setMatrixAt(i, _dummy.matrix);
    }

    pineTrunk.instanceMatrix.needsUpdate = true;
    pineLeaf.instanceMatrix.needsUpdate = true;
    oakTrunk.instanceMatrix.needsUpdate = true;
    oakLeaf.instanceMatrix.needsUpdate = true;
    sakuraTrunk.instanceMatrix.needsUpdate = true;
    sakuraLeaf.instanceMatrix.needsUpdate = true;

    this.root.add(pineTrunk, pineLeaf, oakTrunk, oakLeaf, sakuraTrunk, sakuraLeaf);
  }

  _spawnRockBoulders() {
    // 2. Instanced Natural Granite Boulders (500 instances across plains & mountains)
    const rockGeo = new DodecahedronGeometry(6.0, 1);
    const rockMat = new MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, flatShading: true });
    const count = 400;
    const rockMesh = new InstancedMesh(rockGeo, rockMat, count);
    rockMesh.castShadow = true;
    rockMesh.receiveShadow = true;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 24000;
      const z = -6000 + Math.random() * 26000;
      const s = 0.8 + Math.random() * 3.5;

      _dummy.position.set(x, 3.0 * s, z);
      _dummy.scale.set(s * (0.8 + Math.random() * 0.4), s, s * (0.8 + Math.random() * 0.4));
      _dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      _dummy.updateMatrix();
      rockMesh.setMatrixAt(i, _dummy.matrix);
    }

    rockMesh.instanceMatrix.needsUpdate = true;
    this.root.add(rockMesh);
  }

  _spawnSanctuaryTownFlora() {
    // 3. Imperial Street Lamps along Royal Avenue (Z: -200m ~ 600m)
    const poleGeo = new CylinderGeometry(0.35, 0.45, 7.5, 8);
    const poleMat = new MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const lampMat = new MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 3.5 });

    const lampPositions = [
      { x: -14, z: 25 }, { x: 14, z: 25 },
      { x: -18, z: 80 }, { x: 18, z: 80 },
      { x: -22, z: 180 }, { x: 22, z: 180 },
      { x: -28, z: 320 }, { x: 28, z: 320 },
      { x: -35, z: 500 }, { x: 35, z: 500 }
    ];

    lampPositions.forEach((pos) => {
      const lGroup = new Group();
      lGroup.position.set(pos.x, 0, pos.z);

      const pole = new Mesh(poleGeo, poleMat);
      pole.position.y = 3.75;
      pole.castShadow = true;

      const glass = new Mesh(new OctahedronGeometry(0.85, 0), lampMat);
      glass.position.y = 7.5;

      lGroup.add(pole, glass);
      this.root.add(lGroup);
    });
  }

  _spawnCanyonFirePillars() {
    // 4. Magma Pillars in Volcano Mountain Range (X: ±5,000m ~ ±18,000m)
    const rockGeo = new DodecahedronGeometry(8.0, 0);
    const rockMat = new MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
    const fireMat = new MeshStandardMaterial({ color: 0xff4400, emissive: 0xff1100, emissiveIntensity: 3.8 });

    const pillarCoords = [
      { x: -5500, z: 1500 }, { x: -8500, z: -3500 }, { x: -14000, z: 4000 },
      { x: 5500, z: 1500 }, { x: 8500, z: -3500 }, { x: 14000, z: 4000 }
    ];

    pillarCoords.forEach((pos) => {
      const pGroup = new Group();
      pGroup.position.set(pos.x, 0, pos.z);

      const baseRock = new Mesh(rockGeo, rockMat);
      baseRock.position.y = 4.0;
      baseRock.scale.set(2.5, 3.5, 2.5);
      baseRock.castShadow = true;

      const fireGem = new Mesh(new OctahedronGeometry(4.5, 0), fireMat);
      fireGem.position.y = 16.0;

      pGroup.add(baseRock, fireGem);
      this.root.add(pGroup);
    });
  }

  _spawnGlacialCrystalShrines() {
    // 5. Glacial Astral Shrines in Deep Abyss (Z: -6,000m ~ -22,000m)
    const iceMat = new MeshStandardMaterial({
      color: 0xa5f3fc,
      emissive: 0x06b6d4,
      emissiveIntensity: 2.5,
      roughness: 0.1,
      metalness: 0.3
    });

    const shrineCoords = [
      { x: -2500, z: -7000 },
      { x: 2500, z: -7000 },
      { x: 0, z: -14000 }
    ];

    shrineCoords.forEach((pos) => {
      const sGroup = new Group();
      sGroup.position.set(pos.x, 0, pos.z);

      const shard = new Mesh(new ConeGeometry(8.0, 35.0, 5), iceMat);
      shard.position.y = 17.5;
      shard.castShadow = true;

      sGroup.add(shard);
      this.root.add(sGroup);
    });
  }

  dispose() {
    this.root.clear();
  }
}
