export function setupOverlay(setShape) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '10px';
  overlay.style.left = '10px';
  overlay.style.zIndex = '1';
  overlay.style.background = 'rgba(255, 255, 255, 0.8)';
  overlay.style.padding = '10px';
  overlay.style.borderRadius = '8px';

  const shapes = ['cube', 'pyramid', 'prism'];

  shapes.forEach(shape => {
    const btn = document.createElement('button');
    btn.innerText = shape;
    btn.style.margin = '0 5px';
    btn.onclick = () => setShape(shape);
    overlay.appendChild(btn);
  });

  document.body.appendChild(overlay);
}