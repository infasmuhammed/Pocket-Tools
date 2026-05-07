import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';

export default {
  init() {
    const upload = document.getElementById('cp-upload');
    const controls = document.getElementById('cp-controls');
    const canvas = document.getElementById('cp-canvas');
    const ctx = canvas.getContext('2d');
    const swatch = document.getElementById('cp-swatch');
    const hexEl = document.getElementById('cp-hex');
    const rgbEl = document.getElementById('cp-rgb');
    const btnCopy = document.getElementById('cp-copy');
    
    let img = null;

    upload.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = FileHelper.validateImage(file);
      if (!v.ok) { upload.value = ''; return UI.showError(v.error); }

      const reader = new FileReader();
      reader.onload = (ev) => {
        img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          controls.classList.remove('hidden');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');

    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      
      const hex = rgbToHex(r, g, b);
      const rgb = `rgb(${r}, ${g}, ${b})`;
      
      swatch.style.background = hex;
      hexEl.textContent = hex;
      rgbEl.textContent = rgb;
    };

    btnCopy.onclick = () => {
      navigator.clipboard.writeText(hexEl.textContent)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Failed to copy'));
    };
  }
};
