import type { ProductId } from '@/types/product';

export interface CartItem {
  productId: ProductId;
  quantity: number;
}

export type Wishlist = ProductId[];

