// File helpers — validation, downloads, magic-byte checks. All processing local.

const MB = 1024 * 1024;

export const LIMITS = {
  IMAGE_MB: 10,
  PDF_MB: 20,
};

const IMAGE_EXTS = ['jpg','jpeg','png','webp','gif','bmp','heic','heif'];
const IMAGE_MIMES_PREFIX = 'image/';
const PDF_MIME = 'application/pdf';

function ext(name) {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i + 1).toLowerCase();
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTime(date) {
  return (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
}

function dosDate(date) {
  return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
}

function writeU16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeU32(view, offset, value) {
  view.setUint32(offset, value, true);
}

export const FileHelper = {
  // ---- Validators (return { ok: true } or { ok: false, error: '...' }) ----
  validateImage(file, maxMB = LIMITS.IMAGE_MB) {
    if (!file) return { ok: false, error: 'No file selected.' };
    if (file.size > maxMB * MB) return { ok: false, error: `Image too large. Max ${maxMB} MB.` };
    const fileExt = ext(file.name);
    if (file.type && !file.type.startsWith(IMAGE_MIMES_PREFIX) && !IMAGE_EXTS.includes(fileExt)) {
      return { ok: false, error: 'That doesn\'t look like an image.' };
    }
    if (!IMAGE_EXTS.includes(fileExt)) {
      return { ok: false, error: 'Unsupported image format. Use JPG, PNG, WebP, GIF, BMP, HEIC, or HEIF.' };
    }
    return { ok: true };
  },

  async validatePdf(file, maxMB = LIMITS.PDF_MB) {
    if (!file) return { ok: false, error: 'No file selected.' };
    if (file.size > maxMB * MB) return { ok: false, error: `PDF too large. Max ${maxMB} MB.` };
    if (file.type && file.type !== PDF_MIME) {
      return { ok: false, error: 'That doesn\'t look like a PDF.' };
    }
    if (ext(file.name) !== 'pdf') return { ok: false, error: 'File must end in .pdf' };
    // Magic-byte check: %PDF
    try {
      const head = await file.slice(0, 4).arrayBuffer();
      const bytes = new Uint8Array(head);
      const magic = String.fromCharCode(...bytes);
      if (magic !== '%PDF') return { ok: false, error: 'File is not a valid PDF.' };
    } catch {
      return { ok: false, error: 'Could not read file.' };
    }
    return { ok: true };
  },

  // ---- Downloads ----
  downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  },

  downloadText(filename, content, mime = 'text/plain') {
    this.downloadBlob(filename, new Blob([content], { type: mime + ';charset=utf-8' }));
  },

  async createZip(entries) {
    const encoder = new TextEncoder();
    const chunks = [];
    const central = [];
    const now = new Date();
    const time = dosTime(now);
    const date = dosDate(now);
    const usedNames = new Set();
    let offset = 0;

    for (const entry of entries) {
      const data = new Uint8Array(await entry.blob.arrayBuffer());
      const originalName = String(entry.name || 'file').replace(/[\\:*?"<>|]+/g, '-').replace(/^\/+/, '');
      const index = originalName.lastIndexOf('.');
      const stem = index === -1 ? originalName : originalName.slice(0, index);
      const suffix = index === -1 ? '' : originalName.slice(index);
      let safeName = originalName;
      let counter = 2;
      while (usedNames.has(safeName.toLowerCase())) {
        safeName = `${stem}-${counter}${suffix}`;
        counter++;
      }
      usedNames.add(safeName.toLowerCase());
      const nameBytes = encoder.encode(safeName);
      const crc = crc32(data);

      const local = new ArrayBuffer(30 + nameBytes.length);
      const localView = new DataView(local);
      writeU32(localView, 0, 0x04034b50);
      writeU16(localView, 4, 20);
      writeU16(localView, 6, 0);
      writeU16(localView, 8, 0);
      writeU16(localView, 10, time);
      writeU16(localView, 12, date);
      writeU32(localView, 14, crc);
      writeU32(localView, 18, data.length);
      writeU32(localView, 22, data.length);
      writeU16(localView, 26, nameBytes.length);
      writeU16(localView, 28, 0);
      new Uint8Array(local, 30).set(nameBytes);

      const centralHeader = new ArrayBuffer(46 + nameBytes.length);
      const centralView = new DataView(centralHeader);
      writeU32(centralView, 0, 0x02014b50);
      writeU16(centralView, 4, 20);
      writeU16(centralView, 6, 20);
      writeU16(centralView, 8, 0);
      writeU16(centralView, 10, 0);
      writeU16(centralView, 12, time);
      writeU16(centralView, 14, date);
      writeU32(centralView, 16, crc);
      writeU32(centralView, 20, data.length);
      writeU32(centralView, 24, data.length);
      writeU16(centralView, 28, nameBytes.length);
      writeU16(centralView, 30, 0);
      writeU16(centralView, 32, 0);
      writeU16(centralView, 34, 0);
      writeU16(centralView, 36, 0);
      writeU32(centralView, 38, 0);
      writeU32(centralView, 42, offset);
      new Uint8Array(centralHeader, 46).set(nameBytes);

      chunks.push(local, data);
      central.push(centralHeader);
      offset += local.byteLength + data.length;
    }

    const centralOffset = offset;
    const centralSize = central.reduce((sum, part) => sum + part.byteLength, 0);
    chunks.push(...central);

    const end = new ArrayBuffer(22);
    const endView = new DataView(end);
    writeU32(endView, 0, 0x06054b50);
    writeU16(endView, 4, 0);
    writeU16(endView, 6, 0);
    writeU16(endView, 8, entries.length);
    writeU16(endView, 10, entries.length);
    writeU32(endView, 12, centralSize);
    writeU32(endView, 16, centralOffset);
    writeU16(endView, 20, 0);
    chunks.push(end);

    return new Blob(chunks, { type: 'application/zip' });
  },

  async downloadZip(filename, entries) {
    const zip = await this.createZip(entries);
    this.downloadBlob(filename, zip);
  },

  // ---- Reading helpers ----
  readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error || new Error('Read failed'));
      r.readAsDataURL(file);
    });
  },

  readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error || new Error('Read failed'));
      r.readAsArrayBuffer(file);
    });
  },

  loadImage(file) {
    return new Promise(async (resolve, reject) => {
      try {
        if ('createImageBitmap' in window) {
          try {
            const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
            resolve(bitmap);
            return;
          } catch {
            // Fall back to object URLs below. Some browsers do not expose HEIC through createImageBitmap.
          }
        }

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          const type = ext(file.name).toUpperCase();
          const message = ['HEIC', 'HEIF'].includes(type)
            ? 'This browser cannot decode HEIC/HEIF images. Try opening the tool in Safari or convert the file to JPG/PNG first.'
            : 'Could not load image.';
          reject(new Error(message));
        };
        img.src = url;
      } catch (e) { reject(e); }
    });
  },
};
