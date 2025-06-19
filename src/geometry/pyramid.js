import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export function createPyramid(position) {
  const geometry = new THREE.ConeGeometry(0.2, 0.3, 4);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const pyramid = new THREE.Mesh(geometry, material);
  pyramid.position.copy(position);
  return pyramid;
}