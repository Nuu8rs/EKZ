import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export function createCube(position) {
  const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00aaff, // 💙 Блакитний
    metalness: 0.3,
    roughness: 0.4,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  cube.castShadow = true;
  return cube;
}