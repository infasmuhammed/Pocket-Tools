import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

let destroySignature = () => {};

export default {
  init() {
    destroySignature();

    const canvas = document.getElementById('sig-canvas');
    const sizeEl = document.getElementById('sig-size');
    const colorEl = document.getElementById('sig-color');
    const btnClear = document.getElementById('sig-clear');
    const btnDownload = document.getElementById('sig-download');
    const ctx = canvas.getContext('2d');

    let drawing = false;
    let hasInk = false;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const snapshot = document.createElement('canvas');
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext('2d').drawImage(canvas, 0, 0);

      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.floor(220 * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = '220px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (snapshot.width && snapshot.height) ctx.drawImage(snapshot, 0, 0, rect.width, 220);
    };

    const point = (event) => {
      const rect = canvas.getBoundingClientRect();
      const source = event.touches ? event.touches[0] : event;
      return { x: source.clientX - rect.left, y: source.clientY - rect.top };
    };

    const start = (event) => {
      event.preventDefault();
      drawing = true;
      const p = point(event);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };

    const move = (event) => {
      if (!drawing) return;
      event.preventDefault();
      const p = point(event);
      ctx.strokeStyle = colorEl.value;
      ctx.lineWidth = Number(sizeEl.value);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      hasInk = true;
    };

    const stop = () => { drawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', stop);
    window.addEventListener('resize', resize);

    destroySignature = () => {
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
      window.removeEventListener('resize', resize);
    };

    btnClear.onclick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
    };

    btnDownload.onclick = () => {
      if (!hasInk) return UI.showError('Draw a signature first.');
      canvas.toBlob((blob) => {
        if (!blob) return UI.showError('Could not export signature.');
        FileHelper.downloadBlob('signature.png', blob);
      }, 'image/png');
    };

    resize();
  },

  destroy() {
    destroySignature();
    destroySignature = () => {};
  }
};
