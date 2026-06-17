import { searchCountries, fetchComparisonData } from './api.js';
import {
  renderCountryCard, renderExchangeBanner,
  initCalculator, initConverter,
  renderSuggestions, closeSuggestions,
  showLoading, showResults, showError,
} from './ui.js';
import { saveSearch, getHistory } from './storage.js';
import { buildShareUrl, updateUrl, readUrlParams } from './router.js';

const state = { countryA: null, countryB: null };

const inputA         = document.getElementById('city-a-input');
const inputB         = document.getElementById('city-b-input');
const compareBtn     = document.getElementById('compare-btn');
const swapBtn        = document.getElementById('swap-btn');
const shareCopyBtn   = document.getElementById('share-copy-btn');
const shareLinkInput = document.getElementById('share-link-input');
const historyPills   = document.getElementById('history-pills');

inputA.placeholder = 'e.g. Italy';
inputB.placeholder = 'e.g. Japan';

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

async function handleSearch(side, query) {
  const sugId = `city-${side}-suggestions`;
  if (!query || query.trim().length < 2) { closeSuggestions(sugId); return; }
  try {
    const results = await searchCountries(query);
    renderSuggestions(sugId, results, country => {
      if (side === 'a') { state.countryA = country; inputA.value = country.name; }
      else              { state.countryB = country; inputB.value = country.name; }
    });
  } catch (err) {
    console.error('Search error:', err);
    closeSuggestions(sugId);
  }
}

const debouncedA = debounce(q => handleSearch('a', q), 250);
const debouncedB = debounce(q => handleSearch('b', q), 250);

inputA.addEventListener('input', e => { state.countryA = null; debouncedA(e.target.value); });
inputB.addEventListener('input', e => { state.countryB = null; debouncedB(e.target.value); });
inputA.addEventListener('blur', () => setTimeout(() => closeSuggestions('city-a-suggestions'), 150));
inputB.addEventListener('blur', () => setTimeout(() => closeSuggestions('city-b-suggestions'), 150));

swapBtn.addEventListener('click', () => {
  [state.countryA, state.countryB] = [state.countryB, state.countryA];
  inputA.value = state.countryA?.name ?? '';
  inputB.value = state.countryB?.name ?? '';
});

compareBtn.addEventListener('click', runComparison);

async function runComparison() {
  showError(null);
  if (!state.countryA || !state.countryB) {
    showError('Please select both countries from the dropdown list.');
    return;
  }
  if (state.countryA.cca2 === state.countryB.cca2) {
    showError('Please select two different countries.');
    return;
  }

  showResults(false);
  showLoading(true);
  compareBtn.disabled = true;

  try {
    const data = await fetchComparisonData(state.countryA, state.countryB);

    renderExchangeBanner(data.exchange, data.countryA.name, data.countryB.name);
    renderCountryCard('a', data.countryA);
    renderCountryCard('b', data.countryB);
    initCalculator(data.countryA, data.countryB, data.exchange);
    initConverter(data.countryA, data.countryB, data.exchange);

    const url = buildShareUrl(state.countryA, state.countryB);
    shareLinkInput.value = url;
    updateUrl(state.countryA, state.countryB);

    saveSearch(state.countryA, state.countryB);
    renderHistory();
    showResults(true);
  } catch (err) {
    console.error('Comparison error:', err);
    showError(`Could not load data: ${err.message}`);
  } finally {
    showLoading(false);
    compareBtn.disabled = false;
  }
}

function renderHistory() {
  const history = getHistory();
  historyPills.innerHTML = '';
  history.forEach(entry => {
    const pill = document.createElement('button');
    pill.className = 'history-pill';
    pill.textContent = `${entry.nameA} ↔ ${entry.nameB}`;
    pill.addEventListener('click', () => {
      state.countryA = { cca2: entry.cca2A, name: entry.nameA, currency: entry.currencyA, currencySymbol: entry.symA, col: { col_index: entry.colA } };
      state.countryB = { cca2: entry.cca2B, name: entry.nameB, currency: entry.currencyB, currencySymbol: entry.symB, col: { col_index: entry.colB } };
      inputA.value = entry.nameA;
      inputB.value = entry.nameB;
      runComparison();
    });
    historyPills.appendChild(pill);
  });
}

shareCopyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(shareLinkInput.value).then(() => {
    shareCopyBtn.textContent = 'Copied!';
    shareCopyBtn.classList.add('copied');
    setTimeout(() => { shareCopyBtn.textContent = 'Copy link'; shareCopyBtn.classList.remove('copied'); }, 2000);
  });
});

function init() {
  document.querySelector('label[for="city-a-input"]').textContent = 'Home country';
  document.querySelector('label[for="city-b-input"]').textContent = 'Destination country';

  renderHistory();

  const params = readUrlParams();
  if (params) {
    inputA.value = params.nameA;
    inputB.value = params.nameB;
  }
}

init();
