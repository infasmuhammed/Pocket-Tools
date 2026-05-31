import { UI } from '../core/ui.js';

const money = (value) => '₹' + (Math.round((Number(value) || 0) * 100) / 100).toFixed(2);
const num = (el) => Math.max(0, Number.parseFloat(el.value) || 0);
const makeId = () => (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function' ? globalThis.crypto.randomUUID() : String(Date.now()) + '-' + String(Math.random()));

export default {
  init() {
    const amountEl = document.getElementById('bs-amount');
    const gstEl = document.getElementById('bs-gst');
    const cgstEl = document.getElementById('bs-cgst');
    const noteEl = document.getElementById('bs-note');
    const totalEl = document.getElementById('bs-total');
    const modeHelp = document.getElementById('bs-mode-help');
    const peopleList = document.getElementById('bs-people-list');
    const resultList = document.getElementById('bs-result-list');
    const includedEl = document.getElementById('bs-included');
    const taxPersonEl = document.getElementById('bs-tax-person');
    const balanceEl = document.getElementById('bs-balance');
    const statusEl = document.getElementById('bs-status');
    const addBtn = document.getElementById('bs-add-person');
    const copyBtn = document.getElementById('bs-copy');
    const modeBtns = Array.from(document.querySelectorAll('[data-mode]'));

    let mode = 'equal';
    let people = [
      { id: makeId(), name: 'You', active: true, shares: 1, percent: 0, amount: 0 },
      { id: makeId(), name: 'Friend 1', active: true, shares: 1, percent: 0, amount: 0 },
      { id: makeId(), name: 'Friend 2', active: true, shares: 1, percent: 0, amount: 0 },
    ];
    let latestLines = [];

    const helpText = () => {
      if (mode === 'shares') return 'Shares work like portions. Two shares pays twice the base amount of one share. GST and CGST stay equally split.';
      if (mode === 'percent') return 'Percent splits the base bill by percentage. Keep included people at 100% total. GST and CGST stay equally split.';
      if (mode === 'manual') return "Amount lets you type each person's base bill amount manually. GST and CGST stay equally split.";
      return "Equal divides the bill amount equally, then adds each person's equal tax share.";
    };

    const activePeople = () => people.filter((person) => person.active);

    const calculate = () => {
      const base = num(amountEl);
      const tax = num(gstEl) + num(cgstEl);
      const active = activePeople();
      const count = active.length || 1;
      const taxEach = active.length ? tax / count : 0;
      const totals = new Map();
      let baseAllocated = 0;
      let status = '';

      if (!active.length) {
        status = 'Turn on at least one person to create a split.';
      } else if (mode === 'shares') {
        const shareTotal = active.reduce((sum, person) => sum + Math.max(0, Number(person.shares) || 0), 0);
        if (!shareTotal) status = 'Add at least one share.';
        active.forEach((person) => {
          const basePart = shareTotal ? base * ((Number(person.shares) || 0) / shareTotal) : 0;
          baseAllocated += basePart;
          totals.set(person.id, basePart + taxEach);
        });
      } else if (mode === 'percent') {
        const percentTotal = active.reduce((sum, person) => sum + (Number(person.percent) || 0), 0);
        if (Math.abs(percentTotal - 100) > 0.01) status = 'Percent total is ' + percentTotal.toFixed(2) + '%. Adjust it to 100% for an exact split.';
        active.forEach((person) => {
          const basePart = base * ((Number(person.percent) || 0) / 100);
          baseAllocated += basePart;
          totals.set(person.id, basePart + taxEach);
        });
      } else if (mode === 'manual') {
        active.forEach((person) => {
          const basePart = Number(person.amount) || 0;
          baseAllocated += basePart;
          totals.set(person.id, basePart + taxEach);
        });
        const remaining = base - baseAllocated;
        if (Math.abs(remaining) > 0.01) status = 'Manual base amounts are off by ' + money(remaining) + '.';
      } else {
        active.forEach((person) => {
          const basePart = base / count;
          baseAllocated += basePart;
          totals.set(person.id, basePart + taxEach);
        });
      }

      const grandTotal = base + tax;
      const resultTotal = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
      const balance = active.length ? grandTotal - resultTotal : grandTotal;
      totalEl.textContent = money(grandTotal);
      includedEl.textContent = String(active.length);
      taxPersonEl.textContent = money(taxEach);
      balanceEl.textContent = money(balance);
      statusEl.textContent = status || 'Split is balanced. Copy the result and paste it into WhatsApp or any group chat.';
      statusEl.classList.toggle('status-warning', Boolean(status));

      people.forEach((person) => {
        const amount = totals.get(person.id) || 0;
        const totalNode = peopleList.querySelector(`[data-person-total="${person.id}"]`);
        if (totalNode) totalNode.textContent = person.active ? money(amount) : 'Off';
      });

      resultList.replaceChildren();
      latestLines = [];
      const title = noteEl.value.trim() ? 'Bill split for ' + noteEl.value.trim() : 'Bill split';
      latestLines.push(title);
      latestLines.push('Total: ' + money(grandTotal));
      if (tax) latestLines.push('GST + CGST: ' + money(tax));

      if (!active.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No people included yet.';
        resultList.appendChild(empty);
        return;
      }

      active.forEach((person) => {
        const amount = totals.get(person.id) || 0;
        const row = document.createElement('div');
        row.className = 'split-result-row';
        const name = document.createElement('strong');
        name.textContent = person.name || 'Unnamed';
        const detail = document.createElement('span');
        detail.textContent = 'Pays ' + money(amount) + ' including ' + money(taxEach) + ' tax share';
        row.append(name, detail);
        resultList.appendChild(row);
        latestLines.push((person.name || 'Unnamed') + ': ' + money(amount));
      });
    };

    const renderPeople = () => {
      peopleList.replaceChildren();
      people.forEach((person, index) => {
        const card = document.createElement('div');
        card.className = 'split-person-card' + (person.active ? '' : ' inactive');

        const top = document.createElement('div');
        top.className = 'split-person-main';

        const toggle = document.createElement('label');
        toggle.className = 'split-person-toggle';
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = person.active;
        check.onchange = () => {
          person.active = check.checked;
          renderPeople();
        };
        const toggleText = document.createElement('span');
        toggleText.textContent = 'Included';
        toggle.append(check, toggleText);

        const nameGroup = document.createElement('div');
        nameGroup.className = 'input-group split-person-name';
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Person ' + (index + 1);
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = person.name;
        nameInput.placeholder = 'Name';
        nameInput.oninput = () => {
          person.name = nameInput.value;
          calculate();
        };
        nameGroup.append(nameLabel, nameInput);

        const total = document.createElement('strong');
        total.className = 'split-person-total';
        total.dataset.personTotal = person.id;
        total.textContent = person.active ? '₹0.00' : 'Off';

        top.append(toggle, nameGroup, total);

        const controls = document.createElement('div');
        controls.className = 'split-person-controls';

        if (mode === 'shares') {
          const shareGroup = document.createElement('div');
          shareGroup.className = 'input-group';
          const label = document.createElement('label');
          label.textContent = 'Shares';
          const stepper = document.createElement('div');
          stepper.className = 'split-stepper';
          const minus = document.createElement('button');
          minus.className = 'btn btn-secondary';
          minus.type = 'button';
          minus.textContent = '-';
          minus.onclick = () => {
            person.shares = Math.max(0, (Number(person.shares) || 0) - 1);
            renderPeople();
          };
          const input = document.createElement('input');
          input.type = 'number';
          input.min = '0';
          input.step = '1';
          input.value = person.shares;
          input.oninput = () => {
            person.shares = Math.max(0, Number.parseFloat(input.value) || 0);
            calculate();
          };
          const plus = document.createElement('button');
          plus.className = 'btn btn-secondary';
          plus.type = 'button';
          plus.textContent = '+';
          plus.onclick = () => {
            person.shares = (Number(person.shares) || 0) + 1;
            renderPeople();
          };
          stepper.append(minus, input, plus);
          shareGroup.append(label, stepper);
          controls.append(shareGroup);
        } else if (mode === 'percent') {
          const valueGroup = document.createElement('div');
          valueGroup.className = 'input-group';
          const label = document.createElement('label');
          label.textContent = 'Percent';
          const input = document.createElement('input');
          input.type = 'number';
          input.min = '0';
          input.step = '0.01';
          input.value = person.percent;
          input.oninput = () => {
            person.percent = Math.max(0, Number.parseFloat(input.value) || 0);
            calculate();
          };
          valueGroup.append(label, input);
          controls.append(valueGroup);
        } else if (mode === 'manual') {
          const valueGroup = document.createElement('div');
          valueGroup.className = 'input-group';
          const label = document.createElement('label');
          label.textContent = 'Base Amount';
          const input = document.createElement('input');
          input.type = 'number';
          input.min = '0';
          input.step = '0.01';
          input.value = person.amount;
          input.oninput = () => {
            person.amount = Math.max(0, Number.parseFloat(input.value) || 0);
            calculate();
          };
          valueGroup.append(label, input);
          controls.append(valueGroup);
        }

        const actions = document.createElement('div');
        actions.className = 'split-person-actions';
        const remove = document.createElement('button');
        remove.className = 'btn btn-secondary';
        remove.type = 'button';
        remove.textContent = 'Remove';
        remove.onclick = () => {
          people = people.filter((item) => item.id !== person.id);
          renderPeople();
        };
        actions.append(remove);
        controls.append(actions);

        card.append(top, controls);
        peopleList.appendChild(card);
      });
      calculate();
    };

    modeBtns.forEach((button) => {
      button.onclick = () => {
        mode = button.dataset.mode;
        modeBtns.forEach((btn) => btn.classList.toggle('active', btn === button));
        if (mode === 'percent') {
          const active = activePeople();
          const even = active.length ? 100 / active.length : 0;
          people.forEach((person) => {
            if (person.active) person.percent = even;
          });
        }
        modeHelp.textContent = helpText();
        renderPeople();
      };
    });

    [amountEl, gstEl, cgstEl, noteEl].forEach((el) => el.addEventListener('input', calculate));

    addBtn.onclick = () => {
      people.push({ id: makeId(), name: 'Person ' + (people.length + 1), active: true, shares: 1, percent: 0, amount: 0 });
      renderPeople();
    };

    copyBtn.onclick = () => {
      if (!latestLines.length || !activePeople().length) return UI.showError('Nothing to copy yet.');
      return UI.copyText(latestLines.join('\n'), 'Split text copied.');
    };

    modeHelp.textContent = helpText();
    renderPeople();
  }
};
