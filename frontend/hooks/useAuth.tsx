'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useSyncedLocalStorageState } from '@/hooks/useSyncedLocalStorageState';

export type AuthUser = {
  name?: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (args: { email: string; password: string }) => { ok: true } | { ok: false; error: string };
  register: (args: { name: string; email: string; password: string }) => { ok: true } | { ok: false; error: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'novamart:auth_user';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useSyncedLocalStorageState<AuthUser | null>({
    key: STORAGE_KEY,
    initialValue: null,
    writeDebounceMs: 100
  });

  const logout = useCallback(() => setUser(null), [setUser]);

  const login = useCallback(
    ({ email, password }: { email: string; password: string }) => {
      const e = email.trim().toLowerCase();
      if (!isValidEmail(e)) return { ok: false as const, error: 'Enter a valid email.' };
      if (password.trim().length < 6) return { ok: false as const, error: 'Password must be at least 6 characters.' };
      setUser({ email: e });
      return { ok: true as const };
    },
    [setUser]
  );

  const register = useCallback(
    ({ name, email, password }: { name: string; email: string; password: string }) => {
      const n = name.trim();
      const e = email.trim().toLowerCase();
      if (n.length < 2) return { ok: false as const, error: 'Name is too short.' };
      if (!isValidEmail(e)) return { ok: false as const, error: 'Enter a valid email.' };
      if (password.trim().length < 6) return { ok: false as const, error: 'Password must be at least 6 characters.' };
      setUser({ name: n, email: e });
      return { ok: true as const };
    },
    [setUser]
  );

  const value = useMemo<AuthContextValue>(() => ({ user, login, register, logout }), [login, logout, register, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

