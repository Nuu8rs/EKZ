import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
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
let controls;
const keysPressed = {};

init();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(5, 10, 7.5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  scene.add(ambientLight, dirLight);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 2, 5);
  scene.add(camera);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0, 0);
  controls.update();

  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.2,
  });
  ground = new THREE.Mesh(planeGeometry, planeMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  scene.add(ground);

  const cursorGeo = new THREE.SphereGeometry(0.05, 16, 16);
  const cursorMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0x333300 });
  cursor = new THREE.Mesh(cursorGeo, cursorMat);
  cursor.visible = false;
  cursor.castShadow = true;
  scene.add(cursor);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', e => keysPressed[e.key.toLowerCase()] = true);
  document.addEventListener('keyup', e => keysPressed[e.key.toLowerCase()] = false);

  initUI();
  animate();
}

function updateMouseCoords(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
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
  if (event.target.closest('#overlay')) return;

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

function initUI() {
  const overlay = document.getElementById('overlay');
  const buttons = ['Куб', 'Піраміда', 'Призма'];
  const shapes = ['cube', 'pyramid', 'prism'];

  buttons.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.dataset.shape = shapes[i];

    btn.onclick = () => {
      currentShape = shapes[i];
      console.log('🔁 Обрана форма:', currentShape);
      [...overlay.children].forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };

    if (i === 0) btn.classList.add('active');
    overlay.appendChild(btn);
  });
}

function animate() {
  requestAnimationFrame(animate);

  const speed = 0.1;
  const dir = new THREE.Vector3();

  if (keysPressed['w']) dir.z -= 1;
  if (keysPressed['s']) dir.z += 1;
  if (keysPressed['a']) dir.x -= 1;
  if (keysPressed['d']) dir.x += 1;

  if (dir.lengthSq() > 0) {
    dir.normalize();
    const move = dir.clone().applyQuaternion(camera.quaternion);
    camera.position.addScaledVector(move, speed);
    controls.target.addScaledVector(move, speed);
  }

  if (camera.position.y < 1.2) {
    camera.position.y = 1.2;
  }

  controls.update();
  renderer.render(scene, camera);
}