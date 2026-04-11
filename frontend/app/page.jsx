'use client';

import Hero from '@/components/Hero';
import FlashSale from '@/components/FlashSale';
import Categories from '@/components/Categories';
import ProductGrid from '@/components/ProductGrid';
import SkeletonProductGrid from '@/components/SkeletonProductGrid';
import { categories as mockCategories, mockProducts } from '@/lib/mockData';
import { useInfiniteProducts } from '@/lib/useInfiniteProducts';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';

const HOME_PRODUCTS_PAGE_SIZE = 24;
const HOME_DEFAULT_FILTERS = {};

export default function HomePage() {
  const { items, hasMore, loading, error, loadMore } = useInfiniteProducts({
    filters: HOME_DEFAULT_FILTERS,
    pageSize: HOME_PRODUCTS_PAGE_SIZE
  });
  const products = items.length ? items : mockProducts.slice(0, HOME_PRODUCTS_PAGE_SIZE);

  return (
    <div className="space-y-12">
      <Hero />

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
            <ProductGrid products={products} />
          )}
          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-ink-500 dark:text-mist-300">
            {loading && <span>Loading more deals...</span>}
            {!hasMore && <span>No more items to load.</span>}
          </div>
          <LoadMoreTrigger onLoadMore={loadMore} disabled={!hasMore || loading} />
        </div>
      </section>

      <FlashSale products={(items.length ? items : mockProducts).slice(0, 3)} />
      <Categories items={mockCategories} />
    </div>
  );
}
