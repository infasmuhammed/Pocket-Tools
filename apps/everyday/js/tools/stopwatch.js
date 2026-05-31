export default {
  startTime: 0,
  elapsedTime: 0,
  timerInterval: null,
  isRunning: false,
  laps: [],

  init() {
    clearInterval(this.timerInterval);
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerInterval = null;
    this.isRunning = false;
    this.laps = [];

    this.display = document.getElementById('sw-display');
    this.btnStart = document.getElementById('btn-sw-start');
    this.btnPause = document.getElementById('btn-sw-pause');
    this.btnLap = document.getElementById('btn-sw-lap');
    this.btnReset = document.getElementById('btn-sw-reset');
    this.lapsContainer = document.getElementById('sw-laps');

    this.btnStart.onclick = () => this.start();
    this.btnPause.onclick = () => this.pause();
    this.btnLap.onclick = () => this.lap();
    this.btnReset.onclick = () => this.reset();
  },

  start() {
    if (this.isRunning) return;
    this.startTime = Date.now() - this.elapsedTime;
    this.timerInterval = setInterval(() => this.syncElapsed(), 100);
    this.isRunning = true;
    this.syncElapsed();
    
    this.btnStart.classList.add('hidden');
    this.btnPause.classList.remove('hidden');
    this.btnLap.disabled = false;
  },

  syncElapsed() {
    if (!this.isRunning) return;
    this.elapsedTime = Date.now() - this.startTime;
    this.updateDisplay(this.elapsedTime, this.display);
  },

  pause() {
    if (!this.isRunning) return;
    this.syncElapsed();
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isRunning = false;
    
    this.btnStart.classList.remove('hidden');
    this.btnPause.classList.add('hidden');
    this.btnLap.disabled = true;
  },

  reset() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isRunning = false;
    this.elapsedTime = 0;
    this.updateDisplay(0, this.display);
    this.laps = [];
    this.renderLaps();
    
    this.btnStart.classList.remove('hidden');
    this.btnPause.classList.add('hidden');
    this.btnLap.disabled = true;
  },

  lap() {
    if (!this.isRunning) return;
    this.syncElapsed();
    this.laps.unshift(this.elapsedTime); // Add to beginning
    this.renderLaps();
  },

  updateDisplay(timeMs, element) {
    const totalSecs = Math.floor(timeMs / 1000);
    const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    const ms = Math.floor((timeMs % 1000) / 10).toString().padStart(2, '0');
    
    element.textContent = `${m}:${s}.${ms}`;
  },

  renderLaps() {
    this.lapsContainer.innerHTML = '';
    this.laps.forEach((lapTime, index) => {
      const realIndex = this.laps.length - index;
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.justifyContent = 'space-between';
      el.style.padding = '0.75rem 0';
      el.style.borderBottom = '1px solid var(--border-color)';
      
      const idxSpan = document.createElement('span');
      idxSpan.textContent = `Lap ${realIndex}`;
      idxSpan.style.opacity = '0.7';
      
      const timeSpan = document.createElement('span');
      timeSpan.style.fontWeight = '500';
      timeSpan.style.fontVariantNumeric = 'tabular-nums';
      this.updateDisplay(lapTime, timeSpan);
      
      el.appendChild(idxSpan);
      el.appendChild(timeSpan);
      this.lapsContainer.appendChild(el);
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isRunning = false;
  }
};
