// Util: formatar moeda BRL
const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Estado em localStorage
const KEY = 'expenses';
const read = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));

// Elementos
const form = document.getElementById('expense-form');
const elDesc = document.getElementById('desc');
const elCat = document.getElementById('category');
const elAmount = document.getElementById('amount');
const elDate = document.getElementById('date');
const list = document.getElementById('expense-list');
const empty = document.getElementById('empty-state');
const totalMonth = document.getElementById('total-month');
const catSummary = document.getElementById('category-summary');
const monthLabel = document.getElementById('month-label');

// Definir data padrão hoje
const today = new Date().toISOString().slice(0,10);
elDate.value = today;

// Mês atual (YYYY-MM)
const currentMonth = new Date().toISOString().slice(0,7);
monthLabel.textContent = `(${currentMonth})`;

// Render
function render() {
  const all = read();
  const monthItems = all.filter(e => (e.date || '').slice(0,7) === currentMonth);

  // Lista
  list.innerHTML = '';
  if (monthItems.length === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    monthItems
      .sort((a,b) => (a.date > b.date ? -1 : 1))
      .forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${e.date}</td>
          <td>${e.description}</td>
          <td>${e.category}</td>
          <td>${fmt(Number(e.amount||0))}</td>
          <td><button class="action" data-id="${e.id}">Excluir</button></td>
        `;
        list.appendChild(tr);
      });
  }

  // Total do mês
  const total = monthItems.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  totalMonth.textContent = fmt(total);

  // Resumo por categoria
  const byCat = monthItems.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
    return acc;
  }, {});
  catSummary.innerHTML = '';
  Object.entries(byCat).sort((a,b)=> b[1]-a[1]).forEach(([cat, sum]) => {
    const li = document.createElement('li');
    li.textContent = `${cat}: ${fmt(sum)}`;
    catSummary.appendChild(li);
  });
}

// Eventos
form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const description = elDesc.value.trim();
  const category = elCat.value;
  const amount = parseFloat(elAmount.value);
  const date = elDate.value;

  if (!description || !category || isNaN(amount) || !date) {
    alert('Preencha todos os campos corretamente.'); return;
  }
  if (amount <= 0) { alert('O valor deve ser maior que zero.'); return; }

  const item = { id: crypto.randomUUID(), description, category, amount, date };
  const next = [...read(), item];
  write(next);

  form.reset();
  elDate.value = today; // mantém data
  render();
});

list.addEventListener('click', (ev) => {
  if (ev.target.matches('button.action')) {
    const id = ev.target.getAttribute('data-id');
    const pruned = read().filter(e => e.id !== id);
    write(pruned);
    render();
  }
});

// Inicializa
render();
