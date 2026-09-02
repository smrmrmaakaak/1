import { MeshStandardMaterial, DoubleSide } from 'three';

/**
 * AAA-Grade Ancient Glacier Comet Material with PBR Ice Reflections.
 */
export function createAvalancheMaterial(environment) {
  return new MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x0284c7,
    emissiveIntensity: 0.85,
    roughness: 0.1,
    metalness: 0.05,
    transparent: true,
    opacity: 0.92,
    side: DoubleSide,
    envMap: environment?.envMap || null,
    envMapIntensity: 2.5
  });
}
