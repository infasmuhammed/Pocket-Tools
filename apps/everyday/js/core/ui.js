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

const recentToasts = new Map();

function spawnToast(message, type) {
  const key = `${type || 'info'}:${String(message)}`;
  const now = Date.now();
  if ((recentToasts.get(key) || 0) + 1800 > now) return;
  recentToasts.set(key, now);

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

  async copyText(text, successMessage = 'Copied to clipboard.') {
    const value = String(text || '');
    if (!value) {
      spawnToast('No text to copy', 'error');
      return false;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.left = '-1000px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        if (!document.execCommand('copy')) throw new Error('Copy command failed');
      } catch {
        ta.remove();
        spawnToast('Failed to copy', 'error');
        return false;
      }
      ta.remove();
    }

    spawnToast(successMessage, 'success');
    return true;
  },

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
