'use client';

import Hero from '@/components/Hero';
import FlashSale from '@/components/FlashSale';
import Categories from '@/components/Categories';
import ProductList from '@/components/ProductList';
import SkeletonProductGrid from '@/components/SkeletonProductGrid';
import { categories as mockCategories, mockProducts } from '@/lib/mockData';
import { useInfiniteProducts } from '@/lib/useInfiniteProducts';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useProductsByIds } from '@/hooks/useProductsByIds';
import { useAuth } from '@/hooks/useAuth';
import { apiRecommendations } from '@/lib/api';
import { useEffect, useState } from 'react';

const HOME_PRODUCTS_PAGE_SIZE = 24;
const HOME_DEFAULT_FILTERS = {};

export default function HomePage() {
  const auth = useAuth();
  const recentlyViewed = useRecentlyViewed();
  const recent = useProductsByIds(recentlyViewed.ids);
  const [recommended, setRecommended] = useState([]);

  const { items, hasMore, loading, error, loadMore } = useInfiniteProducts({
    filters: HOME_DEFAULT_FILTERS,
    pageSize: HOME_PRODUCTS_PAGE_SIZE
  });
  const products = items.length ? items : mockProducts.slice(0, HOME_PRODUCTS_PAGE_SIZE);
  const recentProducts = recentlyViewed.ids.map((id) => recent.byId.get(id)).filter(Boolean);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!auth.token) {
        setRecommended([]);
        return;
      }
      try {
        const res = await apiRecommendations(auth.token, 12);
        if (mounted) setRecommended(res.items || []);
      } catch {
        if (mounted) setRecommended([]);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [auth.token]);

  return (
    <div className="space-y-12">
      <Hero />

      {recentProducts.length ? (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="section-title">Recently viewed</h2>
            <button onClick={recentlyViewed.clear} className="btn btn-ghost text-xs">
              Clear
            </button>
          </div>
          <div className="mt-6">
            <ProductList products={recentProducts} />
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="section-title">Trending now</h2>
          <span className="text-sm text-ink-500 dark:text-mist-300">
            {error ? 'Mock data in use' : 'Updated hourly'}
          </span>
        </div>
        <div className="mt-6">
          {items.length === 0 && loading ? (
            <SkeletonProductGrid count={HOME_PRODUCTS_PAGE_SIZE} />
          ) : (
            <ProductList products={products} />
          )}
          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-ink-500 dark:text-mist-300">
            {loading && <span>Loading more deals...</span>}
            {!hasMore && <span>No more items to load.</span>}
          </div>
          <LoadMoreTrigger onLoadMore={loadMore} disabled={!hasMore || loading} />
        </div>
      </section>

      {recommended.length ? (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="section-title">For you</h2>
            <span className="text-sm text-ink-500 dark:text-mist-300">Based on your browsing</span>
          </div>
          <div className="mt-6">
            <ProductList products={recommended} />
          </div>
        </section>
      ) : null}

      <FlashSale products={(items.length ? items : mockProducts).slice(0, 3)} />
      <Categories items={mockCategories} />
    </div>
  );
}
