import { UI } from './core/ui.js';
import { getTool, isValidToolId } from './registry.js';

const HOME_SCROLL_KEY = 'pt-home-scroll';
const HOME_RETURN_TOOL_KEY = 'pt-home-return-tool';

const SafeSessionStorage = (() => {
  const memory = new Map();
  const getStorage = () => {
    try {
      return window.sessionStorage || null;
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
  };
})();

function instantScrollTo(top = 0) {
  window.scrollTo({ top, left: 0, behavior: 'auto' });
}

function setAppTitle(element, title) {
  element.replaceChildren();
  const logo = document.createElement('img');
  logo.className = 'app-logo';
  logo.src = 'assets/pocket-tools-logo-192.png';
  logo.alt = '';
  logo.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.textContent = title;
  element.append(logo, text);
}

class Router {
  constructor() {
    this.currentToolId = null;
    this.currentToolModule = null;
    this.templateCache = new Map();
    this.moduleCache = new Map();
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  goHome() {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`);
    this.handleRoute();
  }

  destroyCurrentTool() {
    if (this.currentToolModule?.destroy) {
      try {
        this.currentToolModule.destroy();
      } catch (err) {
        console.warn('[router] tool destroy failed:', err);
      }
    }
    this.currentToolId = null;
    this.currentToolModule = null;
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
      this.destroyCurrentTool();
      viewTool.classList.add('hidden');
      viewHome.classList.remove('hidden');
      btnBack.classList.add('hidden');
      setAppTitle(appTitle, 'Pocket Tools');
      delete toolContainer.dataset.category;
      const saved = SafeSessionStorage.getItem(HOME_SCROLL_KEY);
      const savedScroll = Number(saved || 0);
      const returnToolId = SafeSessionStorage.getItem(HOME_RETURN_TOOL_KEY);
      requestAnimationFrame(() => {
        if (saved !== null && Number.isFinite(savedScroll)) {
          instantScrollTo(savedScroll);
          return;
        }

        const returnCard = returnToolId
          ? document.querySelector(`.tool-card[href="#/tool/${encodeURIComponent(returnToolId)}"]`)
          : null;
        if (returnCard) {
          returnCard.scrollIntoView({ block: 'center', behavior: 'auto' });
        } else {
          instantScrollTo(0);
        }
      });
      return;
    }

    // Tool route
    if (hash.startsWith('#/tool/')) {
      const rawId = hash.replace('#/tool/', '');
      const toolId = decodeURIComponent(rawId).trim();

      // Whitelist guard — only known tool IDs allowed (prevents path traversal)
      if (!isValidToolId(toolId)) {
        UI.showError('Unknown tool.');
        this.goHome();
        return;
      }

      viewHome.classList.add('hidden');
      viewTool.classList.remove('hidden');
      btnBack.classList.remove('hidden');
      btnBack.onclick = () => { this.goHome(); };

      const tool = getTool(toolId);
      setAppTitle(appTitle, tool.name);
      toolContainer.dataset.category = tool.category;
      toolContainer.replaceChildren();
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton';
      skeleton.setAttribute('aria-hidden', 'true');
      toolContainer.appendChild(skeleton);
      instantScrollTo(0);

      try {
        await this.loadTool(toolId, toolContainer);
        instantScrollTo(0);
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
    this.goHome();
  }

  async loadTool(toolId, container) {
    this.destroyCurrentTool();

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
      this.currentToolModule = module.default;
    }
  }
}

export const appRouter = new Router();
