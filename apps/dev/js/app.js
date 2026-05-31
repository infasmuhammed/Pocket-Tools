"use strict";

const THEME_KEY = "pt-dev-theme";
const RECENT_KEY = "pt-dev-recent";
const HOME_SCROLL_KEY = "pt-dev-home-scroll";
const HOME_RETURN_TOOL_KEY = "pt-dev-home-return-tool";
const RECENT_MAX = 4;

function createSafeStorage(storageName) {
  const memory = new Map();
  const getStorage = () => {
    try {
      return window[storageName] || null;
    } catch {
      return null;
    }
  };

  return {
    getItem(key) {
      const storage = getStorage();
      if (storage) {
        try {
          return storage.getItem(key);
        } catch {}
      }
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      const stringValue = String(value);
      const storage = getStorage();
      if (storage) {
        try {
          storage.setItem(key, stringValue);
          return;
        } catch {}
      }
      memory.set(key, stringValue);
    },
    removeItem(key) {
      const storage = getStorage();
      if (storage) {
        try {
          storage.removeItem(key);
        } catch {}
      }
      memory.delete(key);
    }
  };
}

const SafeStorage = createSafeStorage("localStorage");
const SafeSessionStorage = createSafeStorage("sessionStorage");

const CATEGORIES = [
  { id: "colors", label: "Colors & UI" },
  { id: "format", label: "Formatters" },
  { id: "encode", label: "Encode & Crypto" },
  { id: "data", label: "Data & Time" },
  { id: "mobile", label: "Mobile" },
  { id: "ai", label: "AI & ML" }
];

const ICONS = {
  color: "M12 22a7 7 0 0 0 7-7c0-5-7-13-7-13S5 10 5 15a7 7 0 0 0 7 7z",
  gradient: "M4 4h16v16H4z M4 20 20 4",
  code: "M8 9l-4 3 4 3 M16 9l4 3-4 3 M14 5l-4 14",
  braces: "M8 4H6a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2 M16 4h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-2",
  regex: "M4 12h16 M8 8v8 M6 10l4 4 M10 10l-4 4 M15 8v8 M18 8v8",
  lock: "M6 10h12v10H6z M8 10V8a4 4 0 0 1 8 0v2",
  link: "M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.2 1.2 M14 11a5 5 0 0 0-7.07 0l-2 2A5 5 0 0 0 12 20.07l1.2-1.2",
  clock: "M12 8v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  phone: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M11 18h2",
  spark: "M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z",
  hash: "M10 3 8 21 M16 3l-2 18 M4 8h17 M3 16h17",
  list: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  image: "M4 5h16v14H4z M8 13l2.5-3 3.5 4.5 2-2.5 4 5 M8.5 8.5h.01",
  mobile: "M7 2h10v20H7z M11 18h2 M10 6h4",
  text: "M4 7V4h16v3 M9 20h6 M12 4v16",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
};

const TOOLS = [
  { id: "image-color-extractor", name: "Image Color Extractor", category: "colors", desc: "Extract a palette from an image", icon: ICONS.image },
  { id: "gradient-generator", name: "Gradient Generator", category: "colors", desc: "Build CSS gradients visually", icon: ICONS.gradient },
  { id: "color-converter", name: "HEX RGB HSL Converter", category: "colors", desc: "Convert colors both ways", icon: ICONS.color },
  { id: "contrast-checker", name: "Contrast Checker", category: "colors", desc: "WCAG contrast ratio", icon: ICONS.color },
  { id: "palette-generator", name: "Palette Generator", category: "colors", desc: "Generate UI palettes from a seed", icon: ICONS.spark },

  { id: "json-formatter", name: "JSON Formatter", category: "format", desc: "Format, minify and sort JSON", icon: ICONS.braces },
  { id: "html-formatter", name: "HTML Formatter", category: "format", desc: "Pretty print or minify HTML", icon: ICONS.code },
  { id: "css-minifier", name: "CSS Minifier", category: "format", desc: "Minify CSS locally", icon: ICONS.code },
  { id: "xml-formatter", name: "XML Formatter", category: "format", desc: "Format compact XML", icon: ICONS.code },
  { id: "markdown-preview", name: "Markdown Preview", category: "format", desc: "Preview Markdown safely", icon: ICONS.text },
  { id: "csv-json-converter", name: "CSV JSON Converter", category: "format", desc: "Convert CSV and JSON arrays", icon: ICONS.list },

  { id: "regex-tester", name: "Regex Tester", category: "encode", desc: "Test patterns and groups", icon: ICONS.regex },
  { id: "base64", name: "Base64 Encoder Decoder", category: "encode", desc: "Encode and decode UTF-8 text", icon: ICONS.code },
  { id: "url-encoder", name: "URL Encoder Decoder", category: "encode", desc: "Encode, decode and parse URLs", icon: ICONS.link },
  { id: "jwt-decoder", name: "JWT Decoder", category: "encode", desc: "Decode header and payload", icon: ICONS.lock },
  { id: "hash-generator", name: "Hash Generator", category: "encode", desc: "SHA hashes with Web Crypto", icon: ICONS.hash },

  { id: "timestamp-converter", name: "Timestamp Converter", category: "data", desc: "Unix, ISO and local time", icon: ICONS.clock },
  { id: "uuid-generator", name: "UUID Generator", category: "data", desc: "UUID v4 and short IDs", icon: ICONS.hash },
  { id: "lorem-ipsum", name: "Lorem Ipsum Generator", category: "data", desc: "Generate placeholder copy", icon: ICONS.text },
  { id: "dummy-json", name: "Dummy JSON Generator", category: "data", desc: "Generate fake users, products and events", icon: ICONS.braces },
  { id: "semver-compare", name: "Semver Compare", category: "data", desc: "Compare version numbers", icon: ICONS.list },
  { id: "case-converter", name: "Developer Case Converter", category: "data", desc: "camel, Pascal, snake, kebab", icon: ICONS.text },

  { id: "mobile-density", name: "Mobile Density Converter", category: "mobile", desc: "dp, pt, px and density buckets", icon: ICONS.mobile },
  { id: "flutter-color", name: "Flutter Color Helper", category: "mobile", desc: "Create Flutter, Android and iOS color code", icon: ICONS.mobile },
  { id: "app-icon-sizes", name: "App Icon Sizes", category: "mobile", desc: "PWA, iOS and Android icon checklist", icon: ICONS.image },

  { id: "jsonl-validator", name: "JSONL Validator", category: "ai", desc: "Validate JSON Lines datasets", icon: ICONS.braces },
  { id: "token-estimator", name: "Token Estimator", category: "ai", desc: "Rough tokens, words and characters", icon: ICONS.spark }
];

let currentCategory = "all";
let currentQuery = "";
let currentToolCleanup = null;
let activeRegexWorker = null;
let activeRegexTimer = 0;
let activeRegexReject = null;
let deferredInstallPrompt = null;
const templateCache = new Map();

function instantScrollTo(top = 0) {
  window.scrollTo({ top, left: 0, behavior: "auto" });
}

function replaceWithHomeRoute() {
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/`);
  route();
  requestAnimationFrame(restoreHomePosition);
}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function iconPath(path) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
}

function toast(message, type = "success") {
  const wrap = $("#toast-container");
  if (!wrap) return;
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;
  wrap.appendChild(item);
  window.setTimeout(() => item.remove(), 2600);
}

function fallbackCopyText(text) {
  const active = document.activeElement;
  const selection = window.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index)) : [];
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    textarea.remove();
    if (selection) {
      selection.removeAllRanges();
      ranges.forEach((range) => selection.addRange(range));
    }
    if (active && typeof active.focus === "function") active.focus({ preventScroll: true });
  }
  return copied;
}

function showManualCopy(text) {
  $(".manual-copy")?.remove();

  const wrap = document.createElement("div");
  wrap.className = "manual-copy";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-label", "Manual copy");

  const label = document.createElement("p");
  label.textContent = "Copy is blocked here. Press Ctrl/Cmd+C while this text is selected.";

  const textarea = document.createElement("textarea");
  textarea.className = "manual-copy-input";
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-label", "Text to copy");

  const close = document.createElement("button");
  close.className = "btn-secondary";
  close.type = "button";
  close.textContent = "Close";
  close.addEventListener("click", () => wrap.remove());

  wrap.append(label, textarea, close);
  document.body.appendChild(wrap);
  textarea.focus({ preventScroll: true });
  textarea.select();
}

function selectTextForManualCopy(text, source) {
  if (source && "select" in source) {
    source.focus({ preventScroll: true });
    source.select();
    if (typeof source.setSelectionRange === "function") source.setSelectionRange(0, source.value.length);
    return true;
  }

  if (source && window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(source);
    selection.removeAllRanges();
    selection.addRange(range);
    return Boolean(selection.toString());
  }

  showManualCopy(text);
  return true;
}

async function copyText(text, source = null) {
  const value = String(text ?? "");
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      toast("Copied");
      return;
    }
  } catch {}

  try {
    if (fallbackCopyText(value)) {
      toast("Copied");
      return;
    }
  } catch {
    // Fall through to the manual copy panel below.
  }

  showManualCopy(value);
}

function bindCopy(container) {
  $all("[data-copy-target]", container).forEach((button) => {
    button.addEventListener("click", () => {
      const target = $(button.dataset.copyTarget, container);
      if (!target) return;
      copyText("value" in target ? target.value : target.textContent, target);
    });
  });
  $all("[data-copy-value]", container).forEach((button) => {
    button.addEventListener("click", () => copyText(button.dataset.copyValue || ""));
  });
}

function toolShell(tool, body) {
  return `
    <div class="tool-header">
      <h2>${escapeHtml(tool.name)}</h2>
      <p>${escapeHtml(tool.desc)}. Everything runs locally in this browser.</p>
    </div>
    <div class="tool-dashboard">${body}</div>
  `;
}

function categoryLabel(id) {
  return CATEGORIES.find((cat) => cat.id === id)?.label || "Tool";
}

function textarea(id, label, value = "", rows = 10) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <textarea id="${id}" class="textarea" rows="${rows}" spellcheck="false">${escapeHtml(value)}</textarea>
    </div>
  `;
}

function output(id, label = "Output") {
  return `
    <div class="field">
      <div class="row">
        <span class="mini-label">${label}</span>
        <button class="btn-secondary" type="button" data-copy-target="#${id}">Copy</button>
      </div>
      <pre id="${id}" class="output"></pre>
    </div>
  `;
}

function panel(title, body, note = "") {
  return `
    <div class="panel">
      <div class="panel-title">
        <div>
          <h3>${escapeHtml(title)}</h3>
          ${note ? `<p>${escapeHtml(note)}</p>` : ""}
        </div>
      </div>
      ${body}
    </div>
  `;
}

function statGrid(items) {
  return `<div class="stats-grid">${items.map(([label, value]) => `
    <div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
  `).join("")}</div>`;
}

