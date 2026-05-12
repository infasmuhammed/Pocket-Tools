import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfLib, loadPdfJs } from '../core/lazy.js';

async function renderPdfPreview(file, canvas, empty) {
  const pdfjsLib = await loadPdfJs();
  const loading = pdfjsLib.getDocument({ data: await file.arrayBuffer() });
  const pdf = await loading.promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(1.4, 520 / base.width);
  const viewport = page.getViewport({ scale });
  const ctx = canvas.getContext('2d');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  canvas.classList.remove('hidden');
  empty.classList.add('hidden');
  if (loading.destroy) loading.destroy();
}

function parsePages(str, max) {
  const pages = new Set();
  String(str || '').split(',').map((part) => part.trim()).filter(Boolean).forEach((part) => {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map((value) => Number.parseInt(value, 10));
      if (a > 0 && b >= a) for (let i = a; i <= Math.min(b, max); i += 1) pages.add(i - 1);
    } else {
      const page = Number.parseInt(part, 10);
      if (page > 0 && page <= max) pages.add(page - 1);
    }
  });
  return Array.from(pages).sort((a, b) => a - b);
}

export default {
  async init() {
    const PDFLib = await loadPdfLib();
    const upload = document.getElementById('sp-upload');
    const status = document.getElementById('sp-file-status');
    const pagesEl = document.getElementById('sp-pages');
    const totalPagesEl = document.getElementById('sp-total-pages');
    const keepCountEl = document.getElementById('sp-keep-count');
    const removeCountEl = document.getElementById('sp-remove-count');
    const strip = document.getElementById('sp-page-strip');
    const btnGen = document.getElementById('sp-generate');
    const canvas = document.getElementById('sp-preview');
    const empty = document.getElementById('sp-empty');

    let currentFile = null;
    let pageCount = 0;

    const updateStrip = () => {
      strip.replaceChildren();
      const indices = parsePages(pagesEl.value, pageCount);
      const keep = new Set(indices);
      totalPagesEl.textContent = String(pageCount);
      keepCountEl.textContent = String(indices.length);
      removeCountEl.textContent = String(Math.max(0, pageCount - indices.length));
      if (!pageCount) {
        const blank = document.createElement('div');
        blank.className = 'empty-state';
        blank.textContent = 'No PDF selected yet.';
        strip.appendChild(blank);
        return;
      }
      const visible = Math.min(pageCount, 24);
      for (let i = 0; i < visible; i += 1) {
        const chip = document.createElement('div');
        chip.className = 'page-chip';
        if (!keep.has(i)) chip.classList.add('status-warning');
        const number = document.createElement('strong');
        number.textContent = String(i + 1);
        const label = document.createElement('span');
        label.textContent = keep.has(i) ? 'Kept in output' : 'Removed from output';
        chip.append(number, label);
        strip.appendChild(chip);
      }
      if (pageCount > visible) {
        const note = document.createElement('div');
        note.className = 'field-hint';
        note.textContent = 'Showing first ' + visible + ' pages of ' + pageCount + '. The typed range still applies to the full PDF.';
        strip.appendChild(note);
      }
    };

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) { upload.value = ''; currentFile = null; pageCount = 0; updateStrip(); return UI.showError(v.error); }
      try {
        const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
        currentFile = file;
        pageCount = pdf.getPageCount();
        pagesEl.value = pageCount ? '1-' + pageCount : '';
        status.textContent = file.name + ' selected with ' + pageCount + ' page(s).';
        updateStrip();
        await renderPdfPreview(file, canvas, empty);
      } catch (err) {
        console.error(err);
        currentFile = null;
        pageCount = 0;
        status.textContent = 'No PDF selected yet.';
        updateStrip();
        UI.showError('Could not read this PDF. It may be encrypted.');
      }
    };

    pagesEl.addEventListener('input', updateStrip);

    btnGen.onclick = async () => {
      if (!currentFile) return UI.showError('Select a PDF first.');
      const indices = parsePages(pagesEl.value, pageCount);
      if (!indices.length) return UI.showError('Enter at least one valid page to keep.');
      UI.setLoading(btnGen, true, 'Download Extracted PDF');
      try {
        const source = await PDFLib.PDFDocument.load(await currentFile.arrayBuffer());
        const output = await PDFLib.PDFDocument.create();
        const copiedPages = await output.copyPages(source, indices);
        copiedPages.forEach((page) => output.addPage(page));
        const pdfBytes = await output.save();
        FileHelper.downloadBlob('extracted-pages.pdf', new Blob([pdfBytes], { type: 'application/pdf' }));
        UI.showSuccess('Extracted PDF downloaded.');
      } catch (err) {
        console.error(err);
        UI.showError('Failed to extract pages.');
      } finally {
        UI.setLoading(btnGen, false, 'Download Extracted PDF');
      }
    };

    updateStrip();
  }
};

