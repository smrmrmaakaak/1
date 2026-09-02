import {
  Group,
  Mesh,
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Vector3
} from 'three';
import { Ability } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { randRange } from '../utils/math.js';

const _emit = {};

/**
 * [Whitebeard X] 무라쿠모 참격 (薙刀 斬擊 - Murakumo Slash / 패왕색 검기)
 * 최상명검 나기나타를 휘둘러 대기와 지면을 갈라버리는 거대한 패왕색 진동 검기 파동을 방출합니다.
 */
export class MurakumoAbility extends Ability {
  constructor(context) {
    super('stone_rampart', context);
  }

  createShaders() {
    this.targetPos = new Vector3();
    this.bladeGroup = new Group();
    this.bladeGroup.matrixAutoUpdate = true;

    // Conqueror Haki Red-Black & White Edge Material
    this.hakiMat = new MeshStandardMaterial({
      color: 0x450a0a,
      emissive: 0xdc2626,
      emissiveIntensity: 7.0,
      roughness: 0.1
    });

    this.edgeMat = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 9.0
    });

    // Colossal 12m Curved Conqueror's Crescent Wave
    const wave = new Mesh(new BoxGeometry(14.0, 0.4, 2.5), this.hakiMat);
    wave.position.y = 1.0;
    const edge = new Mesh(new BoxGeometry(14.2, 0.5, 0.5), this.edgeMat);
    edge.position.set(0, 1.0, 1.3);

    this.bladeGroup.add(wave, edge);
    setLayerRecursive(this.bladeGroup, LAYER.VFX);
    this.group.add(this.bladeGroup);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.hakiLightning = particles.get('quake.shards', {
      capacity: 4000,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.1
    });
  }

  get impactDuration() {
    return 1.3;
  }

  get fadeDuration() {
    return 0.5;
  }

  spawn(origin, direction, distance) {
    super.spawn(origin, direction, distance);
    this.targetPos.copy(origin).addScaledVector(direction, distance);
    this.bladeGroup.position.copy(origin).addScaledVector(direction, 1.5);
    this.bladeGroup.rotation.y = Math.atan2(direction.x, direction.z);
    this.bladeGroup.scale.set(1.0, 1.0, 1.0);
    this.bladeGroup.visible = true;

    this.hakiMat.emissiveIntensity = 7.0;
    this.edgeMat.emissiveIntensity = 9.0;

    this.ctx.flash.trigger(0.9);
    this.ctx.shake.add(1.3);
    this.ctx.lights.point(this.targetPos.x, 2.5, this.targetPos.z, '#ef4444', 18.0, 36.0, 1.0);
    this.ctx.decals.spawn(this.targetPos.x, this.targetPos.z, 12.0, DecalType.CRACK, 6.0);
    this.ctx.bursts.trigger(this.targetPos, 14.0, BurstMode.AIR, 0.7, '#ef4444');
  }

  update(dt) {
    super.update(dt);
    const p = this.progress;

    // Slicing wave rushes forward
    this.bladeGroup.position.addScaledVector(this.direction, dt * 32.0);
    const scale = 1.0 + p * 2.0;
    this.bladeGroup.scale.set(scale, 1.0, 1.0);

    // Black-red Haki lightning arcs
    for (let i = 0; i < 4; i++) {
      _emit.position = this.bladeGroup.position.clone().add(new Vector3(randRange(-6, 6), randRange(0.2, 2.5), randRange(-1, 1)));
      _emit.velocity = new Vector3(randRange(-4, 4), randRange(2, 8), randRange(-4, 4));
      _emit.size = randRange(0.35, 0.75);
      _emit.lifetime = randRange(0.2, 0.5);
      _emit.color = '#ef4444';
      this.hakiLightning.emit(1, _emit);
    }

    if (p > 0.5) {
      const fade = (1.0 - p) / 0.5;
      this.hakiMat.emissiveIntensity = 7.0 * fade;
      this.edgeMat.emissiveIntensity = 9.0 * fade;
    }
  }

  onDestroy() {
    this.bladeGroup.visible = false;
  }
}
