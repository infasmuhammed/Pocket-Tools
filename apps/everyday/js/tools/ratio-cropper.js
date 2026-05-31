import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

const MAX_OUTPUT_SIDE = 2400;

function clamp(value, min, max) {
  if (max < min) return (min + max) / 2;
  return Math.min(max, Math.max(min, value));
}

let destroyRatioCropper = () => {};

export default {
  init() {
    destroyRatioCropper();

    const upload = document.getElementById('rc-upload');
    const ratioEl = document.getElementById('rc-ratio');
    const customWEl = document.getElementById('rc-custom-w');
    const customHEl = document.getElementById('rc-custom-h');
    const zoomEl = document.getElementById('rc-zoom');
    const zoomVal = document.getElementById('rc-zoom-val');
    const btnDownload = document.getElementById('rc-download');
    const btnReset = document.getElementById('rc-reset');
    const selectedEl = document.getElementById('rc-selected');
    const ratioLabelEl = document.getElementById('rc-ratio-label');
    const outputSizeEl = document.getElementById('rc-output-size');
    const emptyEl = document.getElementById('rc-empty');
    const stageEl = document.getElementById('rc-stage');
    const preview = document.getElementById('rc-preview');
    const previewCtx = preview.getContext('2d');
    const canvas = document.getElementById('rc-canvas');
    const ctx = canvas.getContext('2d');

    let image = null;
    let baseName = 'cropped';
    let targetW = 1200;
    let targetH = 1200;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let dragStart = null;

    const customGroups = [customWEl.closest('.input-group'), customHEl.closest('.input-group')];

    const ratio = () => {
      if (ratioEl.value !== 'custom') return Number(ratioEl.value);
      const w = Math.max(1, Number(customWEl.value) || 1);
      const h = Math.max(1, Number(customHEl.value) || 1);
      return w / h;
    };

    const updateTargetSize = () => {
      if (!image) {
        outputSizeEl.textContent = '-';
        return;
      }

      const targetRatio = ratio();
      const imageRatio = image.width / image.height;
      let cropW = image.width;
      let cropH = image.height;

      if (imageRatio > targetRatio) cropW = image.height * targetRatio;
      else cropH = image.width / targetRatio;

      const downscale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(cropW, cropH));
      targetW = Math.max(1, Math.round(cropW * downscale));
      targetH = Math.max(1, Math.round(cropH * downscale));
      outputSizeEl.textContent = `${targetW} x ${targetH}`;
    };

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

    const updateRatioLabel = () => {
      customGroups.forEach(group => group.classList.toggle('hidden', ratioEl.value !== 'custom'));
      if (ratioEl.value === 'custom') ratioLabelEl.textContent = `${customWEl.value || 1}:${customHEl.value || 1}`;
      else ratioLabelEl.textContent = ratioEl.options[ratioEl.selectedIndex].text.split(' - ').pop();
    };

    const render = () => {
      updateRatioLabel();
      updateTargetSize();
      zoomVal.textContent = `${Math.round(Number(zoomEl.value) * 100)}%`;
      if (!image) return;
      preview.width = targetW;
      preview.height = targetH;
      clampOffsets();
      drawTo(previewCtx, targetW, targetH);
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
        zoomEl.value = '1';
        updateTargetSize();
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

    const ratioChanged = () => {
      updateTargetSize();
      centerImage();
      render();
    };

    ratioEl.onchange = ratioChanged;
    customWEl.oninput = ratioChanged;
    customHEl.oninput = ratioChanged;
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

    destroyRatioCropper = () => {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };

    btnDownload.onclick = () => {
      if (!image) return UI.showError('Select an image first.');
      canvas.width = targetW;
      canvas.height = targetH;
      drawTo(ctx, targetW, targetH);
      canvas.toBlob((blob) => {
        if (!blob) return UI.showError('Could not export crop.');
        FileHelper.downloadBlob(`${baseName}-cropped.jpg`, blob);
      }, 'image/jpeg', 0.92);
    };

    render();
  },

  destroy() {
    destroyRatioCropper();
    destroyRatioCropper = () => {};
  }
};
