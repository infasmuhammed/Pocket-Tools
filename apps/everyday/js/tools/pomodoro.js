import { UI } from '../core/ui.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.parseInt(value, 10) || min));

export default {
  timer: null,
  deadlineAt: 0,
  timeLeft: 25 * 60,
  isRunning: false,
  mode: 'work',
  completedWork: 0,

  init() {
    clearInterval(this.timer);
    this.timer = null;
    this.deadlineAt = 0;
    this.timeLeft = 25 * 60;
    this.isRunning = false;
    this.mode = 'work';
    this.completedWork = 0;

    this.display = document.getElementById('pomo-display');
    this.status = document.getElementById('pomo-status');
    this.cyclesEl = document.getElementById('pomo-cycles');
    this.planEl = document.getElementById('pomo-plan');
    this.workEl = document.getElementById('pomo-work-min');
    this.breakEl = document.getElementById('pomo-break-min');
    this.longBreakEl = document.getElementById('pomo-long-break-min');
    this.cycleCountEl = document.getElementById('pomo-cycle-count');
    this.btnStart = document.getElementById('btn-pomo-start');
    this.btnPause = document.getElementById('btn-pomo-pause');
    this.btnReset = document.getElementById('btn-pomo-reset');
    this.btnWork = document.getElementById('btn-pomo-work');
    this.btnBreak = document.getElementById('btn-pomo-break');
    this.btnLongBreak = document.getElementById('btn-pomo-long-break');
    this.presetBtns = Array.from(document.querySelectorAll('[data-pomo-preset]'));

    this.btnStart.onclick = () => this.start();
    this.btnPause.onclick = () => this.pause();
    this.btnReset.onclick = () => this.reset();
    this.btnWork.onclick = () => this.setMode('work');
    this.btnBreak.onclick = () => this.setMode('break');
    this.btnLongBreak.onclick = () => this.setMode('long-break');

    [this.workEl, this.breakEl, this.longBreakEl, this.cycleCountEl].forEach((el) => {
      el.addEventListener('input', () => this.applySettings(false));
      el.addEventListener('change', () => this.applySettings(true));
    });

    this.presetBtns.forEach((button) => {
      button.onclick = () => {
        const [work, shortBreak, longBreak, cycles] = button.dataset.pomoPreset.split(',');
        this.workEl.value = work;
        this.breakEl.value = shortBreak;
        this.longBreakEl.value = longBreak;
        this.cycleCountEl.value = cycles;
        this.presetBtns.forEach((btn) => btn.classList.toggle('active', btn === button));
        this.applySettings(true);
      };
    });

    this.applySettings(true);
  },

  getSettings() {
    return {
      work: clamp(this.workEl.value, 1, 180),
      break: clamp(this.breakEl.value, 1, 60),
      longBreak: clamp(this.longBreakEl.value, 1, 90),
      cycles: clamp(this.cycleCountEl.value, 1, 12),
    };
  },

  secondsFor(mode) {
    const s = this.getSettings();
    if (mode === 'break') return s.break * 60;
    if (mode === 'long-break') return s.longBreak * 60;
    return s.work * 60;
  },

  applySettings(resetCurrent) {
    const s = this.getSettings();
    this.workEl.value = s.work;
    this.breakEl.value = s.break;
    this.longBreakEl.value = s.longBreak;
    this.cycleCountEl.value = s.cycles;
    this.planEl.textContent = String(s.work) + ' / ' + String(s.break) + ' / ' + String(s.longBreak);
    if (!this.isRunning && resetCurrent) this.timeLeft = this.secondsFor(this.mode);
    this.updateDisplay();
  },

  setMode(mode) {
    this.pause();
    this.mode = mode;
    this.timeLeft = this.secondsFor(mode);
    this.updateDisplay();
  },

  nextModeAfterComplete() {
    if (this.mode !== 'work') return 'work';
    this.completedWork += 1;
    const every = this.getSettings().cycles;
    return this.completedWork % every === 0 ? 'long-break' : 'break';
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.deadlineAt = Date.now() + this.timeLeft * 1000;
    this.btnStart.classList.add('hidden');
    this.btnPause.classList.remove('hidden');

    this.timer = setInterval(() => this.tick(), 250);
    this.tick();
  },

  syncTimeLeft() {
    if (!this.isRunning || !this.deadlineAt) return this.timeLeft;
    this.timeLeft = Math.max(0, Math.ceil((this.deadlineAt - Date.now()) / 1000));
    return this.timeLeft;
  },

  tick() {
    if (this.syncTimeLeft() <= 0) {
      const oldMode = this.mode;
      const nextMode = this.nextModeAfterComplete();
      this.pause({ sync: false });
      this.mode = nextMode;
      this.timeLeft = this.secondsFor(nextMode);
      this.updateDisplay();
      UI.showSuccess(oldMode === 'work' ? 'Work session complete. Break is ready.' : 'Break complete. Work timer is ready.');
      return;
    }
    this.updateDisplay();
  },

  pause({ sync = true } = {}) {
    if (sync) this.syncTimeLeft();
    this.isRunning = false;
    clearInterval(this.timer);
    this.timer = null;
    this.deadlineAt = 0;
    this.btnStart.classList.remove('hidden');
    this.btnPause.classList.add('hidden');
  },

  reset() {
    this.pause();
    this.timeLeft = this.secondsFor(this.mode);
    this.updateDisplay();
  },

  destroy() {
    clearInterval(this.timer);
    this.timer = null;
    this.deadlineAt = 0;
    this.isRunning = false;
  },

  updateModeButtons() {
    this.btnWork.classList.toggle('active', this.mode === 'work');
    this.btnBreak.classList.toggle('active', this.mode === 'break');
    this.btnLongBreak.classList.toggle('active', this.mode === 'long-break');
  },

  updateDisplay() {
    const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const s = (this.timeLeft % 60).toString().padStart(2, '0');
    const label = this.mode === 'work' ? 'Work Time' : this.mode === 'break' ? 'Short Break' : 'Long Break';
    this.display.textContent = m + ':' + s;
    this.status.textContent = label;
    this.cyclesEl.textContent = String(this.completedWork);
    this.updateModeButtons();
  }
};
