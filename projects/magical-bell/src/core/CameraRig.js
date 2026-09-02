import { PerspectiveCamera, Vector3, MathUtils, MOUSE, TOUCH } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { settings } from '../config/settings.js';
import { clamp, damp } from '../utils/math.js';
import { LAYER } from './Layers.js';

const _dir = new Vector3();
const _desiredTarget = new Vector3();

/**
 * Third-person multi-touch orbit rig.
 * - Multi-touch simultaneous support (Left Joystick + Right Camera Orbit + Pinch Zoom)
 * - Desktop: Right-drag for orbit rotation, Wheel for zoom
 * - Mobile: 1-finger drag for 360 orbit rotation, 2-finger pinch for smooth zoom
 */
export class CameraRig {
  constructor(domElement) {
    this.camera = new PerspectiveCamera(
      settings.camera.fov,
      window.innerWidth / window.innerHeight,
      0.05, // Lower near plane for 1st person view
      2000 // Extended far plane for massive open world
    );
    this.camera.position.set(-6.5, 6.0, 9.5);
    this.camera.layers.enable(LAYER.VFX);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.enablePan = false;
    this.controls.enableZoom = false; // Custom managed smooth zoom
    this.controls.minPolarAngle = settings.camera.minPolar;
    this.controls.maxPolarAngle = settings.camera.maxPolar;
    this.controls.rotateSpeed = 0.85;

    // Desktop controls
    this.controls.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: MOUSE.ROTATE };
    // Disable default OrbitControls touch handling so our custom multi-touch gesture engine manages it flawlessly
    this.controls.touches = { ONE: null, TWO: null };

    this.anchor = new Vector3(0, 0, 0); // character
    this.focus = new Vector3(0, 0, 0); // ability focus point
    this.focusWeight = 0;
    this.shakeOffset = new Vector3();
    this.shakeRoll = 0;
    this.isFirstPerson = false;
    this.onFirstPersonChange = null;

    this.controls.target.set(0, settings.camera.targetHeight, 0);
    this.controls.update();

    this.distance = settings.camera.distance;
    this.domElement = domElement;

    // Multi-Touch Gesture Engine
    this.touchPointers = new Map();
    this.initialPinchDistance = null;
    this.initialCameraDistance = null;

    this._onWheel = this._onWheel.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onTouchPointerDown = this._onTouchPointerDown.bind(this);
    this._onTouchPointerMove = this._onTouchPointerMove.bind(this);
    this._onTouchPointerUp = this._onTouchPointerUp.bind(this);

    domElement.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('wheel', this._onWheel, { passive: false });
    domElement.addEventListener('contextmenu', this._onContextMenu);
    window.addEventListener('contextmenu', this._onContextMenu);

