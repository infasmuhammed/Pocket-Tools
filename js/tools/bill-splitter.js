export default {
  init() {
    const amountEl = document.getElementById('bs-amount');
    const tipEl = document.getElementById('bs-tip');
    const peopleEl = document.getElementById('bs-people');
    
    const tipOut = document.getElementById('bs-total-tip');
    const totalOut = document.getElementById('bs-total-amount');
    const perPersonOut = document.getElementById('bs-per-person');

    const calculate = () => {
      const amount = parseFloat(amountEl.value) || 0;
      const tipPercent = parseFloat(tipEl.value) || 0;
      let people = parseInt(peopleEl.value) || 1;
      if (people < 1) people = 1;

      const totalTip = amount * (tipPercent / 100);
      const totalAmount = amount + totalTip;
      const perPerson = totalAmount / people;

      tipOut.textContent = totalTip.toFixed(2);
      totalOut.textContent = totalAmount.toFixed(2);
      perPersonOut.textContent = perPerson.toFixed(2);
    };

    amountEl.addEventListener('input', calculate);
    tipEl.addEventListener('input', calculate);
    peopleEl.addEventListener('input', calculate);
  }
};
