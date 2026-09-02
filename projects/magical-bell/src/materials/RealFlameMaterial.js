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
 * AAA Photorealistic High-Definition Blazing Flame Shader
 * - Multi-octave 3D upward turbulent flame convection
 * - Dynamic licking flame tongues vertex displacement
 * - 4-stage radiant heat ramp: White Core -> Golden Plasma -> Fiery Solar Orange -> Blazing Crimson
 * - Full additive illumination & depth testing
 */
export function createRealFlameMaterial(options = {}) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: DoubleSide,
    blending: AdditiveBlending,
    uniforms: {
      uTime: frame.uTime,
      uSpeed: { value: options.speed ?? 5.5 },
      uColorCore: { value: new Color('#ffffff') },
      uColorGold: { value: new Color('#ffdd33') },
      uColorOrange: { value: new Color('#ff6600') },
      uColorCrimson: { value: new Color('#ee1100') },
      uIntensity: { value: options.intensity ?? 3.2 },
      uOpacity: { value: options.opacity ?? 0.95 }
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

        // Dynamic 3D flame tongue ripples
        float n = snoise(vec3(pos.xy * 3.5, uTime * uSpeed * 0.8));
        pos += normal * (n * 0.15);
        pos.y += max(0.0, n * 0.2);

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
      uniform vec3  uColorGold;
      uniform vec3  uColorOrange;
      uniform vec3  uColorCrimson;
      uniform float uIntensity;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;

      ${noiseGLSL}

      void main() {
        // Multi-layered rising turbulent flame vortices
        float f1 = snoise(vec3(vWorldPos * 2.2 - vec3(0.0, uTime * uSpeed, 0.0)));
        float f2 = snoise(vec3(vWorldPos * 4.5 + vec3(1.2, -uTime * uSpeed * 1.4, 3.4)));
        float flame = clamp(0.5 + 0.35 * f1 + 0.15 * f2, 0.0, 1.0);

        // Core incandescent brightness
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float NdotV = max(dot(viewDir, vNormalW), 0.0);
        float core = pow(NdotV, 1.5);

        // Radiant Blackbody Flame Ramp
        vec3 col = mix(uColorCrimson, uColorOrange, smoothstep(0.2, 0.55, flame));
        col = mix(col, uColorGold, smoothstep(0.55, 0.85, flame));
        col = mix(col, uColorCore, core * 0.85 + smoothstep(0.85, 1.0, flame) * 0.5);

        col *= uIntensity;

        float alpha = clamp((core * 0.6 + flame * 0.6) * uOpacity, 0.0, 1.0);
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
}
