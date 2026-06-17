const KEY = 'citymatch_history';
const MAX = 5;

export function saveSearch(countryA, countryB) {
  const history = getHistory();
  const entry = {
    cca2A: countryA.cca2, nameA: countryA.name, currencyA: countryA.currency,
    symA: countryA.currencySymbol, colA: countryA.col?.col_index ?? 50,
    cca2B: countryB.cca2, nameB: countryB.name, currencyB: countryB.currency,
    symB: countryB.currencySymbol, colB: countryB.col?.col_index ?? 50,
    ts: Date.now(),
  };
  const deduped = history.filter(h => !(h.cca2A === entry.cca2A && h.cca2B === entry.cca2B));
  localStorage.setItem(KEY, JSON.stringify([entry, ...deduped].slice(0, MAX)));
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}

export function clearHistory() { localStorage.removeItem(KEY); }
