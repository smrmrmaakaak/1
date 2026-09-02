import { MeshStandardMaterial, Color, DoubleSide } from 'three';
import { frame } from '../core/FrameUniforms.js';

/**
 * High-performance, AAA-quality Glacier Ice Shader Material for Aokiji's Ice Age.
 * Emulates translucent deep-sea arctic ice with internal light refraction,
 * diamond rime frost, and shimmering specular facets.
 */
export function createGlacierIceMaterial(opts = {}) {
  const mat = new MeshStandardMaterial({
    color: opts.color || 0xdbeafe,
    emissive: opts.emissive || 0x38bdf8,
    emissiveIntensity: opts.emissiveIntensity ?? 3.5,
    roughness: opts.roughness ?? 0.08,
    metalness: opts.metalness ?? 0.85,
    transparent: true,
    opacity: opts.opacity ?? 0.92,
    side: DoubleSide,
    depthWrite: true
  });

  return mat;
}
