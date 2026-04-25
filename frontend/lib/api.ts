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

type ApiUser = {
  _id: string;
  name?: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
};

type AuthResponse = { token: string; user: ApiUser };

async function apiFetch<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {}
): Promise<T> {
  const res = await fetch(`${API_ROOT}${path}`, {
    method: opts.method || (opts.body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store'
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || 'Request failed');
  }

  // 204
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiRegister(args: {
  name: string;
  email: string;
  password: string;
  role?: 'seller';
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: args });
}

export async function apiLogin(args: { email: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: args });
}

export async function apiMe(token: string): Promise<{ user: ApiUser }> {
  return apiFetch<{ user: ApiUser }>('/auth/me', { token });
}

export async function apiValidateCoupon(
  token: string,
  args: { code: string; subtotal: number }
): Promise<{ ok: true; coupon: { code: string; type: 'percent' | 'fixed'; value: number }; discountTotal: number }> {
  return apiFetch('/coupons/validate', { method: 'POST', token, body: args });
}

export async function apiCheckout(
  token: string,
  args: {
    items: { productId: string; quantity: number }[];
    couponCode?: string | null;
    shippingMode?: 'standard' | 'express';
    shippingAddress?: { name?: string; address1?: string; city?: string; country?: string; zip?: string };
  }
): Promise<{ order: unknown }> {
  return apiFetch('/orders/checkout', { method: 'POST', token, body: args });
}

export async function apiMyOrders(token: string): Promise<{ items: unknown[] }> {
  return apiFetch('/orders/mine', { token });
}

export async function apiMyOrder(token: string, id: string): Promise<unknown> {
  return apiFetch(`/orders/mine/${encodeURIComponent(id)}`, { token });
}

export async function apiSellerOrders(token: string): Promise<{ items: unknown[] }> {
  return apiFetch('/orders/seller', { token });
}

export async function apiSellerProducts(token: string): Promise<{ items: Product[] }> {
  return apiFetch('/products/mine', { token });
}

export async function apiSellerMe(token: string): Promise<any> {
  return apiFetch('/sellers/me', { token });
}

export async function apiUpdateOrderStatus(
  token: string,
  orderId: string,
  status: 'pending' | 'shipped' | 'delivered'
): Promise<{ order: unknown }> {
  return apiFetch(`/orders/${encodeURIComponent(orderId)}/status`, { method: 'PATCH', token, body: { status } });
}

export async function apiRecommendations(token: string, limit = 12): Promise<{ items: Product[] }> {
  return apiFetch(`/products/recommendations?limit=${encodeURIComponent(String(limit))}`, { token });
}

export async function apiSimilar(productId: string, limit = 8): Promise<{ items: Product[] }> {
  return apiFetch(`/products/${encodeURIComponent(productId)}/similar?limit=${encodeURIComponent(String(limit))}`);
}

export async function apiAddBrowseHistory(token: string, productId: string): Promise<void> {
  return apiFetch('/users/me/browse', { method: 'POST', token, body: { productId } });
}

export async function apiProductReviews(productId: string): Promise<{ items: unknown[] }> {
  return apiFetch(`/reviews/product/${encodeURIComponent(productId)}`);
}

export async function apiCreateProductReview(
  token: string,
  args: { productId: string; rating: number; title?: string; body?: string }
): Promise<unknown> {
  return apiFetch('/reviews', { method: 'POST', token, body: args });
}

export async function apiRateSeller(
  token: string,
  sellerId: string,
  args: { orderId: string; rating: number; comment?: string }
): Promise<unknown> {
  return apiFetch(`/sellers/${encodeURIComponent(sellerId)}/ratings`, { method: 'POST', token, body: args });
}

export async function apiSellerById(sellerId: string): Promise<any> {
  return apiFetch(`/sellers/${encodeURIComponent(sellerId)}`);
}

export async function apiSellerRatings(sellerId: string): Promise<{ items: any[] }> {
  return apiFetch(`/sellers/${encodeURIComponent(sellerId)}/ratings`);
}

export async function apiAdminCoupons(token: string): Promise<{ items: any[] }> {
  return apiFetch('/coupons', { token });
}

export async function apiAdminCreateCoupon(
  token: string,
  args: {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    expiresAt: string;
    usageLimit?: number;
    minOrderAmount?: number;
    active?: boolean;
  }
): Promise<any> {
  return apiFetch('/coupons', { method: 'POST', token, body: args });
}

export type { ApiUser, AuthResponse };
