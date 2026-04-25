'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSyncedLocalStorageState } from '@/hooks/useSyncedLocalStorageState';
import { apiLogin, apiMe, apiRegister, type ApiUser } from '@/lib/api';

export type AuthUser = {
  _id: string;
  name?: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (args: { email: string; password: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (args: {
    name: string;
    email: string;
    password: string;
    role?: 'seller';
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'novamart:auth_v1';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useSyncedLocalStorageState<{ token: string; user: ApiUser } | null>({
    key: STORAGE_KEY,
    initialValue: null,
    writeDebounceMs: 100
  });

  const [loading, setLoading] = useState(false);

  const user = (stored?.user as AuthUser | undefined) || null;
  const token = stored?.token || null;

  const logout = useCallback(() => setStored(null), [setStored]);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const e = email.trim().toLowerCase();
      if (!isValidEmail(e)) return { ok: false as const, error: 'Enter a valid email.' };
      if (password.trim().length < 6) return { ok: false as const, error: 'Password must be at least 6 characters.' };
      setLoading(true);
      try {
        const res = await apiLogin({ email: e, password });
        setStored({ token: res.token, user: res.user });
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : 'Login failed.' };
      } finally {
        setLoading(false);
      }
    },
    [setStored]
  );

  const register = useCallback(
    async ({ name, email, password, role }: { name: string; email: string; password: string; role?: 'seller' }) => {
      const n = name.trim();
      const e = email.trim().toLowerCase();
      if (n.length < 2) return { ok: false as const, error: 'Name is too short.' };
      if (!isValidEmail(e)) return { ok: false as const, error: 'Enter a valid email.' };
      if (password.trim().length < 6) return { ok: false as const, error: 'Password must be at least 6 characters.' };
      setLoading(true);
      try {
        const res = await apiRegister({ name: n, email: e, password, role });
        setStored({ token: res.token, user: res.user });
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : 'Registration failed.' };
      } finally {
        setLoading(false);
      }
    },
    [setStored]
  );

  // Best-effort session validation (e.g. if token expired).
  useEffect(() => {
    let mounted = true;
    async function validate() {
      if (!token) return;
      setLoading(true);
      try {
        const me = await apiMe(token);
        if (!mounted) return;
        setStored((prev) => (prev ? { ...prev, user: me.user } : prev));
      } catch {
        if (!mounted) return;
        setStored(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    validate();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout }),
    [loading, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

