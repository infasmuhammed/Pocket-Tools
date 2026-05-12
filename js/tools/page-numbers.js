import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfLib, loadPdfJs } from '../core/lazy.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.parseInt(value, 10) || min));

export default {
  async init() {
    const PDFLib = await loadPdfLib();
    const upload = document.getElementById('pn-upload');
    const status = document.getElementById('pn-file-status');
    const previewStatus = document.getElementById('pn-preview-status');
    const posEl = document.getElementById('pn-pos');
    const styleEl = document.getElementById('pn-style');
    const startEl = document.getElementById('pn-start');
    const sizeEl = document.getElementById('pn-size');
    const marginEl = document.getElementById('pn-margin');
    const btnGen = document.getElementById('pn-generate');
    const canvas = document.getElementById('pn-preview');
    const empty = document.getElementById('pn-empty');

    let currentFile = null;
    let pageCount = 0;

    const pageLabel = (pageNumber, totalPages) => {
      if (styleEl.value === 'page-number') return 'Page ' + pageNumber;
      if (styleEl.value === 'page-of-total') return 'Page ' + pageNumber + ' of ' + totalPages;
      if (styleEl.value === 'dash-number') return '- ' + pageNumber + ' -';
      return String(pageNumber);
    };

    const positionFor = (textWidth, width, height, fontSize, margin) => {
      let x = margin;
      let y = margin;
      if (posEl.value.includes('center')) x = (width - textWidth) / 2;
      else if (posEl.value.includes('right')) x = width - textWidth - margin;
      if (posEl.value.includes('top')) y = height - margin - fontSize;
      else y = margin;
      return { x, y };
    };

    const renderPreview = async () => {
      if (!currentFile) return;
      try {
        const pdfjsLib = await loadPdfJs();
        const loading = pdfjsLib.getDocument({ data: await currentFile.arrayBuffer() });
        const pdf = await loading.promise;
        const page = await pdf.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(1.4, 520 / base.width);
        const viewport = page.getViewport({ scale });
        const ctx = canvas.getContext('2d');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        const fontSize = clamp(sizeEl.value, 8, 48) * scale;
        const margin = clamp(marginEl.value, 8, 120) * scale;
        const text = pageLabel(clamp(startEl.value, 0, 9999), pageCount);
        ctx.save();
        ctx.font = fontSize + 'px sans-serif';
        ctx.fillStyle = '#0a0a0a';
        const textWidth = ctx.measureText(text).width;
        let x = margin;
        if (posEl.value.includes('center')) x = (canvas.width - textWidth) / 2;
        else if (posEl.value.includes('right')) x = canvas.width - textWidth - margin;
        const y = posEl.value.includes('top') ? margin + fontSize : canvas.height - margin;
        ctx.fillText(text, x, y);
        ctx.restore();

        canvas.classList.remove('hidden');
        empty.classList.add('hidden');
        previewStatus.textContent = 'Previewing page 1. The same placement is applied to all ' + pageCount + ' page(s).';
        if (loading.destroy) loading.destroy();
      } catch (err) {
        console.error(err);
        previewStatus.textContent = 'Preview is not available for this PDF.';
      }
    };

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) { upload.value = ''; currentFile = null; return UI.showError(v.error); }
      try {
        const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
        currentFile = file;
        pageCount = pdf.getPageCount();
        status.textContent = file.name + ' selected with ' + pageCount + ' page(s).';
        await renderPreview();
      } catch (err) {
        console.error(err);
        currentFile = null;
        pageCount = 0;
        status.textContent = 'No PDF selected yet.';
        UI.showError('Could not read this PDF. It may be encrypted.');
      }
    };

    [posEl, styleEl, startEl, sizeEl, marginEl].forEach((el) => {
      el.addEventListener('input', renderPreview);
      el.addEventListener('change', renderPreview);
    });

    btnGen.onclick = async () => {
      if (!currentFile) return UI.showError('Select a PDF first.');
      UI.setLoading(btnGen, true, 'Download Numbered PDF');
      try {
        const pdf = await PDFLib.PDFDocument.load(await currentFile.arrayBuffer());
        const pages = pdf.getPages();
        const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
        const startNumber = clamp(startEl.value, 0, 9999);
        const fontSize = clamp(sizeEl.value, 8, 48);
        const margin = clamp(marginEl.value, 8, 120);

        pages.forEach((page, index) => {
          const text = pageLabel(startNumber + index, pages.length);
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const size = page.getSize();
          const pos = positionFor(textWidth, size.width, size.height, fontSize, margin);
          page.drawText(text, {
            x: pos.x,
            y: pos.y,
            size: fontSize,
            font,
            color: PDFLib.rgb(0, 0, 0),
          });
        });

        const pdfBytes = await pdf.save();
        FileHelper.downloadBlob('numbered.pdf', new Blob([pdfBytes], { type: 'application/pdf' }));
        UI.showSuccess('Numbered PDF downloaded.');
      } catch (err) {
        console.error(err);
        UI.showError('Failed to add page numbers.');
      } finally {
        UI.setLoading(btnGen, false, 'Download Numbered PDF');
      }
    };
  }
};

