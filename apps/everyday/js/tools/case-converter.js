import { UI } from '../core/ui.js';

const words = (text) => (text.trim().match(/\S+/g) || []).length;
const changedChars = (before, after) => {
  const max = Math.max(before.length, after.length);
  let changed = 0;
  for (let i = 0; i < max; i += 1) if (before[i] !== after[i]) changed += 1;
  return changed;
};

export default {
  init() {
    const input = document.getElementById('cc-input');
    const output = document.getElementById('cc-output');
    const charCount = document.getElementById('cc-char-count');
    const changeCount = document.getElementById('cc-change-count');
    const wordCount = document.getElementById('cc-word-count');
    const summary = document.getElementById('cc-summary');

    const apply = (label, fn) => {
      const before = input.value;
      output.value = fn(before);
      const changed = changedChars(before, output.value);
      charCount.textContent = String(before.length);
      changeCount.textContent = String(changed);
      wordCount.textContent = String(words(before));
      summary.textContent = label + ': ' + changed + ' character position(s) changed. No words or lines are removed by this tool.';
    };

    document.getElementById('btn-upper').onclick = () => apply('UPPERCASE', (text) => text.toUpperCase());
    document.getElementById('btn-lower').onclick = () => apply('lowercase', (text) => text.toLowerCase());
    document.getElementById('btn-title').onclick = () => apply('Title Case', (text) => text.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase()));
    document.getElementById('btn-sentence').onclick = () => apply('Sentence case', (text) => text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()));

    input.addEventListener('input', () => {
      if (!output.value) {
        charCount.textContent = String(input.value.length);
        changeCount.textContent = '0';
        wordCount.textContent = String(words(input.value));
        summary.textContent = 'Choose a case action to see the change count.';
      }
    });

    document.getElementById('cc-copy').onclick = () => {
      if (!output.value) return UI.showError('No text to copy');
      return UI.copyText(output.value);
    };
  }
};
