import {
  Group,
  Mesh,
  CylinderGeometry,
  BoxGeometry,
  ConeGeometry,
  TorusGeometry,
  DodecahedronGeometry,
  OctahedronGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  Color,
  MathUtils,
  Vector3
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * AAA Colossal Multi-Biome World (75km Continent)
 * Packed with rich landmarks: Grand Fountains, Marketplaces, Windmills, Fortresses, Stonehenges & Shrines
 */
export class ProceduralWorldMap {
  constructor(scene) {
    this.scene = scene;
    this.root = new Group();
    this.root.name = 'ProceduralWorldMap';
    this.scene.add(this.root);

    this.gltfLoader = new GLTFLoader();
    this.animatedObjects = [];
    this.rotatingSails = [];

    // 1. Megalithic Biomes Construction
    this._buildSanctuaryCapital();
    this._buildDawnMeadows();
    this._buildObsidianLavaCanyon();
    this._buildAbyssalVoidDomain();

    // 2. Load Master Architectural Models
    this._loadArchitecturalAssets();
  }

  _loadArchitecturalAssets() {
    // 2.1 Sanctuary Grand Cathedral (North of plaza: Z: -180m)
    this.gltfLoader.load('./models/sanctuary_temple.glb', (gltf) => {
      const temple = gltf.scene;
      temple.position.set(0, 0, -180);
      temple.scale.setScalar(5.5);
      temple.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      this.root.add(temple);
    }, undefined, () => {});

    // 2.2 Central Imperial Aether Spire (Center: 0, 0, 0)
    this.gltfLoader.load('./models/aether_spire.glb', (gltf) => {
      const spire = gltf.scene;
      spire.position.set(0, 0, -45);
      spire.scale.setScalar(4.5);
      spire.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      this.root.add(spire);
    }, undefined, () => {});

    // 2.3 Imperial Fortress & Town Districts (150m ~ 1,200m)
    this.gltfLoader.load('./models/medieval_houses.glb', (gltf) => {
      const houseBase = gltf.scene;
      const houseLayout = [
        { x: -160, z: -90, rot: 0.5, s: 3.5 },
        { x: 160, z: -90, rot: -0.5, s: 3.5 },
        { x: -220, z: 120, rot: 1.3, s: 3.2 },
        { x: 220, z: 120, rot: -1.3, s: 3.2 },
        { x: -350, z: 320, rot: 2.2, s: 4.0 },
        { x: 350, z: 320, rot: -2.2, s: 4.0 },
        { x: -600, z: 700, rot: 0.8, s: 4.5 },
        { x: 600, z: 700, rot: -0.8, s: 4.5 }
      ];

      houseLayout.forEach((cfg) => {
        const h = houseBase.clone();
        h.position.set(cfg.x, 0, cfg.z);
        h.rotation.y = cfg.rot;
        h.scale.setScalar(cfg.s);
        h.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.root.add(h);
      });
    }, undefined, () => {});

    // 2.4 Distant Obsidian Volcano Mountain Peaks (X: ±4,000m ~ ±18,000m)
    this.gltfLoader.load('./models/obsidian_crags.glb', (gltf) => {
      const cragBase = gltf.scene;
      const canyonSpawns = [
        { x: -4500, z: -2000, s: 28.0, r: 0.2 },
        { x: -8500, z: 3000, s: 35.0, r: 1.4 },
        { x: -14000, z: -8000, s: 45.0, r: 2.6 },
        { x: 4500, z: -2000, s: 28.0, r: 3.14 },
        { x: 8500, z: 3000, s: 35.0, r: -1.4 },
        { x: 14000, z: -8000, s: 45.0, r: -2.6 }
      ];

      canyonSpawns.forEach((cfg) => {
        const c = cragBase.clone();
        c.position.set(cfg.x, 0, cfg.z);
        c.rotation.y = cfg.r;
        c.scale.setScalar(cfg.s);
        c.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.root.add(c);
      });
    }, undefined, () => {});
  }

  /* ------------------------------------------------------------------ */
  /* 1. Sanctuary Imperial Capital (Grand Fountain, Plaza, Market)      */
  /* ------------------------------------------------------------------ */
  _buildSanctuaryCapital() {
    const havenGroup = new Group();

    // 1.1 Grand Imperial Capital Ground is rendered seamlessly by Ground.js at y=0

    // 1.2 Grand 3-Tier Marble Fountain at South Plaza Entrance (Z: 60m)
    const waterMat = new MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const whiteStoneMat = new MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });

    const fountain = new Group();
    fountain.position.set(0, 0, 60);

    const fBasin = new Mesh(new CylinderGeometry(18, 20, 2.5, 32), whiteStoneMat);
    fBasin.position.y = 1.25;
    fBasin.castShadow = true;
    fBasin.receiveShadow = true;

    const fWater = new Mesh(new CylinderGeometry(17, 17, 0.4, 32), waterMat);
    fWater.position.y = 2.4;

    const fTier2 = new Mesh(new CylinderGeometry(9, 10, 3.5, 24), whiteStoneMat);
    fTier2.position.y = 4.0;
    fTier2.castShadow = true;

    const fWater2 = new Mesh(new CylinderGeometry(8.5, 8.5, 0.3, 24), waterMat);
    fWater2.position.y = 5.8;

    const fSpire = new Mesh(new ConeGeometry(2.5, 6.0, 16), whiteStoneMat);
    fSpire.position.y = 8.5;
    fSpire.castShadow = true;

    fountain.add(fBasin, fWater, fTier2, fWater2, fSpire);
    havenGroup.add(fountain);

    // 1.3 Ring of 16 Colonnade Imperial Pillars with Blue Aether Crystals
    const pillarMat = new MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.15 });
    const beaconMat = new MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.65 });
    const pRadius = 95.0;
    for (let i = 0; i < 16; i++) {
      if (i === 4 || i === 12) continue; // Keep gateways open

      const angle = (i / 16) * Math.PI * 2;
      const px = Math.cos(angle) * pRadius;
      const pz = Math.sin(angle) * pRadius;

      const pGroup = new Group();
      pGroup.position.set(px, 0, pz);

      const shaft = new Mesh(new CylinderGeometry(2.2, 2.8, 32.0, 16), pillarMat);
      shaft.position.y = 16.0;
      shaft.castShadow = true;
      pGroup.add(shaft);

      const capTop = new Mesh(new BoxGeometry(6.5, 2.0, 6.5), pillarMat);
      capTop.position.y = 32.0;
      pGroup.add(capTop);

      const beacon = new Mesh(new OctahedronGeometry(2.2, 0), beaconMat);
      beacon.position.y = 35.5;
      pGroup.add(beacon);

      havenGroup.add(pGroup);
    }

    // 1.4 Marketplace Stalls, Barrels, and Cargo Crates
    const woodMat = new MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const redClothMat = new MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const blueClothMat = new MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });

    const stallPositions = [
      { x: -45, z: 20, rot: 0.4, mat: redClothMat },
      { x: -45, z: -20, rot: -0.4, mat: blueClothMat },
      { x: 45, z: 20, rot: -0.4, mat: blueClothMat },
      { x: 45, z: -20, rot: 0.4, mat: redClothMat }
    ];

    stallPositions.forEach((pos) => {
      const stall = new Group();
      stall.position.set(pos.x, 0, pos.z);
      stall.rotation.y = pos.rot;

      const table = new Mesh(new BoxGeometry(8.0, 2.2, 4.0), woodMat);
      table.position.y = 1.1;
      table.castShadow = true;

      const canopy = new Mesh(new BoxGeometry(9.0, 0.8, 5.5), pos.mat);
      canopy.position.y = 5.5;
      canopy.castShadow = true;

      const post1 = new Mesh(new CylinderGeometry(0.2, 0.2, 5.5), woodMat);
      post1.position.set(-4.0, 2.75, -2.2);
      const post2 = new Mesh(new CylinderGeometry(0.2, 0.2, 5.5), woodMat);
      post2.position.set(4.0, 2.75, -2.2);
      const post3 = new Mesh(new CylinderGeometry(0.2, 0.2, 5.5), woodMat);
      post3.position.set(-4.0, 2.75, 2.2);
      const post4 = new Mesh(new CylinderGeometry(0.2, 0.2, 5.5), woodMat);
      post4.position.set(4.0, 2.75, 2.2);

      // Wooden Barrels & Crates beside stall
      const barrel = new Mesh(new CylinderGeometry(1.2, 1.2, 2.5, 12), woodMat);
      barrel.position.set(5.5, 1.25, 0);
      barrel.castShadow = true;

      const crate = new Mesh(new BoxGeometry(2.0, 2.0, 2.0), woodMat);
      crate.position.set(-5.5, 1.0, 0);
      crate.castShadow = true;

      stall.add(table, canopy, post1, post2, post3, post4, barrel, crate);
      havenGroup.add(stall);
    });

    // 1.5 Imperial Forge & Workshop
    const forgeMat = new MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const anvil = new Mesh(new BoxGeometry(4.0, 5.0, 6.0), forgeMat);
    anvil.position.set(-65, 2.5, -45);
    havenGroup.add(anvil);

    const coalsMat = new MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 3.0 });
    const furnace = new Mesh(new BoxGeometry(12.0, 9.0, 12.0), forgeMat);
    furnace.position.set(-65, 4.5, -60);
    const coals = new Mesh(new BoxGeometry(9.0, 1.8, 9.0), coalsMat);
    coals.position.set(-65, 9.0, -60);
    havenGroup.add(furnace, coals);

    this.root.add(havenGroup);
  }

  /* ------------------------------------------------------------------ */
  /* 2. Dawn Continental Plains (Giant Windmills, Stonehenges, Ruins)   */
  /* ------------------------------------------------------------------ */
  _buildDawnMeadows() {
    const meadowGroup = new Group();
    const stoneMat = new MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const runeMat = new MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 2.5 });
    const millWoodMat = new MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
    const sailMat = new MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });

    // 2.1 Giant Rotating Windmills (Z: 2,500m ~ 16,000m)
    const windmillCoords = [
      { x: -1200, z: 2800, s: 1.2 },
      { x: 1600, z: 4200, s: 1.5 },
      { x: -2800, z: 8000, s: 1.8 },
      { x: 3200, z: 12000, s: 2.0 },
      { x: -800, z: 16000, s: 2.2 }
    ];

    windmillCoords.forEach((cfg) => {
      const wm = new Group();
      wm.position.set(cfg.x, 0, cfg.z);

      const tower = new Mesh(new CylinderGeometry(6.0 * cfg.s, 10.0 * cfg.s, 32.0 * cfg.s, 16), stoneMat);
      tower.position.y = 16.0 * cfg.s;
      tower.castShadow = true;

      const roof = new Mesh(new ConeGeometry(8.0 * cfg.s, 10.0 * cfg.s, 16), millWoodMat);
      roof.position.y = 37.0 * cfg.s;
      roof.castShadow = true;

      // Rotating Sail Hub
      const sailHub = new Group();
      sailHub.position.set(0, 30.0 * cfg.s, 6.2 * cfg.s);

      for (let i = 0; i < 4; i++) {
        const bladeArm = new Mesh(new CylinderGeometry(0.4 * cfg.s, 0.4 * cfg.s, 24.0 * cfg.s), millWoodMat);
        bladeArm.position.y = 12.0 * cfg.s;
        const bladeSail = new Mesh(new BoxGeometry(4.0 * cfg.s, 18.0 * cfg.s, 0.3), sailMat);
        bladeSail.position.set(2.0 * cfg.s, 12.0 * cfg.s, 0);

        const bladeGroup = new Group();
        bladeGroup.rotation.z = (i / 4) * Math.PI * 2;
        bladeGroup.add(bladeArm, bladeSail);
        sailHub.add(bladeGroup);
      }

      wm.add(tower, roof, sailHub);
      this.rotatingSails.push(sailHub);
      meadowGroup.add(wm);
    });

    // 2.2 Ancient Stonehenge Sacred Circles (Z: 3,500m ~ 14,000m)
    const stonehengeCoords = [
      { x: 0, z: 3500, r: 60, h: 22 },
      { x: -2200, z: 9500, r: 85, h: 28 },
      { x: 2200, z: 14500, r: 110, h: 35 }
    ];

    stonehengeCoords.forEach((cfg) => {
      const shGroup = new Group();
      shGroup.position.set(cfg.x, 0, cfg.z);

      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const px = Math.cos(angle) * cfg.r;
        const pz = Math.sin(angle) * cfg.r;

        const p = new Mesh(new BoxGeometry(cfg.h * 0.25, cfg.h, cfg.h * 0.25), stoneMat);
        p.position.set(px, cfg.h / 2, pz);
        p.rotation.y = angle + Math.PI / 2;
        p.castShadow = true;
        shGroup.add(p);
      }

      // Central Floating Emerald Crystal
      const crystal = new Mesh(new OctahedronGeometry(cfg.h * 0.35, 0), runeMat);
      crystal.position.y = cfg.h * 0.8;
      shGroup.add(crystal);
      this.animatedObjects.push(crystal);

      meadowGroup.add(shGroup);
    });

    this.root.add(meadowGroup);
  }

  /* ------------------------------------------------------------------ */
  /* 3. Obsidian Volcano Mountain Range (Lava Spire Columns)            */
  /* ------------------------------------------------------------------ */
  _buildObsidianLavaCanyon() {
    const canyonGroup = new Group();
    const basaltMat = new MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
    const magmaGlowMat = new MeshStandardMaterial({ color: 0xff3300, emissive: 0xff1100, emissiveIntensity: 3.5 });

    const volcanoSpireCoords = [
      { x: -5000, z: -1000, h: 120 },
      { x: -9000, z: 2500, h: 160 },
      { x: -15000, z: -5000, h: 220 },
      { x: 5000, z: -1000, h: 120 },
      { x: 9000, z: 2500, h: 160 },
      { x: 15000, z: -5000, h: 220 }
    ];

    volcanoSpireCoords.forEach((cfg) => {
      const vGroup = new Group();
      vGroup.position.set(cfg.x, 0, cfg.z);

      const col = new Mesh(new CylinderGeometry(12, 28, cfg.h, 8), basaltMat);
      col.position.y = cfg.h / 2;
      col.castShadow = true;
      vGroup.add(col);

      const magmaRing = new Mesh(new TorusGeometry(16, 2.5, 8, 24), magmaGlowMat);
      magmaRing.position.y = cfg.h * 0.7;
      magmaRing.rotation.x = Math.PI / 2;
      vGroup.add(magmaRing);

      canyonGroup.add(vGroup);
    });

    this.root.add(canyonGroup);
  }

  /* ------------------------------------------------------------------ */
  /* 4. Abyssal Void Realm (North Z: -5,000m ~ -25,000m)                */
  /* ------------------------------------------------------------------ */
  _buildAbyssalVoidDomain() {
    const abyssGroup = new Group();
    const darkObsidianMat = new MeshStandardMaterial({ color: 0x050508, roughness: 0.2, metalness: 0.8 });
    const voidPurpleMat = new MeshStandardMaterial({ color: 0x9333ea, emissive: 0x7e22ce, emissiveIntensity: 3.2 });

    const voidAltarCoords = [
      { x: 0, z: -5000, s: 80 },
      { x: -3500, z: -10000, s: 120 },
      { x: 3500, z: -10000, s: 120 },
      { x: 0, z: -18000, s: 180 }
    ];

    voidAltarCoords.forEach((cfg) => {
      const aGroup = new Group();
      aGroup.position.set(cfg.x, 0, cfg.z);

      // Inverted Void Pyramid Monolith
      const pyramid = new Mesh(new ConeGeometry(cfg.s * 0.5, cfg.s, 4), darkObsidianMat);
      pyramid.position.y = cfg.s / 2;
      pyramid.rotation.y = Math.PI / 4;
      pyramid.castShadow = true;
      aGroup.add(pyramid);

      // Orbiting Void Ring
      const ring = new Mesh(new TorusGeometry(cfg.s * 0.65, 3.5, 8, 32), voidPurpleMat);
      ring.position.y = cfg.s * 0.6;
      ring.rotation.x = 0.8;
      aGroup.add(ring);
      this.animatedObjects.push(ring);

      abyssGroup.add(aGroup);
    });

    this.root.add(abyssGroup);
  }

  setVisible(visible) {
    this.root.visible = visible;
  }

  update(dt, time) {
    // Rotate floating crystals and void rings
    for (const obj of this.animatedObjects) {
      obj.rotation.y += dt * 0.4;
    }
    // Rotate windmill sails smoothly with wind
    for (const sail of this.rotatingSails) {
      sail.rotation.z += dt * 0.8;
    }
  }

  dispose() {
    this.root.clear();
  }
}
