export function readUrlParams() {
  const p = new URLSearchParams(window.location.search);
  const nameA = p.get('a'), nameB = p.get('b');
  if (nameA && nameB) return { nameA, nameB };
  return null;
}

export function buildShareUrl(countryA, countryB) {
  const p = new URLSearchParams({ a: countryA.name, ca: countryA.cca2, b: countryB.name, cb: countryB.cca2 });
  return `${window.location.origin}${window.location.pathname}?${p}`;
}

export function updateUrl(countryA, countryB) {
  window.history.pushState({}, '', buildShareUrl(countryA, countryB));
}
