'use client';

import { useCurrency } from '@/components/CurrencyProvider';

export default function CurrencyToggle() {
  const { currency, setCurrency, options } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="rounded-full border border-mist-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 dark:border-ink-700 dark:bg-ink-800 dark:text-mist-100"
      aria-label="Select currency"
    >
      {Object.keys(options).map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
      ))}
    </select>
  );
}
