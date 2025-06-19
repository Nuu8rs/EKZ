export function setupOverlay(setShapeCallback) {
  // Создадим панель с кнопками для выбора фигуры
  const panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.bottom = '20px';
  panel.style.left = '50%';
  panel.style.transform = 'translateX(-50%)';
  panel.style.background = 'rgba(0,0,0,0.5)';
  panel.style.padding = '10px 20px';
  panel.style.borderRadius = '10px';
  panel.style.display = 'flex';
  panel.style.gap = '10px';

  ['cube', 'pyramid', 'prism'].forEach(shape => {
    const btn = document.createElement('button');
    btn.textContent = shape;
    btn.style.color = 'white';
    btn.style.background = '#333';
    btn.style.border = 'none';
    btn.style.padding = '10px';
    btn.style.borderRadius = '5px';
    btn.style.cursor = 'pointer';

    btn.onclick = () => {
      setShapeCallback(shape);
    };

    panel.appendChild(btn);
  });

  document.body.appendChild(panel);
}