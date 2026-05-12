import { UI } from '../core/ui.js';

const countWhitespace = (text) => (text.match(/\s/g) || []).length;

export default {
  init() {
    const input = document.getElementById('ws-input');
    const output = document.getElementById('ws-output');
    const originalCount = document.getElementById('ws-original-count');
    const resultCount = document.getElementById('ws-result-count');
    const reducedCount = document.getElementById('ws-reduced-count');
    const spaceCount = document.getElementById('ws-space-count');
    const summary = document.getElementById('ws-summary');

    const updateStats = (label) => {
      const before = input.value;
      const after = output.value;
      const charReduced = Math.max(0, before.length - after.length);
      const wsReduced = Math.max(0, countWhitespace(before) - countWhitespace(after));
      originalCount.textContent = String(before.length);
      resultCount.textContent = String(after.length);
      reducedCount.textContent = String(charReduced);
      spaceCount.textContent = String(wsReduced);
      summary.textContent = label ? label + ': reduced ' + charReduced + ' character(s), including ' + wsReduced + ' whitespace character(s).' : 'Choose a cleanup action to see exactly what changed.';
    };

    document.getElementById('btn-extra').onclick = () => {
      output.value = input.value.replace(/[ \t]+/g, ' ').trim();
      updateStats('Extra spaces removed');
    };

    document.getElementById('btn-all').onclick = () => {
      output.value = input.value.replace(/\s+/g, '');
      updateStats('All whitespace removed');
    };

    document.getElementById('btn-empty-lines').onclick = () => {
      output.value = input.value.replace(/^\s*[\r\n]/gm, '');
      updateStats('Empty lines removed');
    };

    input.addEventListener('input', () => {
      if (!output.value) updateStats('');
    });

    document.getElementById('ws-copy').onclick = () => {
      if (!output.value) return UI.showError('No text to copy');
      return UI.copyText(output.value);
    };

    updateStats('');
  }
};
