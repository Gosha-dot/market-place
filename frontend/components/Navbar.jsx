'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cart = useCart();
  const { user, logout } = useAuth();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setQ(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const primaryLinks = useMemo(
    () => [
      { href: '/', label: 'Home' },
      { href: '/products', label: 'Products' },
      { href: '/#flash', label: 'Flash Sale' },
      { href: '/#categories', label: 'Categories' }
    ],
    []
  );

  const accountLinks = useMemo(() => {
    if (!user) return [];
    const links = [{ href: '/orders', label: 'Orders' }];
    if (user.role === 'seller') links.push({ href: '/seller', label: 'Seller' });
    if (user.role === 'admin') links.push({ href: '/admin', label: 'Admin' });
    return links;
  }, [user]);

  function submitSearch() {
    const next = q.trim();
    router.push(next ? `/products?q=${encodeURIComponent(next)}` : '/products');
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-mist-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-ink-700/60 dark:bg-ink-900/80 dark:supports-[backdrop-filter]:bg-ink-900/60">
      <div className="container-page">
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2">
              <span className="font-display text-xl text-ink-900 dark:text-white">NovaMart</span>
              <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-[11px] font-semibold text-accent-600 dark:text-accent-500">
                MVP
              </span>
            </Link>
          </div>

          <form
            className="hidden w-full max-w-md md:block"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 dark:text-mist-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16.5 16.5 21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input w-full px-10" />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost rounded-none px-3 py-2 text-sm md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {mobileOpen ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>

            <Link href="/compare" className="btn btn-ghost hidden rounded-none px-3 py-2 text-sm md:inline-flex">
              Compare
            </Link>
            <Link href="/wishlist" className="btn btn-ghost hidden rounded-none px-3 py-2 text-sm md:inline-flex">
              Wishlist
            </Link>
            <Link href="/cart" className="btn btn-primary relative rounded-none px-3 py-2 text-sm">
              <span className="hidden sm:inline">Cart</span>
              <span className="sm:hidden" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M7 6h14l-2 8H8L7 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M7 6 6.2 3H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path
                    d="M9 21a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm9 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              {cart.totalItems ? (
                <span
                  className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-ink-900 shadow-soft dark:bg-ink-900 dark:text-white"
                  aria-label={`${cart.totalItems} items in cart`}
                >
                  {cart.totalItems}
                </span>
              ) : null}
            </Link>

            {user ? (
              <button
                className="btn btn-ghost hidden rounded-none px-3 py-2 text-sm md:inline-flex"
                onClick={logout}
                title={user.email}
              >
                Logout
              </button>
            ) : (
              <Link href="/auth/login" className="btn btn-ghost hidden rounded-none px-3 py-2 text-sm md:inline-flex">
                Sign in
              </Link>
            )}

            <CurrencyToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="hidden items-center justify-end gap-4 pb-3 text-sm text-ink-600 dark:text-mist-200 md:flex">
          {primaryLinks.map((l) => (
            <Link key={l.href} href={l.href} className="link">
              {l.label}
            </Link>
          ))}
          {accountLinks.length ? <span className="h-4 w-px bg-mist-200 dark:bg-ink-700" aria-hidden="true" /> : null}
          {accountLinks.map((l) => (
            <Link key={l.href} href={l.href} className="link">
              {l.label}
            </Link>
          ))}
        </div>

        {mobileOpen ? (
          <div className="pb-4 md:hidden">
            <form
              className="mb-3"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
            >
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input px-4" />
            </form>

            <div className="grid gap-2">
              {[...primaryLinks, ...accountLinks].map((l) => (
                <Link key={l.href} href={l.href} className="btn btn-ghost justify-start rounded-none px-4 py-3 text-sm">
                  {l.label}
                </Link>
              ))}
              <Link href="/compare" className="btn btn-ghost justify-start rounded-none px-4 py-3 text-sm">
                Compare
              </Link>
              <Link href="/wishlist" className="btn btn-ghost justify-start rounded-none px-4 py-3 text-sm">
                Wishlist
              </Link>
              {user ? (
                <button className="btn btn-ghost justify-start rounded-none px-4 py-3 text-sm" onClick={logout} title={user.email}>
                  Logout
                </button>
              ) : (
                <Link href="/auth/login" className="btn btn-ghost justify-start rounded-none px-4 py-3 text-sm">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
