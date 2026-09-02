import {
  Group,
  Mesh,
  OctahedronGeometry,
  DodecahedronGeometry,
  RingGeometry,
  TorusGeometry,
  Vector3,
  Quaternion
} from 'three';
import { Ability } from './Ability.js';
import { createAvalancheMaterial } from '../materials/AvalancheMaterial.js';
import { createGlacialRuneMaterial } from '../materials/GlacialRuneMaterial.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, randRange } from '../utils/math.js';

const _pos = new Vector3();
const _emit = {};

/**
 * [Arthur Ultimate] Absolute Zero: Avalanche (Slot 8 / T).
 * 3-Stage Colossal Ancient Glacial Comets plunging from the sky, freezing the whole zone and triggering a catastrophic Shatter Chain.
 */
export class AvalancheAbility extends Ability {
  constructor(context) {
    super('avalanche', context);
    this.targetPos = new Vector3();
    this.group.matrixAutoUpdate = true;
  }

  createShaders() {
    this.material = createAvalancheMaterial(this.ctx.environment);
    this.runeMaterial = createGlacialRuneMaterial();

    // Ground Runic Matrix Rings
    this.runeGroup = new Group();
    this.runeGroup.matrixAutoUpdate = true;
    this.runeGroup.visible = false;

    const ring1Geo = new RingGeometry(0.9, 1.0, 32);
    ring1Geo.rotateX(-Math.PI / 2);
    const ring1 = new Mesh(ring1Geo, this.runeMaterial);
    ring1.layers.set(LAYER.VFX);
    ring1.renderOrder = 8;
    this.runeGroup.add(ring1);

    const ring2Geo = new RingGeometry(0.55, 0.62, 24);
    ring2Geo.rotateX(-Math.PI / 2);
    const ring2 = new Mesh(ring2Geo, this.runeMaterial);
    ring2.layers.set(LAYER.VFX);
    ring2.renderOrder = 8;
    this.runeGroup.add(ring2);

    const ring3Geo = new RingGeometry(0.2, 0.25, 16);
    ring3Geo.rotateX(-Math.PI / 2);
    const ring3 = new Mesh(ring3Geo, this.runeMaterial);
    ring3.layers.set(LAYER.VFX);
    ring3.renderOrder = 8;
    this.runeGroup.add(ring3);

    this.group.add(this.runeGroup);

    // Sky Summoning Halo
    const haloGeo = new TorusGeometry(1, 0.08, 12, 48);
    haloGeo.rotateX(Math.PI / 2);
    this.skyHalo = new Mesh(haloGeo, this.runeMaterial);
    this.skyHalo.layers.set(LAYER.VFX);
    this.skyHalo.renderOrder = 9;
    this.skyHalo.visible = false;
    this.group.add(this.skyHalo);

    // 3 Glacial Comets
    this.comets = [];
    const cometScales = [1.8, 2.6, 4.2]; // 1st, 2nd, 3rd Colossal Glacier
    for (let i = 0; i < 3; i++) {
      const cometGroup = new Group();
      cometGroup.matrixAutoUpdate = true;

      const coreGeo = new OctahedronGeometry(cometScales[i], 1);
      coreGeo.scale(1.0, 1.6, 1.0);
      const coreMesh = new Mesh(coreGeo, this.material);
      coreMesh.layers.set(LAYER.VFX);
      coreMesh.renderOrder = 10;
      cometGroup.add(coreMesh);

      // Orbiting Ice Crystals around comet
      for (let j = 0; j < 4; j++) {
        const crystalGeo = new DodecahedronGeometry(cometScales[i] * 0.22, 0);
        const crystalMesh = new Mesh(crystalGeo, this.material);
        crystalMesh.layers.set(LAYER.VFX);
        crystalMesh.renderOrder = 10;
        crystalMesh.position.set(
          Math.cos((j * Math.PI * 2) / 4) * (cometScales[i] * 1.3),
          randRange(-1, 1),
          Math.sin((j * Math.PI * 2) / 4) * (cometScales[i] * 1.3)
        );
        cometGroup.add(crystalMesh);
      }

      cometGroup.visible = false;
      this.group.add(cometGroup);
      this.comets.push({
        group: cometGroup,
        impactTime: 0.55 + i * 0.65, // 0.55s, 1.20s, 1.85s
        hasImpacted: false,
        scale: cometScales[i],
        offset: new Vector3(randRange(-2, 2), 0, randRange(-2, 2))
      });
    }
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.glitter = particles.get('avalanche.glitter', {
      capacity: 3500,
      additive: true,
      curl: true,
      softFade: 0.4
    });
  }

  get impactDuration() {
    return 3.0;
  }

  get fadeDuration() {
    return 2.5;
  }

  onSpawn() {
    const radius = settings.avalanche?.zoneRadius || 10.0;
    this.pointAt(1.0, this.targetPos);
    this.group.position.set(0, 0, 0);

    // Activate Ground Rune
    if (this.runeGroup) {
      this.runeGroup.visible = true;
      this.runeGroup.scale.set(radius * 1.2, 1, radius * 1.2);
      this.runeGroup.position.copy(this.targetPos).setY(0.05);
    }

    // Activate Sky Halo
    if (this.skyHalo) {
      this.skyHalo.visible = true;
      this.skyHalo.scale.set(radius * 1.2, 1, radius * 1.2);
      this.skyHalo.position.copy(this.targetPos).setY(28.0);
    }

    // Reset Comets
    this.comets.forEach((c) => {
      c.group.visible = true;
      c.hasImpacted = false;
      c.group.position.copy(this.targetPos).add(c.offset).setY(32.0);
    });

    if (this.runeMaterial) this.runeMaterial.opacity = 0.85;
    if (this.material) this.material.opacity = 0.92;

    this.ctx.shake.rumble(0.6, 2.5);
  }

