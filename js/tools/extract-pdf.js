import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';

export default {
  async init() {
    const upload = document.getElementById('ep-upload');
    const controls = document.getElementById('ep-controls');
    const outEl = document.getElementById('ep-output');
    const btnGen = document.getElementById('ep-generate');
    const btnCopy = document.getElementById('ep-copy');
    
    let currentFile = null;

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) { upload.value = ''; controls.classList.add('hidden'); return UI.showError(v.error); }
      currentFile = file;
      controls.classList.remove('hidden');
      outEl.value = '';
    };

    btnGen.onclick = async () => {
      if (!currentFile) return;
      
      btnGen.disabled = true;
      btnGen.textContent = 'Loading Engine...';
      
      if (!window['pdfjs-dist/build/pdf']) {
        try {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = './lib/pdf.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          const pdfjsLib = window['pdfjs-dist/build/pdf'];
          pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdf.worker.min.js';
        } catch (e) {
          btnGen.disabled = false;
          btnGen.textContent = 'Extract Text';
          return UI.showError('Failed to load PDF engine offline.');
        }
      }

      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      
      UI.showToast('Extracting Text...', 'info');
      btnGen.textContent = 'Extracting...';
      
      try {
        const arrayBuffer = await currentFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        
        outEl.value = fullText.trim();
        UI.showToast('Extraction Complete!', 'success');
      } catch (err) {
        console.error(err);
        UI.showError('Failed to extract text. PDF might be scanned or protected.');
      } finally {
        btnGen.disabled = false;
        btnGen.textContent = 'Extract Text';
      }
    };

    btnCopy.onclick = () => {
      if (!outEl.value) return UI.showError('No text to copy');
      navigator.clipboard.writeText(outEl.value)
        .then(() => UI.showToast('Copied to clipboard!', 'success'))
        .catch(() => UI.showError('Failed to copy'));
    };
  }
};
