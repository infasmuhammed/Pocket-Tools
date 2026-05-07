import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

export default {
  init() {
    const upload = document.getElementById('bw-upload');
    const controls = document.getElementById('bw-controls');
    const btnDownload = document.getElementById('bw-download');
    const canvas = document.getElementById('bw-canvas');
    const ctx = canvas.getContext('2d');
    
    let img = null;
    let baseName = 'bw';

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
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          
          ctx.putImageData(imageData, 0, 0);
          controls.classList.remove('hidden');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    btnDownload.onclick = () => {
      if (!img) return;
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 0.9);
      a.download = `${baseName}-bw.jpg`;
      a.click();
    };
  }
};
