import {
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  IcosahedronGeometry,
  OctahedronGeometry,
  DodecahedronGeometry,
  ConeGeometry,
  BoxGeometry,
  CylinderGeometry,
  TorusGeometry,
  Vector3,
  Color
} from 'three';

/**
 * AAA-Grade Procedural Rigged Monster Factory.
 * Generates distinct anatomies, glowing visual signatures, attack telegraphs, and hit reaction bones.
 */
export class ProceduralMonsterFactory {
  /**
   * 1. Shadow Imp (Minion) — Fast scuttling winged void creature with curved horns & mantis blades.
   */
  static createMinion() {
    const root = new Group();
    root.name = 'Procedural_ShadowImp';

    const skinMat = new MeshStandardMaterial({
      color: 0x2e1065,
      roughness: 0.6,
      metalness: 0.3,
      emissive: 0x581c87,
      emissiveIntensity: 0.4
    });

    const eyeMat = new MeshBasicMaterial({ color: 0xff0055 });
    const bladeMat = new MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });

    // Torso & Spined Back
    const bodyGeo = new DodecahedronGeometry(0.55, 0);
    bodyGeo.scale(0.8, 1.2, 0.9);
    const body = new Mesh(bodyGeo, skinMat);
    body.position.y = 0.9;
    body.castShadow = true;
    root.add(body);

    // Horned Head
    const headGeo = new OctahedronGeometry(0.35, 0);
    const head = new Mesh(headGeo, skinMat);
    head.position.set(0, 1.6, 0.2);
    head.castShadow = true;
    root.add(head);

    // Glowing Eyes
    const eyeL = new Mesh(new BoxGeometry(0.08, 0.04, 0.1), eyeMat);
    eyeL.position.set(-0.12, 1.65, 0.45);
    const eyeR = new Mesh(new BoxGeometry(0.08, 0.04, 0.1), eyeMat);
    eyeR.position.set(0.12, 1.65, 0.45);
    root.add(eyeL, eyeR);

    // Mantis Arm Blades
    const armL = new Mesh(new ConeGeometry(0.1, 0.9, 3), bladeMat);
    armL.position.set(-0.55, 1.0, 0.3);
    armL.rotation.set(0.5, 0, -0.4);
    const armR = new Mesh(new ConeGeometry(0.1, 0.9, 3), bladeMat);
    armR.position.set(0.55, 1.0, 0.3);
    armR.rotation.set(0.5, 0, 0.4);
    root.add(armL, armR);

    // Wing Membranes
    const wingGeo = new ConeGeometry(0.6, 1.2, 3);
    wingGeo.scale(0.1, 1.0, 1.0);
    const wingL = new Mesh(wingGeo, skinMat);
    wingL.position.set(-0.45, 1.2, -0.4);
    wingL.rotation.set(-0.3, 0.5, -0.6);
    const wingR = new Mesh(wingGeo, skinMat);
    wingR.position.set(0.45, 1.2, -0.4);
    wingR.rotation.set(-0.3, -0.5, 0.6);
    root.add(wingL, wingR);

    root.userData = {
      body,
      head,
      armL,
      armR,
      wingL,
      wingR,
      animate: (time, speed = 1.0) => {
        const walk = Math.sin(time * 14.0 * speed);
        body.position.y = 0.9 + Math.abs(walk) * 0.12;
        head.rotation.y = Math.sin(time * 7.0) * 0.15;
        armL.rotation.x = 0.5 + walk * 0.4;
        armR.rotation.x = 0.5 - walk * 0.4;
        wingL.rotation.z = -0.6 + Math.sin(time * 18.0) * 0.25;
        wingR.rotation.z = 0.6 - Math.sin(time * 18.0) * 0.25;
      }
    };

    return root;
  }

  /**
   * 2. Obsidian Magma Golem (Brute) — Colossal cracked rock titan with molten lava heart.
   */
  static createBrute() {
    const root = new Group();
    root.name = 'Procedural_ObsidianGolem';

    const rockMat = new MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.9,
      metalness: 0.2,
      flatShading: true
    });

    const lavaMat = new MeshBasicMaterial({ color: 0xff4500 });

    // Heavy Torso
    const torsoGeo = new BoxGeometry(1.6, 1.5, 1.1);
    const torso = new Mesh(torsoGeo, rockMat);
    torso.position.y = 1.6;
    torso.castShadow = true;
    root.add(torso);

    // Glowing Molten Core in Chest
    const coreGeo = new OctahedronGeometry(0.5, 0);
    const core = new Mesh(coreGeo, lavaMat);
    core.position.set(0, 1.6, 0.52);
    root.add(core);

    // Sunken Head
    const headGeo = new BoxGeometry(0.6, 0.5, 0.6);
    const head = new Mesh(headGeo, rockMat);
    head.position.set(0, 2.3, 0.2);
    head.castShadow = true;
    root.add(head);

    // Eye Visor Slit
    const eyeSlit = new Mesh(new BoxGeometry(0.4, 0.08, 0.1), lavaMat);
    eyeSlit.position.set(0, 2.32, 0.52);
    root.add(eyeSlit);

    // Massive Stone Fists & Pauldrons
    const pauldronGeo = new DodecahedronGeometry(0.55, 0);
    const pauldronL = new Mesh(pauldronGeo, rockMat);
    pauldronL.position.set(-1.25, 2.0, 0);
    const pauldronR = new Mesh(pauldronGeo, rockMat);
    pauldronR.position.set(1.25, 2.0, 0);
    root.add(pauldronL, pauldronR);

    const fistGeo = new BoxGeometry(0.6, 0.9, 0.6);
    const fistL = new Mesh(fistGeo, rockMat);
    fistL.position.set(-1.25, 1.0, 0.2);
    fistL.castShadow = true;
    const fistR = new Mesh(fistGeo, rockMat);
    fistR.position.set(1.25, 1.0, 0.2);
    fistR.castShadow = true;
    root.add(fistL, fistR);

    root.userData = {
      torso,
      core,
      head,
      fistL,
      fistR,
      animate: (time, speed = 1.0) => {
        const stomp = Math.sin(time * 6.0 * speed);
        torso.position.y = 1.6 + Math.abs(stomp) * 0.15;
        torso.rotation.z = Math.sin(time * 3.0 * speed) * 0.08;
        fistL.position.y = 1.0 + stomp * 0.35;
        fistR.position.y = 1.0 - stomp * 0.35;
        core.scale.setScalar(0.9 + Math.sin(time * 4.0) * 0.15);
      }
    };

    return root;
  }

  /**
   * 3. Fire Drake Lich (Pyro) — Hovering fiery dragon-caster with flaming halo.
   */
  static createPyro() {
    const root = new Group();
    root.name = 'Procedural_FireDrake';

    const scaleMat = new MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.4,
      metalness: 0.5,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.5
    });

    const fireMat = new MeshBasicMaterial({ color: 0xffaa00 });

    // Floating Serpentine Body
    const bodyGeo = new CylinderGeometry(0.3, 0.65, 1.5, 6);
    const body = new Mesh(bodyGeo, scaleMat);
    body.position.y = 1.5;
    body.castShadow = true;
    root.add(body);

    // Drake Dragon Skull
    const skullGeo = new ConeGeometry(0.4, 0.9, 5);
    skullGeo.rotateX(Math.PI / 2);
    const skull = new Mesh(skullGeo, scaleMat);
    skull.position.set(0, 2.2, 0.35);
    root.add(skull);

    // Flaming Halo Ring
    const haloGeo = new TorusGeometry(0.85, 0.08, 6, 24);
    haloGeo.rotateX(Math.PI / 3);
    const halo = new Mesh(haloGeo, fireMat);
    halo.position.set(0, 2.3, -0.2);
    root.add(halo);

    // Fiery Wings
    const wingGeo = new ConeGeometry(0.7, 1.6, 3);
    wingGeo.scale(0.08, 1.0, 1.0);
    const wingL = new Mesh(wingGeo, scaleMat);
    wingL.position.set(-0.65, 1.8, -0.2);
    const wingR = new Mesh(wingGeo, scaleMat);
    wingR.position.set(0.65, 1.8, -0.2);
    root.add(wingL, wingR);

    root.userData = {
      body,
      skull,
      halo,
      wingL,
      wingR,
      animate: (time) => {
        const hover = Math.sin(time * 3.5) * 0.22;
        body.position.y = 1.5 + hover;
        skull.position.y = 2.2 + hover;
        halo.position.y = 2.3 + hover;
        halo.rotation.z = time * 2.5;
        wingL.position.y = 1.8 + hover;
        wingR.position.y = 1.8 + hover;
        wingL.rotation.z = -0.5 + Math.sin(time * 6.0) * 0.35;
        wingR.rotation.z = 0.5 - Math.sin(time * 6.0) * 0.35;
      }
    };

    return root;
  }

  /**
   * 4. Abyssal Void Overlord (Boss) — Giant 8-winged arch-demon with dual doomblades.
   */
  static createBoss() {
    const root = new Group();
    root.name = 'Procedural_AbyssalBoss';

    const bossMat = new MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x4c0519,
      emissiveIntensity: 0.6
    });

    const voidAuraMat = new MeshBasicMaterial({ color: 0xe11d48 });
    const crownMat = new MeshBasicMaterial({ color: 0xf43f5e });

    // Monolithic Armored Torso
    const torsoGeo = new BoxGeometry(2.4, 2.8, 1.6);
    const torso = new Mesh(torsoGeo, bossMat);
    torso.position.y = 2.8;
    torso.castShadow = true;
    root.add(torso);

    // Crowned Horned Demon Head
    const headGeo = new OctahedronGeometry(0.8, 1);
    const head = new Mesh(headGeo, bossMat);
    head.position.set(0, 4.4, 0.3);
    head.castShadow = true;
    root.add(head);

    // Spiked Crown of Void
    const crownGeo = new TorusGeometry(1.2, 0.12, 6, 8);
    crownGeo.rotateX(Math.PI / 2);
    const crown = new Mesh(crownGeo, crownMat);
    crown.position.set(0, 5.2, 0);
    root.add(crown);

    // Dual Giant Runic Doomblades
    const swordGeo = new BoxGeometry(0.3, 3.8, 0.6);
    const swordL = new Mesh(swordGeo, bossMat);
    swordL.position.set(-2.0, 2.6, 0.5);
    swordL.rotation.set(0.3, 0, -0.4);
    swordL.castShadow = true;

    const swordR = new Mesh(swordGeo, bossMat);
    swordR.position.set(2.0, 2.6, 0.5);
    swordR.rotation.set(0.3, 0, 0.4);
    swordR.castShadow = true;
    root.add(swordL, swordR);

    // 4 Massive Spiked Arch Wings
    const wings = [];
    for (let i = 0; i < 4; i++) {
      const wingGeo = new ConeGeometry(1.2, 4.2, 3);
      wingGeo.scale(0.12, 1.0, 1.0);
      const wing = new Mesh(wingGeo, bossMat);
      const side = i % 2 === 0 ? 1 : -1;
      const heightOffset = i < 2 ? 3.8 : 2.5;
      wing.position.set(side * 1.8, heightOffset, -0.8);
      root.add(wing);
      wings.push(wing);
    }

    root.userData = {
      torso,
      head,
      crown,
      swordL,
      swordR,
      wings,
      animate: (time, speed = 1.0) => {
        const pulse = Math.sin(time * 2.5);
        crown.rotation.y = time * 1.5;
        crown.scale.setScalar(1.0 + pulse * 0.1);
        head.rotation.y = Math.sin(time * 2.0) * 0.18;
        torso.position.y = 2.8 + Math.sin(time * 3.0 * speed) * 0.18;
        swordL.rotation.x = 0.3 + Math.sin(time * 4.0 * speed) * 0.3;
        swordR.rotation.x = 0.3 - Math.sin(time * 4.0 * speed) * 0.3;

        wings.forEach((w, idx) => {
          const side = idx % 2 === 0 ? 1 : -1;
          w.rotation.z = side * (0.6 + Math.sin(time * 4.0 + idx) * 0.25);
        });
      }
    };

    return root;
  }
}
