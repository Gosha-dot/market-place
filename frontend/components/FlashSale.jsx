'use client';

import Countdown from '@/components/ui/Countdown';
import ProductCard from '@/components/ProductCard';

export default function FlashSale({ products }) {
  const endsAt = new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString();

  return (
    <section id="flash" className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Flash Sale</h2>
          <p className="text-sm text-ink-600 dark:text-mist-200">
            Limited-time markdowns. Grab them before they’re gone.
          </p>
        </div>
        <div className="badge badge-muted">
          Ends in <Countdown endsAt={endsAt} />
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
