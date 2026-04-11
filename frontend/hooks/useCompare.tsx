'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ProductId } from '@/types/product';
import { useSyncedLocalStorageState } from '@/hooks/useSyncedLocalStorageState';

type CompareContextValue = {
  ids: ProductId[];
  has: (id: ProductId) => boolean;
  add: (id: ProductId) => void;
  remove: (id: ProductId) => void;
  toggle: (id: ProductId) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

const STORAGE_KEY = 'novamart:compare';
const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useSyncedLocalStorageState<ProductId[]>({
    key: STORAGE_KEY,
    initialValue: [],
    writeDebounceMs: 150
  });

  const value = useMemo<CompareContextValue>(() => {
    const normalized = Array.from(new Set(ids)).slice(0, MAX_COMPARE);

    const set = (next: ProductId[]) => setIds(Array.from(new Set(next)).slice(0, MAX_COMPARE));

    return {
      ids: normalized,
      has: (id) => normalized.includes(id),
      add: (id) => set(normalized.includes(id) ? normalized : [...normalized, id]),
      remove: (id) => set(normalized.filter((x) => x !== id)),
      toggle: (id) => set(normalized.includes(id) ? normalized.filter((x) => x !== id) : [...normalized, id]),
      clear: () => set([])
    };
  }, [ids, setIds]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}

