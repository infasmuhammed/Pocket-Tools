import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

const MAX_FILES = 100;
const OUTPUT_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

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

function extension(name) {
  const index = name.lastIndexOf('.');
  return index === -1 ? 'jpg' : name.slice(index + 1).toLowerCase();
}

function cleanBase(value) {
  return (value || 'photo')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '') || 'photo';
}

export default {
  init() {
    const upload = document.getElementById('br-upload');
    const baseEl = document.getElementById('br-base');
    const startEl = document.getElementById('br-start');
    const paddingEl = document.getElementById('br-padding');
    const formatEl = document.getElementById('br-format');
    const btnDownload = document.getElementById('br-download');
    const btnClear = document.getElementById('br-clear');
    const countEl = document.getElementById('br-count');
    const dupesEl = document.getElementById('br-dupes');
    const noteEl = document.getElementById('br-preview-note');
    const emptyEl = document.getElementById('br-empty');
    const listEl = document.getElementById('br-list');
    const canvas = document.getElementById('br-canvas');
    const ctx = canvas.getContext('2d');

    let items = [];

    const newNameFor = (file, index) => {
      const base = cleanBase(baseEl.value);
      const start = Math.max(0, Number(startEl.value) || 0);
      const padding = Math.min(6, Math.max(0, Number(paddingEl.value) || 0));
      const number = String(start + index).padStart(padding, '0');
      const selectedFormat = formatEl.value;
      const ext = selectedFormat === 'original' ? extension(file.name) : OUTPUT_EXT[selectedFormat];
      return `${base}${number}.${ext}`;
    };

    const buildNames = () => {
      const names = items.map((item, index) => newNameFor(item.file, index));
      const seen = new Set();
      let duplicates = 0;
      for (const name of names) {
        const key = name.toLowerCase();
        if (seen.has(key)) duplicates++;
        seen.add(key);
      }
      return { names, duplicates };
    };

    const render = () => {
      const { names, duplicates } = buildNames();
      listEl.replaceChildren();
      emptyEl.classList.toggle('hidden', items.length > 0);
      countEl.textContent = String(items.length);
      dupesEl.textContent = String(duplicates);
      btnDownload.disabled = !items.length || duplicates > 0;
      noteEl.textContent = items.length ? `${items.length} file${items.length === 1 ? '' : 's'} ready` : 'No files selected';

      items.forEach((item, index) => {
        const row = document.createElement('article');
        row.className = 'image-row';

        const img = document.createElement('img');
        img.src = item.previewUrl;
        img.alt = '';
        img.onerror = () => {
          const thumb = document.createElement('div');
          thumb.className = 'file-thumb';
          thumb.textContent = extension(item.file.name).toUpperCase();
          img.replaceWith(thumb);
        };

        const meta = document.createElement('div');
        meta.className = 'image-row-meta';

        const title = document.createElement('strong');
        title.textContent = names[index];

        const detail = document.createElement('span');
        detail.textContent = `${item.file.name} · ${formatBytes(item.file.size)}`;

        meta.append(title, detail);
        row.append(img, meta);
        listEl.appendChild(row);
      });
    };

    const clear = () => {
      for (const item of items) URL.revokeObjectURL(item.previewUrl);
      items = [];
      upload.value = '';
      render();
    };

    const convert = async (file, mime) => {
      const image = await FileHelper.loadImage(file);
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(image, 0, 0);
      if (image.close) image.close();

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Could not convert image.'));
        }, mime, 0.92);
      });
    };

    upload.onchange = (event) => {
      const selected = Array.from(event.target.files || []).slice(0, MAX_FILES);
      if (!selected.length) return;
      if ((event.target.files || []).length > MAX_FILES) {
        UI.showError(`Only the first ${MAX_FILES} images were added.`);
      }

      clear();
      for (const file of selected) {
        const v = FileHelper.validateImage(file);
        if (!v.ok) {
          UI.showError(`${file.name}: ${v.error}`);
          continue;
        }
        items.push({ file, previewUrl: URL.createObjectURL(file) });
      }
      render();
    };

    btnDownload.onclick = async () => {
      if (!items.length) return UI.showError('Select photos first.');
      const { names, duplicates } = buildNames();
      if (duplicates) return UI.showError('Change the start number, padding, or base name to avoid duplicate names.');

      UI.setLoading(btnDownload, true, 'Download Renamed ZIP');
      try {
        const mime = formatEl.value;
        const entries = [];
        for (let i = 0; i < items.length; i++) {
          const blob = mime === 'original' ? items[i].file : await convert(items[i].file, mime);
          entries.push({ name: names[i], blob });
        }
        await FileHelper.downloadZip(`${cleanBase(baseEl.value)}-renamed.zip`, entries);
        UI.showSuccess('Renamed ZIP created.');
      } catch (err) {
        console.error(err);
        UI.showError(err.message || 'Could not create renamed ZIP.');
      } finally {
        UI.setLoading(btnDownload, false, 'Download Renamed ZIP');
      }
    };

    btnClear.onclick = clear;
    [baseEl, startEl, paddingEl, formatEl].forEach(el => el.addEventListener('input', render));
    formatEl.addEventListener('change', render);
    render();
  }
};
