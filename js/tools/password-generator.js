import { UI } from '../core/ui.js';

export default {
  init() {
    const lenEl = document.getElementById('pg-length');
    const lenVal = document.getElementById('pg-length-val');
    const outEl = document.getElementById('pg-output');
    
    const upperEl = document.getElementById('pg-upper');
    const lowerEl = document.getElementById('pg-lower');
    const numEl = document.getElementById('pg-numbers');
    const symEl = document.getElementById('pg-symbols');

    lenEl.addEventListener('input', () => {
      lenVal.textContent = lenEl.value;
    });

    const generate = () => {
      const length = parseInt(lenEl.value);
      const hasUpper = upperEl.checked;
      const hasLower = lowerEl.checked;
      const hasNum = numEl.checked;
      const hasSym = symEl.checked;

      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

      let chars = "";
      if (hasUpper) chars += upper;
      if (hasLower) chars += lower;
      if (hasNum) chars += numbers;
      if (hasSym) chars += symbols;

      if (chars === "") {
        UI.showError("Select at least one character type");
        return;
      }

      // Cryptographically-secure: use crypto.getRandomValues + rejection
      // sampling so all characters are uniformly distributed (no modulo bias).
      const cryptoApi = window.crypto || window.msCrypto;
      if (!cryptoApi || !cryptoApi.getRandomValues) {
        UI.showError('Secure random not available in this browser.');
        return;
      }
      const limit = 256 - (256 % chars.length);
      const buf = new Uint8Array(64);
      let password = "";
      let idx = buf.length;
      while (password.length < length) {
        if (idx >= buf.length) { cryptoApi.getRandomValues(buf); idx = 0; }
        const b = buf[idx++];
        if (b < limit) password += chars.charAt(b % chars.length);
      }

      outEl.textContent = password;
    };

    document.getElementById('btn-pg-generate').onclick = generate;

    document.getElementById('btn-pg-copy').onclick = () => {
      if (outEl.textContent === 'Click Generate') return UI.showError('Generate a password first');
      navigator.clipboard.writeText(outEl.textContent)
        .then(() => UI.showToast('Password copied!', 'success'))
        .catch(() => UI.showError('Failed to copy'));
    };
    
    generate();
  }
};
