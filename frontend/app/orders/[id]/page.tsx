'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiMyOrder, apiRateSeller } from '@/lib/api';
import type { Order, OrderItem } from '@/types/order';

function discountedUnitPrice(item: OrderItem) {
  return item.unitPrice * (1 - (item.discountPercent || 0) / 100);
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const auth = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ratingState, setRatingState] = useState<Record<string, { rating: number; comment: string; status?: string }>>(
    {}
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!auth.token) return;
      setError(null);
      try {
        const res = (await apiMyOrder(auth.token, params.id)) as Order;
        if (mounted) setOrder(res);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load order.');
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [auth.token, params.id]);

  const sellerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const i of order?.items || []) ids.add(String(i.sellerId));
    return [...ids];
  }, [order?.items]);

  if (!auth.user) {
    return (
      <div className="space-y-4">
        <h1 className="section-title">Order details</h1>
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">
          <Link className="link" href="/auth/login">
            Sign in
          </Link>{' '}
          to view this order.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="section-title">Order details</h1>
        <p className="text-sm text-accent-500">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <h1 className="section-title">Order details</h1>
        <p className="text-sm text-ink-500 dark:text-mist-300">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Order #{order._id.slice(-6)}</h1>
        <Link className="link text-sm" href="/orders">
          ← Back
        </Link>
      </div>

      <div className="card space-y-2 p-5 text-sm text-ink-600 dark:text-mist-200">
        <div className="flex items-center justify-between">
          <span>Status</span>
          <span className="font-semibold text-ink-900 dark:text-white">{order.status}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Date</span>
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total</span>
          <span className="font-semibold text-ink-900 dark:text-white">${order.total.toFixed(2)}</span>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Items</h2>
        <div className="grid gap-3">
          {order.items.map((i) => (
            <div key={`${i.productId}-${i.title}`} className="card flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-mist-100 dark:bg-ink-800">
                {i.image ? <Image src={i.image} alt="" fill sizes="64px" className="object-cover" /> : null}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink-900 dark:text-white">{i.title}</div>
                <div className="text-xs text-ink-500 dark:text-mist-300">
                  ${discountedUnitPrice(i).toFixed(2)} • Qty {i.quantity}
                </div>
              </div>
              <div className="text-sm font-semibold text-ink-900 dark:text-white">
                ${(discountedUnitPrice(i) * i.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {order.status === 'delivered' && sellerIds.length ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl">Rate sellers</h2>
          <div className="grid gap-3">
            {sellerIds.map((sellerId) => {
              const state = ratingState[sellerId] || { rating: 5, comment: '' };
              return (
                <form
                  key={sellerId}
                  className="card space-y-3 p-5"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!auth.token) return;
                    setRatingState((p) => ({ ...p, [sellerId]: { ...state, status: 'Saving...' } }));
                    try {
                      await apiRateSeller(auth.token, sellerId, {
                        orderId: order._id,
                        rating: state.rating,
                        comment: state.comment
                      });
                      setRatingState((p) => ({ ...p, [sellerId]: { ...state, status: 'Saved' } }));
                    } catch (err) {
                      setRatingState((p) => ({
                        ...p,
                        [sellerId]: { ...state, status: err instanceof Error ? err.message : 'Failed' }
                      }));
                    }
                  }}
                >
                  <div className="text-xs text-ink-500 dark:text-mist-300">Seller ID: {sellerId.slice(-6)}</div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200">
                      Rating
                      <select
                        className="input px-3 py-2"
                        value={state.rating}
                        onChange={(e) =>
                          setRatingState((p) => ({
                            ...p,
                            [sellerId]: { ...state, rating: Number(e.target.value) }
                          }))
                        }
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200 md:col-span-2">
                      Comment
                      <input
                        className="input px-3 py-2"
                        value={state.comment}
                        onChange={(e) =>
                          setRatingState((p) => ({ ...p, [sellerId]: { ...state, comment: e.target.value } }))
                        }
                        placeholder="Optional"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <button className="btn btn-primary" type="submit">
                      Submit rating
                    </button>
                    {state.status ? <span className="text-xs text-ink-500 dark:text-mist-300">{state.status}</span> : null}
                  </div>
                </form>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

