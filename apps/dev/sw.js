const VERSION = "pocket-dev-v28";
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;
const RUNTIME_LIMIT = 50;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./manifest.json?v=7",
  "./css/styles.css?v=17",
  "./js/theme.js?v=13",
  "./js/app.js?v=24",
  "./js/regex-worker.js?v=1",
  "./assets/pocket-tools-logo.png",
  "./assets/pocket-tools-logo-180.png",
  "./assets/pocket-tools-logo-192.png",
  "./assets/pocket-tools-logo-512.png",
  "./assets/pocket-tools-logo-maskable-512.png",
  "./assets/pwa-icon-app.png",
  "./assets/pwa-icon-app-180.png",
  "./assets/pwa-icon-app-192.png",
  "./assets/pwa-icon-app-512.png",
  "./assets/pwa-icon-app-maskable-512.png",
  "./templates/app-icon-sizes.html",
  "./templates/base64.html",
  "./templates/case-converter.html",
  "./templates/color-converter.html",
  "./templates/contrast-checker.html",
  "./templates/css-minifier.html",
  "./templates/csv-json-converter.html",
  "./templates/dummy-json.html",
  "./templates/flutter-color.html",
  "./templates/gradient-generator.html",
  "./templates/hash-generator.html",
  "./templates/html-formatter.html",
  "./templates/image-color-extractor.html",
  "./templates/json-formatter.html",
  "./templates/jsonl-validator.html",
  "./templates/jwt-decoder.html",
  "./templates/lorem-ipsum.html",
  "./templates/markdown-preview.html",
  "./templates/mobile-density.html",
  "./templates/palette-generator.html",
  "./templates/regex-tester.html",
  "./templates/semver-compare.html",
  "./templates/timestamp-converter.html",
  "./templates/token-estimator.html",
  "./templates/url-encoder.html",
  "./templates/uuid-generator.html",
  "./templates/xml-formatter.html",
];

function offlinePage() {
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pocket Dev is offline</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0e0e0d;color:#f5f3ef;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace}
    main{width:min(100% - 40px,440px)}
    h1{font-size:24px;line-height:1.25;margin:0 0 14px}
    p{color:#b4b0a8;line-height:1.7;margin:0}
  </style>
</head>
<body>
  <main>
    <h1>Pocket Dev needs one online load.</h1>
    <p>Reconnect once to finish caching the app. After that, the developer tools can open offline.</p>
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

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      const response = await fetch(url, { cache: "reload" });
      if (!response.ok) throw new Error(`Precache failed: ${url} (${response.status})`);
      await cache.put(url, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith("pocket-dev-") && key !== PRECACHE && key !== RUNTIME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function trimRuntimeCache() {
  const cache = await caches.open(RUNTIME);
  const keys = await cache.keys();
  if (keys.length <= RUNTIME_LIMIT) return;
  await Promise.all(keys
    .slice(0, keys.length - RUNTIME_LIMIT)
    .map((request) => cache.delete(request)));
}

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

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    const networkTask = fetch(request)
      .then(async (fresh) => {
        if (fresh.ok) {
          const cache = await caches.open(RUNTIME);
          await cache.put("./index.html", fresh.clone());
          await trimRuntimeCache();
        }
        return fresh;
      })
      .catch(() => null);

    event.waitUntil(networkTask);
    event.respondWith((async () => {
      const cached = await matchAppCache("./index.html", { runtimeFirst: true });

      if (cached) {
        return cached;
      }

      const fresh = await networkTask;
      return fresh || offlinePage();
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await matchAppCache(request, { ignoreSearchFallback: true });
    if (cached) {
      event.waitUntil((async () => {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) {
            const cache = await caches.open(RUNTIME);
            await cache.put(request, fresh.clone());
            await trimRuntimeCache();
          }
        } catch {}
      })());
      return cached;
    }

    try {
      const fresh = await fetch(request);
      if (fresh.ok) {
        const cache = await caches.open(RUNTIME);
        await cache.put(request, fresh.clone());
        await trimRuntimeCache();
      }
      return fresh;
    } catch {
      return new Response("", { status: 504, statusText: "Offline" });
    }
  })());
});
