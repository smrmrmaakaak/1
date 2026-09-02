import {
  Group,
  InstancedMesh,
  Object3D,
  Quaternion,
  Vector3,
  DodecahedronGeometry,
  MeshStandardMaterial,
  Color
} from 'three';
import { LAYER } from '../core/Layers.js';
import { randRange } from '../utils/math.js';

const MAX_DEBRIS = 150;
const _dummy = new Object3D();
const _spin = new Quaternion();
const _gravity = -24.0;

export class GroundRockDebrisManager {
  constructor(scene) {
    this.scene = scene;

    // Jagged Low-Poly Fractured Basalt Rock
    this.geometry = new DodecahedronGeometry(0.32, 1);
    // Perturb vertices slightly for organic rock roughness
    const pos = this.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(
        i,
        pos.getX(i) * (1.0 + (Math.random() - 0.5) * 0.4),
        pos.getY(i) * (1.0 + (Math.random() - 0.5) * 0.4),
        pos.getZ(i) * (1.0 + (Math.random() - 0.5) * 0.4)
      );
    }
    this.geometry.computeVertexNormals();

    this.material = new MeshStandardMaterial({
      color: 0x1a0f0d,
      emissive: 0x661100,
      emissiveIntensity: 0.8,
      roughness: 0.8,
      metalness: 0.2,
      flatShading: true
    });

    this.mesh = new InstancedMesh(this.geometry, this.material, MAX_DEBRIS);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    this.mesh.layers.set(LAYER.WORLD);
    this.scene.add(this.mesh);

    this.particles = [];
    for (let i = 0; i < MAX_DEBRIS; i++) {
      this.particles.push({
        index: i,
        active: false,
        pos: new Vector3(0, -999, 0),
        vel: new Vector3(),
        rot: new Quaternion(),
        spinRate: new Vector3(),
        scale: 1.0,
        life: 0,
        maxLife: 8.0,
        groundY: 0.45
      });
      _dummy.position.set(0, -999, 0);
      _dummy.scale.set(0, 0, 0);
      _dummy.updateMatrix();
      this.mesh.setMatrixAt(i, _dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  spawnExplosion(centerPos, count = 8, power = 10.0, color = 0x661100) {
    for (let k = 0; k < count; k++) {
      const p = this.particles.find(pt => !pt.active) || this.particles[k % MAX_DEBRIS];
      p.active = true;
      p.life = 0;
      p.maxLife = randRange(6.0, 10.0);
      p.groundY = randRange(0.40, 0.52);

      p.pos.set(
        centerPos.x + randRange(-0.5, 0.5),
        centerPos.y + 0.4,
        centerPos.z + randRange(-0.5, 0.5)
      );

      const angle = Math.random() * Math.PI * 2;
      const hSpeed = randRange(3.0, power);
      p.vel.set(
        Math.cos(angle) * hSpeed,
        randRange(6.0, power * 1.3),
        Math.sin(angle) * hSpeed
      );

      p.rot.set(Math.random(), Math.random(), Math.random(), Math.random()).normalize();
      p.spinRate.set(randRange(-8, 8), randRange(-8, 8), randRange(-8, 8));
      p.scale = randRange(0.7, 1.6);
    }
  }

  update(dt) {
    let needsUpdate = false;

    for (let i = 0; i < MAX_DEBRIS; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        _dummy.position.set(0, -999, 0);
        _dummy.scale.set(0, 0, 0);
        _dummy.updateMatrix();
        this.mesh.setMatrixAt(i, _dummy.matrix);
        needsUpdate = true;
        continue;
      }

      // Physics integration
      if (p.pos.y > p.groundY || p.vel.y > 0) {
        p.vel.y += _gravity * dt;
        p.pos.addScaledVector(p.vel, dt);

        if (p.pos.y <= p.groundY) {
          p.pos.y = p.groundY;
          p.vel.y = -p.vel.y * 0.35; // Bounce
          p.vel.x *= 0.5;
          p.vel.z *= 0.5;
        }
      }

      // Spin
      _spin.setFromAxisAngle(p.spinRate.clone().normalize(), p.spinRate.length() * dt);
      p.rot.multiply(_spin);

      // Fade scale near end
      let curScale = p.scale;
      if (p.life > p.maxLife - 1.5) {
        curScale *= (p.maxLife - p.life) / 1.5;
      }

      _dummy.position.copy(p.pos);
      _dummy.quaternion.copy(p.rot);
      _dummy.scale.setScalar(curScale);
      _dummy.updateMatrix();

      this.mesh.setMatrixAt(i, _dummy.matrix);
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  clear() {
    for (let i = 0; i < MAX_DEBRIS; i++) {
      this.particles[i].active = false;
      _dummy.position.set(0, -999, 0);
      _dummy.scale.set(0, 0, 0);
      _dummy.updateMatrix();
      this.mesh.setMatrixAt(i, _dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
