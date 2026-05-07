import { UI } from '../core/ui.js';

export default {
  init() {
    const input = document.getElementById('ws-input');
    const output = document.getElementById('ws-output');
    
    document.getElementById('btn-extra').onclick = () => {
      output.value = input.value.replace(/[ \t]+/g, ' ').trim();
    };
    
    document.getElementById('btn-all').onclick = () => {
      output.value = input.value.replace(/\s+/g, '');
    };
    
    document.getElementById('btn-empty-lines').onclick = () => {
      output.value = input.value.replace(/^\s*[\r\n]/gm, '');
    };
    
    document.getElementById('ws-copy').onclick = () => {
      if (!output.value) return UI.showError('No text to copy');
      navigator.clipboard.writeText(output.value)
        .then(() => UI.showToast('Copied to clipboard!', 'success'))
        .catch(() => UI.showError('Failed to copy'));
    };
  }
};
