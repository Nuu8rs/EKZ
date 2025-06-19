import { initHitTest } from './hit-test.js';

export async function initXR(renderer, scene, camera) {
  const session = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test', 'local-floor']
  });

  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local-floor');
  await renderer.xr.setSession(session);

  const hitTestSource = await initHitTest(session);

  return { session, hitTestSource };
}
