import { appRouter } from './router.js';
import { TOOLS } from './registry.js';

function renderHome() {
  // Tool grid
  const grid = document.getElementById('tool-grid');
  if (!grid) return;
  renderGrid(grid, 'all');

  // Category chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.category || 'all';
      renderGrid(grid, cat);
    });
  });
}

function renderGrid(grid, category) {
  grid.replaceChildren();
  const tools = category === 'all'
    ? TOOLS
    : TOOLS.filter(t => t.category === category);

  for (const tool of tools) {
    const a = document.createElement('a');
    a.className = 'tool-card';
    a.setAttribute('role', 'listitem');
    a.href = `#/tool/${encodeURIComponent(tool.id)}`;

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '1.8');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    icon.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', tool.icon);
    icon.appendChild(path);

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = tool.name;

    const desc = document.createElement('span');
    desc.className = 'desc';
    desc.textContent = tool.desc;

    a.appendChild(icon);
    a.appendChild(name);
    a.appendChild(desc);
    grid.appendChild(a);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  appRouter.handleRoute();

  // Service worker (offline support). Only on http(s) — not file://
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js')
      .catch(err => console.warn('[sw] registration failed:', err));
  }
});