    window.addEventListener('pointerdown', this._onTouchPointerDown, { passive: false });
    window.addEventListener('pointermove', this._onTouchPointerMove, { passive: false });
    window.addEventListener('pointerup', this._onTouchPointerUp, { passive: false });
    window.addEventListener('pointercancel', this._onTouchPointerUp, { passive: false });
  }

  _onContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  /** Multi-touch pointer handlers */
  _onTouchPointerDown(e) {
    if (e.pointerType !== 'touch') return;

    // Skip if it's the virtual joystick pointer
    if (window.app?.joystick?.isActive && window.app.joystick.pointerId === e.pointerId) {
      return;
    }

    // Skip if clicked on UI buttons or dialogs
    if (e.target && typeof e.target.closest === 'function') {
      if (e.target.closest('button, input, textarea, #dev-room-ui, .rpg-modal-window, .mobile-controls-pad, .rpg-menu-buttons, .rpg-player-frame, .rpg-minimap-frame, .rpg-quest-tracker')) {
        return;
      }
    }

    this.touchPointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY
    });

    if (this.touchPointers.size === 2) {
      const [p1, p2] = Array.from(this.touchPointers.values());
      this.initialPinchDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      this.initialCameraDistance = settings.camera.distance;
    }
  }

  _onTouchPointerMove(e) {
    if (e.pointerType !== 'touch') return;
    if (!this.touchPointers.has(e.pointerId)) return;

    const touch = this.touchPointers.get(e.pointerId);
    const dx = e.clientX - touch.x;
    const dy = e.clientY - touch.y;
    touch.x = e.clientX;
    touch.y = e.clientY;

    if (this.touchPointers.size === 1) {
      // Natural Touch Camera Orbit (Dragging Right rotates Right, Dragging Up tilts Up)
      const rotSpeed = this.controls.rotateSpeed || 0.85;
      const angleX = (dx / window.innerWidth) * Math.PI * 2.2 * rotSpeed;
      const angleY = (dy / window.innerHeight) * Math.PI * 1.6 * rotSpeed;

      this.controls.rotateLeft(angleX);
      this.controls.rotateUp(angleY);
      this.controls.update();
    } else if (this.touchPointers.size === 2) {
      // 2-Finger Touch Pinch Zoom
      const [p1, p2] = Array.from(this.touchPointers.values());
      const currentPinch = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      if (this.initialPinchDistance && this.initialPinchDistance > 10 && currentPinch > 10) {
        const ratio = this.initialPinchDistance / currentPinch;
        settings.camera.distance = clamp(this.initialCameraDistance * ratio, 0.1, 75.0);
      }
    }
  }

  _onTouchPointerUp(e) {
    if (e.pointerType !== 'touch') return;
    this.touchPointers.delete(e.pointerId);

    if (this.touchPointers.size < 2) {
      this.initialPinchDistance = null;
      this.initialCameraDistance = null;
    }
  }

  /** Smooth Free Wheel zoom (supports 1st-person POV to ultra-wide 3rd-person) */
  _onWheel(event) {
    event.preventDefault();

    const cam = settings.camera;
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
    const delta = MathUtils.clamp((event.deltaY * scale) / 100, -6, 6);

    // Multiplicative zoom with clamped step (0.1m 1st-person ~ 75.0m 3rd-person)
    cam.distance = clamp(
      cam.distance * Math.exp(delta * 0.12 * (cam.zoomSpeed || 1.0)),
      0.1,
      75.0
    );
  }

  /** Point the rig should orbit around (character position). */
  setAnchor(x, y, z) {
    this.anchor.set(x, y, z);
  }

  /** Nudge the look-at point toward an ability. `weight` 0..1, decays on its own. */
  lookAt(point, weight = 1) {
    this.focus.copy(point);
    this.focusWeight = Math.max(this.focusWeight, weight);
  }

  update(dt) {
    const cam = settings.camera;

    if (this.camera.fov !== cam.fov) {
      this.camera.fov = cam.fov;
      this.camera.updateProjectionMatrix();
    }
    this.controls.minPolarAngle = cam.minPolar;
    this.controls.maxPolarAngle = cam.maxPolar;

    // Smoothly ease distance towards target setting
    this.distance = MathUtils.damp(this.distance, cam.distance, 12.0, dt);

    // 1st Person POV Check (< 2.4m) vs 3rd Person View
    const targetIsFirstPerson = this.distance < 2.4;
    if (this.isFirstPerson !== targetIsFirstPerson) {
      this.isFirstPerson = targetIsFirstPerson;
      this.onFirstPersonChange?.(this.isFirstPerson);
    }

    const effectiveTargetHeight = this.isFirstPerson ? 1.65 : (cam.targetHeight || 1.2);

    // Calculate desired look-at target from character anchor
    _desiredTarget.set(this.anchor.x, this.anchor.y + effectiveTargetHeight, this.anchor.z);
    if (this.focusWeight > 0.001) {
      _desiredTarget.lerp(this.focus, this.focusWeight * 0.35);
    }

    // Smoothly interpolate target and camera position together
    const targetDeltaX = _desiredTarget.x - this.controls.target.x;
    const targetDeltaY = _desiredTarget.y - this.controls.target.y;
    const targetDeltaZ = _desiredTarget.z - this.controls.target.z;

    const followSpeed = Math.min(1.0, 16.0 * dt);
    const moveX = targetDeltaX * followSpeed;
    const moveY = targetDeltaY * followSpeed;
    const moveZ = targetDeltaZ * followSpeed;

    this.controls.target.x += moveX;
    this.controls.target.y += moveY;
    this.controls.target.z += moveZ;

    this.camera.position.x += moveX;
    this.camera.position.y += moveY;
    this.camera.position.z += moveZ;

    // Enforce smooth orbital distance along viewpoint ray
    _dir.subVectors(this.camera.position, this.controls.target);
    const currentDist = _dir.length();
    if (currentDist > 0.0001) {
      _dir.normalize();
      const finalDist = Math.max(0.08, this.distance);
      this.camera.position.copy(this.controls.target).addScaledVector(_dir, finalDist);
    }

    this.focusWeight = Math.max(0, this.focusWeight - dt * 2.0);

    this.controls.update();

    // Camera shake is additive and applied after the controls have settled.
    if (this.shakeOffset.lengthSq() > 0) {
      this.camera.position.add(this.shakeOffset);
      this.camera.rotateZ(this.shakeRoll);
    }
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.domElement.removeEventListener('wheel', this._onWheel);
    this.domElement.removeEventListener('contextmenu', this._onContextMenu);
    window.removeEventListener('contextmenu', this._onContextMenu);
    window.removeEventListener('pointerdown', this._onTouchPointerDown);
    window.removeEventListener('pointermove', this._onTouchPointerMove);
    window.removeEventListener('pointerup', this._onTouchPointerUp);
    window.removeEventListener('pointercancel', this._onTouchPointerUp);
    this.controls.dispose();
  }
}
