'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '@/lib/api';
import { mockProducts } from '@/lib/mockData';
import type { Product, ProductId } from '@/types/product';

export function useProductsByIds(ids: ProductId[]) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const idsKey = useMemo(() => ids.slice().sort().join(','), [ids]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!idsKey) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetchProducts({ ids: idsKey });
        if (!mounted) return;
        setItems(res.items);
      } catch {
        if (!mounted) return;
        const fromMock = (mockProducts as unknown as Product[]).filter((p) => ids.includes(p._id));
        setItems(fromMock);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [idsKey]);

  const byId = useMemo(() => new Map(items.map((p) => [p._id, p])), [items]);

  return { items, byId, loading };
}

