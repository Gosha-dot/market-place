export default function Footer() {
  return (
    <footer className="mt-16 border-t border-mist-200 py-8 text-sm text-ink-500 dark:border-ink-700 dark:text-mist-300">
      <div className="container-page flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <span>© 2026 NovaMart Marketplace. All rights reserved.</span>
        <div className="flex gap-4">
          <span>Secure checkout</span>
          <span>24/7 support</span>
          <span>Trusted sellers</span>
        </div>
      </div>
    </footer>
  );
}
