// Lazy loaders for heavy libs. Each returns a cached Promise that resolves to the global.
// Tools call these on first user action so the libs aren't downloaded until needed.

let pdfLibPromise = null;
let pdfJsPromise = null;
let qrPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

// pdf-lib (writing PDFs) → global PDFLib
export function loadPdfLib() {
  if (window.PDFLib) return Promise.resolve(window.PDFLib);
  if (!pdfLibPromise) {
    pdfLibPromise = loadScript('lib/pdf-lib.min.js').then(() => {
      if (!window.PDFLib) throw new Error('pdf-lib failed to register.');
      return window.PDFLib;
    }).catch(err => { pdfLibPromise = null; throw err; });
  }
  return pdfLibPromise;
}

// pdf.js (reading PDFs) → global pdfjsLib
export function loadPdfJs() {
  const get = () => window.pdfjsLib || window['pdfjs-dist/build/pdf'];
  if (get()) return Promise.resolve(get());
  if (!pdfJsPromise) {
    pdfJsPromise = loadScript('lib/pdf.min.js').then(() => {
      const lib = get();
      if (!lib) throw new Error('pdf.js failed to register.');
      lib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
      return lib;
    }).catch(err => { pdfJsPromise = null; throw err; });
  }
  return pdfJsPromise;
}

// qrcode.js → global QRCode
export function loadQRCode() {
  if (window.QRCode) return Promise.resolve(window.QRCode);
  if (!qrPromise) {
    qrPromise = loadScript('lib/qrcode.min.js').then(() => {
      if (!window.QRCode) throw new Error('qrcode failed to register.');
      return window.QRCode;
    }).catch(err => { qrPromise = null; throw err; });
  }
  return qrPromise;
}
