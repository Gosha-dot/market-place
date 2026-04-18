export type ProductId = string;

export type ProductSpecs = Record<string, string | number | boolean | null>;

export interface SellerInfo {
  name: string;
  rating: number;
}

export interface Product {
  _id: ProductId;
  title: string;
  price: number;
  discountPercent: number;
  rating: number;
  brand: string;
  images: string[];
  category: string;
  stockLeft: number;
  createdAt: string; // ISO string
  seller?: SellerInfo;
  description?: string;
  specs?: ProductSpecs;
}

export type ProductSort = 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';

export interface ProductFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  brand?: string[];
  hasDiscount?: boolean;
  discountPercent?: number;
  inStock?: boolean;
}

export interface ProductsListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  mongoQuery?: Record<string, unknown>;
  mongoSort?: Record<string, 1 | -1>;
}
