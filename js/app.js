import { appRouter } from './router.js';
import { TOOLS, CATEGORIES, getTool } from './registry.js';

const RECENT_KEY = 'pt-recent';
const THEME_KEY = 'pt-theme';
const HOME_SCROLL_KEY = 'pt-home-scroll';
const HOME_RETURN_TOOL_KEY = 'pt-home-return-tool';
const RECENT_MAX = 4;
const CATEGORY_COLORS = Object.fromEntries(CATEGORIES.map(cat => [cat.id, 'var(--category-dot)']));

let currentCategory = 'all';
let currentQuery = '';

/* ---------- Theme ---------- */
function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}
function currentTheme() {
  return document.documentElement.getAttribute('data-theme')
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') applyTheme(saved);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      const rect = btn.getBoundingClientRect();
      const x = Math.round(rect.left + rect.width / 2);
      const y = Math.round(rect.top + rect.height / 2);
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      document.documentElement.style.setProperty('--theme-x', `${x}px`);
      document.documentElement.style.setProperty('--theme-y', `${y}px`);
      document.documentElement.style.setProperty('--theme-r', `${Math.ceil(radius)}px`);

      const setNext = () => {
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
      };

      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setNext();
        return;
      }

      if (!document.startViewTransition) {
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
}

/* ---------- Recently Used ---------- */
function getRecent() {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(id => getTool(id)) : [];
  } catch { return []; }
}
function pushRecent(id) {
  if (!getTool(id)) return;
  const list = getRecent().filter(x => x !== id);
  list.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
}

/* ---------- Rendering ---------- */
function makeIcon(d, cls = 'icon') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', cls);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  svg.appendChild(p);
  return svg;
}

function makeCard(tool) {
  const a = document.createElement('a');
  a.className = 'tool-card';
  a.setAttribute('role', 'listitem');
  a.href = `#/tool/${encodeURIComponent(tool.id)}`;
  a.dataset.category = tool.category;
  a.addEventListener('click', () => {
    sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY || 0));
    sessionStorage.setItem(HOME_RETURN_TOOL_KEY, tool.id);
    pushRecent(tool.id);
  });

  const wrap = document.createElement('div');
  wrap.className = 'icon-wrap';
  wrap.appendChild(makeIcon(tool.icon));

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = tool.name;

  const desc = document.createElement('span');
  desc.className = 'desc';
  desc.textContent = tool.desc;

  a.append(wrap, name, desc);
  return a;
}

function makeLabel(category) {
  const label = document.createElement('div');
  label.className = 'category-label';
  const dot = document.createElement('span');
  dot.className = 'cat-dot';
  dot.style.background = CATEGORY_COLORS[category.id] || 'var(--category-dot)';
  label.append(dot, document.createTextNode(category.label));
  return label;
}

function renderRecent() {
  const existing = document.getElementById('recent-row');
  if (existing) existing.remove();
  const ids = getRecent();
  if (!ids.length) return;

  const searchWrap = document.querySelector('.search-wrap');
  if (!searchWrap) return;

  const row = document.createElement('div');
  row.id = 'recent-row';
  row.className = 'recent-row';

  const label = document.createElement('p');
  label.className = 'recent-label';
  label.textContent = 'Recently used';

  const list = document.createElement('div');
  list.className = 'recent-scroll';

  for (const id of ids) {
    const tool = getTool(id);
    if (!tool) continue;
    const a = document.createElement('a');
    a.className = 'recent-card';
    a.href = `#/tool/${encodeURIComponent(tool.id)}`;
    a.addEventListener('click', () => {
      sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY || 0));
      sessionStorage.setItem(HOME_RETURN_TOOL_KEY, tool.id);
      pushRecent(tool.id);
    });
    const wrap = document.createElement('div');
    wrap.className = 'recent-icon-wrap';
    wrap.appendChild(makeIcon(tool.icon));
    const name = document.createElement('span');
    name.className = 'recent-name';
    name.textContent = tool.name;
    a.append(wrap, name);
    list.appendChild(a);
  }

  row.append(label, list);
  searchWrap.insertAdjacentElement('beforebegin', row);
}

function render({ animate = true } = {}) {
  const root = document.getElementById('tool-grid');
  if (!root) return;
  root.replaceChildren();
  root.classList.remove('animate-cards', 'stable-grid');
  if (animate) {
    void root.offsetWidth;
    root.classList.add('animate-cards');
  } else {
    root.classList.add('stable-grid');
  }

  const q = currentQuery.trim().toLowerCase();
  const matches = (t) => !q
    || t.name.toLowerCase().includes(q)
    || t.desc.toLowerCase().includes(q)
    || t.category.toLowerCase().includes(q);

  let total = 0;

  if (currentCategory === 'all') {
    for (const cat of CATEGORIES) {
      const items = TOOLS.filter(t => t.category === cat.id && matches(t));
      if (!items.length) continue;
      root.appendChild(makeLabel(cat));
      for (const t of items) {
        const card = makeCard(t);
        card.style.setProperty('--i', total);
        root.appendChild(card);
        total += 1;
      }
    }
  } else {
    const items = TOOLS.filter(t => t.category === currentCategory && matches(t));
    for (const [index, t] of items.entries()) {
      const card = makeCard(t);
      card.style.setProperty('--i', index);
      root.appendChild(card);
    }
    total = items.length;
  }

  if (!total) {
    const empty = document.createElement('p');
    empty.className = 'search-empty';
    empty.textContent = currentQuery.trim()
      ? `No tools match "${currentQuery.trim()}".`
      : 'No tools in this category.';
    root.appendChild(empty);
  }
}

function renderHome() {
  // Tool count + dynamic search placeholder
  const countEl = document.getElementById('tool-count');
  if (countEl) countEl.textContent = String(TOOLS.length);
  const search = document.getElementById('tool-search');
  if (search) {
    search.placeholder = `Search ${TOOLS.length} tools…`;
    search.addEventListener('input', () => {
      currentQuery = search.value || '';
      render({ animate: true });
    });
  }

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      chip.classList.remove('chip-tapped');
      void chip.offsetWidth;
      chip.classList.add('chip-tapped');
      chip.addEventListener('animationend', () => chip.classList.remove('chip-tapped'), { once: true });
      currentCategory = chip.dataset.category || 'all';
      render({ animate: true });
    });
  });

  renderRecent();
  render({ animate: false });
}

function restoreHomePosition() {
  const id = sessionStorage.getItem(HOME_RETURN_TOOL_KEY);
  const card = id ? document.querySelector(`.tool-card[href="#/tool/${encodeURIComponent(id)}"]`) : null;
  if (card) {
    card.scrollIntoView({ block: 'center' });
    return;
  }
  window.scrollTo(0, Number(sessionStorage.getItem(HOME_SCROLL_KEY) || 0));
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderHome();
  appRouter.handleRoute();

  // Re-render Recently Used when returning home
  window.addEventListener('hashchange', () => {
    if (!location.hash || location.hash === '#' || location.hash === '#/') {
      renderRecent();
      requestAnimationFrame(() => restoreHomePosition());
    }
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js')
      .catch(err => console.warn('[sw] registration failed:', err));
  }
});
