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

function convertedName(file, mime) {
  return `${file.name.replace(/\.[^/.]+$/, '')}.${OUTPUT_EXT[mime] || 'png'}`;
}

export default {
  init() {
    const upload = document.getElementById('fc-upload');
    const formatEl = document.getElementById('fc-format');

    const checkFormatSupport = async (mime) => {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = 2;
        const blob = await new Promise(res => c.toBlob(res, mime));
        return !!blob && blob.type === mime;
      } catch {
        return false;
      }
    };

    (async () => {
      for (const mime of ['image/webp', 'image/avif']) {
        const supported = await checkFormatSupport(mime);
        if (!supported) {
          const opt = formatEl.querySelector(`option[value="${mime}"]`);
          if (opt) {
            opt.disabled = true;
            opt.textContent += ' (unsupported)';
          }
        }
      }
    })();

    const qualityEl = document.getElementById('fc-quality');
    const qualityVal = document.getElementById('fc-quality-val');
    const btnConvert = document.getElementById('fc-convert');
    const btnClear = document.getElementById('fc-clear');
    const btnDownloadAll = document.getElementById('fc-download-all');
    const fileCountEl = document.getElementById('fc-file-count');
    const originalSizeEl = document.getElementById('fc-original-size');
    const outputSizeEl = document.getElementById('fc-output-size');
    const emptyEl = document.getElementById('fc-empty');
    const listEl = document.getElementById('fc-list');
    const canvas = document.getElementById('fc-canvas');
    const ctx = canvas.getContext('2d');

    let items = [];

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
        details.textContent = item.error
          ? item.error
          : item.output
            ? `${formatBytes(item.file.size)} -> ${formatBytes(item.output.blob.size)}`
            : `${formatBytes(item.file.size)} · waiting`;
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

    const convertItem = async (item) => {
      const image = await FileHelper.loadImage(item.file);
      const mime = formatEl.value;

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(image, 0, 0);

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (!result) {
            reject(new Error('Could not convert image.'));
            return;
          }
          if (mime !== 'image/png' && result.type && result.type !== mime) {
            reject(new Error((OUTPUT_EXT[mime] || 'Selected format').toUpperCase() + ' export is not supported by this browser.'));
            return;
          }
          resolve(result);
        }, mime, Number(qualityEl.value));
      });

      item.output = {
        blob,
        name: convertedName(item.file, mime),
      };
      item.error = '';
      if (image.close) image.close();
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

    btnConvert.onclick = async () => {
      if (!items.length) return UI.showError('Select one or more images first.');

      UI.setLoading(btnConvert, true, 'Convert Images');
      let success = 0;
      for (const item of items) {
        try {
          await convertItem(item);
          success++;
        } catch (err) {
          console.error(err);
          item.output = null;
          item.error = err.message || 'Could not convert this image.';
        }
      }
      renderList();
      if (success) UI.showSuccess(`${success} image${success === 1 ? '' : 's'} converted.`);
      if (success < items.length) UI.showError(`${items.length - success} image${items.length - success === 1 ? '' : 's'} could not be converted.`);
      UI.setLoading(btnConvert, false, 'Convert Images');
    };

    btnDownloadAll.onclick = async () => {
      const ready = items.filter(item => item.output);
      if (!ready.length) return UI.showError('Convert images first.');
      UI.setLoading(btnDownloadAll, true, 'Download ZIP');
      try {
        await FileHelper.downloadZip('converted-images.zip', ready.map(item => ({
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

    formatEl.onchange = () => {
      items.forEach(item => { item.output = null; item.error = ''; });
      renderList();
    };

    qualityEl.oninput = () => {
      updateQuality();
      items.forEach(item => { item.output = null; item.error = ''; });
      renderList();
    };

    updateQuality();
    renderList();
  }
};
