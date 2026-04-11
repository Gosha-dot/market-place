'use client';

import { useCart } from '@/hooks/useCart';
import { useProductsByIds } from '@/hooks/useProductsByIds';
import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';

export default function CartPage() {
  const cart = useCart();
  const { currency } = useCurrency();

  const productIds = cart.items.map((i) => i.productId);
  const { byId, loading } = useProductsByIds(productIds);

  const subtotal = cart.items.reduce((sum, item) => {
    const product = byId.get(item.productId);
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);

  return (
    <div className="space-y-6">
      <h1 className="section-title">Your cart</h1>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {cart.items.length === 0 && (
            <p className="text-sm text-ink-500 dark:text-mist-300">Cart is empty.</p>
          )}

          {cart.items.map((item) => {
            const product = byId.get(item.productId);
            if (!product) {
              return (
                <div key={item.productId} className="card flex items-center justify-between gap-4 p-4">
                  <div className="text-sm text-ink-600 dark:text-mist-200">
                    {loading ? 'Loading item…' : 'Item unavailable'}
                  </div>
                  <button className="btn btn-ghost" onClick={() => cart.remove(item.productId)}>
                    Remove
                  </button>
                </div>
              );
            }

            return (
              <div key={product._id} className="card flex items-center gap-4 p-4">
                <img
                  src={product.images?.[0]}
                  alt={product.title}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-xs text-ink-500 dark:text-mist-300">
                    {formatCurrency(product.price, currency)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="btn btn-ghost"
                      onClick={() => cart.setQuantity(product._id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      className="btn btn-ghost"
                      onClick={() => cart.setQuantity(product._id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="ml-3 text-xs text-ink-500 dark:text-mist-300"
                      onClick={() => cart.remove(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card h-fit p-5">
          <h2 className="font-display text-xl">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <button className="btn btn-primary mt-6 w-full" disabled={cart.items.length === 0}>
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
}

