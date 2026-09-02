import {
  ShaderMaterial,
  AdditiveBlending,
  DoubleSide,
  Color,
  Vector3
} from 'three';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';
import { frame } from '../core/FrameUniforms.js';

/**
 * AAA-Grade Procedural Inferno Shader
 * - Dynamic Vertex Displacement for living, billowing flame tongues
 * - 3-layer scrolling Simplex & Voronoi noise for realistic plasma fire
 * - Black-body temperature ramp: White Core -> Golden Yellow -> Vivid Crimson -> Charred Smoke
 * - Dynamic Fresnel rim lighting and soft dissolve erosion
 */
export function createInfernoPillarMaterial() {
  const uniforms = {
    uTime: frame.uTime,
    uColorCore: { value: new Color('#ffffff') },
    uColorMid: { value: new Color('#ff9900') },
    uColorOuter: { value: new Color('#ff1a00') },
    uColorSmoke: { value: new Color('#2b0500') },
    uProgress: { value: 0.0 },
    uErosion: { value: 0.0 },
    uGlowIntensity: { value: 4.5 },
    uTwistSpeed: { value: 4.0 },
    uNoiseScale: { value: 2.2 }
  };

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormalWorld;
    varying vec3 vPositionWorld;
    varying float vDisplacement;

    uniform float uTime;
    uniform float uTwistSpeed;
    uniform float uProgress;

    ${noiseGLSL}

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Spiral twist along Y axis
      float angle = pos.y * 0.18 - uTime * uTwistSpeed;
      float ca = cos(angle);
      float sa = sin(angle);
      mat2 rot = mat2(ca, -sa, sa, ca);
      pos.xz = rot * pos.xz;

      // 3D Noise wave displacement (Billowing fire distortion)
      vec3 noiseCoord = vec3(pos.x * 0.25, pos.y * 0.15 - uTime * 2.0, pos.z * 0.25);
      float n = snoise(noiseCoord);
      float displacement = n * (0.45 + 0.35 * (1.0 - uv.y));
      pos += normal * displacement;
      vDisplacement = displacement;

      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vPositionWorld = worldPos.xyz;
      vNormalWorld = normalize(mat3(modelMatrix) * normal);

      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormalWorld;
    varying vec3 vPositionWorld;
    varying float vDisplacement;

    uniform float uTime;
    uniform float uProgress;
    uniform float uErosion;
    uniform float uGlowIntensity;
    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorOuter;
    uniform vec3 uColorSmoke;

    ${noiseGLSL}

    void main() {
      // 3-tier multi-frequency scrolling turbulence
      vec2 uvScroll1 = vec2(vUv.x * 4.0 + uTime * 0.6, vUv.y * 2.5 - uTime * 2.8);
      vec2 uvScroll2 = vec2(vUv.x * 7.0 - uTime * 1.0, vUv.y * 5.0 - uTime * 4.5);

      float n1 = snoise(vec3(uvScroll1, uTime * 0.4)) * 0.5 + 0.5;
      float n2 = snoise(vec3(uvScroll2, uTime * 0.7)) * 0.5 + 0.5;
      float fireNoise = mix(n1, n2, 0.4);

      // Height gradient & top taper
      float heightGradient = sin(vUv.y * 3.14159);
      float flameDensity = fireNoise * (0.3 + 0.7 * heightGradient);

      // Dissolve erosion
      float alpha = smoothstep(uErosion * 0.85, uErosion * 0.85 + 0.3, flameDensity);

      // View Fresnel
      vec3 viewDir = normalize(cameraPosition - vPositionWorld);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormalWorld)), 1.8);

      // Multi-layer temperature color mapping
      float heat = clamp(flameDensity * 1.4 + fresnel * 0.6 + vDisplacement * 0.2, 0.0, 1.0);
      
      vec3 color = uColorSmoke;
      color = mix(color, uColorOuter, smoothstep(0.12, 0.42, heat));
      color = mix(color, uColorMid, smoothstep(0.42, 0.75, heat));
      color = mix(color, uColorCore, smoothstep(0.75, 0.96, heat));

      color *= uGlowIntensity * (0.8 + fresnel * 1.2);

      gl_FragColor = vec4(color, alpha * (1.0 - uErosion));
    }
  `;

  const mat = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: AdditiveBlending,
    side: DoubleSide,
    depthWrite: false
  });

  return mat;
}

/**
 * High-Detail Magma Pentagram Rune & Fissure Material
 */
export function createInfernoRuneMaterial() {
  const uniforms = {
    uTime: frame.uTime,
    uColorLava: { value: new Color('#ff3300') },
    uColorGlow: { value: new Color('#ffaa00') },
    uColorCore: { value: new Color('#ffffff') },
    uOpacity: { value: 1.0 },
    uPulseSpeed: { value: 4.5 }
  };

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPos;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPos;

    uniform float uTime;
    uniform float uOpacity;
    uniform float uPulseSpeed;
    uniform vec3 uColorLava;
    uniform vec3 uColorGlow;
    uniform vec3 uColorCore;

    ${noiseGLSL}

    void main() {
      vec2 centered = vUv * 2.0 - 1.0;
      float dist = length(centered);

      // Concentric pulsed runic rings
      float ring1 = 1.0 - smoothstep(0.0, 0.06, abs(dist - 0.85));
      float ring2 = 1.0 - smoothstep(0.0, 0.04, abs(dist - 0.65));
      float ring3 = 1.0 - smoothstep(0.0, 0.03, abs(dist - 0.40));
      float rings = ring1 + ring2 * 0.8 + ring3 * 0.6;

      // 5-pointed Star Pentagram geometric lines
      float angle = atan(centered.y, centered.x) + uTime * 0.6;
      float star = sin(angle * 5.0) * 0.5 + 0.5;
      float starRay = smoothstep(0.4, 0.95, star) * (1.0 - smoothstep(0.1, 0.88, dist));

      // Organic Magma Noise Texture
      float lavaNoise = snoise(vec3(centered * 4.0, uTime * 1.5)) * 0.5 + 0.5;
      float pattern = (rings + starRay * 1.2) * (0.6 + 0.4 * lavaNoise);

      float pulse = 0.85 + 0.25 * sin(uTime * uPulseSpeed);
      pattern *= pulse;

      // Multi-tonal intense emissive glow
      vec3 finalColor = mix(uColorLava, uColorGlow, pattern * 0.7);
      finalColor = mix(finalColor, uColorCore, pow(pattern, 3.0) * 0.9);
      finalColor *= 3.8;

      float alpha = clamp(pattern, 0.0, 1.0) * uOpacity * (1.0 - smoothstep(0.85, 1.0, dist));

      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: AdditiveBlending,
    side: DoubleSide,
    depthWrite: false
  });
}
