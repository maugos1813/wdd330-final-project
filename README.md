# CityMatch — Country & Currency Comparator

**WDD 330 Final Project — Mauro Agostinelli**

A web app to compare two countries side by side: real-time exchange rates, currency converter, and cost of living estimates.

## Live site

> [GitHub Pages link — add after deployment]

## Features

- Country search with live autocomplete (250+ countries)
- Real-time exchange rate display
- Side-by-side country cards with flag, capital and currency
- Salary equivalence calculator
- Currency converter
- Search history (localStorage)
- Shareable URL via query params

## Setup

```bash
npm install
npm run dev
```

No API keys required.

## APIs used

- [CountriesNow](https://countriesnow.space) — country data: name, capital, currency, flag
- [Open Exchange Rates](https://open.er-api.com) — real-time currency exchange rates (free tier, no key)

## Module structure

| File | Purpose |
|------|---------|
| `src/main.js` | App entry, event listeners, flow control |
| `src/api.js` | All fetch calls to external APIs |
| `src/ui.js` | DOM rendering functions |
| `src/calculator.js` | Salary and currency math |
| `src/storage.js` | localStorage read/write |
| `src/router.js` | URL parameters for shareable links |
| `src/styles.css` | All styles, responsive layout |
| `index.html` | HTML structure |
| `public/cities-data.json` | Static cost of living reference data |
