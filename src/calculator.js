export function equivalentSalary(salaryA, colIndexA, colIndexB, exchangeRate) {
  if (!salaryA || !colIndexA || colIndexA === 0) return 0;
  return salaryA * (colIndexB / colIndexA) * exchangeRate;
}

export function convertCurrency(amount, exchangeRate) {
  if (!amount || !exchangeRate) return 0;
  return amount * exchangeRate;
}

export function extractColIndex(scoresData) {
  const categories = scoresData?.categories ?? [];
  const colCat = categories.find(
    (c) => c.name?.toLowerCase().includes('cost of living')
  );
  if (!colCat) return 50;
  const raw = colCat.score_out_of_10 ?? 5;
  return Math.round((1 - raw / 10) * 100);
}

export function formatMoney(value, currencyCode = 'USD') {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}
