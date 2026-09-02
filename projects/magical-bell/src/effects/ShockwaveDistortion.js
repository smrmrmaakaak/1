import {
  Group,
  Mesh,
  RingGeometry,
  CylinderGeometry,
  ShaderMaterial,
  DoubleSide,
  Vector3,
  Color
} from 'three';
import { LAYER } from '../core/Layers.js';
import { frame } from '../core/FrameUniforms.js';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';

const SHOCKWAVE_COUNT = 16;
const HEAT_HAZE_COUNT = 30;

/**
 * Screen-Space Normal Refraction Shockwave Material
 * Writes RG=normal offset around 0.5, B=strength, A=alpha mask to LAYER.DISTORTION
 */
function createShockwaveDistortionMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: DoubleSide,
    uniforms: {
      uProgress: { value: 0.0 },
      uStrength: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalW;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform float uStrength;
      varying vec2 vUv;
      varying vec3 vNormalW;

      void main() {
        vec2 centered = vUv * 2.0 - 1.0;
        float dist = length(centered);
        if (dist > 1.0 || dist < 0.2) discard;

        // Wave profile: sharp leading edge, smooth trailing falloff
        float wavePos = uProgress;
        float waveWidth = 0.35;
        float wave = smoothstep(wavePos - waveWidth, wavePos, dist) * (1.0 - smoothstep(wavePos, wavePos + 0.05, dist));

        // Refraction normal direction pointing outwards
        vec2 dir = normalize(centered + 0.001);
        vec2 normalOffset = dir * wave * 0.5 + 0.5;

        float alpha = wave * (1.0 - uProgress) * uStrength;
        gl_FragColor = vec4(normalOffset, 1.0, alpha);
      }
    `
  });
}

/**
 * Real-time Boiling Heat Haze Distortion Material
 */
function createHeatHazeMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: DoubleSide,
    uniforms: {
      uTime: frame.uTime,
      uIntensity: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      ${noiseGLSL}

      void main() {
        // Vertical heat shimmer turbulence
        vec2 uv = vUv;
        float n1 = snoise(vec3(vWorldPos.xz * 3.0, uTime * 2.5));
        float n2 = snoise(vec3(vWorldPos.xz * 6.0 + vec2(n1 * 0.5), uTime * 3.5));

        vec2 offset = vec2(n1, n2) * 0.5 + 0.5;

        // Fade out at top of column
        float verticalFade = (1.0 - uv.y) * smoothstep(0.0, 0.2, uv.y);
        float edgeFade = 1.0 - smoothstep(0.7, 1.0, length(uv * 2.0 - 1.0));

        float alpha = verticalFade * edgeFade * uIntensity * 0.85;
        if (alpha < 0.01) discard;

        gl_FragColor = vec4(offset, 0.8, alpha);
      }
    `
  });
}

export class ShockwaveDistortionManager {
  constructor(scene) {
    this.scene = scene;
    this.root = new Group();
    this.root.name = 'ShockwaveDistortion';
    this.scene.add(this.root);

    // Shockwave Pool
    this.shockwaves = [];
    const ringGeo = new RingGeometry(0.1, 1.0, 32);
    ringGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < SHOCKWAVE_COUNT; i++) {
      const mat = createShockwaveDistortionMaterial();
      const mesh = new Mesh(ringGeo, mat);
      mesh.layers.set(LAYER.DISTORTION);
      mesh.visible = false;
      this.root.add(mesh);

      this.shockwaves.push({
        mesh,
        material: mat,
        active: false,
        time: 0,
        duration: 0.6,
        maxRadius: 8.0,
        strength: 1.0
      });
    }

    // Heat Haze Pool (Cylinders over lava pools)
    this.heatHazes = [];
    const cylGeo = new CylinderGeometry(1.0, 1.2, 2.5, 16, 1, true);
    this.heatHazeMat = createHeatHazeMaterial();

    for (let i = 0; i < HEAT_HAZE_COUNT; i++) {
      const mesh = new Mesh(cylGeo, this.heatHazeMat);
      mesh.layers.set(LAYER.DISTORTION);
      mesh.visible = false;
      this.root.add(mesh);

      this.heatHazes.push({
        mesh,
        active: false,
        time: 0,
        duration: 10.0,
        scale: 1.0
      });
    }
  }

  spawnShockwave(position, maxRadius = 8.0, duration = 0.55, strength = 1.0) {
    const sw = this.shockwaves.find(s => !s.active) || this.shockwaves[0];
    sw.active = true;
    sw.time = 0;
    sw.duration = duration;
    sw.maxRadius = maxRadius;
    sw.strength = strength;
    sw.mesh.position.copy(position);
    sw.mesh.position.y += 0.25;
    sw.mesh.scale.set(0.1, 0.1, 0.1);
    sw.mesh.visible = true;
    sw.material.uniforms.uProgress.value = 0.0;
    sw.material.uniforms.uStrength.value = strength;
  }

  spawnHeatHaze(position, radius = 2.5, duration = 10.0) {
    const hh = this.heatHazes.find(h => !h.active) || this.heatHazes[0];
    hh.active = true;
    hh.time = 0;
    hh.duration = duration;
    hh.scale = radius;
    hh.mesh.position.copy(position);
    hh.mesh.position.y += 1.25;
    hh.mesh.scale.set(radius, 1.0, radius);
    hh.mesh.visible = true;
  }

  update(dt) {
    // 1. Update expanding shockwaves
    for (const sw of this.shockwaves) {
      if (!sw.active) continue;
      sw.time += dt;
      const progress = sw.time / sw.duration;

      if (progress >= 1.0) {
        sw.active = false;
        sw.mesh.visible = false;
      } else {
        const ease = 1.0 - Math.pow(1.0 - progress, 3.0);
        const curRadius = sw.maxRadius * ease;
        sw.mesh.scale.set(curRadius, 1.0, curRadius);
        sw.material.uniforms.uProgress.value = progress;
        sw.material.uniforms.uStrength.value = sw.strength * (1.0 - progress);
      }
    }

    // 2. Update heat hazes
    for (const hh of this.heatHazes) {
      if (!hh.active) continue;
      hh.time += dt;
      if (hh.time >= hh.duration) {
        hh.active = false;
        hh.mesh.visible = false;
      }
    }
  }

  clear() {
    this.shockwaves.forEach(s => { s.active = false; s.mesh.visible = false; });
    this.heatHazes.forEach(h => { h.active = false; h.mesh.visible = false; });
  }
}
