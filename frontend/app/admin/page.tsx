'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiAdminCoupons, apiAdminCreateCoupon } from '@/lib/api';

type Coupon = {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  minOrderAmount: number;
  active: boolean;
};

export default function AdminPage() {
  const auth = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 20,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    usageLimit: 100,
    minOrderAmount: 25,
    active: true
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!auth.token || auth.user?.role !== 'admin') return;
      setError(null);
      try {
        const res = await apiAdminCoupons(auth.token);
        if (mounted) setCoupons((res.items as Coupon[]) || []);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load coupons.');
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
        <h1 className="section-title">Admin</h1>
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">
          <Link className="link" href="/auth/login">
            Sign in
          </Link>{' '}
          to access the admin panel.
        </div>
      </div>
    );
  }

  if (auth.user.role !== 'admin') {
    return (
      <div className="space-y-4">
        <h1 className="section-title">Admin</h1>
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">Forbidden.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="section-title">Admin panel</h1>

      {error ? <p className="text-sm text-accent-500">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="font-display text-xl">Create coupon</h2>
        <form
          className="card grid gap-3 p-5 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!auth.token) return;
            setError(null);
            try {
              await apiAdminCreateCoupon(auth.token, {
                code: form.code,
                type: form.type,
                value: Number(form.value),
                expiresAt: new Date(form.expiresAt).toISOString(),
                usageLimit: Number(form.usageLimit),
                minOrderAmount: Number(form.minOrderAmount),
                active: Boolean(form.active)
              });
              const res = await apiAdminCoupons(auth.token);
              setCoupons((res.items as Coupon[]) || []);
              setForm((p) => ({ ...p, code: '' }));
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to create coupon.');
            }
          }}
        >
          <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200">
            Code
            <input className="input px-3 py-2" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="NOVAMART20" />
          </label>
          <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200">
            Type
            <select className="input px-3 py-2" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as any }))}>
              <option value="percent">percent</option>
              <option value="fixed">fixed</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200">
            Value
            <input className="input px-3 py-2" type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))} />
          </label>
          <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200">
            Expires (YYYY-MM-DD)
            <input className="input px-3 py-2" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} />
          </label>
          <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200">
            Usage limit (0=∞)
            <input className="input px-3 py-2" type="number" value={form.usageLimit} onChange={(e) => setForm((p) => ({ ...p, usageLimit: Number(e.target.value) }))} />
          </label>
          <label className="space-y-1 text-xs text-ink-600 dark:text-mist-200">
            Min order amount
            <input className="input px-3 py-2" type="number" value={form.minOrderAmount} onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: Number(e.target.value) }))} />
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-600 dark:text-mist-200">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
            Active
          </label>
          <div className="md:col-span-2">
            <button className="btn btn-primary" type="submit">
              Create
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Coupons</h2>
        <div className="grid gap-3">
          {coupons.map((c) => (
            <div key={c._id} className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <div className="font-semibold text-ink-900 dark:text-white">{c.code}</div>
                <div className="text-xs text-ink-500 dark:text-mist-300">
                  {c.type} {c.value} • used {c.usedCount}/{c.usageLimit || '∞'} • min ${c.minOrderAmount} • expires{' '}
                  {new Date(c.expiresAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`badge ${c.active ? 'badge-accent' : 'badge-muted'}`}>{c.active ? 'active' : 'inactive'}</span>
            </div>
          ))}
          {!coupons.length ? <p className="text-sm text-ink-500 dark:text-mist-300">No coupons.</p> : null}
        </div>
      </section>
    </div>
  );
}

