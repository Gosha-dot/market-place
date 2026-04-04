'use client';

import { useEffect, useState } from 'react';
import { loadCart, saveCart } from '@/lib/cart';
import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const { currency } = useCurrency();

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const updateQty = (id, delta) => {
    const updated = items
      .map((item) =>
        item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
      .filter((item) => item.quantity > 0);
    setItems(updated);
    saveCart(updated);
  };

  const removeItem = (id) => {
    const updated = items.filter((item) => item._id !== id);
    setItems(updated);
    saveCart(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      <h1 className="section-title">Your cart</h1>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {items.length === 0 && <p className="text-sm text-ink-500 dark:text-mist-300">Cart is empty.</p>}
          {items.map((item) => (
            <div key={item._id} className="card flex items-center gap-4 p-4">
              <img src={item.images?.[0]} alt={item.title} className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-ink-500 dark:text-mist-300">
                  {formatCurrency(item.price, currency)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button className="btn btn-ghost" onClick={() => updateQty(item._id, -1)}>-</button>
                  <span className="text-sm">{item.quantity}</span>
                  <button className="btn btn-ghost" onClick={() => updateQty(item._id, 1)}>+</button>
                  <button className="ml-3 text-xs text-ink-500 dark:text-mist-300" onClick={() => removeItem(item._id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
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
          <button className="btn btn-primary mt-6 w-full">Proceed to checkout</button>
        </div>
      </div>
    </div>
  );
}
