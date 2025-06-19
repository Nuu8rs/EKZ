import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

export async function initXR(renderer, scene, camera) {
  if (!navigator.xr) {
    alert('WebXR не підтримується на цьому пристрої або браузері');
    throw new Error('WebXR not supported');
  }

  const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
  if (!isSupported) {
    alert('immersive-ar не підтримується на цьому пристрої або браузері');
    throw new Error('immersive-ar not supported');
  }

  // Основні параметри
  const options = {
    requiredFeatures: ['hit-test', 'local-floor'],
    optionalFeatures: ['dom-overlay'],
    domOverlay: { root: document.body }
  };

  let session;
  try {
    session = await navigator.xr.requestSession('immersive-ar', options);
  } catch (e) {
    console.warn('⚠️ Не вдалося створити XR-сесію з domOverlay. Спроба без нього...', e);
    delete options.domOverlay;
    options.optionalFeatures = options.optionalFeatures.filter(f => f !== 'dom-overlay');
    session = await navigator.xr.requestSession('immersive-ar', options);
  }

  renderer.xr.setReferenceSpaceType('local-floor');
  await renderer.xr.setSession(session);

  const referenceSpace = await session.requestReferenceSpace('local-floor');
  const viewerSpace = await session.requestReferenceSpace('viewer');
  const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

  return { hitTestSource, referenceSpace };
}