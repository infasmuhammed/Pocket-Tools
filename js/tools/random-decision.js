import { UI } from '../core/ui.js';

export default {
  init() {
    const input = document.getElementById('rd-input');
    const btnSpin = document.getElementById('btn-rd-spin');
    const container = document.getElementById('rd-result-container');
    const winnerEl = document.getElementById('rd-winner');

    btnSpin.onclick = () => {
      const text = input.value.trim();
      if (!text) return UI.showError('Please enter some choices');

      const choices = text.split('\n').map(c => c.trim()).filter(c => c !== '');
      if (choices.length < 2) return UI.showError('Enter at least two choices');

      container.classList.remove('hidden');
      winnerEl.textContent = 'Deciding...';
      winnerEl.style.opacity = '0.5';
      btnSpin.disabled = true;

      // Fun little animation
      let count = 0;
      const maxSpins = 20;
      const interval = setInterval(() => {
        winnerEl.textContent = choices[Math.floor(Math.random() * choices.length)];
        count++;
        
        if (count >= maxSpins) {
          clearInterval(interval);
          const finalWinner = choices[Math.floor(Math.random() * choices.length)];
          winnerEl.textContent = finalWinner;
          winnerEl.style.opacity = '1';
          btnSpin.disabled = false;
        }
      }, 50);
    };
  }
};
