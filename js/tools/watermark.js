import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export default {
  init() {
    const upload = document.getElementById('wm-upload');
    const textEl = document.getElementById('wm-text');
    const posEl = document.getElementById('wm-pos');
    const colorEl = document.getElementById('wm-color');
    const sizeEl = document.getElementById('wm-size');
    const sizeVal = document.getElementById('wm-size-val');
    const opacityEl = document.getElementById('wm-opacity');
    const opacityVal = document.getElementById('wm-opacity-val');
    const formatEl = document.getElementById('wm-format');
    const btnDownload = document.getElementById('wm-download');
    const canvas = document.getElementById('wm-canvas');
    const status = document.getElementById('wm-file-status');
    const ctx = canvas.getContext('2d');

    let img = null;
    let baseName = 'watermarked';

    const render = () => {
      sizeVal.textContent = Number(sizeEl.value).toFixed(Number(sizeEl.value) % 1 ? 1 : 0) + '%';
      opacityVal.textContent = Math.round(Number(opacityEl.value) * 100) + '%';
      if (!img) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const text = textEl.value.trim();
      if (!text) return;

      const fontSize = Math.max(12, Math.round(canvas.width * (Number(sizeEl.value) / 100)));
      const padding = Math.round(fontSize * 1.2);
      ctx.save();
      ctx.globalAlpha = Number(opacityEl.value);
      ctx.font = '700 ' + fontSize + 'px sans-serif';
      ctx.fillStyle = colorEl.value;
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(text);
      let x;
      let y;
      if (posEl.value.includes('left')) x = padding;
      else if (posEl.value.includes('right')) x = canvas.width - metrics.width - padding;
      else x = (canvas.width - metrics.width) / 2;

      if (posEl.value.includes('top')) y = padding + fontSize / 2;
      else if (posEl.value.includes('bottom')) y = canvas.height - padding - fontSize / 2;
      else y = canvas.height / 2;

      ctx.fillText(text, Math.max(padding / 2, x), y);
      ctx.restore();
    };

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = FileHelper.validateImage(file);
      if (!v.ok) { upload.value = ''; return UI.showError(v.error); }
      try {
        img = await FileHelper.loadImage(file);
        baseName = file.name.replace(/\.[^/.]+$/, '');
        status.textContent = file.name + ' selected.';
        render();
      } catch (err) {
        img = null;
        upload.value = '';
        status.textContent = 'No image selected yet.';
        UI.showError(err.message || 'Could not load image.');
      }
    };

    [textEl, posEl, colorEl, sizeEl, opacityEl, formatEl].forEach((el) => el.addEventListener('input', render));
    posEl.addEventListener('change', render);

    btnDownload.onclick = () => {
      if (!img) return UI.showError('Select an image first.');
      render();
      const mime = formatEl.value;
      canvas.toBlob((blob) => {
        if (!blob) return UI.showError('Could not export image.');
        FileHelper.downloadBlob(baseName + '-watermark.' + (EXT[mime] || 'jpg'), blob);
      }, mime, 0.92);
    };

    render();
  }
};

