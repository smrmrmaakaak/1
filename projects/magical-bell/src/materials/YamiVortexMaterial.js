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
 * AAA One Piece Canon [Yami Yami no Mi] Liquid Darkness & Black Smoke Flame Shader Material
 * - 칠흑의 액체성 암흑 아지랑이 & 피어오르는 흑염(黑焰) 볼류메트릭 셰이더
 * - Deep Pitch-Black Core (#000000, #05000a) with Electric Dark Violet Rim (#7e22ce, #9333ea, #c084fc)
 * - Swirling helical fractal vorticity & turbulent gravitational noise
 */
export function createYamiVortexMaterial(options = {}) {
  const isBeam = options.isBeam || false;

  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: DoubleSide,
    blending: NormalBlending,
    uniforms: {
      uTime: frame.uTime,
      uSwirlSpeed: { value: options.swirlSpeed || 3.5 },
      uFlowSpeed: { value: options.flowSpeed || 4.2 },
      uColorCore: { value: new Color('#020005') },
      uColorDeep: { value: new Color('#1e0836') },
      uColorViolet: { value: new Color('#7e22ce') },
      uColorPurple: { value: new Color('#a855f7') },
      uColorElectric: { value: new Color('#e9d5ff') },
      uOpacity: { value: options.opacity || 1.0 },
      uExpansion: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSwirlSpeed;
      uniform float uFlowSpeed;
      uniform float uExpansion;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vViewDir;

      ${noiseGLSL}

      void main() {
        vUv = uv;
        vec3 pos = position;

        // 3D Billowing Boiling Dark Flame Displacement
        float turbulentNoise = snoise(vec3(pos.xyz * 1.8 + vec3(0.0, -uTime * uFlowSpeed * 0.8, uTime * 0.4)));
        float swirlNoise = snoise(vec3(pos.xz * 2.5, uTime * uSwirlSpeed * 0.6));
        
        pos += normal * (turbulentNoise * 0.22 + swirlNoise * 0.15) * uExpansion;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uSwirlSpeed;
      uniform float uFlowSpeed;
      uniform vec3  uColorCore;
      uniform vec3  uColorDeep;
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
        // High-density fractal vorticity noise
        vec3 noiseCoord = vec3(vWorldPos * 1.4 + vec3(0.0, -uTime * uFlowSpeed, 0.0));
        float fbm1 = snoise(noiseCoord);
        float fbm2 = snoise(noiseCoord * 2.2 + vec3(uTime * 0.8, -uTime * 1.2, 0.0));
        float combinedNoise = (fbm1 * 0.6 + fbm2 * 0.4);

        // Cylindrical or Spherical Fresnel Edge Glow
        float fresnel = 1.0 - max(0.0, dot(vNormalW, vViewDir));
        float edgeRim = pow(fresnel, 2.2);

        // Electric Black Lightning Tendrils
        float lightningLine = 1.0 - smoothstep(0.0, 0.08, abs(combinedNoise - 0.15));

        // Color Grading: Pitch Black Core -> Deep Violet -> Purple Rim -> Electric Lightning
        vec3 col = uColorCore;
        col = mix(col, uColorDeep, smoothstep(-0.4, 0.2, combinedNoise));
        col = mix(col, uColorViolet, smoothstep(0.1, 0.7, combinedNoise + edgeRim * 0.5));
        col = mix(col, uColorPurple, edgeRim * 0.85);
        col = mix(col, uColorElectric, lightningLine * 0.95);

        float alpha = clamp(0.75 + edgeRim * 0.25 + lightningLine * 0.3, 0.0, 1.0) * uOpacity;

        gl_FragColor = vec4(col, alpha);
      }
    `
  });
}
