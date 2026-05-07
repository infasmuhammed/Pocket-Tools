export default {
  init() {
    const timeEl = document.getElementById('tz-time');
    const fromEl = document.getElementById('tz-from');
    const toEl = document.getElementById('tz-to');
    const resEl = document.getElementById('tz-result');
    const offsetEl = document.getElementById('tz-date-offset');

    const timezones = {
      'UTC (Coordinated Universal Time)': 0,
      'EST (Eastern Standard Time)': -5,
      'CST (Central Standard Time)': -6,
      'MST (Mountain Standard Time)': -7,
      'PST (Pacific Standard Time)': -8,
      'GMT (Greenwich Mean Time)': 0,
      'CET (Central European Time)': 1,
      'EET (Eastern European Time)': 2,
      'IST (Indian Standard Time)': 5.5,
      'JST (Japan Standard Time)': 9,
      'AEST (Australian Eastern Standard Time)': 10,
    };

    const populate = () => {
      const zones = Object.keys(timezones);
      zones.forEach(z => {
        fromEl.add(new Option(z, z));
        toEl.add(new Option(z, z));
      });
      fromEl.value = 'UTC (Coordinated Universal Time)';
      toEl.value = 'EST (Eastern Standard Time)';
    };

    const calculate = () => {
      const timeStr = timeEl.value;
      if (!timeStr) return;

      const [h, m] = timeStr.split(':').map(Number);
      
      const fromOffset = timezones[fromEl.value];
      const toOffset = timezones[toEl.value];
      
      let utcHours = h - fromOffset;
      let targetHours = utcHours + toOffset;
      
      let dayOffset = 0;
      if (targetHours >= 24) {
        targetHours -= 24;
        dayOffset = 1;
      } else if (targetHours < 0) {
        targetHours += 24;
        dayOffset = -1;
      }

      const resH = Math.floor(targetHours).toString().padStart(2, '0');
      let extraMins = (targetHours % 1) * 60;
      let resM = Math.round(m + extraMins);
      
      if (resM >= 60) {
        resM -= 60;
        let finalH = parseInt(resH) + 1;
        if (finalH >= 24) {
          finalH -= 24;
          if (dayOffset === 0) dayOffset = 1;
        }
        resEl.textContent = `${finalH.toString().padStart(2, '0')}:${resM.toString().padStart(2, '0')}`;
      } else {
        resEl.textContent = `${resH}:${resM.toString().padStart(2, '0')}`;
      }

      if (dayOffset === 1) offsetEl.textContent = 'Next Day';
      else if (dayOffset === -1) offsetEl.textContent = 'Previous Day';
      else offsetEl.textContent = 'Same Day';
    };

    populate();
    
    timeEl.addEventListener('input', calculate);
    fromEl.addEventListener('change', calculate);
    toEl.addEventListener('change', calculate);
    
    calculate();
  }
};
