import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export function createPrism(position) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.4, 0);   
  shape.lineTo(0.2, 0.4);        
  shape.lineTo(0, 0);

  const extrudeSettings = { depth: 0.4, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff8800, 
    metalness: 0.3,
    roughness: 0.4,
  });
  const prism = new THREE.Mesh(geometry, material);
  prism.position.copy(position);
  prism.castShadow = true;
  return prism;
}