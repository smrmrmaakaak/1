import {
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Color,
  Vector2,
  Vector3,
  DoubleSide,
  AdditiveBlending,
  NormalBlending
} from 'three';
import { noiseGLSL } from '../shaders/lib/noise.glsl.js';
import { LAYER } from '../core/Layers.js';

/**
 * AAA-Grade Procedural Water River & Lake Shader.
 * Features Gerstner wave displacement, sun caustics, depth absorption, and shore foam.
 */
export class WaterPlane {
  constructor(scene) {
    this.scene = scene;

    const uniforms = {
      uTime: { value: 0 },
      uDeepColor: { value: new Color('#004b6e') },
      uShallowColor: { value: new Color('#22d3ee') },
      uSunColor: { value: new Color('#ffffff') },
      uSunDir: { value: new Vector3(0.5, 0.8, 0.3).normalize() },
      uFoamColor: { value: new Color('#e0f7fa') },
      uFlowSpeed: { value: 0.35 }
    };

    const vertexShader = /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalWorld;
      varying vec3 vViewDir;

      uniform float uTime;
      uniform float uFlowSpeed;

      ${noiseGLSL}

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Gerstner Multi-Wave Displacement
        float t = uTime * uFlowSpeed;
        float wave1 = sin(pos.x * 0.15 + t * 2.0) * cos(pos.y * 0.15 + t * 1.5) * 0.22;
        float wave2 = sin(pos.x * 0.35 - t * 3.0 + pos.y * 0.2) * 0.12;
        float wave3 = snoise(vec3(pos.xy * 0.5, t)) * 0.08;

        pos.z += wave1 + wave2 + wave3;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;

        // Approximate wave normal
        vec3 waveNorm = normalize(vec3(
          -cos(pos.x * 0.15 + t * 2.0) * 0.15,
          -cos(pos.y * 0.15 + t * 1.5) * 0.15,
          1.0
        ));
        vNormalWorld = normalize(mat3(modelMatrix) * waveNorm);
        vViewDir = normalize(cameraPosition - worldPos.xyz);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalWorld;
      varying vec3 vViewDir;

      uniform float uTime;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uSunColor;
      uniform vec3 uSunDir;
      uniform vec3 uFoamColor;

      ${noiseGLSL}

      void main() {
        // River boundary alpha mask (Meandering curving river curve)
        float riverCenter = sin(vWorldPos.z * 0.035) * 22.0 + 35.0;
        float distToRiver = abs(vWorldPos.x - riverCenter);
        float riverWidth = 14.0 + sin(vWorldPos.z * 0.08) * 4.0;

        if (distToRiver > riverWidth + 4.0) discard;

        float shoreFactor = smoothstep(riverWidth + 3.5, riverWidth - 2.0, distToRiver);

        // 1. Fresnel Reflectance
        float fresnel = pow(1.0 - max(0.0, dot(vViewDir, vNormalWorld)), 3.5);

        // 2. Sunlight Specular Highlight
        vec3 halfVec = normalize(uSunDir + vViewDir);
        float spec = pow(max(0.0, dot(vNormalWorld, halfVec)), 64.0) * 1.8;

        // 3. Sun Caustics Network
        vec2 flowUv = vWorldPos.xz * 0.25 + vec2(0.0, uTime * 0.2);
        float c1 = snoise(vec3(flowUv * 2.0, uTime * 0.4));
        float c2 = snoise(vec3(flowUv * 2.0 + 3.5, uTime * 0.4 + 1.2));
        float caustics = pow(abs(c1 + c2), 2.5) * 0.45;

        // 4. Shoreline Moving Foam
        float foamNoise = snoise(vec3(vWorldPos.xz * 0.8, uTime * 1.2));
        float shoreFoam = smoothstep(0.1, 0.4, (1.0 - shoreFactor) * 0.8 + foamNoise * 0.3);

        // 5. Water Depth Tint Blending
        vec3 waterColor = mix(uDeepColor, uShallowColor, shoreFactor * 0.7 + caustics);
        waterColor += uSunColor * spec;
        waterColor = mix(waterColor, uFoamColor, shoreFoam * 0.75);

        float alpha = clamp(shoreFactor * 0.82 + fresnel * 0.35 + spec, 0.0, 0.92);
        gl_FragColor = vec4(waterColor, alpha);
      }
    `;

    this.material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: DoubleSide,
      depthWrite: false,
      blending: NormalBlending
    });

    // 800m Long River Plane
    this.geometry = new PlaneGeometry(180, 800, 64, 180);
    this.geometry.rotateX(-Math.PI / 2);

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(0, -0.15, 50);
    this.mesh.layers.set(LAYER.WORLD);
    this.mesh.renderOrder = 3;
    this.mesh.receiveShadow = true;

    this.scene.add(this.mesh);
  }

  update(time) {
    if (this.material) {
      this.material.uniforms.uTime.value = time;
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.mesh);
  }
}
