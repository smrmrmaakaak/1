import {
  Group,
  Mesh,
  PlaneGeometry,
  TorusGeometry,
  SphereGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Vector3,
  Color
} from 'three';
import { LAYER, setLayerRecursive } from '../core/Layers.js';
import { randRange } from '../utils/math.js';

const NUM_BOLTS = 32;

/**
 * 3D High-Voltage Air Cracks & Space Fractures (대기 파괴 균열)
 */
export class AirCrackEffect {
  constructor(scene) {
    this.scene = scene;
    this.group = new Group();
    this.group.name = 'AirCrackEffect';
    this.group.visible = false;
    this.scene.add(this.group);

    // Pure White Core Material (HDR Emissive Look)
    this.crackMat = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      side: DoubleSide,
      depthWrite: false
    });

    // Searing Cyan Outer Plasma Material
    this.glowMat = new MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
      side: DoubleSide,
      depthWrite: false
    });

    // 1. Shattered Space Center Core (3 Concentric Tremor Rings & Plasma Core)
    this.coreSphere = new Mesh(new SphereGeometry(1.2, 16, 16), this.crackMat);
    const ringGeo1 = new TorusGeometry(1.6, 0.20, 8, 32);
    const ringGeo2 = new TorusGeometry(2.8, 0.14, 8, 32);
    const ringGeo3 = new TorusGeometry(4.2, 0.09, 8, 32);
    this.ring1 = new Mesh(ringGeo1, this.crackMat);
    this.ring2 = new Mesh(ringGeo2, this.glowMat);
    this.ring3 = new Mesh(ringGeo3, this.glowMat);
    this.ring1.rotation.x = Math.PI / 2;
    this.ring2.rotation.y = Math.PI / 2;
    this.ring3.rotation.z = Math.PI / 2;

    this.group.add(this.coreSphere, this.ring1, this.ring2, this.ring3);

    // 2. 32 Bold 3D Air Crack Fracture Ribbons
    this.cracks = [];
    for (let i = 0; i < NUM_BOLTS; i++) {
      const branchGroup = new Group();
      const segCount = 5;
      let prevPos = new Vector3(0, 0, 0);

      const angle = (i / NUM_BOLTS) * Math.PI * 2 + randRange(-0.1, 0.1);
      const elevation = randRange(-0.85, 0.85);
      const dir = new Vector3(Math.cos(angle), elevation, Math.sin(angle)).normalize();

      for (let s = 0; s < segCount; s++) {
        const segLen = randRange(1.8, 3.2);
        const segWidth = randRange(0.4, 0.8) * (1.0 - (s / segCount) * 0.4);

        const segGeo = new PlaneGeometry(segWidth, segLen);
        const mesh = new Mesh(segGeo, s % 2 === 0 ? this.crackMat : this.glowMat);

        const jitter = new Vector3(randRange(-0.45, 0.45), randRange(-0.45, 0.45), randRange(-0.45, 0.45));
        const currentPos = prevPos.clone().addScaledVector(dir, segLen * 0.85).add(jitter);

        const mid = prevPos.clone().add(currentPos).multiplyScalar(0.5);
        mesh.position.copy(mid);

        const segDir = currentPos.clone().sub(prevPos).normalize();
        mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), segDir);

        branchGroup.add(mesh);
        prevPos = currentPos;
      }

      this.group.add(branchGroup);
      this.cracks.push(branchGroup);
    }

    setLayerRecursive(this.group, LAYER.VFX);

    this.active = false;
    this.time = 0;
    this.duration = 0.85;
  }

  trigger(centerPos, maxRadius = 12.0, duration = 0.85) {
    this.group.position.copy(centerPos);
    this.group.scale.set(0.1, 0.1, 0.1);
    this.group.visible = true;
    this.active = true;
    this.time = 0;
    this.duration = duration;
    this.maxRadius = maxRadius;

    this.crackMat.opacity = 1.0;
    this.glowMat.opacity = 0.95;
  }

  update(dt) {
    if (!this.active) return;
    this.time += dt;
    const progress = this.time / this.duration;

    if (progress >= 1.0) {
      this.active = false;
      this.group.visible = false;
      return;
    }

    // Explosive rapid expansion
    const scaleEase = Math.min(1.0, progress * 4.5);
    const curScale = 1.0 + scaleEase * (this.maxRadius * 0.35);
    this.group.scale.set(curScale, curScale, curScale);

    // High-frequency jitter
    const jitter = (Math.random() - 0.5) * 0.25 * (1.0 - progress);
    this.coreSphere.scale.set(1.0 + jitter, 1.0 + jitter, 1.0 + jitter);
    this.ring1.rotation.z += dt * 16.0;
    this.ring2.rotation.x += dt * 18.0;
    this.ring3.rotation.y += dt * 20.0;

    // Fade out
    const fade = 1.0 - Math.pow(progress, 1.4);
    this.crackMat.opacity = fade;
    this.glowMat.opacity = fade * 0.9;
  }
}
