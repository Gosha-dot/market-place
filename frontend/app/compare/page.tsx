'use client';

import { useEffect, useState } from 'react';
import CompareTable from '@/components/CompareTable';
import { useCompare } from '@/hooks/useCompare';
import { fetchProducts } from '@/lib/api';
import type { Product } from '@/types/product';

export default function ComparePage() {
  const compare = useCompare();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!compare.ids.length) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetchProducts({ ids: compare.ids.join(',') });
        if (!mounted) return;
        setProducts(res.items);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [compare.ids]);

  if (!compare.ids.length) {
    return (
      <div className="space-y-4">
        <h1 className="section-title">Compare</h1>
        <div className="card p-6">
          <p className="text-sm text-ink-600 dark:text-mist-200">
            Add a few products to compare and they will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="section-title">Compare</h1>
        <button onClick={compare.clear} className="btn btn-ghost text-sm">
          Clear
        </button>
      </div>

      {loading ? (
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">Loading...</div>
      ) : (
        <CompareTable products={products} onRemove={compare.remove} />
      )}
    </div>
  );
}

