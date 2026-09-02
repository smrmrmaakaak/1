import { ShaderMaterial, Color, DoubleSide, AdditiveBlending } from 'three';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';

/**
 * AAA-Grade Diamond Glacial Lance Shader Material.
 * Features internal refraction, chromatic dispersion, Voronoi rime, and cryogenic fresnel glow.
 */
export function createFrostLanceMaterial() {
  const uniforms = {
    uTime: { value: 0 },
    uColorCore: { value: new Color('#ffffff') },
    uColorIce: { value: new Color('#57f0ff') },
    uColorDeep: { value: new Color('#0077b6') },
    uColorRim: { value: new Color('#d4f1f9') },
    uDispersion: { value: 0.65 },
    uFresnelPower: { value: 2.2 },
    uGlowIntensity: { value: 2.5 },
    uProgress: { value: 1.0 }
  };

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormalWorld;
    varying vec3 vPositionWorld;
    varying vec3 vViewDir;

    uniform float uTime;

    ${noiseGLSL}

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Subtle ice crystal breathing / aerodynamic spiral vibration
      float vibration = snoise(vec3(pos.x * 3.0, pos.y * 3.0, pos.z * 5.0 + uTime * 12.0)) * 0.04;
      pos += normal * vibration;

      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vPositionWorld = worldPos.xyz;
      vNormalWorld = normalize(mat3(modelMatrix) * normal);
      vViewDir = normalize(cameraPosition - worldPos.xyz);

      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormalWorld;
    varying vec3 vPositionWorld;
    varying vec3 vViewDir;

    uniform float uTime;
    uniform vec3 uColorCore;
    uniform vec3 uColorIce;
    uniform vec3 uColorDeep;
    uniform vec3 uColorRim;
    uniform float uDispersion;
    uniform float uFresnelPower;
    uniform float uGlowIntensity;
    uniform float uProgress;

    ${noiseGLSL}

    void main() {
      // 1. Cryogenic Fresnel Rim Glow
      float fresnel = pow(1.0 - max(0.0, dot(vViewDir, vNormalWorld)), uFresnelPower);

      // 2. Diamond Voronoi Ice Faceting & Micro-Cracks
      vec3 p = vPositionWorld * 3.5;
      float crackNoise = snoise(vec3(p.x * 2.0, p.y * 2.0, p.z * 2.0 - uTime * 3.0));
      float sparkle = pow(max(0.0, snoise(vec3(p.xy * 8.0, uTime * 6.0))), 6.0) * 2.5;

      // 3. Chromatic Refraction Dispersion (Red/Green/Blue split)
      float rChannel = snoise(vec3(p.x + uDispersion * 0.1, p.y, p.z)) * 0.5 + 0.5;
      float gChannel = snoise(vec3(p.x, p.y, p.z)) * 0.5 + 0.5;
      float bChannel = snoise(vec3(p.x - uDispersion * 0.1, p.y, p.z)) * 0.5 + 0.5;
      vec3 chromaticPrism = vec3(rChannel, gChannel, bChannel) * 0.35;

      // 4. Multi-tier Cryo Gradient
      float depthGradient = clamp(dot(vNormalWorld, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5, 0.0, 1.0);
      vec3 baseColor = mix(uColorDeep, uColorIce, depthGradient);
      baseColor = mix(baseColor, uColorCore, pow(fresnel, 1.5) * 0.8);
      baseColor += chromaticPrism + sparkle * uColorRim;

      // 5. Final Radiant Emissive Blend
      vec3 finalColor = baseColor * (uGlowIntensity + fresnel * 1.5);

      float alpha = clamp(0.75 + fresnel * 0.35, 0.0, 1.0) * uProgress;
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    blending: AdditiveBlending
  });
}
