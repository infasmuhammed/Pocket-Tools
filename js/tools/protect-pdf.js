import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';

export default {
  async init() {
    const upload = document.getElementById('ppr-upload');
    const controls = document.getElementById('ppr-controls');
    const passEl = document.getElementById('ppr-pass');
    const suggestBtn = document.getElementById('ppr-suggest');
    const btnGen = document.getElementById('ppr-generate');
    
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

    suggestBtn.onclick = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*?';
      const bytes = new Uint8Array(18);
      crypto.getRandomValues(bytes);
      passEl.value = Array.from(bytes, b => chars[b % chars.length]).join('');
      UI.showSuccess('Suggested password created.');
    };

    btnGen.onclick = async () => {
      if (!currentFile || !passEl.value) return UI.showError('Select a PDF and enter a password');
      UI.showError('Password encryption is not supported by this offline PDF engine.');
    };
  }
};
