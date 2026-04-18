'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useProductsByIds } from '@/hooks/useProductsByIds';
import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';

type ShippingMode = 'standard' | 'express';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const { currency } = useCurrency();

  const productIds = cart.items.map((i) => i.productId);
  const { byId } = useProductsByIds(productIds);

  const [shipping, setShipping] = useState<ShippingMode>('standard');
  const [promoCode, setPromoCode] = useState('');
  const [placed, setPlaced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    postal: ''
  });

  const subtotal = useMemo(() => {
    return cart.items.reduce((sum, item) => {
      const product = byId.get(item.productId);
      if (!product) return sum;
      const discounted = product.price * (1 - product.discountPercent / 100);
      return sum + discounted * item.quantity;
    }, 0);
  }, [byId, cart.items]);

  const shippingCost = shipping === 'express' ? 12 : 0;

  const promo = promoCode.trim().toUpperCase();
  const promoDiscount = promo === 'NOVAMART10' ? subtotal * 0.1 : 0;
  const promoFreeShip = promo === 'FREESHIP';

  const shippingTotal = promoFreeShip ? 0 : shippingCost;
  const total = Math.max(0, subtotal + shippingTotal - promoDiscount);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email';
    if (!form.address.trim()) next.address = 'Required';
    if (!form.city.trim()) next.city = 'Required';
    if (!form.state.trim()) next.state = 'Required';
    if (!/^\\d{4,10}$/.test(form.zip.trim())) next.zip = 'Enter a ZIP/Postal code';
    if (form.cardNumber.replace(/\\s+/g, '').length < 12) next.cardNumber = 'Enter a card number';
    if (!/^\\d{2}\\/\\d{2}$/.test(form.expiry.trim())) next.expiry = 'Use MM/YY';
    if (form.cvc.trim().length < 3) next.cvc = 'Enter CVC';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="section-title">Checkout</h1>

      {cart.items.length === 0 && !placed ? (
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">
          Cart is empty.{' '}
          <Link className="link" href="/products">
            Browse products
          </Link>
          .
        </div>
      ) : null}

      {placed ? (
        <div className="card space-y-3 p-6">
          <h2 className="font-display text-2xl">Order placed</h2>
          <p className="text-sm text-ink-600 dark:text-mist-200">
            Thanks! This is a frontend-only demo, so no payment was processed.
          </p>
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={() => router.push('/')}>
              Back home
            </button>
            <button className="btn btn-ghost" onClick={() => setPlaced(false)}>
              Place another
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card space-y-5 p-6">
          <div className="space-y-2">
            <h2 className="font-display text-xl">Shipping details</h2>
            <p className="text-sm text-ink-500 dark:text-mist-300">We deliver in 1-7 business days.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <input
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
                placeholder="First name"
              />
              {errors.firstName ? <p className="text-xs text-accent-500">{errors.firstName}</p> : null}
            </div>
            <div className="space-y-1">
              <input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
                placeholder="Last name"
              />
              {errors.lastName ? <p className="text-xs text-accent-500">{errors.lastName}</p> : null}
            </div>
          </div>

          <div className="space-y-1">
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
              placeholder="Email"
            />
            {errors.email ? <p className="text-xs text-accent-500">{errors.email}</p> : null}
          </div>

          <div className="space-y-1">
            <input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
              placeholder="Shipping address"
            />
            {errors.address ? <p className="text-xs text-accent-500">{errors.address}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <input
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
                placeholder="City"
              />
              {errors.city ? <p className="text-xs text-accent-500">{errors.city}</p> : null}
            </div>
            <div className="space-y-1">
              <input
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
                placeholder="State"
              />
              {errors.state ? <p className="text-xs text-accent-500">{errors.state}</p> : null}
            </div>
            <div className="space-y-1">
              <input
                value={form.zip}
                onChange={(e) => setForm((p) => ({ ...p, zip: e.target.value }))}
                className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
                placeholder="ZIP"
              />
              {errors.zip ? <p className="text-xs text-accent-500">{errors.zip}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-xl">Shipping</h2>
            <div className="grid gap-2 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setShipping('standard')}
                className={`btn ${shipping === 'standard' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Standard (3–7 days) • Free
              </button>
              <button
                type="button"
                onClick={() => setShipping('express')}
                className={`btn ${shipping === 'express' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Express (1–2 days) • {formatCurrency(12, currency)}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl">Payment</h2>
            <div className="space-y-1">
              <input
                value={form.cardNumber}
                onChange={(e) => setForm((p) => ({ ...p, cardNumber: e.target.value }))}
                className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
                placeholder="Card number"
              />
              {errors.cardNumber ? <p className="text-xs text-accent-500">{errors.cardNumber}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <input
                  value={form.expiry}
                  onChange={(e) => setForm((p) => ({ ...p, expiry: e.target.value }))}
                  className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
                  placeholder="MM/YY"
                />
                {errors.expiry ? <p className="text-xs text-accent-500">{errors.expiry}</p> : null}
              </div>
              <div className="space-y-1">
                <input
                  value={form.cvc}
                  onChange={(e) => setForm((p) => ({ ...p, cvc: e.target.value }))}
                  className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
                  placeholder="CVC"
                />
                {errors.cvc ? <p className="text-xs text-accent-500">{errors.cvc}</p> : null}
              </div>
              <input
                value={form.postal}
                onChange={(e) => setForm((p) => ({ ...p, postal: e.target.value }))}
                className="rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
                placeholder="Postal"
              />
            </div>
          </div>

          <button
            className="btn btn-primary w-full"
            disabled={cart.items.length === 0}
            onClick={() => {
              if (!validate()) return;
              setPlaced(true);
              cart.clear();
            }}
          >
            Place order
          </button>
        </div>

        <div className="card h-fit space-y-4 p-6">
          <h2 className="font-display text-xl">Order summary</h2>
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Shipping</span>
            <span>{shippingTotal === 0 ? 'Free' : formatCurrency(shippingTotal, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Discount</span>
            <span className="text-accent-500">- {formatCurrency(promoDiscount, currency)}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo code (NOVAMART10 / FREESHIP)"
              className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-800"
            />
          </div>
          <div className="flex items-center justify-between border-t border-mist-200 pt-4 text-sm font-semibold dark:border-ink-700">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
          <p className="text-xs text-ink-500 dark:text-mist-300">Demo checkout only. No real payment is processed.</p>
        </div>
      </div>
    </div>
  );
}

