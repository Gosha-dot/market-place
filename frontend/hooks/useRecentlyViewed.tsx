'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ProductId } from '@/types/product';
import { useSyncedLocalStorageState } from '@/hooks/useSyncedLocalStorageState';

type RecentlyViewedContextValue = {
  ids: ProductId[];
  add: (id: ProductId) => void;
  clear: () => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

const STORAGE_KEY = 'novamart:recently_viewed';
const MAX_ITEMS = 12;

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useSyncedLocalStorageState<ProductId[]>({
    key: STORAGE_KEY,
    initialValue: [],
    writeDebounceMs: 150
  });

  const normalized = useMemo(() => Array.from(new Set(ids.filter(Boolean))).slice(0, MAX_ITEMS), [ids]);

  const add = useCallback(
    (id: ProductId) => {
      setIds((prev) => {
        const next = [id, ...prev.filter((x) => x !== id)];
        return next.slice(0, MAX_ITEMS);
      });
    },
    [setIds]
  );

  const clear = useCallback(() => setIds([]), [setIds]);

  const value = useMemo<RecentlyViewedContextValue>(() => ({ ids: normalized, add, clear }), [add, clear, normalized]);

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  return ctx;
}
