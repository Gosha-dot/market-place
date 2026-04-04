export default function Filters({ filters, onChange, categories }) {
  return (
    <div className="card flex flex-wrap items-center gap-4 p-4">
      <div className="flex flex-col">
        <label className="text-xs text-ink-500 dark:text-mist-300">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="mt-1 rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-800"
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-ink-500 dark:text-mist-300">Max price</label>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          className="mt-1 rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-800"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-ink-500 dark:text-mist-300">Min rating</label>
        <select
          value={filters.minRating}
          onChange={(e) => onChange({ ...filters, minRating: e.target.value })}
          className="mt-1 rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-800"
        >
          <option value="">Any</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
          <option value="4.8">4.8+</option>
        </select>
      </div>
    </div>
  );
}
