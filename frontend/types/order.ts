export type OrderStatus = 'pending' | 'shipped' | 'delivered';

export type OrderItem = {
  productId: string;
  sellerId: string;
  title: string;
  image?: string;
  unitPrice: number;
  discountPercent: number;
  quantity: number;
};

export type Order = {
  _id: string;
  status: OrderStatus;
  items: OrderItem[];
  couponCode?: string | null;
  discountTotal: number;
  subtotal: number;
  shippingTotal: number;
  total: number;
  createdAt: string;
};

