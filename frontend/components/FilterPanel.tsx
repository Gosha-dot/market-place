'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProductFilters, ProductSort } from '@/types/product';
import { debounce } from '@/utils/debounce';

type Props = {
  filters: ProductFilters;
  sort: ProductSort;
  brands: string[];
  categories?: string[];
  onChangeFilters: (next: ProductFilters) => void;
  onChangeSort: (sort: ProductSort) => void;
  onReset: () => void;
  disabled?: boolean;
};

export default function FilterPanel({
  filters,
  sort,
  brands,
  categories = [],
  onChangeFilters,
  onChangeSort,
  onReset,
  disabled
}: Props) {
  const [queryInput, setQueryInput] = useState(filters.q ?? '');
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice?.toString() ?? '');
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice?.toString() ?? '');
  const [discountInput, setDiscountInput] = useState(filters.discountPercent?.toString() ?? '');

  useEffect(() => setQueryInput(filters.q ?? ''), [filters.q]);
  useEffect(() => setMinPriceInput(filters.minPrice?.toString() ?? ''), [filters.minPrice]);
  useEffect(() => setMaxPriceInput(filters.maxPrice?.toString() ?? ''), [filters.maxPrice]);
  useEffect(() => setDiscountInput(filters.discountPercent?.toString() ?? ''), [filters.discountPercent]);

  const filtersRef = useRef(filters);
  const onChangeFiltersRef = useRef(onChangeFilters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    onChangeFiltersRef.current = onChangeFilters;
  }, [onChangeFilters]);

  const commitQuery = useMemo(
    () =>
      debounce((q: string) => {
        const nextQ = q.trim();
        const current = filtersRef.current;
        onChangeFiltersRef.current({ ...current, q: nextQ.length ? nextQ : undefined });
      }, 200),
    []
  );

  const commitNumber = useMemo(
    () =>
      debounce((next: { minPrice?: number; maxPrice?: number; discountPercent?: number }) => {
        const current = filtersRef.current;
        onChangeFiltersRef.current({ ...current, ...next });
      }, 250),
    []
  );

  const selectedBrands = filters.brand ?? [];

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    onChangeFilters({ ...filters, brand: next.length ? next : undefined });
  };

  return (
    <div className="card grid gap-4 p-4 lg:grid-cols-[1.35fr_1fr_1fr_1.2fr]">
      <div className="lg:col-span-4">
        <label className="text-xs text-ink-500 dark:text-mist-300">Search</label>
        <div className="mt-1 flex gap-2">
          <input
            value={queryInput}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value;
              setQueryInput(v);
              commitQuery(v);
            }}
            placeholder="Search products, brands, categories..."
            className="input"
          />
          <button
            type="button"
            className="btn btn-ghost whitespace-nowrap text-sm"
            disabled={disabled || !queryInput}
            onClick={() => {
              setQueryInput('');
              onChangeFilters({ ...filters, q: undefined });
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div className="flex flex-col">
          <label className="text-xs text-ink-500 dark:text-mist-300">Category</label>
          <select
            value={filters.category ?? ''}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value;
              onChangeFilters({ ...filters, category: v === '' ? undefined : v });
            }}
            className="select mt-1"
          >
            <option value="">Any</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-ink-500 dark:text-mist-300">Min price</label>
          <input
            inputMode="numeric"
            type="number"
            value={minPriceInput}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value;
              setMinPriceInput(v);
              const n = v === '' ? undefined : Number(v);
              commitNumber({ minPrice: Number.isFinite(n) ? n : undefined });
            }}
            className="input mt-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-ink-500 dark:text-mist-300">Max price</label>
          <input
            inputMode="numeric"
            type="number"
            value={maxPriceInput}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value;
              setMaxPriceInput(v);
              const n = v === '' ? undefined : Number(v);
              commitNumber({ maxPrice: Number.isFinite(n) ? n : undefined });
            }}
            className="input mt-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-ink-500 dark:text-mist-300">Min rating</label>
          <select
            value={filters.minRating ?? ''}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value;
              onChangeFilters({ ...filters, minRating: v === '' ? undefined : Number(v) });
            }}
            className="select mt-1"
          >
            <option value="">Any</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
            <option value="4.8">4.8+</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div className="flex flex-col">
          <label className="text-xs text-ink-500 dark:text-mist-300">Discount</label>
          <div className="mt-1 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-mist-200">
              <input
                type="checkbox"
                checked={filters.hasDiscount === true}
                disabled={disabled}
                onChange={(e) => {
                  onChangeFilters({ ...filters, hasDiscount: e.target.checked ? true : undefined });
                }}
              />
              Has discount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-500 dark:text-mist-300">Min %</span>
              <input
                inputMode="numeric"
                type="number"
                min={0}
                max={100}
                value={discountInput}
                disabled={disabled}
                onChange={(e) => {
                  const v = e.target.value;
                  setDiscountInput(v);
                  const n = v === '' ? undefined : Number(v);
                  commitNumber({ discountPercent: Number.isFinite(n) ? n : undefined });
                }}
                className="input w-24"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-ink-500 dark:text-mist-300">Availability</label>
          <label className="mt-2 flex items-center gap-2 text-sm text-ink-700 dark:text-mist-200">
            <input
              type="checkbox"
              checked={filters.inStock === true}
              disabled={disabled}
              onChange={(e) => {
                onChangeFilters({ ...filters, inStock: e.target.checked ? true : undefined });
              }}
            />
            In stock only
          </label>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-ink-500 dark:text-mist-300">Sort</label>
          <select
            value={sort}
            disabled={disabled}
            onChange={(e) => onChangeSort(e.target.value as ProductSort)}
            className="select mt-1"
          >
            <option value="newest">Newest</option>
            <option value="name_asc">Name: A → Z</option>
            <option value="price_asc">Price: low → high</option>
            <option value="price_desc">Price: high → low</option>
            <option value="rating_desc">Rating</option>
          </select>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-ink-500 dark:text-mist-300">Brand</label>
          <button onClick={onReset} disabled={disabled} className="btn btn-ghost text-xs">
            Reset
          </button>
        </div>
        <div className="mt-2 grid max-h-36 grid-cols-2 gap-2 overflow-auto pr-2 sm:grid-cols-3">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm text-ink-700 dark:text-mist-200">
              <input
                type="checkbox"
                disabled={disabled}
                checked={selectedBrands.includes(b)}
                onChange={() => toggleBrand(b)}
              />
              <span className="truncate">{b}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
