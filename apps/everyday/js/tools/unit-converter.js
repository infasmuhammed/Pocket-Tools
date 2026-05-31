export default {
  init() {
    const catEl = document.getElementById('uc-category');
    const valEl = document.getElementById('uc-value');
    const fromEl = document.getElementById('uc-from');
    const toEl = document.getElementById('uc-to');
    const resEl = document.getElementById('uc-result');

    const units = {
      length: {
        'Meters': 1,
        'Kilometers': 1000,
        'Centimeters': 0.01,
        'Millimeters': 0.001,
        'Miles': 1609.34,
        'Yards': 0.9144,
        'Feet': 0.3048,
        'Inches': 0.0254
      },
      weight: {
        'Kilograms': 1,
        'Grams': 0.001,
        'Milligrams': 0.000001,
        'Metric Tons': 1000,
        'Pounds': 0.453592,
        'Ounces': 0.0283495
      },
      temperature: {
        'Celsius': 'C',
        'Fahrenheit': 'F',
        'Kelvin': 'K'
      }
    };

    const populateSelects = () => {
      const cat = catEl.value;
      const opts = Object.keys(units[cat]);
      
      fromEl.innerHTML = '';
      toEl.innerHTML = '';
      
      opts.forEach(opt => {
        fromEl.add(new Option(opt, opt));
        toEl.add(new Option(opt, opt));
      });
      
      if (opts.length > 1) {
        toEl.selectedIndex = 1;
      }
      calculate();
    };

    const calculate = () => {
      const cat = catEl.value;
      const val = parseFloat(valEl.value) || 0;
      const from = fromEl.value;
      const to = toEl.value;
      
      if (!from || !to) return;

      let result = 0;

      if (cat === 'temperature') {
        let celsius = 0;
        // Convert to Celsius first
        if (from === 'Celsius') celsius = val;
        else if (from === 'Fahrenheit') celsius = (val - 32) * 5/9;
        else if (from === 'Kelvin') celsius = val - 273.15;

        // Convert Celsius to Target
        if (to === 'Celsius') result = celsius;
        else if (to === 'Fahrenheit') result = (celsius * 9/5) + 32;
        else if (to === 'Kelvin') result = celsius + 273.15;
      } else {
        // Simple base unit conversion
        const baseVal = val * units[cat][from];
        result = baseVal / units[cat][to];
      }

      // Format neatly
      const resStr = result.toLocaleString('en-US', { maximumFractionDigits: 4 });
      resEl.textContent = `${resStr} ${to}`;
    };

    catEl.addEventListener('change', populateSelects);
    valEl.addEventListener('input', calculate);
    fromEl.addEventListener('change', calculate);
    toEl.addEventListener('change', calculate);

    populateSelects();
  }
};
