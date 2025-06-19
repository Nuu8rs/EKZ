export async function initHitTest(session) {
    const viewerRefSpace = await session.requestReferenceSpace('viewer');
    const hitTestSource = await session.requestHitTestSource({ space: viewerRefSpace });
    return hitTestSource;
}