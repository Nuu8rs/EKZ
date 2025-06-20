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
  // === РЕНДЕР ===
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // === СЦЕНА ===
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(5, 10, 7.5);
  dirLight.castShadow = true;
  scene.add(ambientLight, dirLight);

  // === КАМЕРА ===
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 2, 5);
  scene.add(camera);

  // === УПРАВЛЕНИЕ ===
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // === ПЛОСКОСТЬ С РЕЛЬЕФОМ ===
  const size = 20;
  const segments = 128;
  const planeGeometry = new THREE.PlaneGeometry(size, size, segments, segments);

  for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
    const x = planeGeometry.attributes.position.getX(i);
    const y = planeGeometry.attributes.position.getY(i);
    const elevation = 0.5 * Math.sin(x * 0.6) * Math.cos(y * 0.6);
    planeGeometry.attributes.position.setZ(i, elevation);
  }
  planeGeometry.computeVertexNormals();

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

  // === ОСИ В ЦЕНТРЕ ===
  const axesHelper = new THREE.AxesHelper(3);
  axesHelper.position.set(0, 0.01, 0); // чуть над поверхностью

  // === КУРСОР ===
  const cursorGeo = new THREE.SphereGeometry(0.05, 16, 16);
  const cursorMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  cursor = new THREE.Mesh(cursorGeo, cursorMat);
  cursor.visible = false;
  scene.add(cursor);

  // === ИНСТРУМЕНТЫ ===
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', e => keysPressed[e.key.toLowerCase()] = true);
  document.addEventListener('keyup', e => keysPressed[e.key.toLowerCase()] = false);

  createOverlayUI();
  createInfoPanel();
  animate();
}

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(ground);
  if (intersects.length > 0) {
    cursor.position.copy(intersects[0].point);
    cursor.visible = true;
  } else {
    cursor.visible = false;
  }
}

function onClick(event) {
  if (event.target.closest('#overlay')) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(ground);
  if (intersects.length === 0) return;
  const point = intersects[0].point;

  const objects = scene.children.filter(o => o.geometry && o !== ground && o !== cursor);
  const picked = raycaster.intersectObjects(objects);

  if (picked.length > 0) {
    const obj = picked[0].object;

    if (!selectedObjects.includes(obj)) {
      selectedObjects.push(obj);
      obj.material.emissive = new THREE.Color(0x2222ff);
    }

    if (selectedObjects.length === 1) {
      updateInfoPanel(`📌 Координати:\n${vectorText(obj.position)}`);
    }

    if (selectedObjects.length === 2) {
      const [a, b] = selectedObjects;
      const d = measureDistance(a.position, b.position).toFixed(2);
      const angle = measureAngle(
        a.position.clone().normalize(),
        b.position.clone().normalize()
      ).toFixed(2);

      updateInfoPanel(
        `📌 A:\n${vectorText(a.position)}\n\n📌 B:\n${vectorText(b.position)}\n\n📏 Відстань: ${d} м\n🔺 Кут: ${angle}°`
      );

      selectedObjects.forEach(o => o.material.emissive.set(0x000000));
      selectedObjects = [];
    }

    return;
  }

  // Добавляем фигуру
  let obj;
  switch (currentShape) {
    case 'cube': obj = createCube(point); break;
    case 'pyramid': obj = createPyramid(point); break;
    case 'prism': obj = createPrism(point); break;
  }
  scene.add(obj);
  updateInfoPanel(`🧱 Додано об'єкт: ${currentShape}\n${vectorText(obj.position)}`);
}

function vectorText(pos) {
  return `x: ${pos.x.toFixed(2)}\ny: ${pos.y.toFixed(2)}\nz: ${pos.z.toFixed(2)}`;
}

function createOverlayUI() {
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.style.position = 'absolute';
  overlay.style.bottom = '25px';
  overlay.style.left = '50%';
  overlay.style.transform = 'translateX(-50%)';
  overlay.style.zIndex = '10';
  overlay.style.display = 'flex';
  overlay.style.gap = '16px';
  document.body.appendChild(overlay);

  const buttons = ['Куб', 'Піраміда', 'Призма'];
  const shapes = ['cube', 'pyramid', 'prism'];
  buttons.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.dataset.shape = shapes[i];

    // Стили для кнопок
    Object.assign(btn.style, {
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
      borderRadius: '10px',
      border: '1px solid #336699',
      backgroundColor: 'rgba(0, 51, 102, 0.4)',
      color: '#cce6ff',
      transition: 'all 0.3s ease',
    });

    // Наведение
    btn.onmouseenter = () => {
      btn.style.backgroundColor = 'rgba(0, 51, 102, 0.8)';
    };
    btn.onmouseleave = () => {
      btn.style.backgroundColor = 'rgba(0, 51, 102, 0.4)';
    };

    btn.onclick = () => {
      currentShape = shapes[i];
    };
    overlay.appendChild(btn);
  });
}

function createInfoPanel() {
  const panel = document.createElement('div');
  panel.id = 'infoPanel';
  panel.style.position = 'absolute';
  panel.style.right = '10px';
  panel.style.top = '10px';
  panel.style.background = 'rgba(25, 35, 121, 0.6)';
  panel.style.color = 'white';
  panel.style.padding = '10px';
  panel.style.maxWidth = '240px';
  panel.style.fontFamily = 'monospace';
  panel.style.fontSize = '14px';
  panel.style.borderRadius = '8px';
  panel.style.whiteSpace = 'pre';
  document.body.appendChild(panel);
}

function updateInfoPanel(text) {
  document.getElementById('infoPanel').innerText = text;
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
  if (camera.position.y < 1.2) camera.position.y = 1.2;

  controls.update();
  renderer.render(scene, camera);
}