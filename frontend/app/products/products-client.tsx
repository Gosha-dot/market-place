'use client';

import { useEffect, useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import ProductGrid from '@/components/ProductGrid';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import { useProductFilters } from '@/hooks/useProductFilters';
import { fetchBrands } from '@/lib/api';
import { useInfiniteProducts } from '@/lib/useInfiniteProducts';
import type { ProductFilters } from '@/types/product';

export default function ProductsClient() {
  const { filters, sort, setFilters, setSort, reset, isPending } = useProductFilters();
  const [brands, setBrands] = useState<string[]>([]);

  const { items, hasMore, loading, error, loadMore } = useInfiniteProducts({
    filters,
    sort,
    pageSize: 12
  });

  useEffect(() => {
    let mounted = true;
    fetchBrands()
      .then((data) => {
        if (mounted) setBrands(data);
      })
      .catch(() => {
        if (mounted) setBrands([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="section-title">Products</h1>
        <span className="text-sm text-ink-500 dark:text-mist-300">
          {error ? 'Mock data in use' : 'Live filters'}
        </span>
      </div>

      <FilterPanel
        filters={filters as ProductFilters}
        sort={sort}
        brands={brands}
        onChangeFilters={setFilters}
        onChangeSort={setSort}
        onReset={reset}
        disabled={isPending}
      />

      <div className="space-y-4">
        <ProductGrid products={items} />
        <div className="flex flex-col items-center gap-2 text-sm text-ink-500 dark:text-mist-300">
          {loading && <span>Loading...</span>}
          {!hasMore && <span>No more items.</span>}
        </div>
        <LoadMoreTrigger onLoadMore={loadMore} disabled={!hasMore || loading} />
      </div>
    </div>
  );
}

