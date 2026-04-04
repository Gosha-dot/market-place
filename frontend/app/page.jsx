'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import FlashSale from '@/components/FlashSale';
import Categories from '@/components/Categories';
import ProductGrid from '@/components/ProductGrid';
import Filters from '@/components/Filters';
import { categories as mockCategories, mockProducts } from '@/lib/mockData';
import { loadCart, saveCart } from '@/lib/cart';
import { useInfiniteProducts } from '@/lib/useInfiniteProducts';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';

export default function HomePage() {
  const [filters, setFilters] = useState({ category: '', maxPrice: '', minRating: '' });
  const [cart, setCart] = useState([]);

  const { items, hasMore, loading, error, loadMore } = useInfiniteProducts({
    filters,
    pageSize: 6
  });

  const handleAdd = (product) => {
    const existing = cart.find((item) => item._id === product._id);
    const updated = existing
      ? cart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [...cart, { ...product, quantity: 1 }];
    setCart(updated);
    saveCart(updated);
  };

  useEffect(() => {
    setCart(loadCart());
  }, []);

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
        <div className="mt-4">
          <Filters filters={filters} onChange={setFilters} categories={mockCategories} />
        </div>
        <div className="mt-6">
          <ProductGrid products={items} onAdd={handleAdd} />
          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-ink-500 dark:text-mist-300">
            {loading && <span>Loading more deals...</span>}
            {!hasMore && <span>No more items to load.</span>}
          </div>
          <LoadMoreTrigger onLoadMore={loadMore} disabled={!hasMore || loading} />
        </div>
      </section>

      <FlashSale products={(items.length ? items : mockProducts).slice(0, 3)} onAdd={handleAdd} />
      <Categories items={mockCategories} />
    </div>
  );
}
