import { UI } from '../core/ui.js';

export default {
  init() {
    const input = document.getElementById('dl-input');
    const output = document.getElementById('dl-output');
    const stats = document.getElementById('dl-stats');
    
    document.getElementById('btn-remove-dup').onclick = () => {
      if (!input.value) return;
      const lines = input.value.split('\n');
      const unique = [...new Set(lines)];
      output.value = unique.join('\n');
      stats.textContent = `Removed ${lines.length - unique.length} duplicate(s).`;
    };
    
    document.getElementById('dl-copy').onclick = () => {
      if (!output.value) return UI.showError('No text to copy');
      navigator.clipboard.writeText(output.value)
        .then(() => UI.showToast('Copied to clipboard!', 'success'))
        .catch(() => UI.showError('Failed to copy'));
    };
  }
};
