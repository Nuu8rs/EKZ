import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { createCube } from './geometry/cube.js';
import { createPyramid } from './geometry/pyramid.js';
import { createPrism } from './geometry/prism.js';
import { setupOverlay } from './ui/overlay.js';

let renderer, scene, camera;
let currentShape = 'cube';
let raycaster, mouse;
let plane; // Віртуальна підлога

init();

function init() {
  // 1. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 2. Scene and camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 1.6, 3);

  // 3. Освітлення
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(1, 2, 3);
  scene.add(light);

  // 4. Плоска "земля"
  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide });
  plane = new THREE.Mesh(groundGeometry, groundMaterial);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  // 5. Raycaster
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('click', onClick);
  window.addEventListener('resize', onWindowResize);

  setupOverlay(setShape);
  animate();
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(plane);

  if (intersects.length > 0) {
    const point = intersects[0].point;
    let object;
    switch (currentShape) {
      case 'cube': object = createCube(); break;
      case 'pyramid': object = createPyramid(); break;
      case 'prism': object = createPrism(); break;
    }
    object.position.copy(point);
    scene.add(object);
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setShape(shape) {
  currentShape = shape;
  console.log('🔁 Форма:', shape);
}