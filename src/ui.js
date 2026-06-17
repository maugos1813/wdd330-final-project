function fmt(n, decimals = 0) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPop(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderExchangeBanner(exchange, nameA, nameB) {
  const { base_code, target_code, conversion_rate, time_last_update_utc, _mock } = exchange;

  const display = document.getElementById('exchange-rate-display');
  const updated = document.getElementById('exchange-updated');

  if (_mock) {
    display.textContent = `1 ${base_code} → ${target_code}  (add API key for live rate)`;
  } else if (base_code === target_code) {
    display.textContent = `${nameA} and ${nameB} share the same currency (${base_code})`;
  } else {
    display.textContent = `1 ${base_code} = ${fmt(conversion_rate, 4)} ${target_code}`;
  }

  const date = time_last_update_utc
    ? new Date(time_last_update_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  updated.textContent = date ? `Updated ${date}` : '';
  document.getElementById('exchange-banner').hidden = false;
}

export function renderCountryCard(side, country) {
  document.getElementById(`city-${side}-name`).textContent = country.name;
  document.getElementById(`city-${side}-currency`).textContent =
    `${country.currency} · ${country.currencySymbol} · ${country.currencyName}`;

  const body = document.getElementById(`city-${side}-body`);
  body.innerHTML = '';

  if (country.flagSvg || country.flagPng) {
    const flagWrap = el('div', '');
    flagWrap.style.cssText = 'margin-bottom:16px;';
    const flag = document.createElement('img');
    flag.src = country.flagSvg || country.flagPng;
    flag.alt = `Flag of ${country.name}`;
    flag.style.cssText = 'width:80px; height:auto; border-radius:4px; border:1px solid var(--border); box-shadow:0 1px 4px rgba(0,0,0,0.1);';
    flagWrap.appendChild(flag);
    body.appendChild(flagWrap);
  }

  const facts = [
    { label: 'Capital',     value: country.capital },
    { label: 'Region',      value: `${country.region}${country.subregion ? ' · ' + country.subregion : ''}` },
    { label: 'Population',  value: fmtPop(country.population) },
    { label: 'Area',        value: country.area ? `${fmt(country.area)} km²` : '—' },
    { label: 'Languages',   value: country.languages || '—' },
  ];

  const factsTitle = el('p', 'section-title', 'Country info');
  factsTitle.style.marginBottom = '8px';
  body.appendChild(factsTitle);

  facts.forEach(({ label, value }) => {
    const row = document.createElement('div');
    row.className = 'cost-category';
    row.innerHTML = `<span class="cost-cat-name">${label}</span><span class="cost-cat-value" style="font-family:var(--font-body);font-size:0.85rem;">${value}</span>`;
    body.appendChild(row);
  });

  const div = document.createElement('div');
  div.style.cssText = 'border-top:1.5px solid var(--border); margin:18px 0 14px;';
  body.appendChild(div);

  const colTitle = el('p', 'section-title', 'Monthly costs (USD est.)');
  colTitle.style.marginBottom = '6px';
  body.appendChild(colTitle);

  const colSubtitle = el('p', '', `Cost of living index: ${country.col.col_index} / 100`);
  colSubtitle.style.cssText = 'font-size:0.78rem; color:var(--mid); margin-bottom:10px; font-family:var(--font-mono);';
  body.appendChild(colSubtitle);

  const categories = [
    { label: 'Housing / Rent',  key: 'housing' },
    { label: 'Food',            key: 'food' },
    { label: 'Transport',       key: 'transport' },
    { label: 'Healthcare',      key: 'healthcare' },
    { label: 'Utilities',       key: 'utilities' },
    { label: 'Entertainment',   key: 'entertainment' },
  ];

  categories.forEach(({ label, key }) => {
    const row = document.createElement('div');
    row.className = 'cost-category';
    row.innerHTML = `<span class="cost-cat-name">${label}</span><span class="cost-cat-value">$${fmt(country.col.categories[key])}</span>`;
    body.appendChild(row);
  });

  const salaryRow = el('p', '');
  salaryRow.style.cssText = 'margin-top:12px; font-family:var(--font-mono); font-size:0.82rem; color:var(--mid);';
  salaryRow.textContent = `Avg. monthly salary: ~$${fmt(country.col.avg_salary_usd)} USD`;
  body.appendChild(salaryRow);

  const raw = document.createElement('details');
  raw.className = 'raw-data-section';
  raw.style.marginTop = '18px';
  const summary = document.createElement('summary');
  summary.textContent = `▸ Raw API data for ${country.name}`;
  raw.appendChild(summary);
  const pre = document.createElement('pre');
  pre.className = 'raw-data-pre';
  pre.textContent = JSON.stringify(country, null, 2);
  raw.appendChild(pre);
  body.appendChild(raw);
}

export function initCalculator(countryA, countryB, exchange) {
  document.getElementById('calc-city-a-name').textContent = countryA.name;
  document.getElementById('calc-city-b-name').textContent = countryB.name;
  document.getElementById('calc-label-a').textContent = countryA.name;
  document.getElementById('calc-label-b').textContent = countryB.name;
  document.getElementById('calc-symbol-a').textContent = countryA.currencySymbol;
  document.getElementById('calc-symbol-b').textContent = countryB.currencySymbol;

  const rate     = exchange.conversion_rate ?? 1;
  const colRatio = countryB.col.col_index / countryA.col.col_index;
  const input    = document.getElementById('salary-input');
  const result   = document.getElementById('calc-result-value');

  input.value = '';
  result.textContent = '—';
  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    result.textContent = (!val || isNaN(val)) ? '—' : fmt(val * colRatio * rate, 0);
  });
}

export function initConverter(countryA, countryB, exchange) {
  const rate = exchange.conversion_rate ?? 1;
  document.getElementById('conv-label-a').textContent = countryA.currency;
  document.getElementById('conv-label-b').textContent = countryB.currency;
  document.getElementById('conv-symbol-a').textContent = countryA.currencySymbol;
  document.getElementById('conv-symbol-b').textContent = countryB.currencySymbol;

  const input  = document.getElementById('convert-amount');
  const result = document.getElementById('conv-result-value');
  input.value = '';
  result.textContent = '—';
  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    result.textContent = (!val || isNaN(val)) ? '—' : fmt(val * rate, 2);
  });
}

export function renderSuggestions(containerId, results, onSelect) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!results?.length) { container.classList.remove('open'); return; }
  results.forEach(country => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = `${country.name} (${country.capital})`;
    item.addEventListener('mousedown', e => { e.preventDefault(); onSelect(country); container.classList.remove('open'); });
    container.appendChild(item);
  });
  container.classList.add('open');
}

export function closeSuggestions(id) {
  document.getElementById(id)?.classList.remove('open');
}

export function showLoading(show) { document.getElementById('loading-state').hidden = !show; }
export function showResults(show) {
  document.getElementById('results-section').hidden = !show;
  document.getElementById('exchange-banner').hidden  = !show;
}
export function showError(msg) {
  const banner = document.getElementById('error-banner');
  const text   = document.getElementById('error-message');
  if (msg) { text.textContent = msg; banner.hidden = false; }
  else { banner.hidden = true; }
}
