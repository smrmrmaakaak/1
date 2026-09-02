import {
  ShaderMaterial,
  Color,
  DoubleSide,
  NormalBlending,
  Vector3
} from 'three';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';
import { frame } from '../core/FrameUniforms.js';

/**
 * AAA Photorealistic 3D Volumetric Frozen Glacier Floor Material for Aokiji's Ice Age.
 * - 3D Vertex displacement creating physical fractured ice shelves and organic crags.
 * - Deep subsurface ocean cyan & glacial turquoise scattering.
 * - Internal 3D fracture planes & trapped cryogenic air bubble layers.
 * - Surface rime frost, diamond sparkle glints, and subzero Fresnel glow.
 */
export function createRealisticIceFloorMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: true,
    depthTest: true,
    side: DoubleSide,
    blending: NormalBlending,
    uniforms: {
      uTime: frame.uTime,
      uRadius: { value: 21.0 },
      uProgress: { value: 1.0 },
      uColorDeep: { value: new Color('#022c43') },
      uColorGlacier: { value: new Color('#0284c7') },
      uColorTurquoise: { value: new Color('#38bdf8') },
      uColorFrost: { value: new Color('#e0f2fe') },
      uColorPureWhite: { value: new Color('#ffffff') },
      uOpacity: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uRadius;
      uniform float uProgress;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying float vElevation;

      ${noiseGLSL}

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Physical 3D Ice Shelf Height Displacement
        vec2 p = pos.xz;
        float n1 = snoise(vec3(p * 0.18, 1.4));
        float n2 = snoise(vec3(p * 0.45, 3.2));
        float ridge = abs(snoise(vec3(p * 0.28, 5.7)));
        
        // Jagged stepping ice floe elevation
        float elev = (n1 * 0.35 + n2 * 0.15 + (1.0 - ridge) * 0.4) * uProgress;
        pos.y += elev * 0.55;
        vElevation = elev;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uRadius;
      uniform float uProgress;
      uniform vec3  uColorDeep;
      uniform vec3  uColorGlacier;
      uniform vec3  uColorTurquoise;
      uniform vec3  uColorFrost;
      uniform vec3  uColorPureWhite;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying float vElevation;

      ${noiseGLSL}

      void main() {
        vec2 centeredUv = vUv * 2.0 - 1.0;
        float distNorm = length(centeredUv);

        // Organic Fractal Edge Noise (Jagged Ice Growth, not a plain circle!)
        float angle = atan(centeredUv.y, centeredUv.x);
        float edgeNoise = snoise(vec3(centeredUv * 3.5, 0.5)) * 0.12
                        + snoise(vec3(centeredUv * 8.0, 1.2)) * 0.06;
        float organicDist = distNorm + edgeNoise;

        // Clip to current expansion radius
        float maxReach = uProgress;
        if (organicDist > maxReach) discard;

        // Frosted perimeter rim
        float rimFactor = smoothstep(maxReach - 0.12, maxReach, organicDist);

        // Deep Internal 3D Fractures & Cryo-Cracks
        vec2 crackCoord = vWorldPos.xz * 0.35;
        float crack1 = 1.0 - abs(snoise(vec3(crackCoord, 2.1)));
        crack1 = pow(crack1, 4.0);

        float crack2 = 1.0 - abs(snoise(vec3(crackCoord * 2.2, 4.8)));
        crack2 = pow(crack2, 5.0);

        float combinedCracks = clamp(crack1 * 1.2 + crack2 * 0.8, 0.0, 1.0);

        // Subsurface Glacier Gradients
        float depthGrad = clamp((vElevation + 0.4) * 1.2, 0.0, 1.0);
        vec3 col = mix(uColorDeep, uColorGlacier, depthGrad);
        col = mix(col, uColorTurquoise, combinedCracks * 0.6);

        // White Rime Frost on high ridges & micro-cracks
        if (combinedCracks > 0.45) {
          float rimeT = smoothstep(0.45, 0.85, combinedCracks);
          col = mix(col, uColorPureWhite, rimeT * 0.85);
        }

        // Frosted Perimeter Glacial Edge
        col = mix(col, uColorPureWhite, rimFactor * 0.9);

        // Diamond Dust Specular Sparkle in World Space
        float sparkleNoise = snoise(vec3(vWorldPos.xz * 12.0, uTime * 0.4));
        if (sparkleNoise > 0.72) {
          col += uColorPureWhite * ((sparkleNoise - 0.72) / 0.28) * 1.5;
        }

        // Edge Soft Transparency
        float alpha = uOpacity * smoothstep(maxReach, maxReach - 0.04, organicDist);
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
}
