'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiMyOrders } from '@/lib/api';
import type { Order } from '@/types/order';

function statusClass(status: string) {
  if (status === 'delivered') return 'badge badge-accent';
  if (status === 'shipped') return 'badge badge-muted';
  return 'badge badge-muted';
}

export default function OrdersPage() {
  const auth = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!auth.token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiMyOrders(auth.token);
        if (!mounted) return;
        setOrders((res.items as Order[]) || []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load orders.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [auth.token]);

  const empty = useMemo(() => !loading && !orders.length, [loading, orders.length]);

  if (!auth.user) {
    return (
      <div className="space-y-4">
        <h1 className="section-title">Order history</h1>
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">
          <Link className="link" href="/auth/login">
            Sign in
          </Link>{' '}
          to view your orders.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="section-title">Order history</h1>

      {error ? <p className="text-sm text-accent-500">{error}</p> : null}
      {loading ? <p className="text-sm text-ink-500 dark:text-mist-300">Loading…</p> : null}

      {empty ? (
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">
          No orders yet.{' '}
          <Link className="link" href="/products">
            Start shopping
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <Link key={o._id} href={`/orders/${o._id}`} className="card block p-5 hover:shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-ink-900 dark:text-white">Order #{o._id.slice(-6)}</div>
                  <div className="text-xs text-ink-500 dark:text-mist-300">
                    {new Date(o.createdAt).toLocaleString()} • {o.items.length} item(s)
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusClass(o.status)}>{o.status}</span>
                  <span className="text-sm font-semibold text-ink-900 dark:text-white">${o.total.toFixed(2)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

