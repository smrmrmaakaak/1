import {
  Group,
  Mesh,
  CylinderGeometry,
  RingGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  Vector3,
  Color,
  AdditiveBlending,
  DoubleSide
} from 'three';
import { Ability, AbilityPhase } from './Ability.js';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { BurstMode } from '../effects/BurstSphere.js';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { settings } from '../config/settings.js';
import { randRange, saturate, Easing } from '../utils/math.js';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';

const _pos = new Vector3();
const _emit = {};

/**
 * [Ace C/R] 불기둥 (火柱 / Enjotei - Fire Pillar)
 * 지면에 거대한 3D 화염 마법진과 함께 하늘 높이 솟구치는 나선 회전 거대 불기둥!
 */
export class FirePillarAbility extends Ability {
  constructor(context) {
    super('fire_pillar', context);
  }

  createShaders() {
    this.pillarGroup = new Group();
    this.group.add(this.pillarGroup);

    // 1. Core Flame Cylinder
    const pillarGeo = new CylinderGeometry(3.6, 2.8, 30.0, 32, 16, true);
    pillarGeo.translate(0, 15.0, 0);

    const pillarMat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uColorCore: { value: new Color(0xfff5ea) },
        uColorMid: { value: new Color(0xf97316) },
        uColorOuter: { value: new Color(0xdc2626) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        uniform float uTime;
        uniform float uProgress;
        ${noiseGLSL}

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;

          // Swirling fire vortex expansion
          float swirlAngle = pos.y * 0.15 - uTime * 6.0;
          float cosA = cos(swirlAngle);
          float sinA = sin(swirlAngle);
          vec2 rotXZ = vec2(pos.x * cosA - pos.z * sinA, pos.x * sinA + pos.z * cosA);
          pos.x = rotXZ.x;
          pos.z = rotXZ.y;

          // Turbulence noise displacement
          float disp = snoise01(pos * 0.2 + vec3(0.0, -uTime * 3.0, 0.0)) * 1.4;
          pos += normal * disp;

          // Height eruption scale with progress
          pos.y *= clamp(uProgress * 1.35, 0.01, 1.0);

          vec4 wp = modelMatrix * vec4(pos, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        uniform float uTime;
        uniform float uProgress;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform vec3 uColorOuter;
        ${noiseGLSL}

        void main() {
          // Upward scrolling fire sheets
          vec2 uvScroll = vec2(vUv.x * 3.0, vUv.y * 1.5 - uTime * 4.5);
          float nFire = fbm3(vec3(uvScroll, uTime * 0.8));

          // Vertical taper
          float yFade = sin(vUv.y * 3.14159);
          float alpha = smoothstep(0.15, 0.65, nFire) * yFade * (1.0 - smoothstep(0.7, 1.0, uProgress));

          // Color gradient from incandescent white to deep inferno crimson
          vec3 col = mix(uColorOuter, uColorMid, smoothstep(0.2, 0.6, nFire));
          col = mix(col, uColorCore, smoothstep(0.65, 0.95, nFire));

          // Emissive rim glow
          float rim = 1.0 - max(0.0, dot(normalize(-vWorldPos), vNormal));
          col += uColorMid * pow(rim, 2.0) * 1.5;

          gl_FragColor = vec4(col * 2.8, alpha * 0.95);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide
    });

    this.pillarMesh = new Mesh(pillarGeo, pillarMat);
    this.pillarGroup.add(this.pillarMesh);

    // 2. Ground Fire Sigil Circle
    const groundGeo = new RingGeometry(0.2, 5.5, 32);
    groundGeo.rotateX(-Math.PI * 0.5);
    const groundMat = new MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      side: DoubleSide,
      depthWrite: false
    });
    this.groundRing = new Mesh(groundGeo, groundMat);
    this.groundRing.position.y = 0.05;
    this.pillarGroup.add(this.groundRing);

    setLayerRecursive(this.pillarGroup, LAYER.VFX);
  }

  createParticles() {
    const particles = this.ctx.particles;
    this.sparks = particles?.get('fire.sparks', {
      capacity: 3500,
      shape: ParticleShape.SPARK,
      additive: true,
      softFade: 0.15
    });
  }

  onSpawn() {
    this.pillarGroup.visible = true;
    const impactPoint = _pos.copy(this.origin).addScaledVector(this.direction, this.length * 0.5);
    this.pillarGroup.position.copy(impactPoint);

    this.ctx.lights?.acquire(this, {
      color: '#ff6600',
      intensity: 5.0,
      radius: 16.0
    });

    this.ctx.shake?.add(0.85);
    this.ctx.flash?.trigger(0.7);

    // Spawn scorch ground decal
    this.ctx.decals?.spawn(
      DecalType.SCORCH,
      impactPoint.x,
      impactPoint.z,
      6.0,
      randRange(0, Math.PI * 2)
    );

    // Initial shockwave burst
    this.ctx.bursts?.trigger(impactPoint, 6.5, BurstMode.SHOCKWAVE);
  }

  onTravel(dt) {
    const p = this.progress;
    const mat = this.pillarMesh.material;
    mat.uniforms.uTime.value = this.age;
    mat.uniforms.uProgress.value = p;

    // Ground ring expansion and rotation
    this.groundRing.material.opacity = Math.sin(p * Math.PI) * 0.9;
    this.groundRing.rotation.y += dt * 3.5;
    const scale = 0.8 + p * 0.5;
    this.groundRing.scale.set(scale, scale, scale);

    // Emit violently spiraling fire ember sparks
    if (this.sparks) {
      for (let i = 0; i < 4; i++) {
        const angle = randRange(0, Math.PI * 2);
        const rad = randRange(0.5, 3.8);
        const spawnPos = _pos.set(
          this.pillarGroup.position.x + Math.cos(angle) * rad,
          randRange(0.2, 12.0 * p),
          this.pillarGroup.position.z + Math.sin(angle) * rad
        );

        _emit.position = spawnPos;
        _emit.velocity = new Vector3(
          Math.cos(angle + 1.2) * randRange(2.0, 5.0),
          randRange(14.0, 26.0),
          Math.sin(angle + 1.2) * randRange(2.0, 5.0)
        );
        _emit.size = randRange(0.25, 0.75);
        _emit.lifetime = randRange(0.6, 1.2);
        _emit.color = '#ff4500';
        this.sparks.emit(1, _emit);
      }
    }
  }

  onImpact() {
    this.ctx.shake?.add(0.9);
    this.ctx.flash?.trigger(0.8);
  }

  onFade(dt) {
    const mat = this.pillarMesh.material;
    mat.uniforms.uTime.value = this.age;
    mat.uniforms.uProgress.value = 0.8 + (this.fadeTime / this.fadeDuration) * 0.2;
    this.groundRing.material.opacity = Math.max(0, 1.0 - this.fadeTime / this.fadeDuration);
  }

  onDestroy() {
    this.pillarGroup.visible = false;
  }
}
