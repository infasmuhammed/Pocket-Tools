export default {
  init() {
    const input = document.getElementById('rt-input');
    const timeEl = document.getElementById('rt-time');
    
    input.addEventListener('input', () => {
      const text = input.value.trim();
      if (!text) {
        timeEl.textContent = '0 min';
        return;
      }
      
      const words = text.split(/\s+/).length;
      // Average reading speed is ~225 words per minute
      const minutes = Math.ceil(words / 225);
      
      if (minutes < 1) {
        timeEl.textContent = '< 1 min';
      } else {
        timeEl.textContent = `${minutes} min`;
      }
    });
  }
};