function resultGrid(items) {
  return `<div class="result-grid">${items.map(([label, value]) => `
    <div class="result-card"><span>${escapeHtml(label)}</span><code>${escapeHtml(value)}</code></div>
  `).join("")}</div>`;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

function debounce(fn, delay = 120) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function applyTheme(theme) {
  if (theme === "light" || theme === "dark") {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function currentTheme() {
  return document.documentElement.getAttribute("data-theme")
    || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function initTheme() {
  const saved = SafeStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") applyTheme(saved);
  const button = $("#theme-toggle");
  if (!button) return;
  button.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    const rect = button.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.style.setProperty("--theme-x", `${x}px`);
    document.documentElement.style.setProperty("--theme-y", `${y}px`);
    document.documentElement.style.setProperty("--theme-r", `${Math.ceil(radius)}px`);

    const setNext = () => {
      applyTheme(next);
      SafeStorage.setItem(THEME_KEY, next);
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !document.startViewTransition) {
      setNext();
      return;
    }

    try {
      const transition = document.startViewTransition(setNext);
      transition.ready?.catch(() => {});
      transition.updateCallbackDone?.catch(() => {});
      transition.finished?.catch(() => {});
    } catch {
      setNext();
    }
  });
}

function initInstallPrompt() {
  const button = $("#pwa-install-btn");
  if (!button || window.matchMedia("(display-mode: standalone)").matches) return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    button.classList.remove("hidden");
  });

  button.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    button.disabled = true;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") toast("Pocket Dev installed.");
    } finally {
      button.disabled = false;
      button.classList.add("hidden");
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    button.classList.add("hidden");
  });
}

function initServiceWorker() {
  if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;

  let refreshPending = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshPending || !navigator.onLine) return;
    refreshPending = true;
    window.location.reload();
  });

  navigator.serviceWorker.register("sw.js")
    .then((registration) => {
      if (navigator.onLine) registration.update().catch(() => {});
      window.addEventListener("online", () => registration.update().catch(() => {}));
    })
    .catch((error) => console.warn("[sw] registration failed:", error));
}

function renderCategories() {
  const root = $("#categories");
  if (!root) return;
  root.replaceChildren();
  const categories = [{ id: "all", label: "All" }, ...CATEGORIES];
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `chip${category.id === currentCategory ? " active" : ""}`;
    button.type = "button";
    button.textContent = category.label;
    button.dataset.category = category.id;
    button.addEventListener("click", () => {
      currentCategory = category.id;
      $all(".chip", root).forEach((chip) => chip.classList.toggle("active", chip.dataset.category === category.id));
      button.classList.remove("chip-tapped");
      void button.offsetWidth;
      button.classList.add("chip-tapped");
      button.addEventListener("animationend", () => button.classList.remove("chip-tapped"), { once: true });
      renderHomeGrid({ animate: true });
    });
    root.appendChild(button);
  });
}

function makeToolCard(tool) {
  const card = document.createElement("a");
  card.className = "tool-card";
  card.href = `#/tool/${encodeURIComponent(tool.id)}`;
  card.setAttribute("role", "listitem");
  card.addEventListener("click", () => {
    SafeSessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY || 0));
    SafeSessionStorage.setItem(HOME_RETURN_TOOL_KEY, tool.id);
    pushRecent(tool.id);
  });
  card.innerHTML = `
    <span class="icon-wrap">${iconPath(tool.icon)}</span>
    <span class="name">${escapeHtml(tool.name)}</span>
    <span class="desc">${escapeHtml(tool.desc)}</span>
  `;
  return card;
}

function renderHomeGrid({ animate = true } = {}) {
  const grid = $("#tool-grid");
  if (!grid) return;
  grid.replaceChildren();
  grid.classList.remove("animate-cards", "stable-grid");
  if (animate) {
    void grid.offsetWidth;
    grid.classList.add("animate-cards");
  } else {
    grid.classList.add("stable-grid");
  }

  const query = currentQuery.trim().toLowerCase();
  const matches = (tool) => !query
    || tool.name.toLowerCase().includes(query)
    || tool.desc.toLowerCase().includes(query)
    || categoryLabel(tool.category).toLowerCase().includes(query);

  let count = 0;
  const categories = currentCategory === "all"
    ? CATEGORIES
    : CATEGORIES.filter((category) => category.id === currentCategory);

  categories.forEach((category) => {
    const tools = TOOLS.filter((tool) => tool.category === category.id && matches(tool));
    if (!tools.length) return;
    const label = document.createElement("div");
    label.className = "category-label";
    label.innerHTML = `<span class="cat-dot"></span>${escapeHtml(category.label)}`;
    grid.appendChild(label);
    tools.forEach((tool) => {
      const card = makeToolCard(tool);
      card.style.setProperty("--i", count);
      grid.appendChild(card);
      count += 1;
    });
  });

  if (!count) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = currentQuery ? `No tools match "${currentQuery}".` : "No tools in this category.";
    grid.appendChild(empty);
  }
}

function getRecent() {
  try {
    const raw = JSON.parse(SafeStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((id) => TOOLS.some((tool) => tool.id === id)) : [];
  } catch {
    return [];
  }
}

function pushRecent(id) {
  const items = getRecent().filter((item) => item !== id);
  items.unshift(id);
  SafeStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, RECENT_MAX)));
}

function renderRecent() {
  const existing = $("#recent-row");
  if (existing) existing.remove();
  const ids = getRecent();
  if (!ids.length) return;
  const search = $(".search-wrap");
  if (!search) return;
  const row = document.createElement("div");
  row.id = "recent-row";
  row.className = "recent-row";
  row.innerHTML = '<p class="recent-label">Recently used</p><div class="recent-scroll"></div>';
  const list = $(".recent-scroll", row);
  ids.map((id) => TOOLS.find((tool) => tool.id === id)).filter(Boolean).forEach((tool) => {
    const card = document.createElement("a");
    card.className = "recent-card";
    card.href = `#/tool/${encodeURIComponent(tool.id)}`;
    card.addEventListener("click", () => {
      SafeSessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY || 0));
      SafeSessionStorage.setItem(HOME_RETURN_TOOL_KEY, tool.id);
      pushRecent(tool.id);
    });
    card.innerHTML = `<span class="recent-icon-wrap">${iconPath(tool.icon)}</span><span class="recent-name">${escapeHtml(tool.name)}</span>`;
    list.appendChild(card);
  });
  search.insertAdjacentElement("beforebegin", row);
}

function renderHome() {
  cleanupCurrentTool();
  $("#view-tool")?.classList.add("hidden");
  $("#view-home")?.classList.remove("hidden");
  $("#btn-back")?.classList.add("hidden");
  $("#tool-container")?.removeAttribute("data-category");
  setAppTitle("Pocket Dev");
  const count = $("#tool-count");
  if (count) count.textContent = String(TOOLS.length);
  const search = $("#tool-search");
  if (search && !search.dataset.ready) {
    search.placeholder = `Search ${TOOLS.length} tools...`;
    search.addEventListener("input", () => {
      currentQuery = search.value || "";
      renderHomeGrid({ animate: true });
    });
    search.dataset.ready = "true";
  }
  renderRecent();
  renderCategories();
  renderHomeGrid({ animate: false });
}

function cleanupCurrentTool() {
  if (!currentToolCleanup) return;
  try {
    currentToolCleanup();
  } catch (error) {
    console.warn("[dev] tool cleanup failed:", error);
  }
  currentToolCleanup = null;
}

function registerToolCleanup(callback) {
  currentToolCleanup = typeof callback === "function" ? callback : null;
}

function setAppTitle(title) {
  const element = $("#app-title");
  if (!element) return;
  element.replaceChildren();
  const logo = document.createElement("img");
  logo.className = "app-logo";
  logo.src = "assets/pocket-tools-logo-192.png";
  logo.alt = "";
  logo.setAttribute("aria-hidden", "true");
  const text = document.createElement("span");
  text.textContent = title;
  element.append(logo, text);
}

async function loadToolTemplate(id) {
  if (templateCache.has(id)) return templateCache.get(id);
  const response = await fetch(`templates/${encodeURIComponent(id)}.html`, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Template not found: ${id}`);
  const html = await response.text();
  templateCache.set(id, html);
  return html;
}

async function renderTool(tool) {
  cleanupCurrentTool();
  $("#view-home")?.classList.add("hidden");
  $("#view-tool")?.classList.remove("hidden");
  $("#btn-back")?.classList.remove("hidden");
  setAppTitle(tool.name);
  const container = $("#tool-container");
  if (!container) return;
  container.dataset.category = tool.category;
  container.innerHTML = '<div class="skeleton" aria-hidden="true"></div>';
  instantScrollTo(0);
  try {
    container.innerHTML = await loadToolTemplate(tool.id);
    bindCopy(container);
    const initName = `init_${tool.id.replaceAll("-", "_")}`;
    if (typeof window[initName] === "function") window[initName](container);
    instantScrollTo(0);
  } catch (error) {
    console.error("[dev] tool template failed:", error);
    container.innerHTML = `
      <div class="tool-header">
        <h2>${escapeHtml(tool.name)}</h2>
        <p>This tool could not load. Go back and try again.</p>
      </div>
    `;
  }
}

function restoreHomePosition() {
  const saved = SafeSessionStorage.getItem(HOME_SCROLL_KEY);
  const savedScroll = Number(saved || 0);
  if (saved !== null && Number.isFinite(savedScroll)) {
    instantScrollTo(savedScroll);
    return;
  }

  const id = SafeSessionStorage.getItem(HOME_RETURN_TOOL_KEY);
  const card = id ? $(`.tool-card[href="#/tool/${CSS.escape(id)}"]`) : null;
  if (card) {
    card.scrollIntoView({ block: "center", behavior: "auto" });
    return;
  }
  instantScrollTo(0);
}

function route() {
  const hash = window.location.hash || "";
  if (!hash || hash === "#" || hash === "#/") {
    renderHome();
    return;
  }

  if (hash.startsWith("#/tool/")) {
    const id = decodeURIComponent(hash.replace("#/tool/", "")).trim();
    const tool = TOOLS.find((item) => item.id === id);
    if (tool) {
      renderTool(tool);
      return;
    }
  }

  replaceWithHomeRoute();
}

function sample(text = "") {
  return text.trim();
}

function setText(selector, value, root = document) {
  const element = $(selector, root);
  if (element) element.textContent = value;
}

function setHtml(selector, value, root = document) {
  const element = $(selector, root);
  if (element) element.innerHTML = value;
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image."));
    };
    img.src = url;
  });
}

function componentToHex(value) {
  return value.toString(16).padStart(2, "0");
}

function rgbToHex(r, g, b) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`.toUpperCase();
}

function hexToRgb(hex) {
  let raw = hex.trim().replace(/^#/, "");
  if (raw.length === 3) raw = raw.split("").map((char) => char + char).join("");
  if (!/^[0-9a-f]{6}$/i.test(raw)) return null;
  const num = Number.parseInt(raw, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  return { h: Math.round((h + 360) % 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  return {
    h: Math.round((h + 360) % 360),
    s: Math.round(max === 0 ? 0 : (delta / max) * 100),
    v: Math.round(max * 100)
  };
}

function rgbToCmyk(r, g, b) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100)
  };
}

function parseColor(value) {
  const raw = value.trim();
  if (raw.startsWith("#")) return hexToRgb(raw);
  let match = raw.match(/^rgb[a]?\(([^)]+)\)$/i);
  if (match) {
    const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.every((part) => Number.isFinite(part))) {
      return { r: clamp255(parts[0]), g: clamp255(parts[1]), b: clamp255(parts[2]) };
    }
  }
  match = raw.match(/^hsl[a]?\(([^)]+)\)$/i);
  if (match) {
    const parts = match[1].replaceAll("%", "").split(/[,\s/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.every((part) => Number.isFinite(part))) return hslToRgb(parts[0], parts[1], parts[2]);
  }
  return null;
}

