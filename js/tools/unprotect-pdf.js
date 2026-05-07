import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfJs, loadPdfLib } from '../core/lazy.js';

export default {
  async init() {
    const upload = document.getElementById('up-upload');
    const controls = document.getElementById('up-controls');
    const passEl = document.getElementById('up-pass');
    const btnGen = document.getElementById('up-generate');
    
    let currentFile = null;

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) {
        currentFile = null;
        upload.value = '';
        controls.classList.add('hidden');
        return UI.showError(v.error);
      }
      currentFile = file;
      controls.classList.remove('hidden');
    };

    btnGen.onclick = async () => {
      if (!currentFile || !passEl.value) return UI.showError('Enter the current password');
      
      UI.showToast('Unlocking...', 'info');
      btnGen.disabled = true;
      btnGen.textContent = 'Unlocking...';
      
      try {
        const [pdfjsLib, pdfLib] = await Promise.all([loadPdfJs(), loadPdfLib()]);
        const { PDFDocument } = pdfLib;
        const arrayBuffer = await currentFile.arrayBuffer();

        const sourcePdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
          password: passEl.value,
        }).promise;

        const unlockedPdf = await PDFDocument.create();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas is unavailable.');

        for (let i = 1; i <= sourcePdf.numPages; i++) {
          btnGen.textContent = `Unlocking ${i}/${sourcePdf.numPages}`;
          const sourcePage = await sourcePdf.getPage(i);
          const pageViewport = sourcePage.getViewport({ scale: 1 });
          const renderViewport = sourcePage.getViewport({ scale: 2 });

          canvas.width = Math.ceil(renderViewport.width);
          canvas.height = Math.ceil(renderViewport.height);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          await sourcePage.render({
            canvasContext: ctx,
            viewport: renderViewport,
          }).promise;

          const pngBytes = await new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
              try {
                if (!blob) throw new Error('Could not render PDF page.');
                resolve(await blob.arrayBuffer());
              } catch (err) {
                reject(err);
              }
            }, 'image/png');
          });

          const image = await unlockedPdf.embedPng(pngBytes);
          const newPage = unlockedPdf.addPage([pageViewport.width, pageViewport.height]);
          newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: pageViewport.width,
            height: pageViewport.height,
          });
        }

        await sourcePdf.destroy();
        const pdfBytes = await unlockedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        FileHelper.downloadBlob('unlocked.pdf', blob);

        UI.showToast('Unlocked PDF created!', 'success');
        passEl.value = '';
      } catch (err) {
        console.error(err);
        UI.showError('Incorrect password, invalid PDF, or unsupported encryption.');
      } finally {
        btnGen.disabled = false;
        btnGen.textContent = 'Unlock PDF';
      }
    };
  }
};
