export type ProductId = string;

export type ProductSpecs = Record<string, string | number | boolean | null>;

export interface SellerInfo {
  _id?: string;
  name: string;
  rating: number;
  ratingCount?: number;
}

export interface Product {
  _id: ProductId;
  title: string;
  price: number;
  description: string;
  discountPercent: number;
  rating: number;
  brand: string;
  images: string[];
  category: string;
  stockLeft: number;
  createdAt: string; // ISO string
  seller?: SellerInfo;
  specs?: ProductSpecs;
}

export type ProductSort = 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc' | 'newest';

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
