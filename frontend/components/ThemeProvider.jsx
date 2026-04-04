'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { applyTheme, getInitialTheme, persistTheme } from '@/lib/theme';

const ThemeContext = createContext({
  theme: 'light',
  toggle: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // First load: system preference wins unless user already saved a choice
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  };

  const value = useMemo(() => ({ theme, toggle }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
