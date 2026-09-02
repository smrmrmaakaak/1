import {
  Group,
  Mesh,
  PlaneGeometry,
  CylinderGeometry,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { createLiquidLavaMaterial } from '../materials/LiquidLavaMaterial.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { saturate, randRange, lerp } from '../utils/math.js';

const _pos = new Vector3();
const _emit = {};

/**
 * [Akainu Q] 6-Second Viscous Magma Lake & Geyser Eruption
 * - 시각적 원형 크기와 몬스터 피격 판정 범위가 100% 정확하게 일치하는 완벽한 원형 용암 호수
 */
export class FireBlastAbility extends Ability {
  constructor(context) {
    super('fire_blast', context);
    this.targetPos = new Vector3();
    this.currentRadius = 2.5;
    this.maxRadius = 8.5;
    this.group.matrixAutoUpdate = true;
  }

  createShaders() {
    this.liquidMaterial = createLiquidLavaMaterial();

    // 1. Initial Explosive Vertical Geyser Column (0.1s ~ 0.7s)
    this.geyserGroup = new Group();
    this.geyserGroup.matrixAutoUpdate = true;
    this.geyserGroup.visible = false;

    const geyserGeo = new CylinderGeometry(0.6, 2.2, 11.5, 24, 12, true);
    geyserGeo.translate(0, 5.75, 0);
    this.geyserMesh = new Mesh(geyserGeo, this.liquidMaterial);
    this.geyserMesh.layers.set(LAYER.VFX);
    this.geyserMesh.renderOrder = 1000;
    this.geyserGroup.add(this.geyserMesh);

    this.group.add(this.geyserGroup);

    // 2. High-precision Circular Ground Lava Plane (Radius = 1.0 unit in plane, scaled by currentRadius)
    this.poolGroup = new Group();
    this.poolGroup.matrixAutoUpdate = true;
    this.poolGroup.visible = false;

    const poolGeo = new PlaneGeometry(2.0, 2.0, 48, 48);
    poolGeo.rotateX(-Math.PI / 2);
    this.poolMesh = new Mesh(poolGeo, this.liquidMaterial);
    this.poolMesh.layers.set(LAYER.VFX);
    this.poolMesh.renderOrder = 999;
    this.poolMesh.position.y = 0.05;
    this.poolGroup.add(this.poolMesh);

    this.group.add(this.poolGroup);
    setLayerRecursive(this.group, LAYER.VFX);
  }

  createParticles() {
    const particles = this.ctx.particles;

    this.embers = particles.get('fire.sparks', {
      capacity: 4000,
      shape: ParticleShape.SPARK,
      additive: true,
      curl: true,
      softFade: 0.2
    });

    this.smoke = particles.get('fire.smoke', {
      capacity: 3000,
      shape: ParticleShape.SMOKE,
      additive: false,
      curl: true,
      softFade: 0.8
    });
  }

  get impactDuration() {
    return 6.0; // 6 seconds
  }

  get fadeDuration() {
    return 1.2; // Smooth fade
  }

  onSpawn() {
    this.pointAt(1.0, this.targetPos);
    this.group.position.set(0, 0, 0);

    this.hasSpurted = false;
    this.spurtTime = 0.08;
    this.currentRadius = 2.5;

    if (this.poolGroup) {
      this.poolGroup.visible = true;
      this.poolGroup.position.copy(this.targetPos).setY(0);
      this.poolGroup.scale.set(this.currentRadius, 1.0, this.currentRadius);
    }

    if (this.geyserGroup) {
      this.geyserGroup.visible = true;
      this.geyserGroup.position.copy(this.targetPos).setY(0);
      this.geyserGroup.scale.set(1.0, 0.05, 1.0);
    }

    if (this.liquidMaterial?.uniforms?.uOpacity) {
      this.liquidMaterial.uniforms.uOpacity.value = 1.0;
    }

    if (this.embers) {
      for (let i = 0; i < 20; i++) {
        _emit.position = _pos.copy(this.targetPos).add(new Vector3(randRange(-1.5, 1.5), 0.5, randRange(-1.5, 1.5)));
        _emit.velocity = new Vector3(randRange(-2, 2), randRange(2.5, 6), randRange(-2, 2));
        _emit.color = getColor('#ff6600');
        _emit.size = randRange(0.25, 0.5);
        _emit.life = randRange(0.4, 0.7);
        this.embers.emit(1, _emit);
      }
    }

    this.ctx.shake?.rumble(0.5, 0.25);
  }

  onTravel(dt) {
    this._tickLavaField(dt);
  }

  onImpact() {}

  onFade(dt, t) {
    this._tickLavaField(dt);

    const fade = 1.0 - saturate(t > 1 ? t - 1 : 0);
    if (this.liquidMaterial?.uniforms?.uOpacity) {
      this.liquidMaterial.uniforms.uOpacity.value = fade;
    }

    if (this.poolGroup) {
      this.poolGroup.scale.set(this.currentRadius * fade, fade, this.currentRadius * fade);
    }
  }

  _tickLavaField(dt) {
    // 1. Initial Eruption Geyser Blast
    if (this.age >= this.spurtTime && !this.hasSpurted) {
      this.hasSpurted = true;
      this._triggerGeyserBlast();
    }

    // 2. Geyser animation
    if (this.hasSpurted && this.geyserGroup && this.geyserGroup.visible) {
      const surgeTime = this.age - this.spurtTime;
      if (surgeTime <= 0.65) {
        const p = surgeTime / 0.65;
        const heightEase = p < 0.35 ? p / 0.35 : 1.0 - (p - 0.35) / 0.65;
        this.geyserGroup.scale.set(1.0 + heightEase * 0.4, heightEase * 1.2, 1.0 + heightEase * 0.4);
        this.geyserGroup.rotation.y = this.age * 3.0;
      } else {
        this.geyserGroup.visible = false;
      }
    }

    // 3. Smooth outward viscous spreading (2.5m -> 8.5m across 3.5s)
    const spreadProgress = saturate(this.age / 3.5);
    const ease = Math.pow(spreadProgress, 0.7);
    this.currentRadius = lerp(2.5, this.maxRadius, ease);

    if (this.poolGroup && this.poolGroup.visible) {
      this.poolGroup.scale.set(this.currentRadius, 1.0, this.currentRadius);
    }

    // 4. Bubbling sparks and smoke across the pool
    if (this.hasSpurted) {
      if (this.embers && Math.random() < 0.8) {
        const randAngle = Math.random() * Math.PI * 2;
        const randDist = Math.random() * (this.currentRadius * 0.85);
        _emit.position = _pos.copy(this.targetPos).add(new Vector3(
          Math.cos(randAngle) * randDist,
          0.4,
          Math.sin(randAngle) * randDist
        ));
        _emit.velocity = new Vector3(
          Math.cos(randAngle) * randRange(0.2, 1.2),
          randRange(2.0, 5.5),
          Math.sin(randAngle) * randRange(0.2, 1.2)
        );
        _emit.color = Math.random() < 0.6 ? '#ff4500' : '#ff9900';
        _emit.size = randRange(0.25, 0.5);
        _emit.life = randRange(0.4, 0.8);
        this.embers.emit(1, _emit);
      }

      if (this.smoke && Math.random() < 0.35) {
        const randAngle = Math.random() * Math.PI * 2;
        const randDist = Math.random() * (this.currentRadius * 0.8);
        _emit.position = _pos.copy(this.targetPos).add(new Vector3(
          Math.cos(randAngle) * randDist,
          0.6,
          Math.sin(randAngle) * randDist
        ));
        _emit.velocity = new Vector3(
          randRange(-0.3, 0.3),
          randRange(1.2, 3.0),
          randRange(-0.3, 0.3)
        );
        _emit.size = randRange(1.5, 3.2);
        _emit.life = randRange(0.9, 1.6);
        _emit.color = '#1f0905';
        this.smoke.emit(1, _emit);
      }
    }
  }

  _triggerGeyserBlast() {
    this.ctx.shake?.rumble(0.8, 0.4);
    this.ctx.flash?.trigger(0.8);

    this.ctx.lights?.point?.(this.targetPos.x, 3.5, this.targetPos.z, '#ff4400', 22.0, 40.0, 1.3);
    this.ctx.bursts?.trigger?.(this.targetPos, 6.0, BurstMode.FIRE, 0.6, '#ff3700');

    if (this.embers) {
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 1.5;
        _emit.position = _pos.copy(this.targetPos).add(new Vector3(Math.cos(angle) * r, 0.4, Math.sin(angle) * r));
        _emit.velocity = new Vector3(
          Math.cos(angle) * randRange(2.0, 6.0),
          randRange(12, 22),
          Math.sin(angle) * randRange(2.0, 6.0)
        );
        _emit.color = getColor('#fff9c4');
        _emit.size = randRange(0.3, 0.7);
        _emit.life = randRange(0.5, 1.0);
        this.embers.emit(1, _emit);
      }
    }

    if (this.smoke) {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 2.0;
        _emit.position = _pos.copy(this.targetPos).add(new Vector3(Math.cos(angle) * r, 0.8, Math.sin(angle) * r));
        _emit.velocity = new Vector3(
          Math.cos(angle) * randRange(1, 3),
          randRange(4, 8),
          Math.sin(angle) * randRange(1, 3)
        );
        _emit.size = randRange(2.0, 4.5);
        _emit.life = randRange(1.0, 1.8);
        _emit.color = '#140301';
        this.smoke.emit(1, _emit);
      }
    }
  }

  onDestroy() {
    this.geyserGroup.visible = false;
    this.poolGroup.visible = false;
  }
}
