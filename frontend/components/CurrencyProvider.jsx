'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { CURRENCIES, getInitialCurrency, persistCurrency } from '@/lib/currency';

const CurrencyContext = createContext({
  currency: 'USD',
  setCurrency: () => {},
  options: CURRENCIES
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(getInitialCurrency());

  const setCurrency = (code) => {
    if (!CURRENCIES[code]) return;
    setCurrencyState(code);
    persistCurrency(code);
  };

  const value = useMemo(() => ({ currency, setCurrency, options: CURRENCIES }), [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
