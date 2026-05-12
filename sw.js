// Pocket Tools — service worker.
// Strategy: full app precache for offline-first install, plus runtime refreshes.

const VERSION = 'pocket-tools-v26';
const PRECACHE = `${VERSION}-precache`;
const RUNTIME  = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/router.js',
  './js/registry.js',
  './js/core/ui.js',
  './js/core/file.js',
  './js/core/validate.js',
  './js/core/lazy.js',

  // Libraries
  './lib/qrcode.min.js',
  './lib/pdf-lib.min.js',
  './lib/pdf.min.js',
  './lib/pdf.worker.min.js',
  './lib/qpdf.js',
  './lib/qpdf.wasm',

  // Assets
  './assets/icon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/apple-touch-icon.png',

  // Tool templates
  './templates/image-compressor.html',
  './templates/format-converter.html',
  './templates/bulk-renamer.html',
  './templates/social-resizer.html',
  './templates/ratio-cropper.html',
  './templates/photo-pdf.html',
  './templates/color-picker.html',
  './templates/watermark.html',
  './templates/black-and-white.html',
  './templates/merge-pdf.html',
  './templates/split-pdf.html',
  './templates/protect-pdf.html',
  './templates/page-numbers.html',
  './templates/extract-pdf.html',
  './templates/rotate-pdf.html',
  './templates/unprotect-pdf.html',
  './templates/id-masker.html',
  './templates/receipt-enhancer.html',
  './templates/word-counter.html',
  './templates/case-converter.html',
  './templates/whitespace-remover.html',
  './templates/alphabetical-sorter.html',
  './templates/duplicate-remover.html',
  './templates/reading-time.html',
  './templates/bill-splitter.html',
  './templates/discount-calculator.html',
  './templates/emi-calculator.html',
  './templates/percentage-change.html',
  './templates/unit-converter.html',
  './templates/grocery-calculator.html',
  './templates/pomodoro.html',
  './templates/days-between.html',
  './templates/timezone.html',
  './templates/stopwatch.html',
  './templates/password-generator.html',
  './templates/qr-generator.html',
  './templates/random-decision.html',
  './templates/signature-png.html',

  // Tool scripts
  './js/tools/image-compressor.js',
  './js/tools/format-converter.js',
  './js/tools/bulk-renamer.js',
  './js/tools/social-resizer.js',
  './js/tools/ratio-cropper.js',
  './js/tools/photo-pdf.js',
  './js/tools/color-picker.js',
  './js/tools/watermark.js',
  './js/tools/black-and-white.js',
  './js/tools/merge-pdf.js',
  './js/tools/split-pdf.js',
  './js/tools/protect-pdf.js',
  './js/tools/page-numbers.js',
  './js/tools/extract-pdf.js',
  './js/tools/rotate-pdf.js',
  './js/tools/unprotect-pdf.js',
  './js/tools/id-masker.js',
  './js/tools/receipt-enhancer.js',
  './js/tools/word-counter.js',
  './js/tools/case-converter.js',
  './js/tools/whitespace-remover.js',
  './js/tools/alphabetical-sorter.js',
  './js/tools/duplicate-remover.js',
  './js/tools/reading-time.js',
  './js/tools/bill-splitter.js',
  './js/tools/discount-calculator.js',
  './js/tools/emi-calculator.js',
  './js/tools/percentage-change.js',
  './js/tools/unit-converter.js',
  './js/tools/grocery-calculator.js',
  './js/tools/pomodoro.js',
  './js/tools/days-between.js',
  './js/tools/timezone.js',
  './js/tools/stopwatch.js',
  './js/tools/password-generator.js',
  './js/tools/qr-generator.js',
  './js/tools/random-decision.js',
  './js/tools/signature-png.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    await Promise.allSettled(PRECACHE_URLS.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (!res.ok) {
          console.warn(`[sw] precache skipped: ${url} (${res.status})`);
          return;
        }
        await cache.put(url, res);
      } catch (err) {
        console.warn(`[sw] precache error: ${url}`, err);
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => k !== PRECACHE && k !== RUNTIME)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GETs
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests → app shell fallback (so refresh on a tool route works offline)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(PRECACHE);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match('./index.html');
        return cached || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' }});
      }
    })());
    return;
  }

  // Cache-first for everything else (templates, tool JS, lib, assets)
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) {
      // Stale-while-revalidate: refresh in background
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(req);
          if (fresh.ok) {
            const cache = await caches.open(RUNTIME);
            await cache.put(req, fresh.clone());
          }
        } catch { /* offline — ignore */ }
      })());
      return cached;
    }
    try {
      const fresh = await fetch(req);
      if (fresh.ok) {
        const cache = await caches.open(RUNTIME);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
