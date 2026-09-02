import {
  Mesh,
  PlaneGeometry,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
  Vector3
} from 'three';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';
import { LAYER } from '../core/Layers.js';

/** Side length of the open world terrain floor (75,000m = 75km Mega Continent) */
const PLANE_SIZE = 75000;

export class Ground {
  constructor(environment) {
    this.environment = environment;

    this.material = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.65,
      metalness: 0.15,
      dithering: true
    });
    this.material.normalScale = new Vector2(1.0, 1.0);

    this.textures = null;
    this._textured = false;

    this.uniforms = {
      uFloorColor: { value: getColor(settings.environment.floorColor).clone() },
      uFloorTint: { value: getColor(settings.environment.floorTint).clone() },
      uTime: { value: 0 }
    };

    environment.registerShadowCasterWithPatch(this.material, (shader) => {
      shader.uniforms.uFloorColor = this.uniforms.uFloorColor;
      shader.uniforms.uFloorTint = this.uniforms.uFloorTint;
      shader.uniforms.uTime = this.uniforms.uTime;

      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\nvarying vec3 vGroundWorld;`)
        .replace(
          '#include <worldpos_vertex>',
          `#include <worldpos_vertex>\nvGroundWorld = worldPosition.xyz;`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
           varying vec3 vGroundWorld;
           uniform vec3 uFloorColor;
           uniform vec3 uFloorTint;
           uniform float uTime;
           ${noiseGLSL}`
        )
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
           {
             vec3 wp = vGroundWorld;
             float distCenter = length(wp.xz);

             // 1. Biome Weights (Mega Planetary Continent Scale: 75km)
             // Sanctuary Capital Core: 0 ~ 3,500m (3.5km radius)
             float villageWeight = 1.0 - smoothstep(1800.0, 3600.0, distCenter);
             // Obsidian Canyon: ±6,000m ~ 25,000m East/West
             float canyonWeight = smoothstep(5500.0, 15000.0, abs(wp.x)) * (1.0 - villageWeight);
             // Abyssal Void Realm: -6,000m ~ -30,000m North
             float abyssWeight = smoothstep(5500.0, 16000.0, -wp.z) * (1.0 - villageWeight) * (1.0 - canyonWeight);
             // Dawn Great Plains: Southern & Central Hemisphere (2,000m ~ 30,000m)
             float meadowWeight = max(0.0, 1.0 - villageWeight - canyonWeight - abyssWeight);

             // 2. Multi-Scale Continental Fractal Noise
             float nMacro = fbm3(wp * 0.0004);
             float nMeso = fbm3(wp * 0.003 + 3.5);
             float nMicro = fbm3(wp * 0.04 + 7.0);
             float nRock = snoise01(wp * 0.012);

             // [Biome 1: Sanctuary Imperial Capital — Rich Slate Royal Marble & Gold Trims]
             vec3 colVillage = mix(vec3(0.26, 0.30, 0.38), vec3(0.38, 0.44, 0.52), nMicro);
             // Royal Flagstone Grid with Golden Inlays
             vec2 grid = abs(fract(wp.xz * 0.12 - 0.5) - 0.5) / max(vec2(0.001), fwidth(wp.xz * 0.12));
             float line = min(grid.x, grid.y);
             float tileBorder = 1.0 - min(line, 1.0);
             colVillage = mix(colVillage, vec3(0.85, 0.72, 0.35), tileBorder * 0.75); // Gold inlays
             
             // Sanctuary Arcane Cyan Rune Circle (1.5km radius)
             float runeRing = abs(sin(distCenter * 0.04 - uTime * 0.5));
             if (distCenter < 2500.0) {
               float runeMask = smoothstep(0.90, 0.98, runeRing) * (1.0 - distCenter / 2500.0);
               colVillage = mix(colVillage, vec3(0.25, 0.85, 1.0), runeMask * 0.85);
             }

             // [Biome 2: Dawn Great Plains — Vibrant Lush Emerald Grass & Golden Highway]
             vec3 colGrass = mix(vec3(0.38, 0.74, 0.28), vec3(0.52, 0.88, 0.36), nMeso);
             colGrass = mix(colGrass, vec3(0.58, 0.78, 0.30), nMicro * 0.4);
             colGrass = mix(colGrass, vec3(0.65, 0.55, 0.38), smoothstep(0.5, 0.85, nMacro)); // Warm golden dirt patches

             // Wildflower Fields (Red, Yellow, Blue, Pink blossoms scattered in grass)
             float flowerNoise = snoise01(wp * 0.25);
             if (flowerNoise > 0.82) {
               vec3 flowerColor = mix(vec3(1.0, 0.85, 0.1), vec3(1.0, 0.3, 0.45), fract(flowerNoise * 17.0));
               if (fract(flowerNoise * 31.0) > 0.5) flowerColor = vec3(0.3, 0.7, 1.0); // Blue flowers
               colGrass = mix(colGrass, flowerColor, smoothstep(0.82, 0.92, flowerNoise) * 0.9);
             }

             // Grand Royal Cobblestone Highway
             float roadDist = abs(wp.x + sin(wp.z * 0.0012) * 60.0);
             float roadMask = 1.0 - smoothstep(8.0, 24.0, roadDist);
             vec3 colRoad = mix(vec3(0.68, 0.62, 0.54), vec3(0.78, 0.72, 0.65), nMicro);
             colGrass = mix(colGrass, colRoad, roadMask * 0.92);

             // [Biome 3: Obsidian Volcanic Mountain Range — Glowing Magma Rivers & Basalt]
             vec3 colBasalt = mix(vec3(0.22, 0.18, 0.20), vec3(0.35, 0.28, 0.30), nRock);
             float crackNoise = abs(snoise(wp * 0.0025 + vec3(uTime * 0.05, 0.0, 0.0)));
             float lavaGlow = smoothstep(0.68, 0.88, crackNoise);
             vec3 colLava = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.85, 0.20), sin(uTime * 2.0 + wp.x * 0.02) * 0.5 + 0.5);
             vec3 colCanyon = mix(colBasalt, colLava * 3.0, lavaGlow);

             // [Biome 4: Abyssal Void Dimension — Luminous Violet Nebula & Astral Shrines]
             vec3 colAbyss = mix(vec3(0.24, 0.14, 0.38), vec3(0.42, 0.22, 0.62), nMacro);
             float voidRift = smoothstep(0.62, 0.85, fbm3(wp * 0.002 - vec3(0.0, 0.0, uTime * 0.08)));
             vec3 colVoidGlow = vec3(0.85, 0.35, 1.0) * (sin(uTime * 1.5 + distCenter * 0.005) * 0.5 + 0.5);
             colAbyss = mix(colAbyss, colVoidGlow * 2.5, voidRift);

             // 3. Composite Ground Color with Smooth Biome Transitions
             vec3 finalColor = colVillage * villageWeight;
             finalColor += colGrass * meadowWeight;
             finalColor += colCanyon * canyonWeight;
             finalColor += colAbyss * abyssWeight;

             // Horizon distant edge fade (40km ~ 55km)
             float edgeFade = 1.0 - smoothstep(38000.0, 55000.0, distCenter);
             finalColor *= mix(0.7, 1.0, edgeFade);

             diffuseColor.rgb = finalColor;
           }`
        )
        .replace(
          '#include <roughnessmap_fragment>',
          `#include <roughnessmap_fragment>
           {
             float dist = length(vGroundWorld.xz);
             float villagePolish = 1.0 - smoothstep(2000.0, 3800.0, dist);
             roughnessFactor = mix(0.75, 0.28, villagePolish);
           }`
        );
    });

    const groundGeo = new PlaneGeometry(PLANE_SIZE, PLANE_SIZE, 64, 64);
    groundGeo.rotateX(-Math.PI / 2);

    this.mesh = new Mesh(groundGeo, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    this.mesh.name = 'Ground';
    this.mesh.layers.set(LAYER.WORLD);
    this.mesh.matrixAutoUpdate = true;

    this.group = this.mesh;
    this.root = this.mesh;
  }

  async loadTextures(assets) {
    return Promise.resolve();
  }

  update(time) {
    this.uniforms.uTime.value = time;
  }

  dispose() {
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}
