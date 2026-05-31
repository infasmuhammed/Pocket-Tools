// Pocket Tools — service worker.
// Strategy: full app precache for offline-first install, plus runtime refreshes.

const VERSION = 'pocket-everyday-v15';
const PRECACHE = `${VERSION}-precache`;
const RUNTIME  = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './manifest.json?v=4',
  './css/styles.css',
  './css/styles.css?v=3',
  './js/theme.js',
  './js/theme.js?v=1',
  './js/app.js',
  './js/app.js?v=30',
  './js/router.js',
  './js/router.js?v=4',
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
  './assets/pocket-tools-logo.png',
  './assets/pocket-tools-logo-180.png',
  './assets/pocket-tools-logo-192.png',
  './assets/pocket-tools-logo-512.png',
  './assets/pocket-tools-logo-maskable-512.png',
  './assets/pwa-icon-app.png',
  './assets/pwa-icon-app-180.png',
  './assets/pwa-icon-app-192.png',
  './assets/pwa-icon-app-512.png',
  './assets/pwa-icon-app-maskable-512.png',

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

function offlinePage() {
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pocket Everyday is offline</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0e0e0d;color:#f5f3ef;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace}
    main{width:min(100% - 40px,440px)}
    h1{font-size:24px;line-height:1.25;margin:0 0 14px}
    p{color:#b4b0a8;line-height:1.7;margin:0}
  </style>
</head>
<body>
  <main>
    <h1>Pocket Everyday needs one online load.</h1>
    <p>Reconnect once to finish caching the app. After that, the everyday tools can open offline.</p>
  </main>
</body>
</html>`, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      const res = await fetch(url, { cache: 'reload' });
      if (!res.ok) throw new Error(`Precache failed: ${url} (${res.status})`);
      await cache.put(url, res);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => k.startsWith('pocket-everyday-') && k !== PRECACHE && k !== RUNTIME)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function matchAppCache(request, options = {}) {
  const fallbackIgnoresSearch = Boolean(options.ignoreSearchFallback);
  const runtimeFirst = Boolean(options.runtimeFirst);
  const precache = await caches.open(PRECACHE);
  const runtime = await caches.open(RUNTIME);

  let cached = runtimeFirst ? await runtime.match(request) : await precache.match(request);
  if (cached) return cached;
  cached = runtimeFirst ? await precache.match(request) : await runtime.match(request);
  if (cached) return cached;
  if (!fallbackIgnoresSearch) return undefined;

  cached = await runtime.match(request, { ignoreSearch: true });
  if (cached) return cached;
  return precache.match(request, { ignoreSearch: true });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GETs
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests → app shell fallback (so refresh on a tool route works offline)
  if (req.mode === 'navigate') {
    const networkTask = fetch(req)
      .then(async (fresh) => {
        if (fresh.ok) {
          const cache = await caches.open(RUNTIME);
          await cache.put('./index.html', fresh.clone());
        }
        return fresh;
      })
      .catch(() => null);

    event.waitUntil(networkTask);
    event.respondWith((async () => {
      const cached = await matchAppCache('./index.html', { runtimeFirst: true });
      if (cached) {
        return cached;
      }

      const fresh = await networkTask;
      return fresh || offlinePage();
    })());
    return;
  }

  // Cache-first for everything else (templates, tool JS, lib, assets)
  event.respondWith((async () => {
    const cached = await matchAppCache(req, { ignoreSearchFallback: true });
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
