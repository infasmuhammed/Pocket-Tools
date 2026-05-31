import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfLib } from '../core/lazy.js';

const makeId = () => (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function' ? globalThis.crypto.randomUUID() : String(Date.now()) + '-' + String(Math.random()));

const formatBytes = (bytes) => {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return value.toFixed(unit === 0 ? 0 : 1) + ' ' + units[unit];
};

export default {
  async init() {
    const PDFLib = await loadPdfLib();
    const upload = document.getElementById('mp-upload');
    const status = document.getElementById('mp-file-status');
    const countEl = document.getElementById('mp-count');
    const pagesEl = document.getElementById('mp-pages');
    const btnGen = document.getElementById('mp-generate');
    const listEl = document.getElementById('mp-list');

    let items = [];
    let draggedId = null;

    const updateSummary = () => {
      countEl.textContent = String(items.length);
      pagesEl.textContent = String(items.reduce((sum, item) => sum + item.pages, 0));
      status.textContent = items.length ? String(items.length) + ' PDF(s) selected. The list below is the exact merge order.' : 'No PDFs selected yet.';
    };

    const move = (id, direction) => {
      const index = items.findIndex((item) => item.id === id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= items.length) return;
      const [item] = items.splice(index, 1);
      items.splice(next, 0, item);
      renderList();
    };

    const renderList = () => {
      listEl.replaceChildren();
      if (!items.length) {
        const blank = document.createElement('div');
        blank.className = 'empty-state';
        blank.textContent = 'No PDFs selected yet.';
        listEl.appendChild(blank);
      }

      items.forEach((item, index) => {
        const row = document.createElement('article');
        row.className = 'file-order-row';
        row.draggable = true;
        row.addEventListener('dragstart', () => { draggedId = item.id; });
        row.addEventListener('dragover', (event) => event.preventDefault());
        row.addEventListener('drop', () => {
          const from = items.findIndex((entry) => entry.id === draggedId);
          const to = items.findIndex((entry) => entry.id === item.id);
          if (from < 0 || to < 0 || from === to) return;
          const [entry] = items.splice(from, 1);
          items.splice(to, 0, entry);
          renderList();
        });

        const meta = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = String(index + 1) + '. ' + item.file.name;
        const detail = document.createElement('span');
        detail.textContent = item.pages + ' page(s) · ' + formatBytes(item.file.size);
        meta.append(title, detail);

        const actions = document.createElement('div');
        actions.className = 'row-actions';
        const up = document.createElement('button');
        up.className = 'btn btn-secondary';
        up.type = 'button';
        up.textContent = 'Up';
        up.disabled = index === 0;
        up.onclick = () => move(item.id, -1);
        const down = document.createElement('button');
        down.className = 'btn btn-secondary';
        down.type = 'button';
        down.textContent = 'Down';
        down.disabled = index === items.length - 1;
        down.onclick = () => move(item.id, 1);
        actions.append(up, down);

        row.append(meta, actions);
        listEl.appendChild(row);
      });
      updateSummary();
    };

    upload.onchange = async (e) => {
      const incoming = Array.from(e.target.files || []);
      if (!incoming.length) return;
      const next = [];
      for (const file of incoming) {
        const v = await FileHelper.validatePdf(file);
        if (!v.ok) { UI.showError(file.name + ': ' + v.error); continue; }
        try {
          const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
          next.push({ id: makeId(), file, pages: pdf.getPageCount() });
        } catch (err) {
          console.error(err);
          UI.showError(file.name + ': Could not read pages. The PDF may be encrypted.');
        }
      }
      items = next;
      renderList();
    };

    btnGen.onclick = async () => {
      if (items.length < 2) return UI.showError('Select at least 2 PDFs.');
      UI.setLoading(btnGen, true, 'Merge PDFs');
      try {
        const mergedPdf = await PDFLib.PDFDocument.create();
        for (const item of items) {
          const pdf = await PDFLib.PDFDocument.load(await item.file.arrayBuffer());
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const pdfBytes = await mergedPdf.save();
        FileHelper.downloadBlob('merged.pdf', new Blob([pdfBytes], { type: 'application/pdf' }));
        UI.showSuccess('PDFs merged in the selected order.');
      } catch (err) {
        console.error(err);
        UI.showError('Failed to merge PDFs. One file may be encrypted or damaged.');
      } finally {
        UI.setLoading(btnGen, false, 'Merge PDFs');
      }
    };

    renderList();
  }
};

