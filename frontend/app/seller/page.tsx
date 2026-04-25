'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiSellerMe, apiSellerOrders, apiSellerProducts, apiUpdateOrderStatus } from '@/lib/api';
import type { Product } from '@/types/product';
import type { Order } from '@/types/order';

export default function SellerDashboardPage() {
  const auth = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [seller, setSeller] = useState<{ _id: string; displayName: string; ratingAvg: number; ratingCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!auth.token || auth.user?.role !== 'seller') return;
      setError(null);
      try {
        const [meRes, pRes, oRes] = await Promise.all([
          apiSellerMe(auth.token),
          apiSellerProducts(auth.token),
          apiSellerOrders(auth.token)
        ]);
        if (!mounted) return;
        setSeller(meRes as any);
        setProducts(pRes.items || []);
        setOrders((oRes.items as Order[]) || []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load seller dashboard.');
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [auth.token, auth.user?.role]);

  if (!auth.user) {
    return (
      <div className="space-y-4">
        <h1 className="section-title">Seller dashboard</h1>
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">
          <Link className="link" href="/auth/login">
            Sign in
          </Link>{' '}
          to manage products and orders.
        </div>
      </div>
    );
  }

  if (auth.user.role !== 'seller') {
    return (
      <div className="space-y-4">
        <h1 className="section-title">Seller dashboard</h1>
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">
          Your account is not a seller account.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Seller dashboard</h1>
        <div className="text-right">
          <div className="text-sm text-ink-500 dark:text-mist-300">{auth.user.email}</div>
          {seller?._id ? (
            <Link className="link text-xs" href={`/sellers/${seller._id}`}>
              Rating: {(seller.ratingAvg || 0).toFixed(1)} / 5 ({seller.ratingCount || 0})
            </Link>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-accent-500">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="font-display text-xl">My products</h2>
        <div className="grid gap-3">
          {products.map((p) => (
            <div key={p._id} className="card flex items-center justify-between gap-4 p-4">
              <div>
                <div className="text-sm font-semibold text-ink-900 dark:text-white">{p.title}</div>
                <div className="text-xs text-ink-500 dark:text-mist-300">
                  {p.category} • ${p.price.toFixed(2)} • Stock {p.stockLeft}
                </div>
              </div>
              <span className="badge badge-muted">{p.discountPercent ? `-${p.discountPercent}%` : 'Regular'}</span>
            </div>
          ))}
          {!products.length ? (
            <p className="text-sm text-ink-500 dark:text-mist-300">No products yet (seed creates demo products).</p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Orders containing my items</h2>
        <div className="grid gap-3">
          {orders.map((o) => (
            <div key={o._id} className="card space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink-900 dark:text-white">Order #{o._id.slice(-6)}</div>
                  <div className="text-xs text-ink-500 dark:text-mist-300">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-muted">{o.status}</span>
                  <span className="text-sm font-semibold text-ink-900 dark:text-white">${o.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['pending', 'shipped', 'delivered'] as const).map((s) => (
                  <button
                    key={s}
                    className={`btn ${o.status === s ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={async () => {
                      if (!auth.token) return;
                      try {
                        await apiUpdateOrderStatus(auth.token, o._id, s);
                        setOrders((prev) => prev.map((x) => (x._id === o._id ? { ...x, status: s } : x)));
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to update status.');
                      }
                    }}
                  >
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!orders.length ? <p className="text-sm text-ink-500 dark:text-mist-300">No orders yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
