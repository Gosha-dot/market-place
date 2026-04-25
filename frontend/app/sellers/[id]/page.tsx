'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiSellerById, apiSellerRatings } from '@/lib/api';
import Rating from '@/components/ui/Rating';

type Seller = {
  _id: string;
  displayName: string;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
};

export default function SellerProfilePage({ params }: { params: { id: string } }) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [ratings, setRatings] = useState<{ _id: string; rating: number; comment?: string; createdAt: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError(null);
      try {
        const [s, r] = await Promise.all([apiSellerById(params.id), apiSellerRatings(params.id)]);
        if (!mounted) return;
        setSeller(s as Seller);
        setRatings((r.items as any[]) || []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load seller.');
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Seller profile</h1>
        <Link className="link text-sm" href="/products">
          ← Back
        </Link>
      </div>

      {error ? <p className="text-sm text-accent-500">{error}</p> : null}

      {seller ? (
        <div className="card space-y-3 p-6">
          <div className="text-xl font-semibold text-ink-900 dark:text-white">{seller.displayName}</div>
          <div className="flex items-center gap-3">
            <Rating value={seller.ratingAvg || 0} />
            <span className="text-sm text-ink-600 dark:text-mist-200">
              {(seller.ratingAvg || 0).toFixed(1)} / 5 • {seller.ratingCount} reviews
            </span>
          </div>
          <div className="text-xs text-ink-500 dark:text-mist-300">
            Joined {new Date(seller.createdAt).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">Loading…</div>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl">Latest ratings</h2>
        <div className="grid gap-3">
          {ratings.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <Rating value={r.rating} />
                <span className="text-xs text-ink-500 dark:text-mist-300">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.comment ? <p className="mt-2 text-sm text-ink-600 dark:text-mist-200">{r.comment}</p> : null}
            </div>
          ))}
          {!ratings.length ? <p className="text-sm text-ink-500 dark:text-mist-300">No ratings yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

