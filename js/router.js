import { UI } from './core/ui.js';
import { getTool, isValidToolId } from './registry.js';

function setAppTitle(element, title) {
  element.replaceChildren();
  const logo = document.createElement('img');
  logo.className = 'app-logo';
  logo.src = 'assets/icon-192.png';
  logo.alt = '';
  logo.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.textContent = title;
  element.append(logo, text);
}

class Router {
  constructor() {
    this.currentToolId = null;
    this.templateCache = new Map();
    this.moduleCache = new Map();
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  async handleRoute() {
    const viewHome = document.getElementById('view-home');
    const viewTool = document.getElementById('view-tool');
    const toolContainer = document.getElementById('tool-container');
    const btnBack = document.getElementById('btn-back');
    const appTitle = document.getElementById('app-title');

    const hash = window.location.hash || '';

    // Home
    if (!hash || hash === '#' || hash === '#/') {
      viewTool.classList.add('hidden');
      viewHome.classList.remove('hidden');
      btnBack.classList.add('hidden');
      setAppTitle(appTitle, 'Pocket Tools');
      this.currentToolId = null;
      window.scrollTo(0, 0);
      return;
    }

    // Tool route
    if (hash.startsWith('#/tool/')) {
      const rawId = hash.replace('#/tool/', '');
      const toolId = decodeURIComponent(rawId).trim();

      // Whitelist guard — only known tool IDs allowed (prevents path traversal)
      if (!isValidToolId(toolId)) {
        UI.showError('Unknown tool.');
        window.location.hash = '#/';
        return;
      }

      viewHome.classList.add('hidden');
      viewTool.classList.remove('hidden');
      btnBack.classList.remove('hidden');
      btnBack.onclick = () => { window.location.hash = '#/'; };

      const tool = getTool(toolId);
      setAppTitle(appTitle, tool.name);
      toolContainer.replaceChildren();
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton';
      skeleton.setAttribute('aria-hidden', 'true');
      toolContainer.appendChild(skeleton);

      try {
        await this.loadTool(toolId, toolContainer);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('[router] loadTool failed:', err);
        UI.showError('Could not load this tool. Try again.');
        toolContainer.replaceChildren();
        const msg = document.createElement('p');
        msg.className = 'muted';
        msg.textContent = 'Failed to load. Go back and try again.';
        toolContainer.appendChild(msg);
      }
      return;
    }

    // Unknown hash — go home
    window.location.hash = '#/';
  }

  async loadTool(toolId, container) {
    // 1. Fetch template (cached after first load)
    let html = this.templateCache.get(toolId);
    if (!html) {
      const res = await fetch(`templates/${toolId}.html`);
      if (!res.ok) throw new Error(`Template not found: ${toolId}`);
      html = await res.text();
      this.templateCache.set(toolId, html);
    }

    // 2. Inject template. Templates are static, served from same origin, gated by CSP.
    container.innerHTML = html;

    // 3. Lazy load tool JS module
    let module = this.moduleCache.get(toolId);
    if (!module) {
      module = await import(`./tools/${toolId}.js`);
      this.moduleCache.set(toolId, module);
    }

    if (module.default && typeof module.default.init === 'function') {
      module.default.init();
      this.currentToolId = toolId;
    }
  }
}

export const appRouter = new Router();
