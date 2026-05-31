const VERSION = 'pocket-shell-v1';
const CACHE = `${VERSION}-cache`;

const PRECACHE_URLS = [
  '/',
  '/home/',
  '/home/index.html',
  '/home/css/styles.css?v=22',
  '/home/script.js?v=9',
  '/apps/everyday/',
  '/apps/everyday/index.html',
  '/apps/everyday/manifest.json?v=4',
  '/apps/everyday/css/styles.css?v=3',
  '/apps/everyday/js/theme.js?v=1',
  '/apps/everyday/js/app.js?v=30',
  '/apps/everyday/js/router.js?v=4',
  '/apps/everyday/js/registry.js',
  '/apps/everyday/js/core/ui.js',
  '/apps/everyday/js/core/file.js',
  '/apps/everyday/js/core/validate.js',
  '/apps/everyday/js/core/lazy.js',
  '/apps/everyday/assets/pocket-tools-logo-192.png',
  '/apps/everyday/assets/pwa-icon-app-192.png',
  '/apps/dev/',
  '/apps/dev/index.html',
  '/apps/dev/manifest.json?v=7',
  '/apps/dev/css/styles.css?v=17',
  '/apps/dev/js/theme.js?v=13',
  '/apps/dev/js/app.js?v=24',
  '/apps/dev/js/regex-worker.js?v=1',
  '/apps/dev/assets/pocket-tools-logo-192.png',
  '/apps/dev/assets/pwa-icon-app-192.png',
];

const FALLBACKS = new Map([
  ['/', '/home/'],
  ['/home', '/home/'],
  ['/home/', '/home/'],
  ['/apps/everyday', '/apps/everyday/'],
  ['/apps/everyday/', '/apps/everyday/'],
  ['/apps/dev', '/apps/dev/'],
  ['/apps/dev/', '/apps/dev/'],
]);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      const response = await fetch(url, { cache: 'reload' });
      if (!response.ok) throw new Error(`Shell precache failed: ${url}`);
      await cache.put(url, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith('pocket-shell-') && key !== CACHE)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function offlinePage() {
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pocket Tools is offline</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#141413;color:#f5f3ef;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace}
    main{width:min(100% - 40px,440px)}
    h1{font-size:24px;line-height:1.25;margin:0 0 14px}
    p{color:#b4b0a8;line-height:1.7;margin:0}
  </style>
</head>
<body>
  <main>
    <h1>Pocket Tools needs one online load.</h1>
    <p>Reconnect once to refresh this page. After a Pocket app opens successfully, it can keep working from its offline cache.</p>
  </main>
</body>
</html>`, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function cacheFirst(request, fallbackUrl = '') {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  if (fallbackUrl) {
    const fallback = await cache.match(fallbackUrl);
    if (fallback) return fallback;
  }
  return null;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const fallbackUrl = FALLBACKS.get(url.pathname) || '';
  const isShellPath = Boolean(fallbackUrl) || PRECACHE_URLS.some((path) => {
    const precacheUrl = new URL(path, self.location.origin);
    return precacheUrl.pathname === url.pathname && precacheUrl.search === url.search;
  });

  if (!isShellPath) return;

  const networkTask = fetch(request)
    .then(async (fresh) => {
      if (fresh.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, fresh.clone());
        if (fallbackUrl) await cache.put(fallbackUrl, fresh.clone());
      }
      return fresh;
    })
    .catch(() => null);

  event.waitUntil(networkTask);
  event.respondWith((async () => {
    if (request.mode === 'navigate') {
      const cached = await cacheFirst(request, fallbackUrl);
      const fresh = await networkTask;
      return fresh || cached || offlinePage();
    }

    const cached = await cacheFirst(request, fallbackUrl);
    if (cached) return cached;
    return await networkTask || offlinePage();
  })());
});
