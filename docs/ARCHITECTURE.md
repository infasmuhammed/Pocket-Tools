# Pocket Tools — Architecture

A family of independent, offline-first PWAs published under one domain.

```
pocket-tools/
├── home/                       ← Landing website  (/ redirects here)
│   ├── index.html
│   └── css/styles.css
├── apps/                       ← All apps live here
│   ├── everyday/               ← Pocket Everyday  (live)
│   ├── dev/                   ← Pocket Dev       (live)
│   ├── qa/                     ← Pocket QA        (planned)
│   └── design/                 ← Pocket Design    (planned)
├── shared/                     ← Reusable core
│   ├── assets/                 (icons, images used by multiple apps)
│   ├── common-css/             (resets, buttons, typography, modals, toast)
│   └── common-js/              (UI helpers, file handlers, validators)
├── docs/
├── _headers                    ← Cloudflare headers (CSP, caching)
├── _redirects                  ← `/  /home/  301`
├── wrangler.jsonc              ← Cloudflare Workers Assets config
├── robots.txt
└── sitemap.xml
```

## URLs

| URL                          | Serves                       |
|------------------------------|------------------------------|
| `/`                          | 301 → `/home/`               |
| `/home/`                     | Landing page                 |
| `/apps/everyday/`            | Pocket Everyday app          |
| `/apps/dev/`                | Pocket Dev app               |
| `/apps/qa/`   *(future)*     | Pocket QA app                |

## Per-app rules

Each app under `/apps/<name>/` is **self-contained**:

- Own `index.html`
- Own `manifest.json` with `scope: "/apps/<name>/"` and `start_url: "/apps/<name>/"`
- Own `sw.js` (scoped to `/apps/<name>/`)
- Own `css/`, `js/`, `templates/`, `assets/`, `lib/`

This guarantees:
- Each app installs as a **separate PWA** on the user's device.
- A change in one app **cannot break another**.
- Each app's service-worker cache is isolated → no cross-app eviction.

## Shared folder

Use `/shared/` for **truly reusable** code only:
- common CSS resets, button styles, typography
- icons used across apps
- utility JS (date helpers, file helpers, etc.)

Apps reference shared assets by absolute path: `/shared/common-css/buttons.css`.

## Deployment

Single Cloudflare Workers project (`wrangler.jsonc`) serves the entire directory.
`not_found_handling: "single-page-application"` falls back to root `index.html`.

```bash
npx wrangler deploy
```

## Adding a new app

1. `mkdir apps/<name>`
2. Copy a template into it (own `index.html`, `manifest.json`, `sw.js`)
3. Set manifest `scope` + `start_url` to `/apps/<name>/`
4. Flip its card on `home/index.html` from `.is-soon` to a real `<a href="/apps/<name>/">`
5. Add the URL to `sitemap.xml`
6. `npx wrangler deploy`
