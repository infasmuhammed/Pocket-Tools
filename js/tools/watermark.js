import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

export default {
  init() {
    const upload = document.getElementById('wm-upload');
    const controls = document.getElementById('wm-controls');
    const textEl = document.getElementById('wm-text');
    const posEl = document.getElementById('wm-pos');
    const colorEl = document.getElementById('wm-color');
    const btnDownload = document.getElementById('wm-download');
    const canvas = document.getElementById('wm-canvas');
    const ctx = canvas.getContext('2d');
    
    let img = null;
    let baseName = 'watermarked';

    const render = () => {
      if (!img) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const text = textEl.value;
      const pos = posEl.value;
      const color = colorEl.value;
      
      const fontSize = Math.max(16, Math.floor(img.width * 0.05));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = color;
      
      const metrics = ctx.measureText(text);
      const padding = fontSize;
      let x, y;
      
      ctx.textBaseline = 'middle';
      
      if (pos.includes('left')) x = padding;
      else if (pos.includes('right')) x = img.width - metrics.width - padding;
      else x = (img.width - metrics.width) / 2;
      
      if (pos.includes('top')) y = padding + (fontSize / 2);
      else if (pos.includes('bottom')) y = img.height - padding - (fontSize / 2);
      else y = img.height / 2;
      
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(text, x, y);
      
      ctx.shadowColor = 'transparent';
    };

    upload.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = FileHelper.validateImage(file);
      if (!v.ok) { upload.value = ''; return UI.showError(v.error); }
      baseName = file.name.replace(/\.[^/.]+$/, "");
      
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

    textEl.oninput = render;
    posEl.onchange = render;
    colorEl.oninput = render;

    btnDownload.onclick = () => {
      if (!img) return;
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 0.9);
      a.download = `${baseName}-watermark.jpg`;
      a.click();
    };
  }
};
