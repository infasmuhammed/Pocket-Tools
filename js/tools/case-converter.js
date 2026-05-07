import { UI } from '../core/ui.js';

export default {
  init() {
    const input = document.getElementById('cc-input');
    const output = document.getElementById('cc-output');
    
    document.getElementById('btn-upper').onclick = () => output.value = input.value.toUpperCase();
    document.getElementById('btn-lower').onclick = () => output.value = input.value.toLowerCase();
    
    document.getElementById('btn-title').onclick = () => {
      output.value = input.value.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
    };
    
    document.getElementById('btn-sentence').onclick = () => {
      output.value = input.value.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    };

    document.getElementById('cc-copy').onclick = () => {
      if (!output.value) return UI.showError('No text to copy');
      navigator.clipboard.writeText(output.value)
        .then(() => UI.showToast('Copied to clipboard!', 'success'))
        .catch(() => UI.showError('Failed to copy'));
    };
  }
};
