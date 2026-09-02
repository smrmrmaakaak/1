import { Color } from 'three';
import { settings } from '../config/settings.js';
import { damp } from '../utils/math.js';

/**
 * Full-screen colour flash & Marineford Inversion for impacts.
 */
export class ScreenFlash {
  constructor() {
    this.color = new Color(1, 1, 1);
    this.strength = 0;
    this._decay = 0.0004;

    // Marineford Ep 484 Red/Blue Negative Invert State
    this.negativeInvert = 0;
    this._invertDecay = 0.0001;
  }

  /**
   * @param {THREE.Color|string} color
   * @param {number} strength 0..1
   * @param {number} [decay]
   */
  trigger(color, strength, decay = 0.0004) {
    const scaled = strength * settings.post.flashStrength;
    if (scaled <= this.strength) return;
    if (color && color.isColor) {
      this.color.copy(color);
    } else if (typeof color === 'string') {
      this.color.set(color);
    } else {
      this.color.set('#ffffff');
    }
    this.strength = Math.min(1, scaled);
    this._decay = decay;
  }

  /**
   * Triggers Marineford Ep 484 High-Contrast Red & Cyan Negative Inversion
   * @param {number} strength 0..1
   * @param {number} durationSeconds e.g. 0.20s
   */
  triggerNegativeInvert(strength = 1.0, durationSeconds = 0.20) {
    this.negativeInvert = Math.max(this.negativeInvert, strength);
    this._invertDecay = Math.pow(0.001, 1.0 / durationSeconds);
  }

  update(dt) {
    if (this.strength > 0.0005) {
      this.strength = damp(this.strength, 0, this._decay, dt);
    } else {
      this.strength = 0;
    }

    if (this.negativeInvert > 0.001) {
      this.negativeInvert = damp(this.negativeInvert, 0, this._invertDecay, dt);
    } else {
      this.negativeInvert = 0;
    }
  }

  reset() {
    this.strength = 0;
    this.negativeInvert = 0;
  }
}
