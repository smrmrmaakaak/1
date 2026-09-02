import { Vector3 } from 'three';

/**
 * Ultra High-Performance DOM-based 3D Floating Damage Numbers
 * Zero GPU texture uploads, 60+ FPS smooth animations!
 */
export class FloatingTextManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    let container = document.getElementById('floating-damage-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'floating-damage-container';
      container.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 30;
      `;
      document.body.appendChild(container);
    }
    this.container = container;

    this.activeTexts = [];
    this.pool = [];
    this._screenPos = new Vector3();
  }

  setCamera(camera) {
    this.camera = camera;
  }

  spawn(text, worldPos, options = {}) {
    const color = options.color || '#ff4444';
    const isCrit = options.isCrit || false;
    const size = options.size || (isCrit ? 22 : 16);

    let el = this.pool.pop();
    if (!el) {
      el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        font-family: 'Inter', system-ui, sans-serif;
        font-weight: 800;
        text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 8px rgba(0,0,0,0.8);
        user-select: none;
        will-change: transform, opacity;
        white-space: nowrap;
      `;
      this.container.appendChild(el);
    }

    el.textContent = text;
    el.style.color = color;
    el.style.fontSize = `${size}px`;
    el.style.display = 'block';
    el.style.opacity = '1';

    const item = {
      el,
      pos: new Vector3(
        worldPos.x + (Math.random() - 0.5) * 0.8,
        worldPos.y + 1.8 + Math.random() * 0.4,
        worldPos.z + (Math.random() - 0.5) * 0.8
      ),
      velY: 1.8 + Math.random() * 0.8,
      life: 0,
      maxLife: isCrit ? 0.85 : 0.6
    };

    this.activeTexts.push(item);
  }

  update(dt) {
    if (!this.camera) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const halfW = width / 2;
    const halfH = height / 2;

    for (let i = this.activeTexts.length - 1; i >= 0; i--) {
      const item = this.activeTexts[i];
      item.life += dt;
      const progress = item.life / item.maxLife;

      if (progress >= 1.0) {
        item.el.style.display = 'none';
        this.activeTexts.splice(i, 1);
        this.pool.push(item.el);
        continue;
      }

      item.pos.y += item.velY * dt;
      item.velY -= 2.0 * dt; // gravity

      // Project 3D to 2D Screen
      this._screenPos.copy(item.pos).project(this.camera);

      // Check if behind camera
      if (this._screenPos.z > 1) {
        item.el.style.display = 'none';
        continue;
      }

      const x = (this._screenPos.x * halfW) + halfW;
      const y = (-(this._screenPos.y * halfH) + halfH);

      const scale = progress < 0.15 ? 0.6 + (progress / 0.15) * 0.5 : 1.0;
      const opacity = progress > 0.6 ? 1.0 - (progress - 0.6) / 0.4 : 1.0;

      item.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(2)})`;
      item.el.style.opacity = opacity.toFixed(2);
    }
  }

  clear() {
    for (const item of this.activeTexts) {
      item.el.style.display = 'none';
      this.pool.push(item.el);
    }
    this.activeTexts.length = 0;
  }

  dispose() {
    this.clear();
    if (this.container) this.container.remove();
  }
}
