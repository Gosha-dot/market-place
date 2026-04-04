import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchProductsPaged } from '@/lib/api';
import { mockProducts } from '@/lib/mockData';

export function useInfiniteProducts({ filters, pageSize = 6 }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const usingMockRef = useRef(false);

  const resetKey = useMemo(
    () => `${filters.category}|${filters.maxPrice}|${filters.minRating}`,
    [filters]
  );

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
          category: filters.category,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating
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
        const filtered = mockProducts.filter((product) => {
          const matchesCategory = !filters.category || product.category === filters.category;
          const matchesPrice = !filters.maxPrice || product.price <= Number(filters.maxPrice);
          const matchesRating = !filters.minRating || product.rating >= Number(filters.minRating);
          return matchesCategory && matchesPrice && matchesRating;
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
  }, [filters, hasMore, loading, page, pageSize]);

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
