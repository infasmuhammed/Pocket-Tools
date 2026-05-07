export default {
  init() {
    const startEl = document.getElementById('db-start');
    const endEl = document.getElementById('db-end');
    const daysEl = document.getElementById('db-days');
    const weeksEl = document.getElementById('db-weeks');
    const monthsEl = document.getElementById('db-months');

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    startEl.valueAsDate = today;
    endEl.valueAsDate = tomorrow;

    const calculate = () => {
      const d1 = new Date(startEl.value);
      const d2 = new Date(endEl.value);
      
      if (isNaN(d1) || isNaN(d2)) return;

      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      daysEl.textContent = diffDays;
      weeksEl.textContent = (diffDays / 7).toFixed(1);
      monthsEl.textContent = (diffDays / 30.44).toFixed(1);
    };

    startEl.addEventListener('change', calculate);
    endEl.addEventListener('change', calculate);
    
    calculate();
  }
};
