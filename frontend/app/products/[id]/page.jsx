'use client';

import { useEffect, useState } from 'react';
import { fetchProduct } from '@/lib/api';
import { mockProducts } from '@/lib/mockData';
import Rating from '@/components/ui/Rating';
import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCompare } from '@/hooks/useCompare';

const mockReviews = [
  { name: 'Ava', rating: 5, text: 'Exceeded expectations. Shipping was fast.' },
  { name: 'Milo', rating: 4.5, text: 'Great value for the price.' },
  { name: 'Zoe', rating: 4, text: 'Solid quality, would buy again.' }
];

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null);
  const { currency } = useCurrency();
  const cart = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProduct(params.id);
        setProduct(data);
      } catch {
        setProduct(mockProducts.find((item) => item._id === params.id) || mockProducts[0]);
      }
    }
    load();
  }, [params.id]);

  if (!product) return <div>Loading...</div>;

  const discounted = product.price * (1 - product.discountPercent / 100);
  const inWishlist = wishlist.has(product._id);
  const inCompare = compare.has(product._id);
  const outOfStock = product.stockLeft <= 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <img src={product.images?.[0]} alt={product.title} className="w-full rounded-3xl" />
        <div className="grid grid-cols-3 gap-3">
          {product.images?.map((img) => (
            <img key={img} src={img} alt="" className="h-24 w-full rounded-2xl object-cover" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h1 className="font-display text-3xl">{product.title}</h1>
        <Rating value={product.rating} />
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-ink-900 dark:text-white">
            {formatCurrency(discounted, currency)}
          </span>
          <span className="text-sm text-ink-500 line-through dark:text-mist-300">
            {formatCurrency(product.price, currency)}
          </span>
        </div>
        <p className="text-sm text-ink-600 dark:text-mist-200">
          {product.description || 'Premium curated product from our best-rated sellers.'}
        </p>

        <div className="card p-4">
          <p className="text-xs text-ink-500 dark:text-mist-300">Seller</p>
          <p className="font-semibold">{product.seller?.name}</p>
          <p className="text-xs text-ink-500 dark:text-mist-300">Rating {product.seller?.rating}</p>
        </div>

        <button
          className="btn btn-primary w-full"
          disabled={outOfStock}
          onClick={() => cart.add(product._id, 1)}
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-ghost w-full" onClick={() => wishlist.toggle(product._id)}>
            {inWishlist ? 'Wishlisted' : 'Add to wishlist'}
          </button>
          <button className="btn btn-ghost w-full" onClick={() => compare.toggle(product._id)}>
            {inCompare ? 'In compare' : 'Compare'}
          </button>
        </div>

        <div className="pt-4">
          <h2 className="section-title">Reviews</h2>
          <div className="mt-4 space-y-3">
            {mockReviews.map((review) => (
              <div key={review.name} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{review.name}</span>
                  <Rating value={review.rating} />
                </div>
                <p className="mt-2 text-sm text-ink-600 dark:text-mist-200">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

