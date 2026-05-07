import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

export default {
  init() {
    const upload = document.getElementById('re-upload');
    const controls = document.getElementById('re-controls');
    const contrastEl = document.getElementById('re-contrast');
    const contrastVal = document.getElementById('re-contrast-val');
    const threshEl = document.getElementById('re-threshold');
    const threshVal = document.getElementById('re-threshold-val');
    const btnDownload = document.getElementById('re-download');
    const canvas = document.getElementById('re-canvas');
    const ctx = canvas.getContext('2d');

    let img = null;
    let baseName = 'receipt';

    const render = () => {
      if (!img) return;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const contrast = parseFloat(contrastEl.value);
      const threshold = parseInt(threshEl.value, 10);
      contrastVal.textContent = contrast.toFixed(1) + '×';
      threshVal.textContent = threshold;

      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        // grayscale (luminance)
        let g = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        // contrast around 128
        g = (g - 128) * contrast + 128;
        // soft threshold: keep mid-tones a bit, harden edges
        if (g < threshold - 20) g = 0;
        else if (g > threshold + 20) g = 255;
        else g = Math.max(0, Math.min(255, g));
        d[i] = d[i + 1] = d[i + 2] = g;
      }
      ctx.putImageData(id, 0, 0);
    };

    upload.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = FileHelper.validateImage(file);
      if (!v.ok) { upload.value = ''; return UI.showError(v.error); }
      baseName = file.name.replace(/\.[^/.]+$/, '');

      const reader = new FileReader();
      reader.onload = (ev) => {
        img = new Image();
        img.onload = () => {
          controls.classList.remove('hidden');
          render();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    contrastEl.oninput = render;
    threshEl.oninput = render;

    btnDownload.onclick = () => {
      if (!img) return;
      canvas.toBlob((blob) => {
        if (!blob) return UI.showError('Could not export image.');
        FileHelper.downloadBlob(`${baseName}-enhanced.jpg`, blob);
      }, 'image/jpeg', 0.92);
    };
  },
};
