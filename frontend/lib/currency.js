export const CURRENCIES = {
  USD: { symbol: '$', rate: 1, locale: 'en-US', label: 'USD' },
  EUR: { symbol: '€', rate: 0.92, locale: 'de-DE', label: 'EUR' },
  UAH: { symbol: '₴', rate: 41.0, locale: 'uk-UA', label: 'UAH' }
};

export const CURRENCY_KEY = 'marketplace-currency';

export function getInitialCurrency() {
  if (typeof window === 'undefined') return 'USD';
  const stored = window.localStorage.getItem(CURRENCY_KEY);
  if (stored && CURRENCIES[stored]) return stored;
  return 'USD';
}

export function formatCurrency(amount, currencyCode) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const value = amount * currency.rate;
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.label,
    maximumFractionDigits: 2
  }).format(value);
}

export function persistCurrency(code) {
  window.localStorage.setItem(CURRENCY_KEY, code);
}
