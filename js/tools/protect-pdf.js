import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';

let qpdfPromise = null;

async function loadQpdf() {
  if (!qpdfPromise) {
    qpdfPromise = import('../../lib/qpdf.js').then(({ default: createModule }) => createModule({
      locateFile: () => 'lib/qpdf.wasm',
      noInitialRun: true,
    }));
  }
  return qpdfPromise;
}

function safePdfName(name) {
  const base = String(name || 'protected.pdf')
    .replace(/\.pdf$/i, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .trim() || 'protected';
  return `${base}-protected.pdf`;
}

export default {
  async init() {
    const upload = document.getElementById('ppr-upload');
    const passEl = document.getElementById('ppr-pass');
    const suggestBtn = document.getElementById('ppr-suggest');
    const generateBtn = document.getElementById('ppr-generate');
    const status = document.getElementById('ppr-status');
    const fileStatus = document.getElementById('ppr-file-status');
    let currentFile = null;

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) {
        currentFile = null;
        upload.value = '';
        fileStatus.textContent = 'No PDF selected yet.';
        status.textContent = v.error;
        status.classList.add('status-warning');
        return UI.showError(v.error);
      }
      currentFile = file;
      fileStatus.textContent = file.name + ' selected.';
      status.textContent = 'PDF is valid. Enter a password and protect it.';
      status.classList.remove('status-warning');
    };

    suggestBtn.onclick = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*?';
      const bytes = new Uint8Array(18);
      crypto.getRandomValues(bytes);
      passEl.value = Array.from(bytes, (b) => chars[b % chars.length]).join('');
      status.textContent = 'Suggested password created.';
      status.classList.remove('status-warning');
    };

    generateBtn.onclick = async () => {
      if (!currentFile) return UI.showError('Select a PDF first.');
      const password = passEl.value;
      if (!password) return UI.showError('Enter a password.');
      if (password.length < 4) return UI.showError('Use at least 4 characters.');

      UI.setLoading(generateBtn, true, 'Protect & Download');
      status.textContent = 'Protecting PDF...';
      status.classList.remove('status-warning');

      const inputPath = `/input-${Date.now()}.pdf`;
      const outputPath = `/output-${Date.now()}.pdf`;

      try {
        const qpdf = await loadQpdf();
        qpdf.FS.writeFile(inputPath, new Uint8Array(await currentFile.arrayBuffer()));

        const exitCode = qpdf.callMain([
          '--encrypt',
          password,
          password,
          '256',
          '--',
          inputPath,
          outputPath,
        ]);

        if (exitCode) throw new Error(`qpdf exited with ${exitCode}`);
        const outputBytes = qpdf.FS.readFile(outputPath);
        FileHelper.downloadBlob(safePdfName(currentFile.name), new Blob([outputBytes], { type: 'application/pdf' }));
        status.textContent = 'Protected PDF downloaded.';
        UI.showSuccess('Protected PDF downloaded.');
      } catch (err) {
        console.error(err);
        status.textContent = 'Could not protect this PDF. It may be encrypted, damaged, or unsupported.';
        status.classList.add('status-warning');
        UI.showError('Could not protect this PDF.');
      } finally {
        try {
          const qpdf = await qpdfPromise;
          try { qpdf.FS.unlink(inputPath); } catch {}
          try { qpdf.FS.unlink(outputPath); } catch {}
        } catch {}
        UI.setLoading(generateBtn, false, 'Protect & Download');
      }
    };
  }
};
