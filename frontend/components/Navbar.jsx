import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-mist-200/60 bg-white/80 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/80">
      <div className="container-page flex items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-xl text-ink-900 dark:text-white">
            NovaMart
          </Link>
          <div className="hidden items-center gap-4 text-sm text-ink-600 dark:text-mist-200 md:flex">
            <Link href="/" className="link">Home</Link>
            <Link href="/#flash" className="link">Flash Sale</Link>
            <Link href="/#categories" className="link">Categories</Link>
            <Link href="/admin" className="link">Admin</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/wishlist" className="link text-sm">Wishlist</Link>
          <Link href="/cart" className="link text-sm">Cart</Link>
          <CurrencyToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
