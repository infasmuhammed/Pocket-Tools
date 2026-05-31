export default {
  init() {
    const oldEl = document.getElementById('pc-old');
    const newEl = document.getElementById('pc-new');
    const resEl = document.getElementById('pc-result');
    const labelEl = document.getElementById('pc-label');

    const calculate = () => {
      const oldVal = parseFloat(oldEl.value);
      const newVal = parseFloat(newEl.value);

      if (isNaN(oldVal) || isNaN(newVal) || oldVal === 0) {
        resEl.textContent = '0%';
        resEl.style.color = 'inherit';
        labelEl.textContent = 'Change';
        return;
      }

      const change = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
      
      resEl.textContent = `${Math.abs(change).toFixed(2)}%`;
      
      if (change > 0) {
        resEl.style.color = '#2e7d32'; // Subdued green for increase
        labelEl.textContent = 'Increase';
      } else if (change < 0) {
        resEl.style.color = '#c62828'; // Subdued red for decrease
        labelEl.textContent = 'Decrease';
      } else {
        resEl.style.color = 'inherit';
        labelEl.textContent = 'No Change';
      }
    };

    oldEl.addEventListener('input', calculate);
    newEl.addEventListener('input', calculate);
  }
};
