'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Rating from '@/components/ui/Rating';
import ProductList from '@/components/ProductList';
import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';
import type { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCompare } from '@/hooks/useCompare';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { shimmerDataUrl } from '@/utils/blurDataUrl';
import { apiAddBrowseHistory, apiCreateProductReview, apiProductReviews, apiSimilar } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

function formatSpecValue(value: unknown) {
  if (value === null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export default function ProductClient({ product }: { product: Product }) {
  const { currency } = useCurrency();
  const cart = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();
  const recentlyViewed = useRecentlyViewed();
  const auth = useAuth();

  const images = product.images?.length
    ? product.images
    : ['/placeholder.svg'];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[Math.min(activeIndex, images.length - 1)];

  useEffect(() => {
    recentlyViewed.add(product._id);
    if (auth.token) apiAddBrowseHistory(auth.token, product._id).catch(() => {});
  }, [auth.token, product._id, recentlyViewed]);

  const discounted = useMemo(() => product.price * (1 - product.discountPercent / 100), [product.price, product.discountPercent]);
  const inWishlist = wishlist.has(product._id);
  const inCompare = compare.has(product._id);
  const qty = cart.getQuantity(product._id);

  const specs = useMemo(() => Object.entries(product.specs ?? {}), [product.specs]);

  const [similar, setSimilar] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<
    { _id: string; rating: number; title?: string; body?: string; createdAt: string }[]
  >([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [similarRes, reviewsRes] = await Promise.all([apiSimilar(product._id, 8), apiProductReviews(product._id)]);
        if (!mounted) return;
        setSimilar(similarRes.items || []);
        setReviews((reviewsRes.items as any[]) || []);
      } catch {
        // ignore (offline/demo mode)
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [product._id]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/products" className="link text-sm">
          ← Back to products
        </Link>
        <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-mist-300">
          <span className="badge badge-muted">{product.category}</span>
          <span className="badge badge-muted">{product.brand}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="relative aspect-[4/3] w-full bg-mist-100 dark:bg-ink-700">
              <Image
                src={activeImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                quality={85}
                placeholder="blur"
                blurDataURL={shimmerDataUrl(1200, 900)}
                className="object-cover"
              />
              {product.discountPercent > 0 ? (
                <span className="absolute left-4 top-4 rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-white">
                  Save {product.discountPercent}%
                </span>
              ) : null}
            </div>
          </div>

          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.slice(0, 6).map((src, i) => {
                const active = i === activeIndex;
                return (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={[
                      'card relative overflow-hidden border p-0',
                      'transition-shadow hover:shadow-soft',
                      active ? 'border-accent-500 shadow-glow' : 'border-mist-200 dark:border-ink-700'
                    ].join(' ')}
                    aria-label={`View image ${i + 1}`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="96px"
                        quality={70}
                        placeholder="blur"
                        blurDataURL={shimmerDataUrl(200, 200)}
                        className="object-cover"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <header className="space-y-3">
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">{product.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Rating value={product.rating} />
              <span className="text-sm text-ink-500 dark:text-mist-300">{product.rating.toFixed(1)} / 5</span>
              <span className="text-sm text-ink-500 dark:text-mist-300">
                {product.stockLeft > 0 ? `${product.stockLeft} in stock` : 'Out of stock'}
              </span>
            </div>
          </header>

          <div className="card space-y-4 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <div className="text-2xl font-semibold text-ink-900 dark:text-white">
                  {formatCurrency(discounted, currency)}
                </div>
                {product.discountPercent > 0 ? (
                  <div className="text-sm text-ink-500 dark:text-mist-300">
                    <span className="line-through">{formatCurrency(product.price, currency)}</span> • You save{' '}
                    {formatCurrency(product.price - discounted, currency)}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => wishlist.toggle(product._id)}
                  className="btn btn-ghost"
                  aria-pressed={inWishlist}
                >
                  {inWishlist ? 'Wishlisted' : 'Wishlist'}
                </button>
                <button onClick={() => compare.toggle(product._id)} className="btn btn-ghost" aria-pressed={inCompare}>
                  {inCompare ? 'In compare' : 'Compare'}
                </button>
              </div>
            </div>

            <button
              onClick={() => cart.add(product._id, 1)}
              className="btn btn-primary w-full"
              disabled={product.stockLeft <= 0}
            >
              {qty > 0 ? `Add again (${qty} in cart)` : 'Add to cart'}
            </button>

            <p className="text-sm leading-relaxed text-ink-600 dark:text-mist-200">{product.description}</p>
          </div>

          {specs.length ? (
            <section className="card p-5">
              <h2 className="font-display text-xl">Details</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {specs.map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-mist-200 bg-white p-3 dark:border-ink-700 dark:bg-ink-800">
                    <dt className="text-xs uppercase tracking-wide text-ink-500 dark:text-mist-300">{key}</dt>
                    <dd className="mt-1 text-sm font-semibold text-ink-900 dark:text-white">{formatSpecValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {product.seller ? (
            <section className="card p-5">
              <h2 className="font-display text-xl">Seller</h2>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  {product.seller._id ? (
                    <Link className="link text-sm font-semibold" href={`/sellers/${product.seller._id}`}>
                      {product.seller.name}
                    </Link>
                  ) : (
                    <div className="text-sm font-semibold text-ink-900 dark:text-white">{product.seller.name}</div>
                  )}
                  <div className="mt-1 text-xs text-ink-500 dark:text-mist-300">
                    Seller rating: {product.seller.rating.toFixed(1)} / 5
                    {typeof product.seller.ratingCount === 'number' ? ` • ${product.seller.ratingCount} reviews` : ''}
                  </div>
                </div>
                <span className="badge badge-accent">Trusted</span>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {similar.length ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">You may also like</h2>
            <Link className="link text-sm" href="/products">
              Browse more
            </Link>
          </div>
          <ProductList products={similar} />
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Reviews</h2>
          <span className="text-sm text-ink-500 dark:text-mist-300">{reviews.length} total</span>
        </div>

        {auth.user ? (
          <form
            className="card space-y-3 p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!auth.token) return;
              setReviewError(null);
              setReviewSubmitting(true);
              try {
                await apiCreateProductReview(auth.token, {
                  productId: product._id,
                  rating: Number(reviewForm.rating),
                  title: reviewForm.title,
                  body: reviewForm.body
                });
                const next = await apiProductReviews(product._id);
                setReviews((next.items as any[]) || []);
                setReviewForm({ rating: 5, title: '', body: '' });
              } catch (err) {
                setReviewError(err instanceof Error ? err.message : 'Failed to submit review.');
              } finally {
                setReviewSubmitting(false);
              }
            }}
          >
            {reviewError ? <p className="text-sm text-accent-500">{reviewError}</p> : null}
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200">
                Rating
                <select
                  className="input px-3 py-2"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200 md:col-span-2">
                Title
                <input
                  className="input px-3 py-2"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Quick summary"
                />
              </label>
            </div>
            <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200">
              Review
              <textarea
                className="input min-h-24 px-3 py-2"
                value={reviewForm.body}
                onChange={(e) => setReviewForm((p) => ({ ...p, body: e.target.value }))}
                placeholder="What did you like? What could be better?"
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={reviewSubmitting}>
              {reviewSubmitting ? 'Posting...' : 'Post review'}
            </button>
          </form>
        ) : (
          <div className="card p-5 text-sm text-ink-600 dark:text-mist-200">
            <Link className="link" href="/auth/login">
              Sign in
            </Link>{' '}
            to leave a review.
          </div>
        )}

        <div className="grid gap-3">
          {reviews.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <Rating value={r.rating} />
                <span className="text-xs text-ink-500 dark:text-mist-300">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              {r.title ? <p className="mt-2 text-sm font-semibold">{r.title}</p> : null}
              {r.body ? <p className="mt-1 text-sm text-ink-600 dark:text-mist-200">{r.body}</p> : null}
            </div>
          ))}
          {!reviews.length ? (
            <p className="text-sm text-ink-500 dark:text-mist-300">No reviews yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