function clamp255(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function colorBlock(hex, label = hex) {
  const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
  const darkText = contrastRatio(rgb, { r: 255, g: 255, b: 255 }) < 4.5;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return `
    <div class="color-chip${darkText ? " dark-text" : ""}" style="background:${hex}">
      <strong>${escapeHtml(label)}</strong>
      <span>${hex}</span>
      <span>rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</span>
      <span>hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</span>
      <button type="button" data-copy-value="${hex}">Copy HEX</button>
    </div>
  `;
}

function luminance({ r, g, b }) {
  const convert = (value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
}

function contrastRatio(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((next, key) => {
      next[key] = sortObject(value[key]);
      return next;
    }, {});
  }
  return value;
}

function jsonDepth(value) {
  if (!value || typeof value !== "object") return 0;
  const children = Array.isArray(value) ? value : Object.values(value);
  return 1 + Math.max(0, ...children.map(jsonDepth));
}

function jsonKeyCount(value) {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + jsonKeyCount(item), 0);
  if (value && typeof value === "object") {
    return Object.entries(value).reduce((sum, [, item]) => sum + 1 + jsonKeyCount(item), 0);
  }
  return 0;
}

function minifyXml(input) {
  return input.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
}

function htmlStats(input, outputValue) {
  const tags = (input.match(/<\/?[a-z][^>]*>/gi) || []).length;
  return [["Input", formatBytes(new Blob([input]).size)], ["Output", formatBytes(new Blob([outputValue]).size)], ["Tags", String(tags)]];
}

const HTML_VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const HTML_RAW_TEXT_TAGS = new Set(["script", "style"]);
const HTML_PREVIEW_BLOCKED_TAGS = new Set(["script", "style", "iframe", "object", "embed", "link", "meta", "base", "form", "input", "button", "textarea", "select", "option", "svg", "math"]);
const HTML_URI_ATTRS = new Set(["href", "src", "poster", "xlink:href"]);

function safePreviewUrl(value) {
  const raw = String(value || "").trim();
  if (!raw || raw.startsWith("#") || raw.startsWith("/") || raw.startsWith("./") || raw.startsWith("../")) return true;
  try {
    const url = new URL(raw, location.href);
    return ["http:", "https:", "mailto:", "tel:", "data:", "blob:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeHtmlForPreview(input) {
  const parsed = new DOMParser().parseFromString(input, "text/html");
  const template = document.createElement("template");

  const appendSafe = (source, target) => {
    if (source.nodeType === Node.TEXT_NODE) {
      target.append(document.createTextNode(source.textContent || ""));
      return;
    }
    if (source.nodeType !== Node.ELEMENT_NODE) return;

    const tag = source.tagName.toLowerCase();
    if (HTML_PREVIEW_BLOCKED_TAGS.has(tag)) return;

    const element = document.createElement(tag);
    [...source.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || name === "style" || name === "srcdoc") return;
      if (HTML_URI_ATTRS.has(name) && !safePreviewUrl(attr.value)) return;
      element.setAttribute(attr.name, attr.value);
    });
    [...source.childNodes].forEach((child) => appendSafe(child, element));
    target.append(element);
  };

  [...parsed.body.childNodes].forEach((node) => appendSafe(node, template.content));
  return template.innerHTML;
}

function htmlAttrs(element) {
  return [...element.attributes].map((attr) => ` ${attr.name}="${escapeAttr(attr.value)}"`).join("");
}

function serializeHtmlDoctype(node) {
  let value = `<!DOCTYPE ${node.name || "html"}`;
  if (node.publicId) value += ` PUBLIC "${node.publicId}"`;
  if (node.systemId) value += node.publicId ? ` "${node.systemId}"` : ` SYSTEM "${node.systemId}"`;
  return `${value}>`;
}

function serializeHtmlNode(node, depth = 0, pretty = true) {
  const indent = pretty ? "  ".repeat(depth) : "";
  if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
    return `${indent}${serializeHtmlDoctype(node)}`;
  }
  if (node.nodeType === Node.TEXT_NODE) {
    const isRawText = HTML_RAW_TEXT_TAGS.has(node.parentNode?.tagName?.toLowerCase());
    const text = node.textContent || "";
    const value = isRawText ? text : (pretty ? text.replace(/\s+/g, " ").trim() : text);
    if (!value) return "";
    return `${indent}${isRawText ? value : escapeHtml(value)}`;
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return pretty ? `${indent}<!--${node.textContent || ""}-->` : "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const tag = node.tagName.toLowerCase();
  const open = `<${tag}${htmlAttrs(node)}>`;
  if (HTML_VOID_TAGS.has(tag)) return `${indent}<${tag}${htmlAttrs(node)}>`;
  if (HTML_RAW_TEXT_TAGS.has(tag)) return `${indent}${open}${node.textContent || ""}</${tag}>`;

  const children = [...node.childNodes].map((child) => serializeHtmlNode(child, depth + 1, pretty)).filter(Boolean);
  if (!children.length) return `${indent}${open}</${tag}>`;
  if (pretty && children.length === 1 && node.childNodes[0]?.nodeType === Node.TEXT_NODE) {
    return `${indent}${open}${children[0].trim()}</${tag}>`;
  }
  return pretty
    ? `${indent}${open}\n${children.join("\n")}\n${indent}</${tag}>`
    : `${open}${children.map((child) => child.trim()).join("")}</${tag}>`;
}

function shouldSerializeFullHtmlDocument(input) {
  return /<!doctype\s+html|<html(?:\s|>)|<head(?:\s|>)|<body(?:\s|>)/i.test(input);
}

function serializeHtml(input, pretty = true) {
  const parsed = new DOMParser().parseFromString(input, "text/html");
  const nodes = shouldSerializeFullHtmlDocument(input) ? [...parsed.childNodes] : [...parsed.body.childNodes];
  const outputValue = nodes.map((node) => serializeHtmlNode(node, 0, pretty)).filter(Boolean).join(pretty ? "\n" : "");
  return outputValue || input.trim();
}

function formatHtml(input) {
  return serializeHtml(input, true);
}

function minifyHtml(input) {
  return serializeHtml(input, false);
}

function stripCssComments(input) {
  let outputValue = "";
  let quote = "";
  let escaped = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (quote) {
      outputValue += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      outputValue += char;
      continue;
    }
    if (char === "/" && next === "*") {
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) i += 1;
      i += 1;
      continue;
    }
    outputValue += char;
  }
  return outputValue;
}

function cssNeedsSpace(prev, next) {
  if (!prev || !next) return false;
  if ("{}:;,>+~)]".includes(next)) return false;
  if ("{}:;,>+~([".includes(prev)) return false;
  return true;
}

function minifyCss(input) {
  const clean = stripCssComments(input);
  let outputValue = "";
  let quote = "";
  let escaped = false;
  let pendingSpace = false;
  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];
    if (quote) {
      outputValue += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "\"" || char === "'") {
      if (pendingSpace && cssNeedsSpace(outputValue.at(-1), char)) outputValue += " ";
      pendingSpace = false;
      quote = char;
      outputValue += char;
      continue;
    }
    if (/\s/.test(char)) {
      pendingSpace = true;
      continue;
    }
    if ("{}:;,>+~".includes(char)) {
      outputValue = outputValue.trimEnd();
      outputValue += char;
      pendingSpace = false;
      continue;
    }
    if (pendingSpace && cssNeedsSpace(outputValue.at(-1), char)) outputValue += " ";
    pendingSpace = false;
    outputValue += char;
  }
  return outputValue.replace(/;}/g, "}").trim();
}

function formatCss(input) {
  const compact = minifyCss(input);
  let outputValue = "";
  let quote = "";
  let escaped = false;
  let depth = 0;
  let parens = 0;
  const indent = () => "  ".repeat(Math.max(0, depth));
  for (const char of compact) {
    if (quote) {
      outputValue += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      outputValue += char;
      continue;
    }
    if (char === "(") parens += 1;
    if (char === ")") parens = Math.max(0, parens - 1);
    if (char === "{") {
      outputValue = `${outputValue.trimEnd()} {\n${indent()}  `;
      depth += 1;
    } else if (char === "}") {
      depth = Math.max(0, depth - 1);
      outputValue = `${outputValue.trimEnd()}\n${indent()}}\n\n${indent()}`;
    } else if (char === ";") {
      outputValue = `${outputValue.trimEnd()};\n${indent()}`;
    } else if (char === ":" && parens === 0) {
      outputValue += ": ";
    } else if (char === "," && depth === 0 && parens === 0) {
      outputValue = `${outputValue.trimEnd()},\n${indent()}`;
    } else {
      outputValue += char;
    }
  }
  return outputValue.trim();
}

