'use client';

import Link from 'next/link';
import Image from 'next/image';
import Rating from '@/components/ui/Rating';
import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';
import type { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCompare } from '@/hooks/useCompare';

export default function ProductCard({ product }: { product: Product }) {
  const { currency } = useCurrency();
  const cart = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();

  const discounted = product.price * (1 - product.discountPercent / 100);
  const inWishlist = wishlist.has(product._id);
  const inCompare = compare.has(product._id);
  const qty = cart.getQuantity(product._id);

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={product.images?.[0]}
          alt={product.title}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover"
        />
        {product.discountPercent > 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-white">
            -{product.discountPercent}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product._id}`} className="font-semibold text-ink-900 dark:text-mist-100">
          {product.title}
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-ink-900 dark:text-white">
            {formatCurrency(discounted, currency)}
          </span>
          <span className="text-xs text-ink-500 line-through dark:text-mist-300">
            {formatCurrency(product.price, currency)}
          </span>
        </div>

        <Rating value={product.rating} />

        <div className="mt-auto flex items-center justify-between text-xs text-ink-500 dark:text-mist-300">
          <span className="truncate">Brand: {product.brand}</span>
          <span>{product.stockLeft > 0 ? `In stock: ${product.stockLeft}` : 'Out of stock'}</span>
        </div>

        <button
          onClick={() => cart.add(product._id, 1)}
          className="btn btn-primary mt-3 w-full"
          disabled={product.stockLeft <= 0}
        >
          {qty > 0 ? `Add again (${qty} in cart)` : 'Add to cart'}
        </button>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => wishlist.toggle(product._id)}
            className="btn btn-ghost w-full"
          >
            {inWishlist ? 'Wishlisted' : 'Wishlist'}
          </button>
          <button onClick={() => compare.toggle(product._id)} className="btn btn-ghost w-full">
            {inCompare ? 'In compare' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  );
}
