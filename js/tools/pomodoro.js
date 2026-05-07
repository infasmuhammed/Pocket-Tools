import { UI } from '../core/ui.js';

export default {
  timer: null,
  timeLeft: 25 * 60,
  isRunning: false,
  mode: 'work',

  init() {
    this.display = document.getElementById('pomo-display');
    this.status = document.getElementById('pomo-status');
    this.btnStart = document.getElementById('btn-pomo-start');
    this.btnPause = document.getElementById('btn-pomo-pause');
    this.btnReset = document.getElementById('btn-pomo-reset');
    this.btnWork = document.getElementById('btn-pomo-work');
    this.btnBreak = document.getElementById('btn-pomo-break');

    this.updateDisplay();

    this.btnStart.onclick = () => this.start();
    this.btnPause.onclick = () => this.pause();
    this.btnReset.onclick = () => this.reset();
    
    this.btnWork.onclick = () => this.setMode('work');
    this.btnBreak.onclick = () => this.setMode('break');
  },

  setMode(mode) {
    this.pause();
    this.mode = mode;
    this.timeLeft = mode === 'work' ? 25 * 60 : 5 * 60;
    this.status.textContent = mode === 'work' ? 'Work Time' : 'Break Time';
    this.updateDisplay();
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.btnStart.classList.add('hidden');
    this.btnPause.classList.remove('hidden');
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.pause();
        this.timeLeft = 0;
        this.updateDisplay();
        UI.showSuccess(this.mode === 'work' ? 'Work session complete! Take a break.' : 'Break over! Back to work.');
        try { new AudioContext(); } catch {} // hint user gesture; sound TBD
      } else {
        this.updateDisplay();
      }
    }, 1000);
  },

  pause() {
    this.isRunning = false;
    clearInterval(this.timer);
    this.btnStart.classList.remove('hidden');
    this.btnPause.classList.add('hidden');
  },

  reset() {
    this.setMode(this.mode);
  },

  updateDisplay() {
    const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const s = (this.timeLeft % 60).toString().padStart(2, '0');
    this.display.textContent = `${m}:${s}`;
  }
};
