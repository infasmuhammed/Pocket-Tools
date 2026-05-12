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

export default {
  async init() {
    const upload = document.getElementById('up-upload');
    const controls = document.getElementById('up-controls');
    const passEl = document.getElementById('up-pass');
    const btnGen = document.getElementById('up-generate');

    let currentFile = null;

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) {
        currentFile = null;
        upload.value = '';
        controls.classList.add('hidden');
        return UI.showError(v.error);
      }
      currentFile = file;
      controls.classList.remove('hidden');
    };

    btnGen.onclick = async () => {
      if (!currentFile || !passEl.value) return UI.showError('Enter the current password');

      UI.showToast('Unlocking...', 'info');
      btnGen.disabled = true;
      btnGen.textContent = 'Unlocking...';

      const inputPath = `/input-${Date.now()}.pdf`;
      const outputPath = `/output-${Date.now()}.pdf`;

      try {
        const qpdf = await loadQpdf();
        qpdf.FS.writeFile(inputPath, new Uint8Array(await currentFile.arrayBuffer()));

        const exitCode = qpdf.callMain([
          `--password=${passEl.value}`,
          '--decrypt',
          inputPath,
          outputPath,
        ]);

        if (exitCode) throw new Error(`qpdf exited with ${exitCode}`);
        const outputBytes = qpdf.FS.readFile(outputPath);
        FileHelper.downloadBlob('unlocked.pdf', new Blob([outputBytes], { type: 'application/pdf' }));

        UI.showToast('Unlocked PDF created!', 'success');
        passEl.value = '';
      } catch (err) {
        console.error(err);
        UI.showError('Incorrect password, invalid PDF, or unsupported encryption.');
      } finally {
        try {
          const qpdf = await qpdfPromise;
          try { qpdf.FS.unlink(inputPath); } catch {}
          try { qpdf.FS.unlink(outputPath); } catch {}
        } catch {}
        btnGen.disabled = false;
        btnGen.textContent = 'Unlock PDF';
      }
    };
  }
};
