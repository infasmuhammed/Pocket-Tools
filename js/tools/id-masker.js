import { FileHelper } from '../core/file.js';
import { loadPdfJs } from '../core/lazy.js';
import { UI } from '../core/ui.js';

export default {
  init() {
    const upload = document.getElementById('im-upload');
    const styleEl = document.getElementById('im-style');
    const pageEl = document.getElementById('im-page');
    const btnUndo = document.getElementById('im-undo');
    const btnClear = document.getElementById('im-clear');
    const btnDownload = document.getElementById('im-download');
    const canvas = document.getElementById('im-canvas');
    const ctx = canvas.getContext('2d');

    let sourceCanvas = document.createElement('canvas');
    let masks = [];
    let drawing = false;
    let start = null;
    let current = null;
    let currentFile = null;

    const hasSource = () => sourceCanvas.width > 0 && sourceCanvas.height > 0;

    const fitCanvas = (width, height) => {
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(width, height));
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      sourceCanvas.width = canvas.width;
      sourceCanvas.height = canvas.height;
      return scale;
    };

    const drawMask = (mask) => {
      if (mask.style === 'blur') {
        const imageData = ctx.getImageData(mask.x, mask.y, mask.w, mask.h);
        const data = imageData.data;
        for (let y = 0; y < mask.h; y += 4) {
          for (let x = 0; x < mask.w; x += 4) {
            const idx = (y * mask.w + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            for (let yy = y; yy < Math.min(y + 4, mask.h); yy++) {
              for (let xx = x; xx < Math.min(x + 4, mask.w); xx++) {
                const target = (yy * mask.w + xx) * 4;
                data[target] = r; data[target + 1] = g; data[target + 2] = b;
              }
            }
          }
        }
        ctx.putImageData(imageData, mask.x, mask.y);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(mask.x, mask.y, mask.w, mask.h);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (hasSource()) ctx.drawImage(sourceCanvas, 0, 0);
      masks.forEach(drawMask);
      if (current) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(current.x, current.y, current.w, current.h);
        ctx.setLineDash([]);
      }
    };

    const normalizedRect = (a, b) => ({
      x: Math.max(0, Math.min(a.x, b.x)),
      y: Math.max(0, Math.min(a.y, b.y)),
      w: Math.min(canvas.width, Math.max(a.x, b.x)) - Math.max(0, Math.min(a.x, b.x)),
      h: Math.min(canvas.height, Math.max(a.y, b.y)) - Math.max(0, Math.min(a.y, b.y)),
      style: styleEl.value,
    });

    const point = (event) => {
      const rect = canvas.getBoundingClientRect();
      const source = event.touches ? event.touches[0] : event;
      return {
        x: Math.round((source.clientX - rect.left) * (canvas.width / rect.width)),
        y: Math.round((source.clientY - rect.top) * (canvas.height / rect.height)),
      };
    };

    const loadImageFile = async (file) => {
      const image = await FileHelper.loadImage(file);
      const scale = fitCanvas(image.width, image.height);
      const sctx = sourceCanvas.getContext('2d');
      sctx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      sctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
      masks = [];
      render();
    };

    const loadPdfFile = async (file) => {
      const pdfjsLib = await loadPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const pageNumber = Math.min(pdf.numPages, Math.max(1, Number(pageEl.value) || 1));
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });
      fitCanvas(viewport.width, viewport.height);
      const renderCanvas = document.createElement('canvas');
      renderCanvas.width = canvas.width;
      renderCanvas.height = canvas.height;
      await page.render({
        canvasContext: renderCanvas.getContext('2d'),
        viewport: page.getViewport({ scale: canvas.width / page.getViewport({ scale: 1 }).width }),
      }).promise;
      sourceCanvas.getContext('2d').drawImage(renderCanvas, 0, 0);
      await pdf.destroy();
      masks = [];
      render();
    };

    const loadCurrentFile = async () => {
      if (!currentFile) return;
      try {
        if (currentFile.type === 'application/pdf' || currentFile.name.toLowerCase().endsWith('.pdf')) {
          await loadPdfFile(currentFile);
        } else {
          const v = FileHelper.validateImage(currentFile);
          if (!v.ok) throw new Error(v.error);
          await loadImageFile(currentFile);
        }
      } catch (err) {
        console.error(err);
        UI.showError(err.message || 'Could not load file.');
      }
    };

    upload.onchange = async (event) => {
      currentFile = event.target.files[0];
      if (!currentFile) return;
      await loadCurrentFile();
    };

    pageEl.onchange = loadCurrentFile;

    const startDraw = (event) => {
      if (!hasSource()) return;
      event.preventDefault();
      drawing = true;
      start = point(event);
    };

    const moveDraw = (event) => {
      if (!drawing) return;
      event.preventDefault();
      current = normalizedRect(start, point(event));
      render();
    };

    const stopDraw = () => {
      if (!drawing) return;
      if (!current) {
        drawing = false;
        return;
      }
      drawing = false;
      if (current.w > 6 && current.h > 6) masks.push(current);
      current = null;
      render();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', moveDraw, { passive: false });
    window.addEventListener('touchend', stopDraw);

    btnUndo.onclick = () => { masks.pop(); render(); };
    btnClear.onclick = () => { masks = []; render(); };
    btnDownload.onclick = () => {
      if (!hasSource()) return UI.showError('Select a file first.');
      canvas.toBlob((blob) => {
        if (!blob) return UI.showError('Could not export masked image.');
        FileHelper.downloadBlob('masked-document.png', blob);
      }, 'image/png');
    };
  }
};
