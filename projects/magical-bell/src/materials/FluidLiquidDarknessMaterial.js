import {
  ShaderMaterial,
  Color,
  NormalBlending,
  DoubleSide,
  Vector3
} from 'three';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';
import { frame } from '../core/FrameUniforms.js';

/**
 * AAA Photorealistic Viscous Liquid Darkness / Fluid Black Hole Material
 * - 44m 초광역 유체 역학적 고점도 칠흑 액체 암흑 바다
 * - 3D 버텍스 파동 & 넘실거리는 심연의 검은 액체 표면
 * - Deep Pitch Black Fluid (#000000, #030008) + Dark Violet Convection Cells (#2e0854, #581c87) + Electric Purple Rim
 */
export function createFluidLiquidDarknessMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -12,
    polygonOffsetUnits: -12,
    side: DoubleSide,
    blending: NormalBlending,
    uniforms: {
      uTime: frame.uTime,
      uFlowSpeed: { value: 1.4 },
      uColorCore: { value: new Color('#000000') },
      uColorAbyss: { value: new Color('#0d011c') },
      uColorViolet: { value: new Color('#581c87') },
      uColorPurple: { value: new Color('#9333ea') },
      uColorElectric: { value: new Color('#c084fc') },
      uOpacity: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uFlowSpeed;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vViewDir;

      ${noiseGLSL}

      void main() {
        vUv = uv;
        vec3 pos = position;

        // 3D Viscous Fluid Waves across 44m surface
        float wave1 = snoise(vec3(pos.xz * 0.35, uTime * uFlowSpeed * 0.5)) * 0.22;
        float wave2 = snoise(vec3(pos.xz * 0.85 + vec3(uTime * 0.3), uTime * uFlowSpeed * 0.9)) * 0.12;

        pos.y += max(0.02, wave1 + wave2 + 0.08);

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uFlowSpeed;
      uniform vec3  uColorCore;
      uniform vec3  uColorAbyss;
      uniform vec3  uColorViolet;
      uniform vec3  uColorPurple;
      uniform vec3  uColorElectric;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vViewDir;

      ${noiseGLSL}

      void main() {
        vec2 centeredUv = vUv * 2.0 - 1.0;
        float dist = length(centeredUv);

        // Organic edge noise
        float edgeNoise = snoise(vec3(centeredUv * 3.2, uTime * 0.4)) * 0.05;
        float boundary = dist + edgeNoise;

        if (boundary > 1.0) discard;

        // Swirling viscous fluid convection noise
        float angle = atan(centeredUv.y, centeredUv.x);
        float swirl = angle + (1.0 - dist) * 3.5;
        vec2 swirlUv = vec2(cos(swirl), sin(swirl)) * dist;

        float fluid1 = snoise(vec3(swirlUv * 2.8, uTime * uFlowSpeed * 0.8));
        float fluid2 = snoise(vec3(swirlUv * 5.5 + vec3(uTime * 0.4), -uTime * uFlowSpeed * 1.1));
        float combinedFluid = fluid1 * 0.6 + fluid2 * 0.4;

        // Fresnel Rim
        float fresnel = 1.0 - max(0.0, dot(vNormalW, vViewDir));
        float rim = pow(fresnel, 2.0);

        // Color Mapping: Pure Black Void -> Deep Abyss -> Dark Violet Waves -> Electric Rim
        vec3 col = uColorCore;
        col = mix(col, uColorAbyss, smoothstep(-0.6, 0.1, combinedFluid));
        col = mix(col, uColorViolet, smoothstep(-0.1, 0.45, combinedFluid + rim * 0.3));
        col = mix(col, uColorPurple, smoothstep(0.25, 0.8, combinedFluid + rim * 0.6));
        col = mix(col, uColorElectric, smoothstep(0.88, 1.0, boundary) * 0.85);

        // Edge alpha feathering
        float edgeAlpha = 1.0 - smoothstep(0.92, 1.0, boundary);
        float alpha = clamp(0.95 + edgeAlpha * 0.05, 0.0, 1.0) * uOpacity;

        gl_FragColor = vec4(col, alpha);
      }
    `
  });
}
