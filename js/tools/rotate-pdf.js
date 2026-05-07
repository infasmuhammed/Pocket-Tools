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

    const upload = document.getElementById('rp-upload');
    const controls = document.getElementById('rp-controls');
    const btnLeft = document.getElementById('rp-left');
    const btnRight = document.getElementById('rp-right');
    
    let currentFile = null;

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) { upload.value = ''; controls.classList.add('hidden'); return UI.showError(v.error); }
      currentFile = file;
      controls.classList.remove('hidden');
    };

    const rotatePdf = async (degrees) => {
      if (!currentFile) return;
      UI.showToast('Rotating...', 'info');
      
      try {
        const { PDFDocument, degrees: pDegrees } = window.PDFLib;
        const arrayBuffer = await currentFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        const pages = pdf.getPages();
        for (const page of pages) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(pDegrees(currentRotation + degrees));
        }
        
        const pdfBytes = await pdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'rotated.pdf';
        a.click();
        
        UI.showToast('PDF Rotated!', 'success');
      } catch (err) {
        console.error(err);
        UI.showError('Failed to rotate PDF.');
      }
    };

    btnLeft.onclick = () => rotatePdf(-90);
    btnRight.onclick = () => rotatePdf(90);
  }
};
