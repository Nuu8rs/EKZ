import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { initXR } from '.src/xr/session.js';
import { createCube } from '.src/geometry/cube.js';
import { createPyramid } from '.src/geometry/pyramid.js';
import { createPrism } from '.src/geometry/prism.js';
import { setupOverlay } from '.src/ui/overlay.js';

let renderer, scene, camera;
let hitTestSource = null;
let referenceSpace = null;
let currentShape = 'cube';

async function init() {
  console.log('🔧 XR init start');

  // 1. Setup renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // 2. Setup scene and camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

  // 3. XR session
  try {
    const { hitTestSource: hts, referenceSpace: rs } = await initXR(renderer, scene, camera);
    hitTestSource = hts;
    referenceSpace = rs;
    console.log('✅ XR session ready');
  } catch (err) {
    alert('XR помилка: ' + err.message);
    return;
  }

  // 4. Touch listener for placing objects
  document.body.addEventListener('click', () => {
    if (!lastHitPose) return;
    let object;
    switch (currentShape) {
      case 'cube': object = createCube(); break;
      case 'pyramid': object = createPyramid(); break;
      case 'prism': object = createPrism(); break;
    }
    object.position.copy(lastHitPose);
    scene.add(object);
  });

  setupOverlay(setShape); // setup UI overlay
  renderer.setAnimationLoop(render);
}

let lastHitPose = null;

function render(timestamp, frame) {
  if (frame) {
    const viewerPose = frame.getViewerPose(referenceSpace);
    if (viewerPose && hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const pose = hitTestResults[0].getPose(referenceSpace);
        lastHitPose = new THREE.Vector3(
          pose.transform.position.x,
          pose.transform.position.y,
          pose.transform.position.z
        );
      }
    }
  }
  renderer.render(scene, camera);
}

function setShape(shape) {
  currentShape = shape;
  console.log('🔁 shape switched to:', shape);
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-btn')?.addEventListener('click', init);
});