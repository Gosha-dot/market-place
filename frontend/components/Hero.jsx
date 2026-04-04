export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-mist-200 bg-gradient-to-r from-white via-mist-100 to-white p-8 shadow-soft dark:border-ink-700 dark:from-ink-800 dark:via-ink-700 dark:to-ink-800">
      <div className="absolute right-[-20%] top-[-30%] h-64 w-64 rounded-full bg-accent-500/15 blur-3xl" />
      <div className="relative z-10 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <span className="badge badge-accent">-70% Mega Deals</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            Shop smarter with NovaMart’s flash-first marketplace.
          </h1>
          <p className="mt-4 text-sm text-ink-600 dark:text-mist-200">
            Discover curated tech, lifestyle, and home essentials with lightning discounts and trusted sellers.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn btn-primary">Explore Deals</button>
            <button className="btn btn-ghost">Browse Categories</button>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="card p-4">
            <p className="text-xs uppercase text-ink-500 dark:text-mist-300">Today’s highlight</p>
            <h3 className="mt-2 font-display text-xl">Smart home kits from $39</h3>
            <p className="mt-2 text-sm text-ink-600 dark:text-mist-200">Bundle and save with top-rated sellers.</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase text-ink-500 dark:text-mist-300">Exclusive</p>
            <h3 className="mt-2 font-display text-xl">Fashion drops with free returns</h3>
            <p className="mt-2 text-sm text-ink-600 dark:text-mist-200">Limited runs. Restocked daily.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
