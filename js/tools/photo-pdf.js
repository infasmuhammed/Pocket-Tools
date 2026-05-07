import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfLib } from '../core/lazy.js';

const MAX_FILES = 50;

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export default {
  async init() {
    const upload = document.getElementById('pp-upload');
    const countEl = document.getElementById('pp-count');
    const btnGen = document.getElementById('pp-generate');
    const btnClear = document.getElementById('pp-clear');
    const emptyEl = document.getElementById('pp-empty');
    const listEl = document.getElementById('pp-list');
    const noteEl = document.getElementById('pp-note');

    let selectedFiles = [];
    let previews = [];

    const clear = () => {
      previews.forEach(URL.revokeObjectURL);
      selectedFiles = [];
      previews = [];
      upload.value = '';
      render();
    };

    const render = () => {
      countEl.textContent = String(selectedFiles.length);
      btnGen.disabled = selectedFiles.length === 0;
      emptyEl.classList.toggle('hidden', selectedFiles.length > 0);
      noteEl.textContent = selectedFiles.length
        ? `${selectedFiles.length} page${selectedFiles.length === 1 ? '' : 's'}`
        : 'No photos selected';
      listEl.replaceChildren();

      selectedFiles.forEach((file, index) => {
        const row = document.createElement('article');
        row.className = 'image-row';

        const img = document.createElement('img');
        img.src = previews[index];
        img.alt = '';
        img.onerror = () => {
          const thumb = document.createElement('div');
          thumb.className = 'file-thumb';
          thumb.textContent = file.name.split('.').pop().toUpperCase();
          img.replaceWith(thumb);
        };

        const meta = document.createElement('div');
        meta.className = 'image-row-meta';
        const title = document.createElement('strong');
        title.textContent = `Page ${index + 1}: ${file.name}`;
        const detail = document.createElement('span');
        detail.textContent = formatBytes(file.size);
        meta.append(title, detail);

        row.append(img, meta);
        listEl.appendChild(row);
      });
    };

    upload.onchange = (event) => {
      const raw = Array.from(event.target.files || []);
      if (!raw.length) return;
      if (raw.length > MAX_FILES) UI.showError(`Only the first ${MAX_FILES} photos were added.`);

      clear();
      for (const file of raw.slice(0, MAX_FILES)) {
        const v = FileHelper.validateImage(file);
        if (v.ok) {
          selectedFiles.push(file);
          previews.push(URL.createObjectURL(file));
        } else {
          UI.showError(`${file.name}: ${v.error}`);
        }
      }
      render();
    };

    btnGen.onclick = async () => {
      if (selectedFiles.length === 0) return UI.showError('Select one or more photos first.');

      UI.setLoading(btnGen, true, 'Generate PDF');
      try {
        const { PDFDocument } = await loadPdfLib();
        const pdfDoc = await PDFDocument.create();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas is unavailable.');

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          btnGen.textContent = `Processing ${i + 1}/${selectedFiles.length}`;
          const sourceImage = await FileHelper.loadImage(file);

          canvas.width = sourceImage.width;
          canvas.height = sourceImage.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(sourceImage, 0, 0);
          if (sourceImage.close) sourceImage.close();

          const pngBytes = await new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
              try {
                if (!blob) throw new Error('Could not prepare image.');
                resolve(await blob.arrayBuffer());
              } catch (err) {
                reject(err);
              }
            }, 'image/png');
          });

          const image = await pdfDoc.embedPng(pngBytes);
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        FileHelper.downloadBlob('images.pdf', blob);
        UI.showSuccess('PDF downloaded.');
      } catch (err) {
        console.error(err);
        UI.showError(err.message || 'Failed to create PDF.');
      } finally {
        UI.setLoading(btnGen, false, 'Generate PDF');
      }
    };

    btnClear.onclick = clear;
    render();
  }
};
