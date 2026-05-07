import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';

export default {
  async init() {
    if (!window.PDFLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './lib/pdf-lib.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const upload = document.getElementById('mp-upload');
    const controls = document.getElementById('mp-controls');
    const countEl = document.getElementById('mp-count');
    const btnGen = document.getElementById('mp-generate');
    
    let files = [];

    upload.onchange = async (e) => {
      const incoming = Array.from(e.target.files);
      if (incoming.length === 0) return;
      const ok = [];
      for (const f of incoming) {
        const v = await FileHelper.validatePdf(f);
        if (v.ok) ok.push(f);
        else UI.showError(`${f.name}: ${v.error}`);
      }
      files = ok;
      if (files.length === 0) { upload.value = ''; controls.classList.add('hidden'); return; }
      countEl.textContent = files.length;
      controls.classList.remove('hidden');
    };

    btnGen.onclick = async () => {
      if (files.length < 2) return UI.showError('Select at least 2 PDFs');
      
      UI.showToast('Merging...', 'info');
      btnGen.disabled = true;
      btnGen.textContent = 'Processing...';
      
      try {
        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();
        
        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        
        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.pdf';
        a.click();
        
        UI.showToast('PDFs Merged!', 'success');
      } catch (err) {
        console.error(err);
        UI.showError('Failed to merge PDFs. They might be encrypted.');
      } finally {
        btnGen.disabled = false;
        btnGen.textContent = 'Merge PDFs';
      }
    };
  }
};
