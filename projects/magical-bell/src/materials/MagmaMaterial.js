import { MeshStandardMaterial, Color, Vector3, DoubleSide } from 'three';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';
import { frame } from '../core/FrameUniforms.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';

/**
 * AAA-Grade Photorealistic Molten Magma & Volcanic Basalt Material.
 * Combines PBR lighting with procedural multi-octave lava vein flow,
 * incandescent liquid heat, and charred obsidian crust.
 */
export function createMagmaMaterial(environment) {
  const material = new MeshStandardMaterial({
    color: 0x180a06,
    roughness: 0.85,
    metalness: 0.1,
    flatShading: true,
    side: DoubleSide
  });

  const uniforms = {
    uTime: frame.uTime,
    uHeat: { value: 1.0 },
    uFlowSpeed: { value: 1.8 },
    uCrackScale: { value: 3.2 },
    uColorCore: { value: new Color('#ffffff') },
    uColorLava: { value: new Color('#ff4500') },
    uColorCrimson: { value: new Color('#990000') },
    uColorCrust: { value: new Color('#0d0503') }
  };

  environment.registerShadowCasterWithPatch(material, (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vMagmaLocal;
         varying vec3 vMagmaWorld;
         varying vec3 vMagmaNormalW;
         uniform float uTime;
         uniform float uFlowSpeed;
         ${noiseGLSL}`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         // Organic magma viscosity distortion
         float vNoise = snoise(vec3(position * 0.9 + vec3(0.0, -uTime * uFlowSpeed * 0.8, 0.0)));
         transformed += normal * (vNoise * 0.18);
         vMagmaLocal = transformed;
         vMagmaWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vMagmaNormalW = normalize(mat3(modelMatrix) * objectNormal);`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vMagmaLocal;
         varying vec3 vMagmaWorld;
         varying vec3 vMagmaNormalW;
         uniform float uTime;
         uniform float uHeat;
         uniform float uFlowSpeed;
         uniform float uCrackScale;
         uniform vec3  uColorCore;
         uniform vec3  uColorLava;
         uniform vec3  uColorCrimson;
         uniform vec3  uColorCrust;
         ${noiseGLSL}`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         // Multi-octave molten lava vein network
         vec3 samplePos = vMagmaLocal * uCrackScale + vec3(0.0, -uTime * uFlowSpeed, 0.0);
         float n1 = abs(snoise(samplePos));
         float n2 = abs(snoise(samplePos * 2.2 + vec3(4.2, 1.7, 9.1)));
         float crack = 1.0 - smoothstep(0.0, 0.35, n1 * 0.7 + n2 * 0.3);

         // Pulse and intense liquid temperature
         float pulse = 0.85 + 0.15 * sin(uTime * 4.0 + vMagmaLocal.y * 3.0);
         float temp = crack * uHeat * pulse;

         // Incandescent heat gradient: White-Hot -> Fiery Orange -> Deep Crimson -> Dark Basalt
         vec3 lavaGlow = mix(uColorCrimson, uColorLava, smoothstep(0.1, 0.6, temp));
         lavaGlow = mix(lavaGlow, uColorCore, smoothstep(0.6, 1.0, temp) * 1.5);

         // Emissive output into HDR bloom buffer
         totalEmissiveRadiance += lavaGlow * (temp * 5.2);
         diffuseColor.rgb = mix(uColorCrust, uColorLava * 0.4, temp * 0.5);`
      );
  });

  return material;
}
