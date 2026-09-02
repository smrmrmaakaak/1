import { Vector2 } from 'three';

/**
 * High-performance Touch Virtual Joystick for 360-degree mobile movement.
 */
export class VirtualJoystick {
  constructor(container = document.body) {
    this.container = container;
    this.value = new Vector2(0, 0); // x: -1..1 (left/right), y: -1..1 (down/up)
    this.isActive = false;
    this.pointerId = null;

    this.baseRadius = 55;
    this.knobRadius = 26;
    this.maxDistance = 50;

    this.origin = new Vector2(0, 0);
    this.current = new Vector2(0, 0);

    this._createDOM();
    this._bindEvents();
  }

  _createDOM() {
    this.zone = document.createElement('div');
    this.zone.className = 'virtual-joystick-zone';
    this.zone.setAttribute('aria-hidden', 'true');

    this.base = document.createElement('div');
    this.base.className = 'virtual-joystick-base';

    this.knob = document.createElement('div');
    this.knob.className = 'virtual-joystick-knob';

    this.base.appendChild(this.knob);
    this.zone.appendChild(this.base);
    this.container.appendChild(this.zone);

    // Initial hidden state
    this.base.style.display = 'none';
  }

  _bindEvents() {
    this.zone.addEventListener('pointerdown', this._onPointerDown, { passive: false });
    window.addEventListener('pointermove', this._onPointerMove, { passive: false });
    window.addEventListener('pointerup', this._onPointerUp, { passive: false });
    window.addEventListener('pointercancel', this._onPointerUp, { passive: false });
  }

  _onPointerDown = (e) => {
    if (this.isActive) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    this.pointerId = e.pointerId;
    this.isActive = true;

    const rect = this.zone.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    this.origin.set(touchX, touchY);
    this.current.set(touchX, touchY);
    this.value.set(0, 0);

    this.base.style.display = 'block';
    this.base.style.left = `${touchX}px`;
    this.base.style.top = `${touchY}px`;
    this.knob.style.transform = 'translate(-50%, -50%) translate3d(0, 0, 0)';
    this.base.classList.add('is-active');
  };

  _onPointerMove = (e) => {
    if (!this.isActive || e.pointerId !== this.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = this.zone.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    this.current.set(touchX, touchY);

    // Calculate displacement from origin
    const dx = this.current.x - this.origin.x;
    const dy = this.current.y - this.origin.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      this.value.set(0, 0);
      this.knob.style.transform = 'translate(-50%, -50%) translate3d(0, 0, 0)';
      return;
    }

    const clampedDist = Math.min(dist, this.maxDistance);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    this.knob.style.transform = `translate(-50%, -50%) translate3d(${knobX.toFixed(1)}px, ${knobY.toFixed(1)}px, 0)`;

    // Output normalized value: x (-1..1), y (-1..1 where +y is forward/up)
    const norm = clampedDist / this.maxDistance;
    this.value.set(
      (Math.cos(angle) * norm),
      -(Math.sin(angle) * norm) // invert y so up is positive forward
    );
  };

  _onPointerUp = (e) => {
    if (!this.isActive || e.pointerId !== this.pointerId) return;

    this.isActive = false;
    this.pointerId = null;
    this.value.set(0, 0);

    this.base.classList.remove('is-active');
    this.knob.style.transform = 'translate(-50%, -50%) translate3d(0, 0, 0)';
    this.base.style.display = 'none';
  };

  setVisible(visible) {
    this.zone.style.display = visible ? 'block' : 'none';
    if (!visible) {
      this.isActive = false;
      this.pointerId = null;
      this.value.set(0, 0);
      this.base.style.display = 'none';
      this.base.classList.remove('is-active');
    }
  }

  dispose() {
    this.zone.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerUp);
    this.zone.remove();
  }
}