function formatXml(input) {
  let depth = 0;
  return input.replace(/>\s*</g, ">\n<").split("\n").reduce((lines, raw) => {
    const line = raw.trim();
    if (!line) return lines;
    if (/^<\//.test(line)) depth = Math.max(0, depth - 1);
    lines.push(`${"  ".repeat(depth)}${line}`);
    if (/^<[^!?/][^>]*[^/]?>$/.test(line)) depth += 1;
    return lines;
  }, []);
}

function parseCsv(input, delimiter = ",") {
  const rows = [];
  let row = [];
  let cell = "";
  let quote = false;
  const separator = delimiter || ",";
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (char === '"' && quote && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quote = !quote;
    } else if (!quote && input.startsWith(separator, i)) {
      row.push(cell);
      cell = "";
      i += separator.length - 1;
    } else if ((char === "\n" || char === "\r") && !quote) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((items) => items.some((item) => item.trim()));
}

function normalizeCsvHeaders(headers, rows) {
  const maxColumns = Math.max(headers.length, ...rows.map((row) => row.length), 0);
  const seen = new Map();
  return Array.from({ length: maxColumns }, (_, index) => {
    const raw = (headers[index] || "").trim();
    const base = raw || `column_${index + 1}`;
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? `${base}_${count + 1}` : base;
  });
}

function csvEscape(value, delimiter = ",") {
  const text = value == null ? "" : String(value);
  return text.includes('"') || text.includes("\n") || text.includes("\r") || text.includes(delimiter)
    ? `"${text.replaceAll('"', '""')}"`
    : text;
}

function markdownToHtml(markdown) {
  const lines = escapeHtml(markdown).split("\n");
  let inList = false;
  const html = [];
  const inline = (text) => text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  for (const line of lines) {
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) html.push("<ul>");
      inList = true;
      html.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
    if (/^###\s+/.test(line)) html.push(`<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`);
    else if (/^##\s+/.test(line)) html.push(`<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`);
    else if (/^#\s+/.test(line)) html.push(`<h1>${inline(line.replace(/^#\s+/, ""))}</h1>`);
    else if (line.trim()) html.push(`<p>${inline(line)}</p>`);
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

function sanitizeMarkdownPreview(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, "text/html");
  doc.querySelectorAll("script, iframe, object, embed, form, input, button, textarea, select, option, svg, math").forEach((element) => element.remove());
  doc.body.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || name === "style" || name === "srcdoc") {
        element.removeAttribute(attr.name);
        return;
      }
      if (HTML_URI_ATTRS.has(name) && !safePreviewUrl(attr.value)) {
        element.removeAttribute(attr.name);
      }
    });
    if (element.tagName.toLowerCase() === "a") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener");
    }
  });
  return doc.body.innerHTML;
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function uuidv4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [...bytes].map((byte, index) => {
    const value = byte.toString(16).padStart(2, "0");
    return [4, 6, 8, 10].includes(index) ? `-${value}` : value;
  }).join("");
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)));
}

function bytesToHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunk));
  }
  return btoa(binary);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("Could not read file.")));
    reader.readAsDataURL(file);
  });
}

function base64ToBytes(value) {
  const clean = value.trim().replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = clean.padEnd(Math.ceil(clean.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function searchParamsToObject(searchParams) {
  const outputValue = {};
  searchParams.forEach((value, key) => {
    if (Object.hasOwn(outputValue, key)) {
      outputValue[key] = Array.isArray(outputValue[key])
        ? [...outputValue[key], value]
        : [outputValue[key], value];
    } else {
      outputValue[key] = value;
    }
  });
  return outputValue;
}

function randomAlphabetId(length, alphabet) {
  const max = Math.floor(256 / alphabet.length) * alphabet.length;
  const chars = [];
  while (chars.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(Math.max(16, (length - chars.length) * 2)));
    for (const byte of bytes) {
      if (byte >= max) continue;
      chars.push(alphabet[byte % alphabet.length]);
      if (chars.length === length) break;
    }
  }
  return chars.join("");
}

function stopActiveRegexWorker(reason = "Regex run was cancelled.") {
  const worker = activeRegexWorker;
  const timer = activeRegexTimer;
  const reject = activeRegexReject;
  activeRegexWorker = null;
  activeRegexTimer = 0;
  activeRegexReject = null;

  if (timer) window.clearTimeout(timer);
  if (worker) worker.terminate();
  if (reject) reject(new Error(reason));
}

function runRegexWorker(pattern, flags, text, timeout = 2000) {
  return new Promise((resolve, reject) => {
    if (!window.Worker) {
      reject(new Error("Web Workers are not available in this browser."));
      return;
    }

    stopActiveRegexWorker("Regex run was replaced by a newer input.");
    const worker = new Worker("js/regex-worker.js?v=1");
    let timer = 0;
    activeRegexWorker = worker;
    activeRegexReject = reject;

    const finish = (callback) => {
      if (activeRegexWorker === worker) {
        activeRegexWorker = null;
        activeRegexTimer = 0;
        activeRegexReject = null;
      }
      window.clearTimeout(timer);
      worker.terminate();
      callback();
    };

    timer = window.setTimeout(() => {
      finish(() => reject(new Error("Regex took too long and was stopped. Try a safer pattern or shorter test text.")));
    }, timeout);
    activeRegexTimer = timer;

    worker.addEventListener("message", (event) => {
      finish(() => {
        if (event.data?.ok) resolve(event.data.matches || []);
        else reject(new Error(event.data?.error || "Regex failed."));
      });
    });

    worker.addEventListener("error", (event) => {
      finish(() => reject(new Error(event.message || "Regex worker failed.")));
    });

    worker.postMessage({ pattern, flags, text });
  });
}

function wordsFromText(text) {
  return text.trim().split(/[^A-Za-z0-9]+/).filter(Boolean);
}

function toWords(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function toTitle(word) {
  return word ? `${word[0].toUpperCase()}${word.slice(1)}` : "";
}

function parseSemverValue(value) {
  const match = String(value).trim().replace(/^v/i, "").match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
  if (!match) return null;
  return {
    major: Number(match[1] || 0),
    minor: Number(match[2] || 0),
    patch: Number(match[3] || 0),
    pre: match[4] || "",
    build: match[5] || ""
  };
}

function comparePreRelease(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const left = a.split(".");
  const right = b.split(".");
  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i += 1) {
    if (left[i] == null) return -1;
    if (right[i] == null) return 1;
    const ln = Number(left[i]);
    const rn = Number(right[i]);
    const bothNumeric = Number.isInteger(ln) && Number.isInteger(rn);
    if (bothNumeric && ln !== rn) return ln > rn ? 1 : -1;
    if (!bothNumeric && left[i] !== right[i]) return left[i] > right[i] ? 1 : -1;
  }
  return 0;
}

function compareSemverValues(a, b) {
  for (const key of ["major", "minor", "patch"]) {
    if (a[key] !== b[key]) return a[key] > b[key] ? 1 : -1;
  }
  return comparePreRelease(a.pre, b.pre);
}

window.init_image_color_extractor = (root) => {
  const input = $("#ice-file", root);
  const drop = $("#ice-drop", root);
  const dropContent = $("#ice-drop-content", root);
  const canvas = $("#ice-canvas", root);
  const meta = $("#ice-meta", root);
  const results = $("#ice-results", root);
  let image = null;
  let fileMeta = null;
  const defaultCanvas = { width: canvas.width, height: canvas.height };
  const maxCanvasSide = 4096;
  const maxCanvasPixels = 12000000;

  const fittedCanvasSize = (width, height) => {
    const sideScale = Math.min(1, maxCanvasSide / Math.max(width, height));
    const pixelScale = Math.min(1, Math.sqrt(maxCanvasPixels / Math.max(1, width * height)));
    const scale = Math.min(sideScale, pixelScale);
    return {
      width: Math.max(1, Math.round(width * scale)),
      height: Math.max(1, Math.round(height * scale))
    };
  };

  const drawPreview = () => {
    if (!image) return;
    const context = canvas.getContext("2d");
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  };

  const setFile = async (file) => {
    if (!file) return;
    const nextImage = await fileToImage(file);
    if (image?.src) URL.revokeObjectURL(image.src);
    image = nextImage;
    fileMeta = file;
    const size = fittedCanvasSize(image.width, image.height);
    canvas.width = size.width;
    canvas.height = size.height;
    drop.classList.add("has-file");
    dropContent.innerHTML = `
      <div class="file-preview">
        <img src="${image.src}" alt="">
        <div>
          <strong>${escapeHtml(file.name)}</strong>
          <span>${image.width} x ${image.height}px / ${formatBytes(file.size)}</span>
          <span>Click here to replace the image.</span>
        </div>
      </div>
    `;
    drawPreview();
    meta.className = "";
    meta.innerHTML = statGrid([
      ["File", file.name],
      ["Dimensions", `${image.width} x ${image.height}px`],
      ["Size", formatBytes(file.size)],
      ["Type", file.type || "Image"]
    ]);
    results.className = "empty-state";
    results.innerHTML = "Preview ready. Press Extract colors to build the palette.";
  };

  const extract = () => {
    if (!image) {
      results.className = "empty-state";
      results.textContent = "Choose an image first.";
      return;
    }
    drawPreview();
    const context = canvas.getContext("2d");
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const map = new Map();
    const step = Math.max(8, Number($("#ice-step", root).value) || 28);
    const max = Math.max(4, Math.min(24, Number($("#ice-count", root).value) || 12));
    for (let i = 0; i < data.length; i += 4 * step) {
      if (data[i + 3] < 40) continue;
      const r = Math.round(data[i] / 24) * 24;
      const g = Math.round(data[i + 1] / 24) * 24;
      const b = Math.round(data[i + 2] / 24) * 24;
      const hex = rgbToHex(clamp255(r), clamp255(g), clamp255(b));
      map.set(hex, (map.get(hex) || 0) + 1);
    }
    const colors = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([hex]) => hex);
    results.className = "tool-stack";
    results.innerHTML = `
      ${statGrid([["Colors", String(colors.length)], ["Sampling", $("#ice-step", root).selectedOptions[0].textContent], ["Source", fileMeta?.name || "Image"]])}
      <div class="swatch-grid">${colors.map((hex, index) => colorBlock(hex, `Color ${index + 1}`)).join("")}</div>
      ${output("ice-output", "Palette")}
    `;
    setText("#ice-output", colors.join("\n"), root);
    bindCopy(results);
  };

  input.addEventListener("change", () => setFile(input.files?.[0]));
  $("#ice-run", root).addEventListener("click", extract);
  const clear = () => {
    if (image?.src) URL.revokeObjectURL(image.src);
    image = null;
    fileMeta = null;
    input.value = "";
    canvas.width = defaultCanvas.width;
    canvas.height = defaultCanvas.height;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    drop.classList.remove("has-file");
    dropContent.innerHTML = "<strong>Choose or drop an image</strong><span>PNG, JPG, WebP, SVG screenshots and design exports all work locally.</span>";
    meta.className = "empty-state";
    meta.textContent = "Select an image to see its preview and file details.";
    results.className = "empty-state";
    results.textContent = "Your extracted palette will appear here with copy-ready HEX, RGB and HSL values.";
  };
  $("#ice-clear", root).addEventListener("click", clear);
  registerToolCleanup(() => {
    if (image?.src) URL.revokeObjectURL(image.src);
    image = null;
    fileMeta = null;
  });
  ["dragenter", "dragover"].forEach((eventName) => drop.addEventListener(eventName, (event) => {
    event.preventDefault();
    drop.classList.add("is-dragging");
  }));
  ["dragleave", "drop"].forEach((eventName) => drop.addEventListener(eventName, () => drop.classList.remove("is-dragging")));
  drop.addEventListener("drop", (event) => {
    event.preventDefault();
    setFile(event.dataTransfer?.files?.[0]);
  });
};

window.init_gradient_generator = (root) => {
  const colorInputs = ["#gg-a", "#gg-b", "#gg-c"].map((selector) => $(selector, root));

  const build = () => {
    const a = $("#gg-a", root).value;
    const b = $("#gg-b", root).value;
    const c = $("#gg-c", root).value;
    const angle = $("#gg-angle", root).value;
    const type = $("#gg-type", root).value;
    const position = $("#gg-position", root).value;
    const shape = $("#gg-shape", root).value;
    const stop = $("#gg-softness", root).value;
    const stops = `${a} 0%, ${b} ${stop}%, ${c} 100%`;
    if (type === "radial") return `radial-gradient(${shape} at ${position}, ${stops})`;
    if (type === "conic") return `conic-gradient(from ${angle}deg at ${position}, ${a}, ${b}, ${c}, ${a})`;
    return `linear-gradient(${angle}deg, ${stops})`;
  };

  const update = () => {
    const css = build();
    $("#gg-preview", root).style.background = css;
    setText("#gg-output", [
      `background: ${css};`,
      "",
      ".gradient-surface {",
      `  background: ${css};`,
      "}"
    ].join("\n"), root);
    $("#gg-meta", root).innerHTML = resultGrid([
      ["Type", $("#gg-type", root).value],
      ["Angle", `${$("#gg-angle", root).value}deg`],
      ["Position", $("#gg-position", root).value],
      ["Colors", colorInputs.map((input) => input.value.toUpperCase()).join(" -> ")]
    ]);
  };
  $all("input,select", root).forEach((element) => {
    element.addEventListener("input", update);
    element.addEventListener("change", update);
  });
  $all("[data-gradient]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const [a, b, c] = button.dataset.gradient.split(",");
      $("#gg-a", root).value = a;
      $("#gg-b", root).value = b;
      $("#gg-c", root).value = c;
      update();
    });
  });
  $("#gg-random", root).addEventListener("click", () => {
    colorInputs.forEach((input) => {
      input.value = rgbToHex(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    });
    $("#gg-angle", root).value = String(Math.floor(Math.random() * 361));
    update();
  });
  $("#gg-reverse", root).addEventListener("click", () => {
    const first = $("#gg-a", root).value;
    $("#gg-a", root).value = $("#gg-c", root).value;
    $("#gg-c", root).value = first;
    update();
  });
  update();
};

