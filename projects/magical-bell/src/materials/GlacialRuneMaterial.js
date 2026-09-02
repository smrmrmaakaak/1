import { MeshBasicMaterial, DoubleSide, AdditiveBlending } from 'three';

/**
 * Robust Glacial Rune & Summoning Matrix Material.
 */
export function createGlacialRuneMaterial() {
  return new MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85,
    blending: AdditiveBlending,
    side: DoubleSide,
    depthWrite: false
  });
}
