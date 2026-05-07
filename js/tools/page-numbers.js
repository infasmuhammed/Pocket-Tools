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

    const upload = document.getElementById('pn-upload');
    const controls = document.getElementById('pn-controls');
    const posEl = document.getElementById('pn-pos');
    const styleEl = document.getElementById('pn-style');
    const startEl = document.getElementById('pn-start');
    const sizeEl = document.getElementById('pn-size');
    const btnGen = document.getElementById('pn-generate');
    
    let currentFile = null;

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) { upload.value = ''; controls.classList.add('hidden'); return UI.showError(v.error); }
      currentFile = file;
      controls.classList.remove('hidden');
    };

    const pageLabel = (pageNumber, totalPages) => {
      if (styleEl.value === 'page-number') return `Page ${pageNumber}`;
      if (styleEl.value === 'page-of-total') return `Page ${pageNumber} of ${totalPages}`;
      if (styleEl.value === 'dash-number') return `- ${pageNumber} -`;
      return `${pageNumber}`;
    };

    btnGen.onclick = async () => {
      if (!currentFile) return;
      
      UI.showToast('Adding numbers...', 'info');
      btnGen.disabled = true;
      
      try {
        const { PDFDocument, rgb } = window.PDFLib;
        const arrayBuffer = await currentFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        const pages = pdf.getPages();
        const font = await pdf.embedFont(window.PDFLib.StandardFonts.Helvetica);
        const startNumber = Number.parseInt(startEl.value, 10) || 1;
        const fontSize = Math.min(36, Math.max(8, Number.parseInt(sizeEl.value, 10) || 12));
        
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const text = pageLabel(startNumber + i, startNumber + pages.length - 1);
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const { width, height } = page.getSize();
          
          let x, y;
          const margin = 20;
          
          if (posEl.value === 'bottom-center') {
            x = (width - textWidth) / 2;
            y = margin;
          } else if (posEl.value === 'bottom-right') {
            x = width - textWidth - margin;
            y = margin;
          } else if (posEl.value === 'bottom-left') {
            x = margin;
            y = margin;
          } else if (posEl.value === 'top-right') {
            x = width - textWidth - margin;
            y = height - margin - fontSize;
          } else if (posEl.value === 'top-center') {
            x = (width - textWidth) / 2;
            y = height - margin - fontSize;
          } else if (posEl.value === 'top-left') {
            x = margin;
            y = height - margin - fontSize;
          }
          
          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }
        
        const pdfBytes = await pdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'numbered.pdf';
        a.click();
        
        UI.showToast('Page numbers added!', 'success');
      } catch (err) {
        console.error(err);
        UI.showError('Failed to process PDF.');
      } finally {
        btnGen.disabled = false;
      }
    };
  }
};
