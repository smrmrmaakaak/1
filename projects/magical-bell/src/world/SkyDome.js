import {
  Mesh,
  SphereGeometry,
  ShaderMaterial,
  BackSide,
  Color
} from 'three';

const skyVertexShader = `
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const skyFragmentShader = `
  uniform float uTime;
  uniform vec3 uTopColor;
  uniform vec3 uBottomColor;
  uniform vec3 uNebulaColor1;
  uniform vec3 uNebulaColor2;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  // Simplex-style pseudo noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; ++i) {
      v += a * noise(p);
      p = rot * p * 2.0 + vec2(0.1, 0.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    // Deep Atmospheric Gradient
    vec3 sky = mix(uBottomColor, uTopColor, pow(h, 0.8));

    // Nebula Clouds
    vec2 skyUv = vec2(atan(dir.z, dir.x) * 1.5, dir.y * 3.0) + vec2(uTime * 0.005, 0.0);
    float neb1 = fbm(skyUv * 1.5);
    float neb2 = fbm(skyUv * 2.5 + vec2(1.7, 9.2) - uTime * 0.003);

    sky += uNebulaColor1 * pow(neb1, 2.2) * 1.4 * smoothstep(0.05, 0.8, h);
    sky += uNebulaColor2 * pow(neb2, 2.8) * 1.6 * smoothstep(0.1, 0.9, h);

    // Twinkling Starfield
    vec2 starGrid = floor(skyUv * 120.0);
    float starRand = hash(starGrid);
    if (starRand > 0.985 && h > 0.08) {
      float twinkle = sin(uTime * 4.0 + starRand * 60.0) * 0.5 + 0.5;
      float starBright = (starRand - 0.985) / 0.015;
      sky += vec3(0.9, 0.95, 1.0) * starBright * (0.4 + 0.6 * twinkle);
    }

    gl_FragColor = vec4(sky, 1.0);
  }
`;

export class SkyDome {
  constructor(scene) {
    this.scene = scene;
    this._createSky();
  }

  _createSky() {
    const geo = new SphereGeometry(45000, 32, 24);
    this.uniforms = {
      uTime: { value: 0 },
      uTopColor: { value: new Color(0x02040a) },
      uBottomColor: { value: new Color(0x0a1424) },
      uNebulaColor1: { value: new Color(0x38bdf8) },
      uNebulaColor2: { value: new Color(0x818cf8) }
    };

    this.material = new ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: this.uniforms,
      side: BackSide,
      depthWrite: false
    });

    this.mesh = new Mesh(geo, this.material);
    this.scene.add(this.mesh);
  }

  update(time, playerPos) {
    if (this.mesh) {
      this.uniforms.uTime.value = time;
      if (playerPos) {
        this.mesh.position.set(playerPos.x, 0, playerPos.z);
      }
    }
  }
}
