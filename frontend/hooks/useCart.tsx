'use client';

import { createContext, useContext, useMemo } from 'react';
import type { CartItem } from '@/types/cart';
import type { ProductId } from '@/types/product';
import { useSyncedLocalStorageState } from '@/hooks/useSyncedLocalStorageState';

type CartContextValue = {
  items: CartItem[];
  getQuantity: (productId: ProductId) => number;
  add: (productId: ProductId, quantity?: number) => void;
  setQuantity: (productId: ProductId, quantity: number) => void;
  remove: (productId: ProductId) => void;
  clear: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'novamart:cart';

function clampAddQty(qty: number) {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.floor(qty));
}

function clampSetQty(qty: number) {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(0, Math.floor(qty));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useSyncedLocalStorageState<CartItem[]>({
    key: STORAGE_KEY,
    initialValue: [],
    writeDebounceMs: 150
  });

  const value = useMemo<CartContextValue>(() => {
    const normalized = items
      .filter((i) => i.productId && i.quantity > 0)
      .map((i) => ({ productId: i.productId, quantity: clampAddQty(i.quantity) }));

    const set = (next: CartItem[]) => setItems(next);

    const getQuantity = (productId: ProductId) =>
      normalized.find((i) => i.productId === productId)?.quantity ?? 0;

    const add = (productId: ProductId, quantity = 1) => {
      const addQty = clampAddQty(quantity);
      const current = getQuantity(productId);
      if (current === 0) set([...normalized, { productId, quantity: addQty }]);
      else set(normalized.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + addQty } : i)));
    };

    const setQuantity = (productId: ProductId, quantity: number) => {
      const nextQty = clampSetQty(quantity);
      if (nextQty <= 0) {
        set(normalized.filter((i) => i.productId !== productId));
        return;
      }
      if (getQuantity(productId) === 0) set([...normalized, { productId, quantity: nextQty }]);
      else set(normalized.map((i) => (i.productId === productId ? { ...i, quantity: nextQty } : i)));
    };

    const remove = (productId: ProductId) => set(normalized.filter((i) => i.productId !== productId));
    const clear = () => set([]);

    const totalItems = normalized.reduce((sum, i) => sum + i.quantity, 0);

    return { items: normalized, getQuantity, add, setQuantity, remove, clear, totalItems };
  }, [items, setItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
