'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cart = useCart();
  const { user, logout } = useAuth();

  const [q, setQ] = useState(searchParams.get('q') || '');

  return (
    <nav className="sticky top-0 z-50 border-b border-mist-200/60 bg-white/80 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/80">
      <div className="container-page flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-xl text-ink-900 dark:text-white">
            NovaMart
          </Link>

          <form
            className="hidden md:block"
            onSubmit={(e) => {
              e.preventDefault();
              const next = q.trim();
              router.push(next ? `/products?q=${encodeURIComponent(next)}` : '/products');
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-72 rounded-xl border border-mist-200 bg-white px-4 py-2 text-sm dark:border-ink-700 dark:bg-ink-800"
            />
          </form>

          <div className="hidden items-center gap-4 text-sm text-ink-600 dark:text-mist-200 md:flex">
            <Link href="/" className="link">
              Home
            </Link>
            <Link href="/products" className="link">
              Products
            </Link>
            <Link href="/#flash" className="link">
              Flash Sale
            </Link>
            <Link href="/#categories" className="link">
              Categories
            </Link>
            <Link href="/admin" className="link">
              Admin
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/compare" className="link text-sm">
            Compare
          </Link>
          <Link href="/wishlist" className="link text-sm">
            Wishlist
          </Link>
          <Link href="/cart" className="link text-sm">
            Cart{cart.totalItems ? ` (${cart.totalItems})` : ''}
          </Link>
          {user ? (
            <button className="btn btn-ghost text-sm" onClick={logout} title={user.email}>
              Logout
            </button>
          ) : (
            <Link href="/auth/login" className="link text-sm">
              Sign in
            </Link>
          )}
          <CurrencyToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

