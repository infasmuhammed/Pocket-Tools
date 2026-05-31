import { UI } from '../core/ui.js';

export default {
  init() {
    const input = document.getElementById('as-input');
    const output = document.getElementById('as-output');
    
    const sortLines = (desc = false) => {
      if (!input.value) return;
      const lines = input.value.split('\n').map(l => l.trim()).filter(l => l !== '');
      lines.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      if (desc) lines.reverse();
      output.value = lines.join('\n');
    };

    document.getElementById('btn-sort-az').onclick = () => sortLines(false);
    document.getElementById('btn-sort-za').onclick = () => sortLines(true);
    
    document.getElementById('as-copy').onclick = () => {
      if (!output.value) return UI.showError('No text to copy');
      return UI.copyText(output.value);
    };
  }
};
