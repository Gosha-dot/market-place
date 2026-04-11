'use client';

import ProductGrid from '@/components/ProductGrid';
import { useWishlist } from '@/hooks/useWishlist';
import { useProductsByIds } from '@/hooks/useProductsByIds';

export default function WishlistPage() {
  const wishlist = useWishlist();
  const { items, loading } = useProductsByIds(wishlist.ids);

  if (!wishlist.ids.length) {
    return (
      <div className="space-y-4">
        <h1 className="section-title">Wishlist</h1>
        <div className="card p-6">
          <p className="text-sm text-ink-600 dark:text-mist-200">
            Your wishlist is empty. Tap “Wishlist” on a product to save it for later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="section-title">Wishlist</h1>
        <button onClick={wishlist.clear} className="btn btn-ghost text-sm">
          Clear
        </button>
      </div>
      {loading ? (
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">Loading...</div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}

