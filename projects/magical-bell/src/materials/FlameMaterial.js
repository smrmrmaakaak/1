import {
  ShaderMaterial,
  Color,
  AdditiveBlending,
  DoubleSide,
  Vector3
} from 'three';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';
import { frame } from '../core/FrameUniforms.js';

/**
 * AAA Photorealistic Flowing Fire & Plasma Bullet Material
 * - Radiant incandescent core (white-yellow)
 * - Fiery corona tongues (orange-red)
 * - Animated noise turbulence
 */
export function createFlameMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: DoubleSide,
    blending: AdditiveBlending,
    uniforms: {
      uTime: frame.uTime,
      uSpeed: { value: 6.0 },
      uColorCore: { value: new Color('#ffffff') },
      uColorMid: { value: new Color('#ffa500') },
      uColorRim: { value: new Color('#ff2200') },
      uIntensity: { value: 2.5 },
      uOpacity: { value: 0.95 }
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSpeed;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;

      ${noiseGLSL}

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Dynamic flame tongue vertex jitter
        float n = snoise(vec3(pos.xy * 4.0, uTime * uSpeed));
        pos += normal * n * 0.12;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uSpeed;
      uniform vec3  uColorCore;
      uniform vec3  uColorMid;
      uniform vec3  uColorRim;
      uniform float uIntensity;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;

      ${noiseGLSL}

      void main() {
        // Turbulent noise pattern
        float noise = snoise(vec3(vWorldPos * 3.0 - vec3(0.0, uTime * uSpeed, 0.0)));
        float flame = clamp(0.5 + 0.5 * noise, 0.0, 1.0);

        // Core to Rim gradient
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float NdotV = max(dot(viewDir, vNormalW), 0.0);
        float core = pow(NdotV, 1.8);

        vec3 col = mix(uColorRim, uColorMid, smoothstep(0.2, 0.7, flame));
        col = mix(col, uColorCore, core);
        col *= uIntensity;

        float alpha = clamp((core * 0.7 + flame * 0.5) * uOpacity, 0.0, 1.0);
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
}
