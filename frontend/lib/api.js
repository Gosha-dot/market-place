const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/products?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductsPaged({ page = 1, limit = 12, category, maxPrice, minRating } = {}) {
  return fetchProducts({
    page,
    limit,
    category,
    maxPrice,
    minRating
  });
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/products/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
