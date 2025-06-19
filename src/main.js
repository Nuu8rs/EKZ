import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { createCube } from './geometry/cube.js';
import { createPyramid } from './geometry/pyramid.js';
import { createPrism } from './geometry/prism.js';
import { measureDistance } from './measurements/distance.js';
import { measureAngle } from './measurements/angle.js';

let scene, camera, renderer;
let raycaster, mouse, ground, cursor;
let currentShape = 'cube';
let copiedObject = null;
let selectedObjects = [];

init();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 2, 5);
  scene.add(camera);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x008800, side: THREE.DoubleSide });
  ground = new THREE.Mesh(planeGeometry, planeMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const cursorGeo = new THREE.SphereGeometry(0.05, 16, 16);
  const cursorMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  cursor = new THREE.Mesh(cursorGeo, cursorMat);
  cursor.visible = false;
  scene.add(cursor);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('click', onClick);

  createUI();

  animate();
}

function onPointerMove(event) {
  updateMouseCoords(event);
  const intersects = raycaster.intersectObject(ground);
  if (intersects.length > 0) {
    cursor.visible = true;
    cursor.position.copy(intersects[0].point);
  } else {
    cursor.visible = false;
  }
}

function onClick(event) {
  updateMouseCoords(event);
  const intersects = raycaster.intersectObject(ground);
  if (intersects.length === 0) return;

  const point = intersects[0].point;

  if (copiedObject) {
    const clone = copiedObject.clone();
    clone.position.copy(point);
    scene.add(clone);
    copiedObject = null;
    return;
  }

  // Выбор объекта
  raycaster.setFromCamera(mouse, camera);
  const objects = scene.children.filter(o => o.geometry && o !== ground && o !== cursor);
  const picked = raycaster.intersectObjects(objects);

  if (picked.length > 0) {
    const obj = picked[0].object;
    if (!selectedObjects.includes(obj)) {
      selectedObjects.push(obj);
      obj.material.emissive = new THREE.Color(0x2222ff);
    }

    if (selectedObjects.length === 2) {
      const [a, b] = selectedObjects;
      const d = measureDistance(a.position, b.position).toFixed(2);
      const angle = measureAngle(a.position.clone().normalize(), b.position.clone().normalize()).toFixed(2);
      alert(`Відстань: ${d} м\nКут: ${angle}°`);
      selectedObjects.forEach(o => o.material.emissive.set(0x000000));
      selectedObjects = [];
    }
    return;
  }

  let obj;
  switch (currentShape) {
    case 'cube': obj = createCube(point); break;
    case 'pyramid': obj = createPyramid(point); break;
    case 'prism': obj = createPrism(point); break;
  }
  scene.add(obj);
}

function updateMouseCoords(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
}

function createUI() {
  const buttons = ['cube', 'pyramid', 'prism'];
  const ui = document.createElement('div');
  ui.style.position = 'absolute';
  ui.style.top = '10px';
  ui.style.left = '10px';
  ui.style.background = 'rgba(0,0,0,0.5)';
  ui.style.color = 'white';
  ui.style.padding = '10px';
  ui.style.zIndex = '10';

  buttons.forEach(shape => {
    const btn = document.createElement('button');
    btn.textContent = shape;
    btn.style.marginRight = '5px';
    btn.onclick = () => {
      currentShape = shape;
      console.log('🔁 Форма:', shape);
    };
    ui.appendChild(btn);
  });

  document.body.appendChild(ui);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}