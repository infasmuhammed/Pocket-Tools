import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';

export default {
  async init() {
    if (!window.PDFLib) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = './lib/pdf-lib.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    const upload = document.getElementById('sp-upload');
    const controls = document.getElementById('sp-controls');
    const pagesEl = document.getElementById('sp-pages');
    const btnGen = document.getElementById('sp-generate');
    
    let currentFile = null;

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) { upload.value = ''; controls.classList.add('hidden'); return UI.showError(v.error); }
      currentFile = file;
      controls.classList.remove('hidden');
    };

    const parsePages = (str, max) => {
      const pages = new Set();
      const parts = str.split(',').map(p => p.trim());
      for (const p of parts) {
        if (p.includes('-')) {
          const [start, end] = p.split('-').map(Number);
          if (start > 0 && end >= start && start <= max) {
            for (let i = start; i <= Math.min(end, max); i++) pages.add(i - 1);
          }
        } else {
          const num = Number(p);
          if (num > 0 && num <= max) pages.add(num - 1);
        }
      }
      return Array.from(pages).sort((a, b) => a - b);
    };

    btnGen.onclick = async () => {
      if (!currentFile || !pagesEl.value) return UI.showError('Select a file and enter pages');
      
      UI.showToast('Extracting...', 'info');
      btnGen.disabled = true;
      
      try {
        const { PDFDocument } = window.PDFLib;
        const arrayBuffer = await currentFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const maxPages = pdf.getPageCount();
        
        const indices = parsePages(pagesEl.value, maxPages);
        if (indices.length === 0) throw new Error('No valid pages found');
        
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, indices);
        copiedPages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'extracted.pdf';
        a.click();
        
        UI.showToast('Pages Extracted!', 'success');
      } catch (err) {
        console.error(err);
        UI.showError(err.message || 'Failed to extract pages.');
      } finally {
        btnGen.disabled = false;
      }
    };
  }
};
