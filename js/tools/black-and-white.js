import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

export default {
  init() {
    const upload = document.getElementById('bw-upload');
    const intensityEl = document.getElementById('bw-intensity');
    const intensityVal = document.getElementById('bw-intensity-val');
    const btnDownload = document.getElementById('bw-download');
    const canvas = document.getElementById('bw-canvas');
    const empty = document.getElementById('bw-empty');
    const status = document.getElementById('bw-file-status');
    const ctx = canvas.getContext('2d');

    let img = null;
    let baseName = 'bw';

    const render = () => {
      const amount = Number(intensityEl.value) / 100;
      intensityVal.textContent = Math.round(amount * 100) + '%';
      if (!img) return;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i] + (gray - data[i]) * amount;
        data[i + 1] = data[i + 1] + (gray - data[i + 1]) * amount;
        data[i + 2] = data[i + 2] + (gray - data[i + 2]) * amount;
      }
      ctx.putImageData(imageData, 0, 0);
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
        status.textContent = 'No image selected yet.';
        empty.classList.remove('hidden');
        canvas.classList.add('hidden');
        UI.showError(err.message || 'Could not load image.');
      }
    };

    intensityEl.oninput = render;

    btnDownload.onclick = () => {
      if (!img) return UI.showError('Select an image first.');
      render();
      canvas.toBlob((blob) => {
        if (!blob) return UI.showError('Could not export image.');
        FileHelper.downloadBlob(baseName + '-bw.jpg', blob);
      }, 'image/jpeg', 0.92);
    };

    render();
  }
};

