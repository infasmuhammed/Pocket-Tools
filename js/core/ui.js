// UI helpers — toasts, loading states, no innerHTML with user content.

function ensureToastContainer() {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    c.setAttribute('aria-live', 'polite');
    c.setAttribute('aria-atomic', 'true');
    document.body.appendChild(c);
  }
  return c;
}

function spawnToast(message, type) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type || ''}`.trim();
  toast.textContent = String(message);
  container.appendChild(toast);

  const ttl = type === 'error' ? 4500 : 2800;
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, ttl);
}

export const UI = {
  showToast(message, type = 'info') { spawnToast(message, type); },
  showError(message) { spawnToast(message, 'error'); },
  showSuccess(message) { spawnToast(message, 'success'); },

  // Accepts a button element OR an id string.
  setLoading(target, isLoading, originalText) {
    const btn = typeof target === 'string' ? document.getElementById(target) : target;
    if (!btn) return;
    if (isLoading) {
      if (!btn.dataset._origText) btn.dataset._origText = btn.textContent;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'Processing…';
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.textContent = originalText || btn.dataset._origText || btn.textContent;
      delete btn.dataset._origText;
    }
  },
};
