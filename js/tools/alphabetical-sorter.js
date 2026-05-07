import { UI } from '../core/ui.js';

export default {
  init() {
    const input = document.getElementById('as-input');
    const output = document.getElementById('as-output');
    
    const sortLines = (desc = false) => {
      if (!input.value) return;
      const lines = input.value.split('\n').filter(l => l.trim() !== '');
      lines.sort((a, b) => a.localeCompare(b));
      if (desc) lines.reverse();
      output.value = lines.join('\n');
    };

    document.getElementById('btn-sort-az').onclick = () => sortLines(false);
    document.getElementById('btn-sort-za').onclick = () => sortLines(true);
    
    document.getElementById('as-copy').onclick = () => {
      if (!output.value) return UI.showError('No text to copy');
      navigator.clipboard.writeText(output.value)
        .then(() => UI.showToast('Copied to clipboard!', 'success'))
        .catch(() => UI.showError('Failed to copy'));
    };
  }
};
