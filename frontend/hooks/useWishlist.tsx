'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ProductId } from '@/types/product';
import { useSyncedLocalStorageState } from '@/hooks/useSyncedLocalStorageState';

type WishlistContextValue = {
  ids: ProductId[];
  has: (id: ProductId) => boolean;
  add: (id: ProductId) => void;
  remove: (id: ProductId) => void;
  toggle: (id: ProductId) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = 'novamart:wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useSyncedLocalStorageState<ProductId[]>({
    key: STORAGE_KEY,
    initialValue: [],
    writeDebounceMs: 150
  });

  const value = useMemo<WishlistContextValue>(() => {
    const normalized = Array.from(new Set(ids));
    const set = (next: ProductId[]) => setIds(Array.from(new Set(next)));

    return {
      ids: normalized,
      has: (id) => normalized.includes(id),
      add: (id) => set(normalized.includes(id) ? normalized : [...normalized, id]),
      remove: (id) => set(normalized.filter((x) => x !== id)),
      toggle: (id) => set(normalized.includes(id) ? normalized.filter((x) => x !== id) : [...normalized, id]),
      clear: () => set([])
    };
  }, [ids, setIds]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

