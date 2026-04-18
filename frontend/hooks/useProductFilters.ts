'use client';

import { useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ProductFilters, ProductSort } from '@/types/product';

export interface ProductFiltersState {
  filters: ProductFilters;
  sort: ProductSort;
  setFilters: (next: ProductFilters) => void;
  patchFilters: (patch: Partial<ProductFilters>) => void;
  setSort: (sort: ProductSort) => void;
  reset: () => void;
  isPending: boolean;
}

function parseNumber(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function parseBoolean(raw: string | null): boolean | undefined {
  if (raw === null) return undefined;
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return undefined;
}

function parseBrand(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

function parseSort(raw: string | null): ProductSort {
  if (raw === 'price_asc' || raw === 'price_desc' || raw === 'rating_desc' || raw === 'newest') {
    return raw;
  }
  return 'newest';
}

function serialize(filters: ProductFilters, sort: ProductSort) {
  const sp = new URLSearchParams();

  if (filters.q) sp.set('q', filters.q);
  if (filters.category) sp.set('category', filters.category);
  if (filters.minPrice !== undefined) sp.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) sp.set('maxPrice', String(filters.maxPrice));
  if (filters.minRating !== undefined) sp.set('rating', String(filters.minRating));
  if (filters.brand?.length) sp.set('brand', filters.brand.join(','));
  if (filters.hasDiscount !== undefined) sp.set('hasDiscount', String(filters.hasDiscount));
  if (filters.discountPercent !== undefined) sp.set('discountPercent', String(filters.discountPercent));
  if (filters.inStock !== undefined) sp.set('inStock', String(filters.inStock));
  if (sort) sp.set('sort', sort);

  return sp;
}

export function useProductFilters(): ProductFiltersState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const state = useMemo(() => {
    const filters: ProductFilters = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: parseNumber(searchParams.get('minPrice')),
      maxPrice: parseNumber(searchParams.get('maxPrice')),
      minRating: parseNumber(searchParams.get('minRating')) ?? parseNumber(searchParams.get('rating')),
      brand: parseBrand(searchParams.get('brand')),
      hasDiscount: parseBoolean(searchParams.get('hasDiscount')),
      discountPercent: parseNumber(searchParams.get('discountPercent')),
      inStock: parseBoolean(searchParams.get('inStock'))
    };
    const sort = parseSort(searchParams.get('sort'));
    return { filters, sort };
  }, [searchParams]);

  const apply = (filters: ProductFilters, sort: ProductSort) => {
    const next = serialize(filters, sort);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  };

  return {
    filters: state.filters,
    sort: state.sort,
    setFilters: (next) => apply(next, state.sort),
    patchFilters: (patch) => apply({ ...state.filters, ...patch }, state.sort),
    setSort: (sort) => apply(state.filters, sort),
    reset: () => apply({}, 'newest'),
    isPending
  };
}
