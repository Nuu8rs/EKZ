import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { initXR } from './src/xr/session.js';
import { createCube } from './src/geometry/cube.js';
import { createPyramid } from './src/geometry/pyramid.js';
import { createPrism } from './src/geometry/prism.js';
import { showOverlayText } from './src/ui/overlay.js';
import { measureDistance } from './src/measurements/distance.js';

let renderer, scene, camera;
let currentShape = 'cube';
let shapes = [];

// Кнопка запуску AR
const startButton = document.createElement('button');
startButton.textContent = '▶️ Почати AR';
startButton.style.position = 'absolute';
startButton.style.top = '50%';
startButton.style.left = '50%';
startButton.style.transform = 'translate(-50%, -50%)';
startButton.style.padding = '20px 40px';
startButton.style.fontSize = '18px';
startButton.style.zIndex = '1000';
document.body.appendChild(startButton);

startButton.addEventListener('click', () => {
  startButton.remove();
  init();
});

function setupUI() {
  const shapeButtons = document.createElement('div');
  shapeButtons.style.position = 'absolute';
  shapeButtons.style.bottom = '10px';
  shapeButtons.style.left = '50%';
  shapeButtons.style.transform = 'translateX(-50%)';
  shapeButtons.style.zIndex = '999';
  shapeButtons.innerHTML = `
    <button id="cube">🟥 Куб</button>
    <button id="pyramid">🔺 Піраміда</button>
    <button id="prism">🟦 Призма</button>
    <button id="distance">📏 Вимір</button>
  `;
  document.body.appendChild(shapeButtons);

  document.getElementById('cube').onclick = () => currentShape = 'cube';
  document.getElementById('pyramid').onclick = () => currentShape = 'pyramid';
  document.getElementById('prism').onclick = () => currentShape = 'prism';
  document.getElementById('distance').onclick = () => {
    if (shapes.length >= 2) {
      const d = measureDistance(shapes[shapes.length - 2].position, shapes[shapes.length - 1].position);
      showOverlayText(`Відстань: ${d.toFixed(2)} м`);
    } else {
      showOverlayText('Недостатньо фігур для вимірювання');
    }
  };
}

async function init() {
  setupUI();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const { hitTestSource } = await initXR(renderer, scene, camera);

  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    const frame = renderer.xr.getFrame();
    const refSpace = renderer.xr.getReferenceSpace();
    const hitTestResults = frame.getHitTestResults(hitTestSource);

    if (hitTestResults.length > 0) {
      const hit = hitTestResults[0];
      const pose = hit.getPose(refSpace);
      const pos = new THREE.Vector3().fromArray(pose.transform.position.toArray());

      let shape;
      if (currentShape === 'cube') shape = createCube(pos);
      if (currentShape === 'pyramid') shape = createPyramid(pos);
      if (currentShape === 'prism') shape = createPrism(pos);

      scene.add(shape);
      shapes.push(shape);

      showOverlayText(`${currentShape.charAt(0).toUpperCase() + currentShape.slice(1)} додано!`);
    }
  });

  scene.add(controller);
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
}
