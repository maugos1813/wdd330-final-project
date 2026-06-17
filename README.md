# CityMatch — Currency & Cost of Living Comparator

**WDD 330 Final Project — Mauro Agostinelli**

A web app to compare the cost of living between two cities and display real-time exchange rates.

## Live site

> [GitHub Pages link — add after deployment]

## Features (W05)

- City search with live autocomplete (Teleport API)
- Exchange rate display (ExchangeRate-API)
- Cost of living comparison cards
- Quality of life scores with progress bars
- Salary calculator
- Currency converter
- Search history (localStorage)
- Shareable URL

## Setup

```bash
npm install
npm run dev
```

Add your ExchangeRate-API key in `src/api.js`:

```js
export const EXCHANGE_API_KEY = 'your_key_here';
```

Get a free key at [exchangerate-api.com](https://www.exchangerate-api.com) — no credit card needed.

## APIs used

- [ExchangeRate-API](https://www.exchangerate-api.com) — currency exchange rates
- [Teleport API](https://developers.teleport.org) — city data, cost of living, quality of life

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
