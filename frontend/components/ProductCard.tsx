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
import { shimmerDataUrl } from '@/utils/blurDataUrl';

export default function ProductCard({ product, layout = 'grid' }: { product: Product; layout?: 'grid' | 'list' }) {
  const { currency } = useCurrency();
  const cart = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();

  const isList = layout === 'list';
  const discounted = product.price * (1 - product.discountPercent / 100);
  const inWishlist = wishlist.has(product._id);
  const inCompare = compare.has(product._id);
  const qty = cart.getQuantity(product._id);
  const isNew =
    typeof product.createdAt === 'string' && Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 14;

  const imageSrc = product.images?.[0] ?? '/placeholder.svg';

  return (
    <div
      className={[
        'card group flex h-full overflow-hidden transition-shadow',
        'hover:shadow-glow dark:hover:shadow-none',
        isList ? 'flex-col sm:flex-row' : 'flex-col'
      ].join(' ')}
    >
      <div className={['relative overflow-hidden bg-mist-100 dark:bg-ink-700', isList ? 'aspect-[4/3] w-full sm:aspect-auto sm:w-60' : 'aspect-[4/3] w-full'].join(' ')}>
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          sizes={isList ? '(max-width: 640px) 100vw, 240px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'}
          quality={80}
          placeholder="blur"
          blurDataURL={shimmerDataUrl(700, 525)}
          className="object-cover transition-transform duration-300 will-change-transform group-hover:scale-[1.04]"
        />

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
          {isNew ? <span className="badge badge-muted">New</span> : null}
          {product.discountPercent > 0 ? (
            <span className="badge badge-accent">-{product.discountPercent}%</span>
          ) : null}
          {product.stockLeft <= 0 ? <span className="badge badge-muted">Sold out</span> : null}
        </div>
      </div>

      <div className={['flex flex-1 flex-col gap-2 p-4', isList ? 'sm:p-5' : ''].join(' ')}>
        <div className="space-y-1.5">
          <Link
            href={`/products/${product._id}`}
            className="line-clamp-2 text-sm font-semibold text-ink-900 hover:underline dark:text-mist-100"
          >
            {product.title}
          </Link>
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-600 dark:text-mist-200">{product.description}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-ink-900 dark:text-white">
            {formatCurrency(discounted, currency)}
          </span>
          {product.discountPercent > 0 ? (
            <span className="text-xs text-ink-500 line-through dark:text-mist-300">
              {formatCurrency(product.price, currency)}
            </span>
          ) : null}
        </div>

        <Rating value={product.rating} />

        <div
          className={[
            'mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500 dark:text-mist-300',
            isList ? 'pt-2' : ''
          ].join(' ')}
        >
          <span className="truncate">
            Seller: {product.seller?.name || '—'} {product.seller ? `(${product.seller.rating.toFixed(1)}/5)` : ''}
          </span>
          <span>
            {product.stockLeft <= 0
              ? 'Out of stock'
              : product.stockLeft <= 5
                ? `Only ${product.stockLeft} left`
                : `In stock: ${product.stockLeft}`}
          </span>
        </div>

        <div className={['mt-3 grid gap-2', isList ? 'sm:grid-cols-[1fr_1fr]' : ''].join(' ')}>
          <button
            onClick={() => cart.add(product._id, 1)}
            className="btn btn-primary w-full"
            disabled={product.stockLeft <= 0}
          >
            {qty > 0 ? `Add again (${qty})` : 'Add to cart'}
          </button>

          <button
            onClick={() => wishlist.toggle(product._id)}
            className="btn btn-ghost w-full"
            aria-pressed={inWishlist}
          >
            {inWishlist ? 'Wishlisted' : 'Wishlist'}
          </button>
          <button
            onClick={() => compare.toggle(product._id)}
            className="btn btn-ghost w-full"
            aria-pressed={inCompare}
          >
            {inCompare ? 'In compare' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  );
}
