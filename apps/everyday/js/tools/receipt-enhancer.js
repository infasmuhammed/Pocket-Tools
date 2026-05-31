import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

export default {
  init() {
    const upload = document.getElementById('re-upload');
    const contrastEl = document.getElementById('re-contrast');
    const contrastVal = document.getElementById('re-contrast-val');
    const threshEl = document.getElementById('re-threshold');
    const threshVal = document.getElementById('re-threshold-val');
    const btnDownload = document.getElementById('re-download');
    const canvas = document.getElementById('re-canvas');
    const empty = document.getElementById('re-empty');
    const status = document.getElementById('re-file-status');
    const ctx = canvas.getContext('2d');

    let img = null;
    let baseName = 'receipt';

    const render = () => {
      const contrast = parseFloat(contrastEl.value);
      const threshold = parseInt(threshEl.value, 10);
      contrastVal.textContent = contrast.toFixed(1) + 'x';
      threshVal.textContent = String(threshold);
      if (!img) return;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        let g = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        g = (g - 128) * contrast + 128;
        if (g < threshold - 20) g = 0;
        else if (g > threshold + 20) g = 255;
        else g = Math.max(0, Math.min(255, g));
        d[i] = d[i + 1] = d[i + 2] = g;
      }
      ctx.putImageData(id, 0, 0);
    };

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = FileHelper.validateImage(file);
      if (!v.ok) { upload.value = ''; return UI.showError(v.error); }
      try {
        img = await FileHelper.loadImage(file);
        baseName = file.name.replace(/.[^/.]+$/, '');
        status.textContent = file.name + ' selected.';
        empty.classList.add('hidden');
        canvas.classList.remove('hidden');
        render();
      } catch (err) {
        img = null;
        upload.value = '';
        status.textContent = 'No receipt selected yet.';
        empty.classList.remove('hidden');
        canvas.classList.add('hidden');
        UI.showError(err.message || 'Could not load image.');
      }
    };

    contrastEl.oninput = render;
    threshEl.oninput = render;

    btnDownload.onclick = () => {
      if (!img) return UI.showError('Select a receipt first.');
      render();
      canvas.toBlob((blob) => {
        if (!blob) return UI.showError('Could not export image.');
        FileHelper.downloadBlob(baseName + '-enhanced.jpg', blob);
      }, 'image/jpeg', 0.92);
    };

    render();
  }
};

