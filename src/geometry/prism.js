import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export function createPrism(position) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.2, 0);
  shape.lineTo(0.1, 0.2);
  shape.lineTo(0, 0);

  const extrudeSettings = { depth: 0.2, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const prism = new THREE.Mesh(geometry, material);
  prism.position.copy(position);
  return prism;
}