import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export function createPyramid(position) {
  const geometry = new THREE.ConeGeometry(0.4, 0.6, 4); 
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff44, // 💚 Зелений
    metalness: 0.3,
    roughness: 0.4,
  });
  const pyramid = new THREE.Mesh(geometry, material);
  pyramid.position.copy(position);
  pyramid.castShadow = true;
  return pyramid;
}