export default {
  init() {
    const priceEl = document.getElementById('dc-price');
    const discountEl = document.getElementById('dc-discount');
    const savingsOut = document.getElementById('dc-savings');
    const finalOut = document.getElementById('dc-final');

    const calculate = () => {
      const price = parseFloat(priceEl.value) || 0;
      let discount = parseFloat(discountEl.value) || 0;
      if (discount > 100) discount = 100;
      if (discount < 0) discount = 0;

      const savings = price * (discount / 100);
      const finalPrice = price - savings;

      savingsOut.textContent = savings.toFixed(2);
      finalOut.textContent = finalPrice.toFixed(2);
    };

    priceEl.addEventListener('input', calculate);
    discountEl.addEventListener('input', calculate);
  }
};
