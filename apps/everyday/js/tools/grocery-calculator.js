import { UI } from '../core/ui.js';

function money(value) {
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function quantity(value) {
  const number = Number(value);
  return Number.isInteger(number) ? String(number) : String(Number(number.toFixed(3)));
}

function unitLabel(qty, unit) {
  const value = Number(qty);
  if (unit === 'packet') return value === 1 ? 'packet' : 'packets';
  if (unit === 'piece') return value === 1 ? 'piece' : 'pieces';
  if (unit === 'box') return value === 1 ? 'box' : 'boxes';
  if (unit === 'bunch') return value === 1 ? 'bunch' : 'bunches';
  if (unit === 'litre') return value === 1 ? 'litre' : 'litres';
  return unit;
}

function priceInfo(unit) {
  if (unit === 'g') {
    return {
      factor: 1 / 1000,
      label: '/kg',
      placeholder: 'Price per kg',
      hint: 'For grams, enter the price for 1 kg. Example: 250 g at 20/kg = 5.00.',
    };
  }
  if (unit === 'kg') {
    return {
      factor: 1,
      label: '/kg',
      placeholder: 'Price per kg',
      hint: 'For kg or g, enter the price for 1 kg.',
    };
  }
  if (unit === 'ml') {
    return {
      factor: 1 / 1000,
      label: '/litre',
      placeholder: 'Price per litre',
      hint: 'For ml, enter the price for 1 litre. Example: 500 ml at 60/litre = 30.00.',
    };
  }
  if (unit === 'litre') {
    return {
      factor: 1,
      label: '/litre',
      placeholder: 'Price per litre',
      hint: 'For litre or ml, enter the price for 1 litre.',
    };
  }
  return {
    factor: 1,
    label: `/${unitLabel(1, unit)}`,
    placeholder: `Price per ${unitLabel(1, unit)}`,
    hint: `For ${unitLabel(2, unit)}, enter the price for 1 ${unitLabel(1, unit)}.`,
  };
}

function lineTotal(item) {
  return item.qty * item.price * priceInfo(item.unit).factor;
}

function lineDetail(item) {
  const info = priceInfo(item.unit);
  return `${quantity(item.qty)} ${unitLabel(item.qty, item.unit)} @ ${money(item.price)}${info.label}`;
}

export default {
  init() {
    const itemEl = document.getElementById('gc-item');
    const qtyEl = document.getElementById('gc-qty');
    const unitEl = document.getElementById('gc-unit');
    const priceEl = document.getElementById('gc-price');
    const priceHintEl = document.getElementById('gc-price-hint');
    const btnAdd = document.getElementById('gc-add');
    const btnClear = document.getElementById('gc-clear');
    const btnCopy = document.getElementById('gc-copy');
    const countEl = document.getElementById('gc-count');
    const totalEl = document.getElementById('gc-total');
    const listEl = document.getElementById('gc-list');

    let items = [];

    const updatePriceHelp = () => {
      const info = priceInfo(unitEl.value);
      priceEl.placeholder = info.placeholder;
      if (priceHintEl) priceHintEl.textContent = info.hint;
    };

    const render = () => {
      listEl.replaceChildren();
      let total = 0;

      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No grocery items added yet.';
        listEl.appendChild(empty);
      }

      items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'grocery-row';
        const amountValue = lineTotal(item);
        total += amountValue;

        const meta = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = item.name;
        const detail = document.createElement('span');
        detail.textContent = lineDetail(item);
        meta.append(name, detail);

        const amount = document.createElement('strong');
        amount.textContent = money(amountValue);

        const remove = document.createElement('button');
        remove.className = 'btn btn-secondary';
        remove.textContent = 'Remove';
        remove.onclick = () => {
          items.splice(index, 1);
          render();
        };

        row.append(meta, amount, remove);
        listEl.appendChild(row);
      });

      countEl.textContent = String(items.length);
      totalEl.textContent = money(total);
    };

    const add = () => {
      const name = itemEl.value.trim();
      const qty = Number(qtyEl.value);
      const unit = unitEl.value;
      const price = Number(priceEl.value);
      if (!name) return UI.showError('Enter an item name.');
      if (!Number.isFinite(qty) || qty <= 0) return UI.showError('Enter a valid quantity.');
      if (!Number.isFinite(price) || price < 0) return UI.showError('Enter a valid price.');

      items.push({ name, qty, unit, price });
      itemEl.value = '';
      qtyEl.value = '1';
      unitEl.value = 'kg';
      priceEl.value = '';
      updatePriceHelp();
      itemEl.focus();
      render();
    };

    btnAdd.onclick = add;
    btnClear.onclick = () => { items = []; render(); };
    btnCopy.onclick = () => {
      if (!items.length) return UI.showError('Add items first.');
      const lines = items.map((item) => `${item.name} - ${lineDetail(item)} = ${money(lineTotal(item))}`);
      lines.push(`Total: ${totalEl.textContent}`);
      return UI.copyText(lines.join('\n'), 'Grocery list copied.');
    };
    unitEl.addEventListener('change', updatePriceHelp);
    [itemEl, qtyEl, unitEl, priceEl].forEach((el) => {
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') add();
      });
    });

    updatePriceHelp();
    render();
  }
};