window.init_color_converter = (root) => {
  const update = (source = "text") => {
    const textInput = $("#cc-input", root);
    const picker = $("#cc-picker", root);
    const color = parseColor(source === "picker" ? picker.value : textInput.value);
    if (!color) {
      $("#cc-results", root).innerHTML = '<div class="empty-state">Enter a valid HEX, RGB or HSL color.</div>';
      setText("#cc-output", "Invalid color", root);
      return;
    }
    const hex = rgbToHex(color.r, color.g, color.b);
    const hsl = rgbToHsl(color.r, color.g, color.b);
    const hsv = rgbToHsv(color.r, color.g, color.b);
    const cmyk = rgbToCmyk(color.r, color.g, color.b);
    if (source !== "picker") picker.value = hex;
    textInput.value = hex;
    const preview = $("#cc-preview", root);
    preview.style.background = hex;
    preview.style.color = contrastRatio(color, { r: 255, g: 255, b: 255 }) < 4.5 ? "#111111" : "#ffffff";
    preview.innerHTML = `<strong>${hex}</strong><span>rgb(${color.r}, ${color.g}, ${color.b})</span>`;
    const formats = [
      ["HEX", hex],
      ["RGB", `rgb(${color.r}, ${color.g}, ${color.b})`],
      ["HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
      ["HSV", `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`],
      ["CMYK", `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`],
      ["Flutter", `Color(0xFF${hex.slice(1)})`],
      ["Android XML", `<color name="color">${hex}</color>`],
      ["SwiftUI", `Color(red: ${(color.r / 255).toFixed(3)}, green: ${(color.g / 255).toFixed(3)}, blue: ${(color.b / 255).toFixed(3)})`]
    ];
    $("#cc-results", root).innerHTML = resultGrid(formats);
    setText("#cc-output", formats.map(([label, value]) => `${label}: ${value}`).join("\n"), root);
  };
  $("#cc-input", root).addEventListener("input", () => update("text"));
  $("#cc-picker", root).addEventListener("input", () => update("picker"));
  update();
};

window.init_contrast_checker = (root) => {
  const update = () => {
    const fgHex = $("#co-fg", root).value;
    const bgHex = $("#co-bg", root).value;
    const fg = hexToRgb(fgHex);
    const bg = hexToRgb(bgHex);
    const size = Number($("#co-size", root).value) || 16;
    const weight = $("#co-weight", root).value;
    const ratio = contrastRatio(fg, bg);
    const isLarge = size >= 24 || (size >= 18.66 && Number(weight) >= 700);
    const tests = [
      ["AA normal", ratio >= 4.5],
      ["AA large", ratio >= 3],
      ["AAA normal", ratio >= 7],
      ["AAA large", ratio >= 4.5]
    ];
    const preview = $("#co-preview", root);
    preview.style.color = fgHex;
    preview.style.background = bgHex;
    preview.innerHTML = `<strong style="font-size:${size}px;font-weight:${weight}">Readable interface text</strong><p>This preview uses your selected color pair, font size and weight.</p>`;
    $("#co-results", root).innerHTML = `
      ${statGrid([["Ratio", `${ratio.toFixed(2)}:1`], ["Text class", isLarge ? "Large text" : "Normal text"], ["Foreground", fgHex.toUpperCase()], ["Background", bgHex.toUpperCase()]])}
      <div class="badge-row">${tests.map(([label, pass]) => `<span class="badge ${pass ? "pass" : "fail"}">${label}: ${pass ? "Pass" : "Fail"}</span>`).join("")}</div>
    `;
    setText("#co-output", [
      `Ratio: ${ratio.toFixed(2)}:1`,
      ...tests.map(([label, pass]) => `${label}: ${pass ? "Pass" : "Fail"}`),
      `Text: ${fgHex.toUpperCase()}`,
      `Background: ${bgHex.toUpperCase()}`
    ].join("\n"), root);
  };
  $all("input,select", root).forEach((element) => element.addEventListener("input", update));
  update();
};

window.init_palette_generator = (root) => {
  let lastCss = "";
  const update = () => {
    const rgb = hexToRgb($("#pg-color", root).value);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const mode = $("#pg-mode", root).value;
    const count = Math.max(3, Math.min(12, Number($("#pg-count", root).value) || 6));
    const saturation = Number($("#pg-saturation", root).value) || hsl.s;
    const offsets = {
      analogous: [-42, -24, -10, 0, 18, 36, 54, 72],
      triadic: [0, 120, 240, 30, 150, 270, 60, 180],
      complement: [0, 180, 160, 200, 20, 340, 140, 220],
      split: [0, 150, 210, 30, 330, 170, 190, 60],
      mono: [0, 0, 0, 0, 0, 0, 0, 0]
    }[mode];
    const colors = Array.from({ length: count }, (_, index) => {
      const light = mode === "mono"
        ? Math.round(18 + (index * (72 / Math.max(1, count - 1))))
        : Math.max(18, Math.min(82, hsl.l + (index - count / 2) * 4));
      const color = hslToRgb(hsl.h + offsets[index % offsets.length], saturation, light);
      return rgbToHex(color.r, color.g, color.b);
    });
    $("#pg-swatches", root).innerHTML = colors.map((hex, index) => colorBlock(hex, `Color ${index + 1}`)).join("");
    lastCss = colors.map((hex, index) => `  --color-${index + 1}: ${hex};`).join("\n");
    setText("#pg-output", `:root {\n${lastCss}\n}`, root);
    bindCopy($("#pg-swatches", root));
  };
  $all("input,select", root).forEach((element) => element.addEventListener("input", update));
  $("#pg-random", root).addEventListener("click", () => {
    $("#pg-color", root).value = rgbToHex(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    update();
  });
  $("#pg-copy-css", root).addEventListener("click", () => copyText(`:root {\n${lastCss}\n}`));
  update();
};

window.init_json_formatter = (root) => {
  const input = $("#jf-input", root);
  const format = (mode) => {
    try {
      let value = JSON.parse(input.value);
      if (mode === "sort") value = sortObject(value);
      const outputValue = JSON.stringify(value, null, mode === "minify" ? 0 : 2);
      setText("#jf-output", outputValue, root);
      $("#jf-status", root).className = "status-line";
      $("#jf-status", root).innerHTML = "<strong>Valid JSON</strong> Ready to copy or keep editing.";
      $("#jf-metrics", root).innerHTML = statGrid([
        ["Type", Array.isArray(value) ? "Array" : typeof value],
        ["Keys", String(jsonKeyCount(value))],
        ["Depth", String(jsonDepth(value))],
        ["Output", formatBytes(new Blob([outputValue]).size)]
      ]);
    } catch (error) {
      $("#jf-status", root).className = "status-line error";
      $("#jf-status", root).textContent = `Invalid JSON: ${error.message}`;
      $("#jf-metrics", root).innerHTML = "";
      setText("#jf-output", "", root);
    }
  };
  $("#jf-format", root).addEventListener("click", () => format("format"));
  $("#jf-minify", root).addEventListener("click", () => format("minify"));
  $("#jf-sort", root).addEventListener("click", () => format("sort"));
  $("#jf-sample", root).addEventListener("click", () => {
    input.value = JSON.stringify({ app: "Pocket Dev", offline: true, tools: ["json", "regex", "colors"], meta: { version: 1, private: true } }, null, 2);
    format("format");
  });
  input.addEventListener("input", debounce(() => format("format")));
  format("format");
};

window.init_html_formatter = (root) => {
  const run = (mode) => {
    const input = $("#hf-input", root).value;
    const outputValue = mode === "minify" ? minifyHtml(input) : formatHtml(input);
    setText("#hf-output", outputValue, root);
    $("#hf-metrics", root).innerHTML = statGrid(htmlStats(input, outputValue));
  };
  $("#hf-format", root).addEventListener("click", () => run("format"));
  $("#hf-minify", root).addEventListener("click", () => run("minify"));
  $("#hf-preview-btn", root).addEventListener("click", () => {
    $("#hf-preview", root).innerHTML = sanitizeHtmlForPreview($("#hf-input", root).value);
  });
  run("format");
};

window.init_css_minifier = (root) => {
  const run = (mode) => {
    const input = $("#cm-input", root).value;
    const outputValue = mode === "format" ? formatCss(input) : minifyCss(input);
    setText("#cm-output", outputValue, root);
    const saved = input.length ? Math.max(0, Math.round((1 - outputValue.length / input.length) * 100)) : 0;
    $("#cm-metrics", root).innerHTML = statGrid([["Input", formatBytes(new Blob([input]).size)], ["Output", formatBytes(new Blob([outputValue]).size)], ["Saved", `${saved}%`]]);
  };
  $("#cm-minify", root).addEventListener("click", () => run("minify"));
  $("#cm-format", root).addEventListener("click", () => run("format"));
  run("minify");
};

window.init_xml_formatter = (root) => {
  const run = (mode) => {
    const input = $("#xf-input", root).value;
    const parsed = new DOMParser().parseFromString(input, "application/xml");
    const error = parsed.querySelector("parsererror");
    if (error) {
      $("#xf-status", root).className = "status-line error";
      $("#xf-status", root).textContent = "XML parser found an error. Output is best-effort formatting.";
    } else {
      $("#xf-status", root).className = "status-line";
      $("#xf-status", root).innerHTML = "<strong>Valid XML</strong> Parsed successfully.";
    }
    setText("#xf-output", mode === "minify" ? minifyXml(input) : formatXml(input).join("\n"), root);
  };
  $("#xf-format", root).addEventListener("click", () => run("format"));
  $("#xf-minify", root).addEventListener("click", () => run("minify"));
  run("format");
};

window.init_markdown_preview = (root) => {
  const update = () => {
    const input = $("#md-input", root).value;
    const html = markdownToHtml(input);
    const safeHtml = sanitizeMarkdownPreview(html);
    setHtml("#md-preview", safeHtml, root);
    setText("#md-output", safeHtml, root);
    $("#md-metrics", root).innerHTML = statGrid([["Words", String(wordsFromText(input).length)], ["Characters", String(input.length)], ["HTML", formatBytes(new Blob([safeHtml]).size)]]);
  };
  $("#md-input", root).addEventListener("input", update);
  update();
};

window.init_csv_json_converter = (root) => {
  $("#cj-to-json", root).addEventListener("click", () => {
    const delimiter = $("#cj-delimiter", root).value === "\\t" ? "\t" : $("#cj-delimiter", root).value;
    const rows = parseCsv($("#cj-input", root).value, delimiter);
    const rawHeaders = rows.shift() || [];
    const headers = normalizeCsvHeaders(rawHeaders, rows);
    const data = rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
    const outputValue = JSON.stringify(data, null, $("#cj-pretty", root).value === "pretty" ? 2 : 0);
    setText("#cj-output", outputValue, root);
    $("#cj-metrics", root).innerHTML = statGrid([["Rows", String(data.length)], ["Columns", String(headers.length)], ["Output", formatBytes(new Blob([outputValue]).size)]]);
  });
  $("#cj-to-csv", root).addEventListener("click", () => {
    try {
      const data = JSON.parse($("#cj-input", root).value);
      if (!Array.isArray(data)) throw new Error("Input must be a JSON array.");
      const headers = [...new Set(data.flatMap((item) => Object.keys(item || {})))];
      const delimiter = $("#cj-delimiter", root).value === "\\t" ? "\t" : $("#cj-delimiter", root).value;
      const csv = [
        headers.map((header) => csvEscape(header, delimiter)).join(delimiter),
        ...data.map((item) => headers.map((header) => csvEscape(item?.[header], delimiter)).join(delimiter))
      ].join("\n");
      setText("#cj-output", csv, root);
      $("#cj-metrics", root).innerHTML = statGrid([["Rows", String(data.length)], ["Columns", String(headers.length)], ["Output", formatBytes(new Blob([csv]).size)]]);
    } catch (error) {
      setText("#cj-output", error.message, root);
      $("#cj-metrics", root).innerHTML = "";
    }
  });
};

window.init_regex_tester = (root) => {
  let runId = 0;
  registerToolCleanup(() => {
    runId += 1;
    stopActiveRegexWorker();
  });

  const renderMatches = (matches, flags, text) => {
    $("#rx-status", root).className = "status-line";
    $("#rx-status", root).innerHTML = `<strong>${matches.length} ${matches.length === 1 ? "match" : "matches"}</strong> Pattern compiled with /${escapeHtml(flags)}.${flags.includes("g") ? "" : " Add g to scan every match."}`;
    setText("#rx-output", JSON.stringify(matches, null, 2), root);
    let last = 0;
    const parts = [];
    matches.forEach((match) => {
      parts.push(escapeHtml(text.slice(last, match.index)));
      parts.push(`<mark>${escapeHtml(match.match)}</mark>`);
      last = match.index + match.match.length;
    });
    parts.push(escapeHtml(text.slice(last)));
    $("#rx-preview", root).innerHTML = parts.join("") || "No test text.";
  };

  const run = async () => {
    const id = ++runId;
    const text = $("#rx-text", root).value;
    try {
      const rawFlags = [...new Set($("#rx-flags", root).value.replace(/[^dgimsuvy]/g, "").split(""))].join("");
      const flags = rawFlags;
      const pattern = $("#rx-pattern", root).value;
      $("#rx-status", root).className = "status-line";
      $("#rx-status", root).innerHTML = "<strong>Running</strong> Testing pattern in a worker.";
      const matches = await runRegexWorker(pattern, flags, text);
      if (id !== runId) return;
      renderMatches(matches, flags, text);
    } catch (error) {
      if (id !== runId) return;
      $("#rx-status", root).className = "status-line error";
      $("#rx-status", root).textContent = error.message;
      setText("#rx-output", error.message, root);
      $("#rx-preview", root).textContent = text;
    }
  };
  const debouncedRun = debounce(run, 120);
  $all("input,textarea", root).forEach((element) => element.addEventListener("input", debouncedRun));
  run();
};

window.init_base64 = (root) => {
  const setResult = (value, sourceBytes = 0, label = "Ready") => {
    setText("#b64-output", value, root);
    $("#b64-status", root).innerHTML = `<strong>${escapeHtml(label)}</strong> ${formatBytes(new Blob([value]).size)} output.`;
    $("#b64-metrics", root).innerHTML = statGrid([
      ["Input", formatBytes(sourceBytes)],
      ["Output", formatBytes(new Blob([value]).size)],
      ["Mode", $("#b64-mode", root).value === "url" ? "URL-safe" : "Standard"]
    ]);
  };

  const applyMode = (value) => $("#b64-mode", root).value === "url"
    ? value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
    : value;

  $("#b64-encode", root).addEventListener("click", () => {
    const text = $("#b64-input", root).value;
    const bytes = new TextEncoder().encode(text);
    setResult(applyMode(bytesToBase64(bytes)), bytes.length, "Encoded text");
  });
  $("#b64-decode", root).addEventListener("click", () => {
    try {
      const bytes = base64ToBytes($("#b64-input", root).value);
      setResult(new TextDecoder().decode(bytes), bytes.length, "Decoded text");
    } catch (error) {
      $("#b64-status", root).className = "status-line error";
      $("#b64-status", root).textContent = "Invalid Base64 input.";
      setText("#b64-output", error.message, root);
    }
  });
  $("#b64-file-run", root).addEventListener("click", async () => {
    const file = $("#b64-file", root).files?.[0];
    if (!file) {
      $("#b64-status", root).className = "status-line error";
      $("#b64-status", root).textContent = "Choose a file first.";
      return;
    }
    try {
      $("#b64-status", root).className = "status-line";
      $("#b64-status", root).innerHTML = `<strong>Encoding</strong> Reading ${escapeHtml(file.name)} with the browser file reader.`;
      const dataUrl = await fileToDataUrl(file);
      const marker = ";base64,";
      const markerIndex = dataUrl.indexOf(marker);
      if (markerIndex === -1) throw new Error("FileReader did not return Base64 data.");
      const prefix = dataUrl.slice(0, markerIndex + marker.length);
      const base = dataUrl.slice(markerIndex + marker.length);
      setResult(`${prefix}${applyMode(base)}`, file.size, `Encoded ${file.name}`);
    } catch (error) {
      $("#b64-status", root).className = "status-line error";
      $("#b64-status", root).textContent = error.message;
    }
  });
  $("#b64-swap", root).addEventListener("click", () => {
    $("#b64-input", root).value = $("#b64-output", root).textContent;
    $("#b64-input", root).focus();
  });
  $("#b64-encode", root).click();
};

window.init_url_encoder = (root) => {
  const setStatus = (text, error = false) => {
    $("#url-status", root).className = `status-line${error ? " error" : ""}`;
    $("#url-status", root).textContent = text;
  };
  $("#url-encode", root).addEventListener("click", () => {
    const value = encodeURIComponent($("#url-input", root).value);
    setText("#url-output", value, root);
    setStatus("Encoded as a URL component.");
  });
  $("#url-decode", root).addEventListener("click", () => {
    try {
      setText("#url-output", decodeURIComponent($("#url-input", root).value), root);
      setStatus("Decoded component successfully.");
    } catch {
      setText("#url-output", "Invalid encoded URL text", root);
      setStatus("Invalid encoded URL text.", true);
    }
  });
  $("#url-encode-uri", root).addEventListener("click", () => {
    setText("#url-output", encodeURI($("#url-input", root).value), root);
    setStatus("Encoded full URL while keeping URL separators readable.");
  });
  $("#url-parse", root).addEventListener("click", () => {
    try {
      const url = new URL($("#url-input", root).value);
      const params = [...url.searchParams.entries()];
      $("#url-details", root).innerHTML = resultGrid([
        ["Protocol", url.protocol || "-"],
        ["Origin", url.origin],
        ["Path", url.pathname || "/"],
        ["Params", String(params.length)]
      ]);
      $("#url-params", root).innerHTML = params.length
        ? params.map(([key, value]) => `<div class="mini-table-row"><span>${escapeHtml(key)}</span><code>${escapeHtml(value)}</code></div>`).join("")
        : `<div class="empty-state">No query parameters.</div>`;
      setText("#url-output", JSON.stringify({
        protocol: url.protocol,
        origin: url.origin,
        host: url.host,
        pathname: url.pathname,
        search: searchParamsToObject(url.searchParams),
        hash: url.hash
      }, null, 2), root);
      setStatus("URL parsed successfully.");
    } catch (error) {
      setText("#url-output", "Invalid URL", root);
      $("#url-details", root).innerHTML = "";
      $("#url-params", root).innerHTML = "";
      setStatus(error.message, true);
    }
  });
  $("#url-parse", root).click();
};

window.init_jwt_decoder = (root) => {
  const run = () => {
    try {
      const parts = $("#jwt-input", root).value.trim().split(".");
      if (parts.length < 2) throw new Error("JWT should contain at least header and payload segments.");
      const header = JSON.parse(base64UrlDecode(parts[0] || ""));
      const payload = JSON.parse(base64UrlDecode(parts[1] || ""));
      const now = Math.floor(Date.now() / 1000);
      const expires = payload.exp ? new Date(payload.exp * 1000) : null;
      const issued = payload.iat ? new Date(payload.iat * 1000) : null;
      const notBefore = payload.nbf ? new Date(payload.nbf * 1000) : null;
      $("#jwt-status", root).className = "status-line";
      $("#jwt-status", root).innerHTML = `<strong>Decoded</strong> Signature is shown but not verified.`;
      $("#jwt-claims", root).innerHTML = resultGrid([
        ["Algorithm", header.alg || "-"],
        ["Type", header.typ || "-"],
        ["Expires", expires ? (payload.exp < now ? "Expired" : expires.toLocaleString()) : "-"],
        ["Subject", payload.sub || payload.name || "-"]
      ]);
      setText("#jwt-header", JSON.stringify(header, null, 2), root);
      setText("#jwt-payload", JSON.stringify({
        ...payload,
        ...(expires ? { expLocal: expires.toString() } : {}),
        ...(issued ? { iatLocal: issued.toString() } : {}),
        ...(notBefore ? { nbfLocal: notBefore.toString() } : {})
      }, null, 2), root);
      setText("#jwt-signature", parts[2] || "(no signature segment)", root);
    } catch (error) {
      $("#jwt-status", root).className = "status-line error";
      $("#jwt-status", root).textContent = error.message;
      $("#jwt-claims", root).innerHTML = "";
      setText("#jwt-header", "", root);
      setText("#jwt-payload", "Invalid JWT. This tool decodes only; it does not verify signatures.", root);
      setText("#jwt-signature", "", root);
    }
  };
  $("#jwt-decode", root).addEventListener("click", run);
  $("#jwt-clear", root).addEventListener("click", () => {
    $("#jwt-input", root).value = "";
    run();
  });
  $("#jwt-input", root).addEventListener("input", run);
  run();
};

window.init_hash_generator = (root) => {
  const run = async (bytes, label) => {
    if (!crypto.subtle) {
      setText("#hash-output", "Web Crypto is not available in this browser context.", root);
      return;
    }
    const algorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
    const results = [];
    for (const algorithm of algorithms) {
      results.push([algorithm, bytesToHex(await crypto.subtle.digest(algorithm, bytes))]);
    }
    $("#hash-status", root).innerHTML = `<strong>Generated</strong> ${escapeHtml(label)} (${formatBytes(bytes.length)}).`;
    $("#hash-cards", root).innerHTML = resultGrid(results.map(([name, value]) => [name, `${value.slice(0, 18)}...`]));
    setText("#hash-output", results.map(([name, value]) => `${name}: ${value}`).join("\n"), root);
  };
  $("#hash-run", root).addEventListener("click", () => {
    run(new TextEncoder().encode($("#hash-input", root).value), "text");
  });
  $("#hash-file-run", root).addEventListener("click", async () => {
    const file = $("#hash-file", root).files?.[0];
    if (!file) {
      $("#hash-status", root).className = "status-line error";
      $("#hash-status", root).textContent = "Choose a file first.";
      return;
    }
    $("#hash-status", root).className = "status-line";
    run(new Uint8Array(await file.arrayBuffer()), file.name);
  });
  $("#hash-run", root).click();
};

window.init_timestamp_converter = (root) => {
  const run = () => {
    const raw = $("#ts-input", root).value.trim();
    const numeric = Number(raw);
    const mode = $("#ts-format", root).value;
    const date = Number.isFinite(numeric)
      ? new Date(mode === "millis" || (mode === "auto" && raw.length > 10) ? numeric : numeric * 1000)
      : new Date(raw);
    if (Number.isNaN(date.getTime())) {
      $("#ts-status", root).className = "status-line error";
      $("#ts-status", root).textContent = "Invalid date or timestamp.";
      $("#ts-cards", root).innerHTML = "";
      return setText("#ts-output", "Invalid date or timestamp", root);
    }
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
    $("#ts-status", root).className = "status-line";
    $("#ts-status", root).innerHTML = `<strong>Converted</strong> Local timezone: ${escapeHtml(localZone)}.`;
    $("#ts-cards", root).innerHTML = resultGrid([
      ["Unix seconds", String(Math.floor(date.getTime() / 1000))],
      ["Unix millis", String(date.getTime())],
      ["ISO 8601", date.toISOString()],
      ["UTC", date.toUTCString()]
    ]);
    setText("#ts-output", [
      `Unix seconds: ${Math.floor(date.getTime() / 1000)}`,
      `Unix milliseconds: ${date.getTime()}`,
      `ISO: ${date.toISOString()}`,
      `Local: ${date.toString()}`,
      `UTC: ${date.toUTCString()}`,
      `Timezone: ${localZone}`
    ].join("\n"), root);
  };
  $all("input,select", root).forEach((element) => element.addEventListener("input", run));
  $("#ts-now", root).addEventListener("click", () => {
    $("#ts-input", root).value = String(Math.floor(Date.now() / 1000));
    $("#ts-format", root).value = "seconds";
    run();
  });
  $("#ts-iso", root).addEventListener("click", () => {
    $("#ts-input", root).value = new Date().toISOString();
    $("#ts-format", root).value = "auto";
    run();
  });
  run();
};

window.init_uuid_generator = (root) => {
  const run = () => {
    const count = Math.max(1, Math.min(200, Number($("#uuid-count", root).value) || 1));
    const mode = $("#uuid-mode", root).value;
    const prefix = $("#uuid-prefix", root).value;
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const makeShort = () => randomAlphabetId(12, alphabet);
    const makeHex = () => bytesToHex(crypto.getRandomValues(new Uint8Array(12)));
    const ids = Array.from({ length: count }, () => `${prefix}${mode === "short" ? makeShort() : mode === "hex" ? makeHex() : uuidv4()}`);
    const format = $("#uuid-format", root).value;
    $("#uuid-stats", root).innerHTML = statGrid([["Generated", String(ids.length)], ["Mode", mode.toUpperCase()], ["Unique", String(new Set(ids).size)]]);
    setText("#uuid-output", format === "json" ? JSON.stringify(ids, null, 2) : format === "csv" ? ids.map((id) => csvEscape(id)).join(",\n") : ids.join("\n"), root);
  };
  $("#uuid-run", root).addEventListener("click", run);
  $all("input,select", root).forEach((element) => element.addEventListener("input", debounce(run)));
  run();
};

window.init_lorem_ipsum = (root) => {
  const banks = {
    classic: "lorem ipsum dolor sit amet consectetur adipiscing elit integer posuere erat a ante venenatis dapibus posuere velit aliquet curabitur blandit tempus porttitor".split(" "),
    product: "workspace privacy workflow dashboard preview offline export import instant polished simple focused reliable accessible responsive settings insight action".split(" "),
    dev: "component function schema payload request response token parser format module runtime cache local secure build deploy route hook".split(" ")
  };
  const run = () => {
    const count = Math.max(1, Math.min(20, Number($("#li-count", root).value) || 1));
    const words = Math.max(5, Math.min(200, Number($("#li-words", root).value) || 20));
    const bank = banks[$("#li-tone", root).value] || banks.classic;
    const paragraphs = Array.from({ length: count }, () => {
      const text = Array.from({ length: words }, () => randomChoice(bank)).join(" ");
      return `${text[0].toUpperCase()}${text.slice(1)}.`;
    });
    const format = $("#li-format", root).value;
    const outputValue = format === "html"
      ? paragraphs.map((item) => `<p>${item}</p>`).join("\n")
      : format === "list"
        ? paragraphs.map((item) => `- ${item}`).join("\n")
        : paragraphs.join("\n\n");
    $("#li-stats", root).innerHTML = statGrid([["Paragraphs", String(count)], ["Words", String(wordsFromText(outputValue).length)], ["Characters", String(outputValue.length)]]);
    setText("#li-output", outputValue, root);
  };
  $("#li-run", root).addEventListener("click", run);
  $all("input,select", root).forEach((element) => element.addEventListener("input", debounce(run)));
  run();
};

window.init_dummy_json = (root) => {
  const first = ["Asha", "Noah", "Maya", "Irfan", "Lina", "Omar", "Zara", "Dev"];
  const last = ["Khan", "Rao", "Smith", "Nair", "Chen", "Patel", "Ali", "Stone"];
  const run = () => {
    const count = Math.max(1, Math.min(200, Number($("#dj-count", root).value) || 1));
    const type = $("#dj-type", root).value;
    const idStyle = $("#dj-id", root).value;
    const makeId = (index) => idStyle === "uuid" ? uuidv4() : index + 1;
    const data = Array.from({ length: count }, (_, index) => {
      if (type === "products") return { id: makeId(index), sku: `SKU-${1000 + index}`, name: `Product ${index + 1}`, price: Number((Math.random() * 250 + 10).toFixed(2)), inStock: Math.random() > 0.25, category: randomChoice(["tools", "books", "software", "hardware"]) };
      if (type === "events") return { id: makeId(index), type: randomChoice(["click", "view", "purchase", "signup"]), timestamp: new Date(Date.now() - Math.random() * 1e9).toISOString(), source: randomChoice(["web", "ios", "android"]) };
      if (type === "tasks") return { id: makeId(index), title: `Task ${index + 1}`, status: randomChoice(["todo", "doing", "blocked", "done"]), priority: randomChoice(["low", "medium", "high"]), estimateHours: Math.ceil(Math.random() * 12) };
      if (type === "devices") return { id: makeId(index), platform: randomChoice(["ios", "android", "flutter"]), model: randomChoice(["phone", "tablet", "foldable"]), width: randomChoice([360, 390, 412, 768]), density: randomChoice([2, 2.625, 3, 3.5]) };
      const name = `${randomChoice(first)} ${randomChoice(last)}`;
      return { id: makeId(index), name, email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`, role: randomChoice(["admin", "editor", "viewer"]), active: Math.random() > 0.2 };
    });
    const format = $("#dj-format", root).value;
    const outputValue = format === "jsonl"
      ? data.map((item) => JSON.stringify(item)).join("\n")
      : JSON.stringify(data, null, format === "compact" ? 0 : 2);
    $("#dj-stats", root).innerHTML = statGrid([["Records", String(data.length)], ["Fields", String(Object.keys(data[0] || {}).length)], ["Size", formatBytes(new Blob([outputValue]).size)]]);
    setText("#dj-output", outputValue, root);
  };
  $("#dj-run", root).addEventListener("click", run);
  $all("input,select", root).forEach((element) => element.addEventListener("input", debounce(run)));
  run();
};

window.init_semver_compare = (root) => {
  const run = () => {
    const a = parseSemverValue($("#sv-a", root).value);
    const b = parseSemverValue($("#sv-b", root).value);
    if (!a || !b) {
      $("#sv-status", root).className = "status-line error";
      $("#sv-status", root).textContent = "Use versions like 1.2.3, v2.0.0-beta.1 or 3.1.0+build.";
      $("#sv-cards", root).innerHTML = "";
      return setText("#sv-output", "Invalid semver input.", root);
    }
    const diff = compareSemverValues(a, b);
    const result = diff === 0 ? "Versions are equal" : diff > 0 ? "Version A is newer" : "Version B is newer";
    $("#sv-status", root).className = "status-line";
    $("#sv-status", root).innerHTML = `<strong>${result}</strong> Build metadata is ignored for precedence.`;
    $("#sv-cards", root).innerHTML = resultGrid([
      ["A parsed", `${a.major}.${a.minor}.${a.patch}${a.pre ? `-${a.pre}` : ""}`],
      ["B parsed", `${b.major}.${b.minor}.${b.patch}${b.pre ? `-${b.pre}` : ""}`],
      ["Difference", diff === 0 ? "Equal" : diff > 0 ? "A > B" : "B > A"]
    ]);
    setText("#sv-output", `${result}\n\nA: ${JSON.stringify(a, null, 2)}\nB: ${JSON.stringify(b, null, 2)}`, root);
  };
  $all("input", root).forEach((element) => element.addEventListener("input", run));
  run();
};

window.init_case_converter = (root) => {
  const run = () => {
    const words = toWords($("#case-input", root).value);
    const pascal = words.map(toTitle).join("");
    const camel = `${words[0] || ""}${words.slice(1).map(toTitle).join("")}`;
    const values = [
      ["camelCase", camel],
      ["PascalCase", pascal],
      ["snake_case", words.join("_")],
      ["kebab-case", words.join("-")],
      ["CONSTANT_CASE", words.join("_").toUpperCase()],
      ["Title Case", words.map(toTitle).join(" ")],
      ["Sentence case", words.length ? `${toTitle(words[0])}${words.slice(1).length ? ` ${words.slice(1).join(" ")}` : ""}` : ""],
      ["dot.case", words.join(".")]
    ];
    $("#case-stats", root).innerHTML = statGrid([["Words", String(words.length)], ["Characters", String($("#case-input", root).value.length)]]);
    $("#case-cards", root).innerHTML = values.map(([label, value]) => `<div class="mini-table-row"><span>${escapeHtml(label)}</span><code>${escapeHtml(value)}</code></div>`).join("");
    setText("#case-output", values.map(([label, value]) => `${label}: ${value}`).join("\n"), root);
  };
  $("#case-input", root).addEventListener("input", run);
  run();
};

window.init_mobile_density = (root) => {
  const run = () => {
    const value = Number($("#md-value", root).value) || 0;
    const density = Number($("#md-density", root).value) || 1;
    const viewport = Number($("#md-css", root).value) || 390;
    const rounding = $("#md-round", root).value;
    const format = (next) => {
      if (rounding === "ceil") return `${Math.ceil(next)}px`;
      if (rounding === "floor") return `${Math.floor(next)}px`;
      if (rounding === "none") return `${Number(next.toFixed(2))}px`;
      return `${Math.round(next)}px`;
    };
    const rows = [
      ["Android mdpi", "1x", format(value)],
      ["Android hdpi", "1.5x", format(value * 1.5)],
      ["Android xhdpi", "2x", format(value * 2)],
      ["Android xxhdpi", "3x", format(value * 3)],
      ["Android xxxhdpi", "4x", format(value * 4)],
      ["iOS @2x", "2x", format(value * 2)],
      ["iOS @3x", "3x", format(value * 3)],
      ["Custom", `${density}x`, format(value * density)]
    ];
    $("#md-stats", root).innerHTML = statGrid([
      ["Base", `${value} dp/pt`],
      ["Viewport @custom", `${format(viewport * density)}`],
      ["Custom density", `${density}x`]
    ]);
    $("#md-table", root).innerHTML = rows.map(([name, scale, pixels]) => `<div class="mini-table-row"><span>${escapeHtml(name)} ${escapeHtml(scale)}</span><code>${escapeHtml(pixels)}</code></div>`).join("");
    setText("#md-output", rows.map(([name, scale, pixels]) => `${name} (${scale}): ${pixels}`).join("\n"), root);
  };
  $all("input,select", root).forEach((element) => element.addEventListener("input", run));
  run();
};

window.init_flutter_color = (root) => {
  const run = () => {
    const parsed = parseColor($("#fc-hex", root).value) || hexToRgb($("#fc-color", root).value);
    const hex = rgbToHex(parsed.r, parsed.g, parsed.b);
    $("#fc-color", root).value = hex;
    $("#fc-hex", root).value = hex;
    const rgb = hexToRgb(hex);
    const alpha = Math.max(0, Math.min(100, Number($("#fc-alpha", root).value) || 0));
    const alphaHex = componentToHex(Math.round(alpha * 2.55)).toUpperCase();
    const name = ($("#fc-name", root).value || "brand").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
    const argb = `${alphaHex}${hex.slice(1)}`;
    $("#fc-preview", root).style.background = hex;
    $("#fc-preview", root).style.opacity = Math.max(0.18, alpha / 100);
    $("#fc-preview", root).innerHTML = `<strong>${hex}</strong><span>${alpha}% alpha · ${name}</span>`;
    $("#fc-cards", root).innerHTML = resultGrid([
      ["Flutter ARGB", `0x${argb}`],
      ["Android", `#${argb}`],
      ["RGB", `${rgb.r}, ${rgb.g}, ${rgb.b}`],
      ["Alpha", `${alpha}%`]
    ]);
    setText("#fc-output", [
      `Flutter: const Color(0x${argb});`,
      `Dart ARGB int: 0x${argb}`,
      `Android XML: <color name="${name}">#${argb}</color>`,
      `Compose: Color(0x${argb})`,
      `SwiftUI: Color(red: ${(rgb.r / 255).toFixed(3)}, green: ${(rgb.g / 255).toFixed(3)}, blue: ${(rgb.b / 255).toFixed(3)}, opacity: ${(alpha / 100).toFixed(2)})`,
      `UIKit: UIColor(red: ${(rgb.r / 255).toFixed(3)}, green: ${(rgb.g / 255).toFixed(3)}, blue: ${(rgb.b / 255).toFixed(3)}, alpha: ${(alpha / 100).toFixed(2)})`,
      `CSS: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(alpha / 100).toFixed(2)})`
    ].join("\n"), root);
  };
  $("#fc-color", root).addEventListener("input", () => {
    $("#fc-hex", root).value = $("#fc-color", root).value.toUpperCase();
    run();
  });
  $all("#fc-hex,#fc-alpha,#fc-name", root).forEach((element) => element.addEventListener("input", run));
  run();
};

window.init_app_icon_sizes = (root) => {
  const sizes = [
    ["pwa", "PWA icon", "192x192, 512x512"],
    ["pwa", "PWA maskable", "512x512 with safe zone"],
    ["ios", "Apple touch", "180x180"],
    ["ios", "App Store", "1024x1024"],
    ["android", "Android launcher", "48, 72, 96, 144, 192"],
    ["android", "Play Store", "512x512"],
    ["all", "Favicons", "16x16, 32x32, 48x48"],
    ["all", "Safari pinned tab", "Monochrome SVG"]
  ];
  const run = () => {
    const platform = $("#ais-platform", root).value;
    const visible = sizes.filter(([group]) => platform === "all" || group === platform || group === "all");
    const base = Number($("#ais-base", root).value) || 1024;
    $("#ais-stats", root).innerHTML = statGrid([["Master", `${base}x${base}`], ["Exports", String(visible.length)], ["Safe zone", "80% center"]]);
    $("#ais-table", root).innerHTML = visible.map(([, label, value]) => `<div class="mini-table-row"><span>${escapeHtml(label)}</span><code>${escapeHtml(value)}</code></div>`).join("");
    setText("#ais-output", visible.map(([, label, value]) => `${label}: ${value}`).join("\n"), root);
  };
  $all("input,select", root).forEach((element) => element.addEventListener("input", run));
  run();
};

window.init_jsonl_validator = (root) => {
  const run = () => {
    const lines = $("#jsonl-input", root).value.split(/\r?\n/).filter((line) => line.trim());
    const errors = [];
    const schema = $("#jsonl-schema", root).value;
    lines.forEach((line, index) => {
      try {
        const parsed = JSON.parse(line);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) errors.push(`Line ${index + 1}: record must be an object.`);
        if (schema === "prompt" && (!("prompt" in parsed) || !("completion" in parsed))) errors.push(`Line ${index + 1}: missing prompt or completion.`);
        if (schema === "messages" && !Array.isArray(parsed.messages)) errors.push(`Line ${index + 1}: missing messages array.`);
      } catch (error) {
        errors.push(`Line ${index + 1}: ${error.message}`);
      }
    });
    $("#jsonl-status", root).className = `status-line${errors.length ? " error" : ""}`;
    $("#jsonl-status", root).innerHTML = errors.length ? `<strong>${errors.length} issues</strong> Fix the listed records.` : `<strong>Valid</strong> ${lines.length} records passed.`;
    $("#jsonl-stats", root).innerHTML = statGrid([["Records", String(lines.length)], ["Issues", String(errors.length)], ["Size", formatBytes(new Blob([$("#jsonl-input", root).value]).size)]]);
    setText("#jsonl-output", errors.length ? errors.join("\n") : `${lines.length} valid JSONL records`, root);
  };
  $("#jsonl-sample", root).addEventListener("click", () => {
    $("#jsonl-schema", root).value = "messages";
    $("#jsonl-input", root).value = '{"messages":[{"role":"system","content":"You are concise."},{"role":"user","content":"Summarize this."}]}\n{"messages":[{"role":"user","content":"Create test cases."}]}';
    run();
  });
  $all("textarea,select", root).forEach((element) => element.addEventListener("input", run));
  run();
};

window.init_token_estimator = (root) => {
  const run = () => {
    const text = $("#te-input", root).value;
    const chars = text.length;
    const words = wordsFromText(text).length;
    const divisor = Number($("#te-profile", root).value) || 4;
    const context = Number($("#te-context", root).value) || 8000;
    const tokens = Math.ceil(chars / divisor);
    const pct = Math.min(100, Math.round((tokens / context) * 100));
    $("#te-stats", root).innerHTML = statGrid([
      ["Characters", String(chars)],
      ["Words", String(words)],
      ["Rough tokens", String(tokens)],
      ["Context used", `${pct}%`]
    ]);
    $("#te-advice", root).textContent = tokens > context
      ? `This is roughly ${tokens - context} tokens over the selected context. Split it into sections.`
      : `Rough remaining context: ${Math.max(0, context - tokens)} tokens.`;
    setText("#te-output", [
      `Characters: ${chars}`,
      `Words: ${words}`,
      `Estimated tokens: ${tokens}`,
      `Selected context: ${context}`,
      `Approx pages: ${(words / 450).toFixed(1)}`
    ].join("\n"), root);
  };
  $all("textarea,select", root).forEach((element) => element.addEventListener("input", run));
  run();
};

document.addEventListener("DOMContentLoaded", () => {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  initTheme();
  initInstallPrompt();
  $("#btn-back")?.addEventListener("click", () => {
    replaceWithHomeRoute();
  });
  window.addEventListener("hashchange", () => {
    const home = !window.location.hash || window.location.hash === "#" || window.location.hash === "#/";
    route();
    if (home) requestAnimationFrame(restoreHomePosition);
  });
  route();
  initServiceWorker();
});
