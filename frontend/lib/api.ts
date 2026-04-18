import type { ProductsListResponse, Product } from '@/types/product';

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || '/api';

type QueryValue = string | number | boolean | undefined | null | string[];

function toSearchParams(params: Record<string, QueryValue>) {
  const sp = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      sp.set(key, value.join(','));
      return;
    }
    sp.set(key, String(value));
  });

  return sp;
}

export async function fetchProducts(params: Record<string, QueryValue> = {}): Promise<ProductsListResponse> {
  const qs = toSearchParams(params).toString();
  const res = await fetch(`${API_ROOT}/products${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json() as Promise<ProductsListResponse>;
}

export async function fetchProductsPaged(params: Record<string, QueryValue> = {}): Promise<ProductsListResponse> {
  return fetchProducts(params);
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_ROOT}/products/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json() as Promise<Product>;
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_ROOT}/products/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json() as Promise<string[]>;
}

export async function fetchBrands(): Promise<string[]> {
  const res = await fetch(`${API_ROOT}/products/brands`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json() as Promise<string[]>;
}

export async function fetchProductSuggestions(q: string): Promise<string[]> {
  const res = await fetch(`${API_ROOT}/products/suggest?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch suggestions');
  const data = (await res.json()) as { suggestions?: string[] };
  return data.suggestions ?? [];
}