  onTravel(dt) {
    this._tickComets(dt);
  }

  onImpact() {
    // Keep ticking comets in impact phase
  }

  onFade(dt, t) {
    this._tickComets(dt);

    const fade = 1.0 - saturate(t > 1 ? t - 1 : 0);
    if (this.runeMaterial) this.runeMaterial.opacity = fade * 0.85;
    if (this.material) this.material.opacity = fade * 0.92;
  }

  _tickComets(dt) {
    // Animate Sky Halo & Ground Rings rotation
    if (this.skyHalo && this.skyHalo.visible) {
      this.skyHalo.rotation.y = this.age * 1.2;
    }
    if (this.runeGroup && this.runeGroup.visible) {
      this.runeGroup.rotation.y = -this.age * 0.5;
    }

    // Process Comet Plunges
    for (let i = 0; i < this.comets.length; i++) {
      const comet = this.comets[i];
      if (comet.hasImpacted) continue;

      const progress = saturate(this.age / comet.impactTime);
      const startY = 32.0;
      const curY = (1.0 - progress * progress) * startY;

      comet.group.position.copy(this.targetPos).add(comet.offset).setY(Math.max(0.5, curY));
      comet.group.rotation.x = this.age * 5.0 + i;
      comet.group.rotation.y = this.age * 6.0 + i;

      // Spawn falling ice spark trail
      if (this.glitter && Math.random() < 0.8) {
        _emit.position = comet.group.position;
        _emit.velocity = new Vector3(randRange(-2, 2), randRange(-4, 0), randRange(-2, 2));
        _emit.color = getColor('#7dd3fc');
        _emit.size = randRange(0.25, 0.6);
        _emit.life = randRange(0.4, 0.8);
        this.glitter.emit(1, _emit);
      }

      // Trigger Impact
      if (this.age >= comet.impactTime && !comet.hasImpacted) {
        comet.hasImpacted = true;
        comet.group.visible = false;
        this._triggerCometImpact(i, comet);
      }
    }
  }

  _triggerCometImpact(index, comet) {
    const g = settings.global;
    const impactPos = _pos.copy(this.targetPos).add(comet.offset).setY(0.4);
    const isFinalStage = index === 2;

    // Burst Sphere
    this.ctx.bursts.spawn(BurstMode.FROST, impactPos, {
      radius: comet.scale * 1.5,
      endRadius: comet.scale * (isFinalStage ? 7.5 : 4.5) * g.explosionIntensity,
      life: isFinalStage ? 1.4 : 0.8,
      intensity: isFinalStage ? 4.5 : 2.5,
      opacity: 0.9,
      colorA: getColor('#ffffff'),
      colorB: getColor('#38bdf8'),
      colorC: getColor('#0284c7')
    });

    // Decal Shockwave
    this.ctx.decals.spawn(DecalType.SHOCKWAVE, impactPos, {
      radius: comet.scale * (isFinalStage ? 8.0 : 4.0) * g.explosionIntensity,
      life: 0.9,
      width: 0.08,
      intensity: isFinalStage ? 1.8 : 1.0,
      colorA: getColor('#ffffff'),
      colorB: getColor('#00f0ff')
    });

    // Frost ground rime
    this.ctx.decals.spawn(DecalType.FROST, impactPos, {
      radius: comet.scale * (isFinalStage ? 7.0 : 3.5),
      life: 8.0,
      width: 1.5,
      intensity: 1.0,
      colorA: getColor('#e0f2fe'),
      colorB: getColor('#38bdf8')
    });

    // Spawn massive shatter sparkles
    if (this.glitter) {
      const sparkCount = isFinalStage ? 80 : 35;
      for (let s = 0; s < sparkCount; s++) {
        _emit.position = impactPos;
        _emit.velocity = new Vector3(randRange(-12, 12), randRange(4, 18), randRange(-12, 12));
        _emit.color = getColor(Math.random() < 0.5 ? '#ffffff' : '#38bdf8');
        _emit.size = randRange(0.3, 0.8);
        _emit.life = randRange(0.8, 1.6);
        this.glitter.emit(1, _emit);
      }
    }

    // Camera Shake & Screen Flash
    this.ctx.shake.add(
      (isFinalStage ? 0.8 : 0.35) * g.cameraShake,
      1 / (isFinalStage ? 1.0 : 0.45),
      25
    );
    this.ctx.flash.trigger(getColor('#cffafe'), isFinalStage ? 0.75 : 0.4);
  }

  onDestroy() {
    if (this.runeGroup) this.runeGroup.visible = false;
    if (this.skyHalo) this.skyHalo.visible = false;
    this.comets.forEach((c) => (c.group.visible = false));
  }

  dispose() {
    this.runeMaterial?.dispose();
    this.material?.dispose();
    super.dispose();
  }
}
