export function showOverlayText(text) {
    const overlay = document.getElementById('overlay');
    overlay.textContent = text;
    overlay.style.display = 'block';
    setTimeout(() => overlay.style.display = 'none', 2000);
  }
  