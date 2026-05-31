import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

const OUTPUT_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};
const MAX_FILES = 100;

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

function baseName(name) {
  return name.replace(/\.[^/.]+$/, '');
}

function fileNameFor(file, mime) {
  return `${baseName(file.name)}-optimized.${OUTPUT_EXT[mime] || 'jpg'}`;
}

export default {
  init() {
    const upload = document.getElementById('ic-upload');
    const qualityEl = document.getElementById('ic-quality');
    const qualityVal = document.getElementById('ic-quality-val');
    const formatEl = document.getElementById('ic-format');
    const maxWidthEl = document.getElementById('ic-max-width');
    const targetKbEl = document.getElementById('ic-target-kb');
    const btnProcess = document.getElementById('ic-process');
    const btnClear = document.getElementById('ic-clear');
    const btnDownloadAll = document.getElementById('ic-download-all');
    const fileCountEl = document.getElementById('ic-file-count');
    const originalSizeEl = document.getElementById('ic-original-size');
    const outputSizeEl = document.getElementById('ic-output-size');
    const emptyEl = document.getElementById('ic-empty');
    const listEl = document.getElementById('ic-list');
    const canvas = document.getElementById('ic-canvas');
    const ctx = canvas.getContext('2d');

    let items = [];

    const checkFormatSupport = async (mime) => {
      try {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 2;
        testCanvas.height = 2;
        const blob = await new Promise(resolve => testCanvas.toBlob(resolve, mime, 0.8));
        return !!blob && blob.type === mime;
      } catch {
        return false;
      }
    };

    const updateFormatSupport = async () => {
      const support = await Promise.all(
        ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].map(async mime => [mime, await checkFormatSupport(mime)])
      );
      const supportMap = Object.fromEntries(support);

      for (const option of formatEl.options) {
        const supported = Boolean(supportMap[option.value]);
        option.disabled = !supported;
        option.textContent = option.textContent.replace(' (unsupported)', '') + (supported ? '' : ' (unsupported)');
      }

      if (formatEl.selectedOptions[0]?.disabled) {
        formatEl.value = supportMap['image/webp'] ? 'image/webp' : 'image/jpeg';
      }
    };

    const updateQuality = () => {
      qualityVal.textContent = `${Math.round(Number(qualityEl.value) * 100)}%`;
    };

    const updateSummary = () => {
      fileCountEl.textContent = String(items.length);
      originalSizeEl.textContent = formatBytes(items.reduce((sum, item) => sum + item.file.size, 0));
      outputSizeEl.textContent = formatBytes(items.reduce((sum, item) => sum + (item.output?.blob.size || 0), 0));
      emptyEl.classList.toggle('hidden', items.length > 0);
      btnDownloadAll.disabled = !items.some(item => item.output);
    };

    const renderList = () => {
      listEl.replaceChildren();

      for (const item of items) {
        const row = document.createElement('article');
        row.className = 'image-row';

        const img = document.createElement('img');
        img.src = item.previewUrl;
        img.alt = '';
        img.onerror = () => {
          const thumb = document.createElement('div');
          thumb.className = 'file-thumb';
          thumb.textContent = item.file.name.split('.').pop().toUpperCase();
          img.replaceWith(thumb);
        };

        const meta = document.createElement('div');
        meta.className = 'image-row-meta';

        const title = document.createElement('strong');
        title.textContent = item.file.name;

        const details = document.createElement('span');
        const status = item.error
          ? item.error
          : item.output
            ? `${formatBytes(item.file.size)} -> ${formatBytes(item.output.blob.size)} · ${item.output.width}x${item.output.height}`
            : `${formatBytes(item.file.size)} · waiting`;
        details.textContent = status;
        if (item.error) details.className = 'status-error';

        meta.append(title, details);

        const actions = document.createElement('div');
        actions.className = 'image-row-actions';

        if (item.output) {
          const download = document.createElement('button');
          download.className = 'btn btn-secondary';
          download.textContent = 'Download';
          download.onclick = () => FileHelper.downloadBlob(item.output.name, item.output.blob);
          actions.appendChild(download);
        }

        row.append(img, meta, actions);
        listEl.appendChild(row);
      }

      updateSummary();
    };

    const clearItems = () => {
      for (const item of items) URL.revokeObjectURL(item.previewUrl);
      items = [];
      upload.value = '';
      renderList();
    };

    const canvasToBlob = (mime, quality) => new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) {
          reject(new Error('Could not process image.'));
          return;
        }
        if (mime !== 'image/png' && result.type && result.type !== mime) {
          reject(new Error((OUTPUT_EXT[mime] || 'Selected format').toUpperCase() + ' export is not supported by this browser.'));
          return;
        }
        resolve(result);
      }, mime, quality);
    });

    const blobForTarget = async (mime) => {
      const targetBytes = Number(targetKbEl.value) * 1024;
      const supportsQuality = mime === 'image/jpeg' || mime === 'image/webp' || mime === 'image/avif';

      if (!targetBytes || !supportsQuality) {
        return canvasToBlob(mime, Number(qualityEl.value));
      }

      let low = 0.1;
      let high = 0.95;
      let best = null;

      for (let i = 0; i < 8; i++) {
        const quality = (low + high) / 2;
        const blob = await canvasToBlob(mime, quality);
        best = blob;

        if (blob.size > targetBytes) high = quality;
        else low = quality;
      }

      return best || canvasToBlob(mime, Number(qualityEl.value));
    };

    const processItem = async (item) => {
      const image = await FileHelper.loadImage(item.file);
      try {
        const requestedWidth = Number(maxWidthEl.value);
        const scale = requestedWidth > 0 && image.width > requestedWidth
          ? requestedWidth / image.width
          : 1;
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const mime = formatEl.value;

        if (formatEl.selectedOptions[0]?.disabled) {
          throw new Error('Selected output format is not supported by this browser.');
        }

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);

        if (mime === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(image, 0, 0, width, height);

        const blob = await blobForTarget(mime);

        item.output = {
          blob,
          width,
          height,
          name: fileNameFor(item.file, mime),
        };
        item.error = '';
      } finally {
        if (image.close) image.close();
      }
    };

    upload.onchange = (e) => {
      const raw = Array.from(e.target.files || []);
      const selected = raw.slice(0, MAX_FILES);
      if (!selected.length) return;
      if (raw.length > MAX_FILES) UI.showError(`Only the first ${MAX_FILES} images were added.`);

      const next = [];
      for (const file of selected) {
        const v = FileHelper.validateImage(file);
        if (!v.ok) {
          UI.showError(`${file.name}: ${v.error}`);
          continue;
        }
        next.push({
          file,
          previewUrl: URL.createObjectURL(file),
          output: null,
          error: '',
        });
      }

      clearItems();
      items = next;
      renderList();
    };

    btnProcess.onclick = async () => {
      if (!items.length) return UI.showError('Select one or more images first.');

      UI.setLoading(btnProcess, true, 'Process Images');
      let success = 0;
      for (const item of items) {
        try {
          await processItem(item);
          success++;
        } catch (err) {
          console.error(err);
          item.output = null;
          item.error = err.message || 'Could not process this image.';
        }
      }
      renderList();
      if (success) UI.showSuccess(`${success} image${success === 1 ? '' : 's'} processed.`);
      if (success < items.length) UI.showError(`${items.length - success} image${items.length - success === 1 ? '' : 's'} could not be processed.`);
      UI.setLoading(btnProcess, false, 'Process Images');
    };

    btnDownloadAll.onclick = async () => {
      const ready = items.filter(item => item.output);
      if (!ready.length) return UI.showError('Process images first.');
      UI.setLoading(btnDownloadAll, true, 'Download ZIP');
      try {
        await FileHelper.downloadZip('processed-images.zip', ready.map(item => ({
          name: item.output.name,
          blob: item.output.blob,
        })));
      } catch (err) {
        console.error(err);
        UI.showError('Could not create ZIP file.');
      } finally {
        UI.setLoading(btnDownloadAll, false, 'Download ZIP');
      }
    };

    btnClear.onclick = clearItems;

    qualityEl.oninput = () => {
      updateQuality();
      items.forEach(item => { item.output = null; item.error = ''; });
      renderList();
    };

    formatEl.onchange = () => {
      items.forEach(item => { item.output = null; item.error = ''; });
      renderList();
    };

    maxWidthEl.oninput = () => {
      items.forEach(item => { item.output = null; item.error = ''; });
      renderList();
    };

    targetKbEl.oninput = () => {
      items.forEach(item => { item.output = null; item.error = ''; });
      renderList();
    };

    updateQuality();
    updateFormatSupport();
    renderList();
  }
};
