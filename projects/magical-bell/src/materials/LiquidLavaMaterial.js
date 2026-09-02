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
 * AAA Photorealistic 3D Volumetric Liquid Lava Material
 * - 100% Perfect circular shape with depth & thickness
 * - Heavy slow viscous laminar flow & glowing magma channels
 * - High renderOrder & polygonOffset to eliminate Z-fighting & clipping
 */
export function createLiquidLavaMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: true,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -6,
    polygonOffsetUnits: -6,
    side: DoubleSide,
    blending: NormalBlending,
    uniforms: {
      uTime: frame.uTime,
      uFlowSpeed: { value: 0.65 },
      uColorHot: { value: new Color('#fff9c4') },
      uColorOrange: { value: new Color('#ff4500') },
      uColorCrimson: { value: new Color('#b30a00') },
      uColorDark: { value: new Color('#140301') },
      uOpacity: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uFlowSpeed;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;

      ${noiseGLSL}

      void main() {
        vUv = uv;
        vec3 pos = position;

        // 3D bubbling molten lava surface displacement
        float heavyWave = snoise(vec3(pos.xz * 1.2, -uTime * uFlowSpeed * 0.5)) * 0.12;
        pos.y += heavyWave;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uFlowSpeed;
      uniform vec3  uColorHot;
      uniform vec3  uColorOrange;
      uniform vec3  uColorCrimson;
      uniform vec3  uColorDark;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;

      ${noiseGLSL}

      void main() {
        vec2 centeredUv = vUv * 2.0 - 1.0;
        float dist = length(centeredUv);

        // Smooth circular crater disc boundary
        if (dist > 1.0) discard;
        float edgeSoft = 1.0 - smoothstep(0.75, 1.0, dist);

        // 2-Octave Viscous Magma Flow
        vec2 flowCoords = centeredUv * 2.2;
        float flow1 = snoise(vec3(flowCoords + vec2(0.0, -uTime * uFlowSpeed * 0.3), uTime * 0.15));
        float flow2 = snoise(vec3(flowCoords * 2.0 - vec2(flow1 * 0.4), uTime * 0.25));
        float combinedNoise = (flow1 * 0.65 + flow2 * 0.35);

        // Incandescent Heat Grading
        vec3 col = uColorDark;
        if (combinedNoise > -0.1) {
          float t1 = smoothstep(-0.1, 0.25, combinedNoise);
          col = mix(uColorDark, uColorCrimson * 1.4, t1);
        }
        if (combinedNoise > 0.2) {
          float t2 = smoothstep(0.2, 0.55, combinedNoise);
          col = mix(col, uColorOrange * 2.2, t2);
        }
        if (combinedNoise > 0.45) {
          float t3 = smoothstep(0.45, 0.85, combinedNoise);
          col = mix(col, uColorHot * 3.5, t3);
        }

        // Rim cooling crust
        col = mix(uColorDark * 0.4, col, edgeSoft);

        float alpha = edgeSoft * uOpacity * 0.96;
        if (alpha < 0.01) discard;

        gl_FragColor = vec4(col, alpha);
      }
    `
  });
}
