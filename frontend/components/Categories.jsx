export default function Categories({ items }) {
  return (
    <section id="categories" className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Categories</h2>
        <span className="text-sm text-ink-500 dark:text-mist-300">Tap to explore</span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="card flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold text-ink-900 dark:text-white">{item}</p>
              <p className="text-xs text-ink-500 dark:text-mist-300">Deals updated daily</p>
            </div>
            <span className="badge badge-muted">Browse</span>
          </div>
        ))}
      </div>
    </section>
  );
}
