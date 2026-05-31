import { UI } from '../core/ui.js';

export default {
  async init() {
    if (!window.QRCode) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './lib/qrcode.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load QR library'));
        document.head.appendChild(script);
      }).catch(err => {
        UI.showError('Could not load QR module offline');
        console.error(err);
      });
    }

    const input = document.getElementById('qr-input');
    const btnGen = document.getElementById('btn-qr-generate');
    const container = document.getElementById('qr-result-container');
    const qrDiv = document.getElementById('qr-code');
    const btnDownload = document.getElementById('btn-qr-download');

    let qrcode = null;

    btnGen.onclick = () => {
      const text = input.value.trim();
      if (!text) return UI.showError('Please enter text or URL');

      if (!window.QRCode) return UI.showError('QR Library not available');

      qrDiv.innerHTML = '';
      container.classList.remove('hidden');

      qrcode = new QRCode(qrDiv, {
        text: text,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
    };

    btnDownload.onclick = () => {
      const img = qrDiv.querySelector('img');
      const canvas = qrDiv.querySelector('canvas');
      
      let dataUrl = '';
      if (img && img.src) {
        dataUrl = img.src;
      } else if (canvas) {
        dataUrl = canvas.toDataURL("image/png");
      }

      if (!dataUrl) return UI.showError('QR Code not generated yet');

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  }
};
