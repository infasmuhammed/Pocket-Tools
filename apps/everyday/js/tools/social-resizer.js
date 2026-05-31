import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

function clamp(value, min, max) {
  if (max < min) return (min + max) / 2;
  return Math.min(max, Math.max(min, value));
}

let destroySocialResizer = () => {};

export default {
  init() {
    destroySocialResizer();

    const upload = document.getElementById('sr-upload');
    const presetEl = document.getElementById('sr-preset');
    const zoomEl = document.getElementById('sr-zoom');
    const zoomVal = document.getElementById('sr-zoom-val');
    const btnDownload = document.getElementById('sr-download');
    const btnReset = document.getElementById('sr-reset');
    const selectedEl = document.getElementById('sr-selected');
    const outputSizeEl = document.getElementById('sr-output-size');
    const emptyEl = document.getElementById('sr-empty');
    const stageEl = document.getElementById('sr-stage');
    const preview = document.getElementById('sr-preview');
    const previewCtx = preview.getContext('2d');
    const canvas = document.getElementById('sr-canvas');
    const ctx = canvas.getContext('2d');

    let image = null;
    let baseName = 'resized';
    let targetW = 1080;
    let targetH = 1080;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let dragStart = null;

    const scale = () => Math.max(targetW / image.width, targetH / image.height) * Number(zoomEl.value);

    const bounds = () => {
      const drawW = image.width * scale();
      const drawH = image.height * scale();
      return {
        drawW,
        drawH,
        minX: Math.min(0, targetW - drawW),
        maxX: 0,
        minY: Math.min(0, targetH - drawH),
        maxY: 0,
      };
    };

    const clampOffsets = () => {
      if (!image) return;
      const b = bounds();
      offsetX = clamp(offsetX, b.minX, b.maxX);
      offsetY = clamp(offsetY, b.minY, b.maxY);
    };

    const centerImage = () => {
      if (!image) return;
      const b = bounds();
      offsetX = (targetW - b.drawW) / 2;
      offsetY = (targetH - b.drawH) / 2;
      clampOffsets();
    };

    const drawTo = (targetCtx, width, height) => {
      if (!image) return;
      targetCtx.clearRect(0, 0, width, height);
      targetCtx.fillStyle = '#ffffff';
      targetCtx.fillRect(0, 0, width, height);
      targetCtx.drawImage(image, offsetX, offsetY, image.width * scale(), image.height * scale());
    };

    const render = () => {
      outputSizeEl.textContent = `${targetW} x ${targetH}`;
      zoomVal.textContent = `${Math.round(Number(zoomEl.value) * 100)}%`;
      if (!image) return;
      preview.width = targetW;
      preview.height = targetH;
      clampOffsets();
      drawTo(previewCtx, targetW, targetH);
    };

    const readPreset = () => {
      const [w, h] = presetEl.value.split('x').map(Number);
      targetW = w;
      targetH = h;
    };

    const point = (event) => {
      const rect = preview.getBoundingClientRect();
      const source = event.touches ? event.touches[0] : event;
      return {
        x: (source.clientX - rect.left) * (targetW / rect.width),
        y: (source.clientY - rect.top) * (targetH / rect.height),
      };
    };

    upload.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const v = FileHelper.validateImage(file);
      if (!v.ok) {
        upload.value = '';
        return UI.showError(v.error);
      }

      try {
        image = await FileHelper.loadImage(file);
        baseName = file.name.replace(/\.[^/.]+$/, '');
        selectedEl.textContent = file.name;
        emptyEl.classList.add('hidden');
        stageEl.classList.remove('hidden');
        btnDownload.disabled = false;
        readPreset();
        zoomEl.value = '1';
        centerImage();
        render();
      } catch (err) {
        console.error(err);
        image = null;
        selectedEl.textContent = 'None';
        btnDownload.disabled = true;
        UI.showError(err.message || 'Could not load image.');
      }
    };

    presetEl.onchange = () => {
      readPreset();
      centerImage();
      render();
    };

    zoomEl.oninput = () => {
      centerImage();
      render();
    };

    btnReset.onclick = () => {
      centerImage();
      render();
    };

    preview.addEventListener('mousedown', (event) => {
      if (!image) return;
      event.preventDefault();
      dragging = true;
      dragStart = { point: point(event), offsetX, offsetY };
    });

    preview.addEventListener('mousemove', (event) => {
      if (!dragging || !image) return;
      event.preventDefault();
      const p = point(event);
      offsetX = dragStart.offsetX + (p.x - dragStart.point.x);
      offsetY = dragStart.offsetY + (p.y - dragStart.point.y);
      render();
    });

    const stopDragging = () => { dragging = false; };
    window.addEventListener('mouseup', stopDragging);
    preview.addEventListener('touchstart', (event) => {
      if (!image) return;
      event.preventDefault();
      dragging = true;
      dragStart = { point: point(event), offsetX, offsetY };
    }, { passive: false });
    preview.addEventListener('touchmove', (event) => {
      if (!dragging || !image) return;
      event.preventDefault();
      const p = point(event);
      offsetX = dragStart.offsetX + (p.x - dragStart.point.x);
      offsetY = dragStart.offsetY + (p.y - dragStart.point.y);
      render();
    }, { passive: false });
    window.addEventListener('touchend', stopDragging);

    destroySocialResizer = () => {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };

    btnDownload.onclick = () => {
      if (!image) return UI.showError('Select an image first.');
      canvas.width = targetW;
      canvas.height = targetH;
      drawTo(ctx, targetW, targetH);
      canvas.toBlob((blob) => {
        if (!blob) return UI.showError('Could not export image.');
        FileHelper.downloadBlob(`${baseName}-${presetEl.value}.jpg`, blob);
      }, 'image/jpeg', 0.9);
    };

    readPreset();
    render();
  },

  destroy() {
    destroySocialResizer();
    destroySocialResizer = () => {};
  }
};
