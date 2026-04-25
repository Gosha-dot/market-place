'use client';

import { useEffect, useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import ProductList from '@/components/ProductList';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import { useProductFilters } from '@/hooks/useProductFilters';
import { fetchBrands, fetchCategories } from '@/lib/api';
import { useInfiniteProducts } from '@/lib/useInfiniteProducts';
import type { ProductFilters } from '@/types/product';

export default function ProductsClient() {
  const { filters, sort, setFilters, setSort, reset, isPending } = useProductFilters();
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

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

    fetchCategories()
      .then((data) => {
        if (mounted) setCategories(data);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('products_layout');
      if (saved === 'grid' || saved === 'list') setLayout(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('products_layout', layout);
    } catch {
      // ignore
    }
  }, [layout]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="section-title">Products</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-mist-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-800">
            <button
              type="button"
              onClick={() => setLayout('grid')}
              className={`btn px-3 py-1 text-sm ${layout === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setLayout('list')}
              className={`btn px-3 py-1 text-sm ${layout === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            >
              List
            </button>
          </div>
          <span className="text-sm text-ink-500 dark:text-mist-300">{error ? 'Mock data in use' : 'Live filters'}</span>
        </div>
      </div>

      <FilterPanel
        filters={filters as ProductFilters}
        sort={sort}
        brands={brands}
        categories={categories}
        onChangeFilters={setFilters}
        onChangeSort={setSort}
        onReset={reset}
        disabled={isPending}
      />

      <div className="space-y-4">
        <ProductList products={items} layout={layout} />
        <div className="flex flex-col items-center gap-2 text-sm text-ink-500 dark:text-mist-300">
          {loading && <span>Loading...</span>}
          {!hasMore && <span>No more items.</span>}
        </div>
        <LoadMoreTrigger onLoadMore={loadMore} disabled={!hasMore || loading} />
      </div>
    </div>
  );
}

