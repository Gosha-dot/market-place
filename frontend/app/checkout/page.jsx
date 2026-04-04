'use client';

import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';

export default function CheckoutPage() {
  const { currency } = useCurrency();
  const subtotal = 248;
  const discount = 34;
  const total = subtotal - discount;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="section-title">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card space-y-5 p-6">
          <div className="space-y-2">
            <h2 className="font-display text-xl">Shipping details</h2>
            <p className="text-sm text-ink-500 dark:text-mist-300">We deliver in 3-7 business days.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="First name" />
            <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="Last name" />
          </div>
          <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="Email" />
          <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="Shipping address" />
          <div className="grid gap-4 md:grid-cols-3">
            <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="City" />
            <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="State" />
            <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="ZIP" />
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-xl">Payment</h2>
            <input className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="Card number" />
            <div className="grid gap-4 md:grid-cols-3">
              <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="MM/YY" />
              <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="CVC" />
              <input className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="Postal" />
            </div>
          </div>
          <button className="btn btn-primary w-full">Place order</button>
        </div>
        <div className="card h-fit space-y-4 p-6">
          <h2 className="font-display text-xl">Order summary</h2>
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Discount</span>
            <span className="text-accent-500">- {formatCurrency(discount, currency)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-mist-200 pt-4 text-sm font-semibold dark:border-ink-700">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
          <p className="text-xs text-ink-500 dark:text-mist-300">
            Your payment will be processed securely. You can cancel any time before shipment.
          </p>
        </div>
      </div>
    </div>
  );
}
