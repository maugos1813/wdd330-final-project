const COUNTRIESNOW = 'https://countriesnow.space/api/v0.1';
const OPEN_ER      = 'https://open.er-api.com/v6/latest';
const BASE         = import.meta.env.BASE_URL ?? '/';

let _countriesCache = null;
let _colCache       = null;

async function loadCountries() {
  if (_countriesCache) return _countriesCache;
  const res = await fetch(
    `${COUNTRIESNOW}/countries/info?returns=name,currency,flag,unicodeFlag,capital,iso2,iso3,dialCode`
  );
  if (!res.ok) throw new Error(`CountriesNow failed (${res.status})`);
  const json = await res.json();
  if (json.error) throw new Error(json.msg ?? 'CountriesNow error');
  _countriesCache = json.data;
  return _countriesCache;
}

async function loadColData() {
  if (_colCache) return _colCache;
  const res = await fetch(`${BASE}cities-data.json`);
  if (!res.ok) throw new Error('Could not load cost-of-living data');
  _colCache = await res.json();
  return _colCache;
}

export async function searchCountries(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const all = await loadCountries();

  const matches = all.filter(c =>
    (c.name ?? '').toLowerCase().includes(q)
  );

  matches.sort((a, b) => {
    const aS = (a.name ?? '').toLowerCase().startsWith(q) ? 0 : 1;
    const bS = (b.name ?? '').toLowerCase().startsWith(q) ? 0 : 1;
    return aS - bS;
  });

  return matches.slice(0, 6).map(parseCountry);
}

export async function getCountryByCode(code) {
  const all = await loadCountries();
  const c = all.find(x => (x.iso2 ?? '').toUpperCase() === code.toUpperCase());
  if (!c) throw new Error(`Country not found: ${code}`);
  return parseCountry(c);
}

function parseCountry(c) {
  const currency       = c.currency ?? 'USD';
  const currencySymbol = c.currency ?? 'USD';

  return {
    cca2:          c.iso2 ?? '',
    name:          c.name ?? 'Unknown',
    officialName:  c.name ?? 'Unknown',
    capital:       c.capital ?? '—',
    region:        '—',
    subregion:     '—',
    population:    0,
    area:          0,
    languages:     '—',
    currency,
    currencyName:  currency,
    currencySymbol,
    flagSvg:       c.flag ?? '',
    flagPng:       c.flag ?? '',
    unicodeFlag:   c.unicodeFlag ?? '',
    borders:       [],
  };
}

export async function getColData(countryName) {
  const data = await loadColData();
  const match = data.find(
    d => d.country.toLowerCase() === countryName.toLowerCase()
  );
  return match ?? {
    country: countryName,
    col_index: 50,
    avg_salary_usd: 1500,
    categories: { housing: 600, food: 300, transport: 60, healthcare: 50, utilities: 80, entertainment: 100 },
  };
}

const CURRENCY_ALIAS = { CNH: 'CNY' };
function normalizeCurrency(code) { return CURRENCY_ALIAS[code] ?? code; }

export async function getExchangeRate(baseCurrency, targetCurrency) {
  const base   = normalizeCurrency(baseCurrency);
  const target = normalizeCurrency(targetCurrency);

  if (base === target) {
    return { result: 'success', base_code: baseCurrency, target_code: targetCurrency, conversion_rate: 1, time_last_update_utc: new Date().toUTCString() };
  }

  try {
    const res = await fetch(`${OPEN_ER}/${base}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.result !== 'success') throw new Error(data['error-type'] ?? 'Exchange API error');
    const rate = data.rates?.[target];
    if (!rate) throw new Error(`Rate not found for ${target}`);
    return {
      result: 'success',
      base_code: baseCurrency,
      target_code: targetCurrency,
      conversion_rate: rate,
      time_last_update_utc: data.time_last_update_utc ?? new Date().toUTCString(),
    };
  } catch (err) {
    console.warn('Exchange rate unavailable, using rate 1:', err.message);
    return {
      result: 'success',
      base_code: baseCurrency,
      target_code: targetCurrency,
      conversion_rate: 1,
      time_last_update_utc: new Date().toUTCString(),
      _mock: true,
    };
  }
}

export async function fetchComparisonData(countryA, countryB) {
  const [colA, colB, exchange] = await Promise.all([
    getColData(countryA.name),
    getColData(countryB.name),
    getExchangeRate(countryA.currency, countryB.currency),
  ]);
  return { countryA: { ...countryA, col: colA }, countryB: { ...countryB, col: colB }, exchange };
}
