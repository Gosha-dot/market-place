'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchProductsPaged } from '@/lib/api';
import { mockProducts } from '@/lib/mockData';
import type { Product, ProductFilters, ProductSort } from '@/types/product';

export function useInfiniteProducts({
  filters,
  sort = 'newest',
  pageSize = 12
}: {
  filters: ProductFilters;
  sort?: ProductSort;
  pageSize?: number;
}) {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usingMockRef = useRef(false);

  const resetKey = useMemo(() => JSON.stringify({ filters, sort, pageSize }), [filters, sort, pageSize]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    usingMockRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!hasMore || loading) return;
      setLoading(true);

      try {
        const data = await fetchProductsPaged({
          page,
          limit: pageSize,
          q: filters.q,
          category: filters.category,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          brand: filters.brand,
          hasDiscount: filters.hasDiscount,
          discountPercent: filters.discountPercent,
          inStock: filters.inStock,
          sort
        });

        if (!isMounted) return;
        const newItems = data.items || [];
        setItems((prev) => [...prev, ...newItems]);
        const total = data.total ?? newItems.length;
        const loaded = (page - 1) * pageSize + newItems.length;
        setHasMore(loaded < total);
      } catch (err) {
        if (!isMounted) return;
        usingMockRef.current = true;

        const q = filters.q?.trim().toLowerCase();
        const qWords = q ? q.split(/\s+/).filter(Boolean) : [];

        const filtered = (mockProducts as unknown as Product[])
          .filter((p) => {
            if (qWords.length) {
              const haystack = `${p.title} ${p.brand} ${p.category} ${p.description ?? ''}`.toLowerCase();
              for (const word of qWords) {
                if (!haystack.includes(word)) return false;
              }
            }
            if (filters.category && p.category !== filters.category) return false;
            if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
            if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
            if (filters.minRating !== undefined && p.rating < filters.minRating) return false;
            if (filters.brand?.length && !filters.brand.includes(p.brand)) return false;
            if (filters.hasDiscount === true && p.discountPercent <= 0) return false;
            if (filters.discountPercent !== undefined && p.discountPercent < filters.discountPercent) return false;
            if (filters.inStock === true && p.stockLeft <= 0) return false;
            if (filters.inStock === false && p.stockLeft > 0) return false;
            return true;
          })
          .sort((a, b) => {
            if (sort === 'price_asc') return a.price - b.price;
            if (sort === 'price_desc') return b.price - a.price;
            if (sort === 'rating_desc') return b.rating - a.rating;
            if (sort === 'name_asc') return a.title.localeCompare(b.title);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

        const start = (page - 1) * pageSize;
        const slice = filtered.slice(start, start + pageSize);
        setItems((prev) => [...prev, ...slice]);
        setHasMore(start + slice.length < filtered.length);
        setError('Using mock data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [filters, hasMore, loading, page, pageSize, sort]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    setPage((prev) => prev + 1);
  };

  return {
    items,
    page,
    hasMore,
    loading,
    error,
    loadMore,
    usingMock: usingMockRef.current
  };
}
