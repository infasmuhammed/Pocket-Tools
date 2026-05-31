export default {
  init() {
    const pEl = document.getElementById('emi-principal');
    const rEl = document.getElementById('emi-rate');
    const tEl = document.getElementById('emi-tenure');
    const typeEl = document.getElementById('emi-tenure-type');

    const emiOut = document.getElementById('emi-monthly');
    const interestOut = document.getElementById('emi-total-interest');
    const totalOut = document.getElementById('emi-total-payment');

    const calculate = () => {
      const p = parseFloat(pEl.value) || 0;
      const r = parseFloat(rEl.value) || 0;
      let t = parseFloat(tEl.value) || 0;

      if (typeEl.value === 'years') {
        t = t * 12;
      }

      if (p === 0 || r === 0 || t === 0) {
        emiOut.textContent = '0.00';
        interestOut.textContent = '0.00';
        totalOut.textContent = '0.00';
        return;
      }

      // EMI Formula: P x R x (1+R)^N / [(1+R)^N-1]
      // where R is monthly interest rate
      const monthlyRate = r / 12 / 100;
      const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, t)) / (Math.pow(1 + monthlyRate, t) - 1);
      
      const totalPayment = emi * t;
      const totalInterest = totalPayment - p;

      emiOut.textContent = emi.toFixed(2);
      interestOut.textContent = totalInterest.toFixed(2);
      totalOut.textContent = totalPayment.toFixed(2);
    };

    pEl.addEventListener('input', calculate);
    rEl.addEventListener('input', calculate);
    tEl.addEventListener('input', calculate);
    typeEl.addEventListener('change', calculate);
  }
};
