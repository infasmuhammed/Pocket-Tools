import { UI } from '../core/ui.js';

function money(value) {
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function unitLabel(qty, unit) {
  const value = Number(qty);
  if (unit === 'packet') return value === 1 ? 'packet' : 'packets';
  if (unit === 'piece') return value === 1 ? 'piece' : 'pieces';
  if (unit === 'box') return value === 1 ? 'box' : 'boxes';
  if (unit === 'bunch') return value === 1 ? 'bunch' : 'bunches';
  return unit;
}

export default {
  init() {
    const itemEl = document.getElementById('gc-item');
    const qtyEl = document.getElementById('gc-qty');
    const unitEl = document.getElementById('gc-unit');
    const priceEl = document.getElementById('gc-price');
    const btnAdd = document.getElementById('gc-add');
    const btnClear = document.getElementById('gc-clear');
    const btnCopy = document.getElementById('gc-copy');
    const countEl = document.getElementById('gc-count');
    const totalEl = document.getElementById('gc-total');
    const listEl = document.getElementById('gc-list');

    let items = [];

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
        const lineTotal = item.qty * item.price;
        total += lineTotal;

        const meta = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = item.name;
        const detail = document.createElement('span');
        detail.textContent = `${item.qty} ${unitLabel(item.qty, item.unit)} x ${money(item.price)}`;
        meta.append(name, detail);

        const amount = document.createElement('strong');
        amount.textContent = money(lineTotal);

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
      itemEl.focus();
      render();
    };

    btnAdd.onclick = add;
    btnClear.onclick = () => { items = []; render(); };
    btnCopy.onclick = () => {
      if (!items.length) return UI.showError('Add items first.');
      const lines = items.map((item) => `${item.name} - ${item.qty} ${unitLabel(item.qty, item.unit)} x ${money(item.price)} = ${money(item.qty * item.price)}`);
      lines.push(`Total: ${totalEl.textContent}`);
      return UI.copyText(lines.join('\n'), 'Grocery list copied.');
    };
    [itemEl, qtyEl, unitEl, priceEl].forEach((el) => {
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') add();
      });
    });

    render();
  }
};
