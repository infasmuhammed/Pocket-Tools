import { UI } from '../core/ui.js';

export default {
  init() {
    const input = document.getElementById('dl-input');
    const output = document.getElementById('dl-output');
    const originalLines = document.getElementById('dl-original-lines');
    const uniqueLines = document.getElementById('dl-unique-lines');
    const removedLines = document.getElementById('dl-removed-lines');
    const removedList = document.getElementById('dl-removed-list');

    document.getElementById('btn-remove-dup').onclick = () => {
      const lines = input.value.split(/\r?\n/);
      const seen = new Set();
      const unique = [];
      const removed = [];
      for (const line of lines) {
        const key = line.trim().toLowerCase();
        if (seen.has(key)) removed.push(line);
        else {
          seen.add(key);
          unique.push(line);
        }
      }
      output.value = unique.join('\n');
      originalLines.textContent = String(input.value ? lines.length : 0);
      uniqueLines.textContent = String(input.value ? unique.length : 0);
      removedLines.textContent = String(removed.length);
      removedList.textContent = removed.length ? 'Removed: ' + removed.slice(0, 8).map((line) => line || '[blank line]').join(', ') + (removed.length > 8 ? '...' : '') : 'No duplicate lines found.';
    };

    document.getElementById('dl-copy').onclick = () => {
      if (!output.value) return UI.showError('No text to copy');
      return UI.copyText(output.value);
    };
  }
};
