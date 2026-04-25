'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useProductsByIds } from '@/hooks/useProductsByIds';
import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/hooks/useAuth';
import { apiCheckout, apiValidateCoupon } from '@/lib/api';

type ShippingMode = 'standard' | 'express';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const { currency } = useCurrency();
  const auth = useAuth();

  const productIds = cart.items.map((i) => i.productId);
  const { byId } = useProductsByIds(productIds);

  const [shipping, setShipping] = useState<ShippingMode>('standard');
  const [promoCode, setPromoCode] = useState('');
  const [placed, setPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coupon, setCoupon] = useState<{ code: string; discountTotal: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

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

  const shippingTotal = shippingCost;
  const promoDiscount = coupon?.discountTotal || 0;
  const total = Math.max(0, subtotal + shippingTotal - promoDiscount);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email';
    if (!form.address.trim()) next.address = 'Required';
    if (!form.city.trim()) next.city = 'Required';
    if (!form.state.trim()) next.state = 'Required';
    if (!/^\d{4,10}$/.test(form.zip.trim())) next.zip = 'Enter a ZIP/Postal code';
    if (form.cardNumber.replace(/\s+/g, '').length < 12) next.cardNumber = 'Enter a card number';
    if (!/^\d{2}\/\d{2}$/.test(form.expiry.trim())) next.expiry = 'Use MM/YY';
    if (form.cvc.trim().length < 3) next.cvc = 'Enter CVC';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="section-title">Checkout</h1>

      {!auth.user ? (
        <div className="card p-6 text-sm text-ink-600 dark:text-mist-200">
          <Link className="link" href="/auth/login">
            Sign in
          </Link>{' '}
          to checkout and access coupons + order history.
        </div>
      ) : null}

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
            Thanks! Payment is mocked for this MVP.
          </p>
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={() => router.push('/')}>
              Back home
            </button>
            <button className="btn btn-ghost" onClick={() => router.push(placedOrderId ? `/orders/${placedOrderId}` : '/orders')}>
              View order
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
                className="input px-4 py-3"
                placeholder="First name"
              />
              {errors.firstName ? <p className="text-xs text-accent-500">{errors.firstName}</p> : null}
            </div>
            <div className="space-y-1">
              <input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                className="input px-4 py-3"
                placeholder="Last name"
              />
              {errors.lastName ? <p className="text-xs text-accent-500">{errors.lastName}</p> : null}
            </div>
          </div>

          <div className="space-y-1">
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="input px-4 py-3"
              placeholder="Email"
            />
            {errors.email ? <p className="text-xs text-accent-500">{errors.email}</p> : null}
          </div>

          <div className="space-y-1">
            <input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="input px-4 py-3"
              placeholder="Shipping address"
            />
            {errors.address ? <p className="text-xs text-accent-500">{errors.address}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <input
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="input px-4 py-3"
                placeholder="City"
              />
              {errors.city ? <p className="text-xs text-accent-500">{errors.city}</p> : null}
            </div>
            <div className="space-y-1">
              <input
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                className="input px-4 py-3"
                placeholder="State"
              />
              {errors.state ? <p className="text-xs text-accent-500">{errors.state}</p> : null}
            </div>
            <div className="space-y-1">
              <input
                value={form.zip}
                onChange={(e) => setForm((p) => ({ ...p, zip: e.target.value }))}
                className="input px-4 py-3"
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
                className="input px-4 py-3"
                placeholder="Card number"
              />
              {errors.cardNumber ? <p className="text-xs text-accent-500">{errors.cardNumber}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <input
                  value={form.expiry}
                  onChange={(e) => setForm((p) => ({ ...p, expiry: e.target.value }))}
                  className="input px-4 py-3"
                  placeholder="MM/YY"
                />
                {errors.expiry ? <p className="text-xs text-accent-500">{errors.expiry}</p> : null}
              </div>
              <div className="space-y-1">
                <input
                  value={form.cvc}
                  onChange={(e) => setForm((p) => ({ ...p, cvc: e.target.value }))}
                  className="input px-4 py-3"
                  placeholder="CVC"
                />
                {errors.cvc ? <p className="text-xs text-accent-500">{errors.cvc}</p> : null}
              </div>
              <input
                value={form.postal}
                onChange={(e) => setForm((p) => ({ ...p, postal: e.target.value }))}
                className="input px-4 py-3"
                placeholder="Postal"
              />
            </div>
          </div>

          <button
            className="btn btn-primary w-full"
            disabled={cart.items.length === 0 || !auth.token}
            onClick={async () => {
              if (!validate()) return;
              if (!auth.token) return;

              const payload = {
                items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                couponCode: coupon?.code || null,
                shippingMode: shipping,
                shippingAddress: {
                  name: `${form.firstName} ${form.lastName}`.trim(),
                  address1: form.address,
                  city: form.city,
                  country: 'US',
                  zip: form.zip
                }
              } as const;

              try {
                const res = await apiCheckout(auth.token, payload);
                const orderId = (res as any)?.order?._id ? String((res as any).order._id) : null;
                setPlacedOrderId(orderId);
                setPlaced(true);
                cart.clear();
              } catch (err) {
                setErrors((prev) => ({
                  ...prev,
                  checkout: err instanceof Error ? err.message : 'Checkout failed.'
                }));
              }
            }}
          >
            Place order
          </button>
          {errors.checkout ? <p className="text-xs text-accent-500">{errors.checkout}</p> : null}
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
              onChange={(e) => {
                setPromoCode(e.target.value);
                setCoupon(null);
                setCouponError(null);
              }}
              placeholder="Coupon code (e.g. NOVAMART20)"
              className="input px-4 py-3"
            />
            <button
              className="btn btn-ghost"
              disabled={!auth.token || !promoCode.trim() || couponLoading}
              onClick={async () => {
                if (!auth.token) return;
                setCouponError(null);
                setCouponLoading(true);
                try {
                  const res = await apiValidateCoupon(auth.token, { code: promoCode, subtotal });
                  setCoupon({ code: res.coupon.code, discountTotal: res.discountTotal });
                } catch (err) {
                  setCoupon(null);
                  setCouponError(err instanceof Error ? err.message : 'Coupon failed.');
                } finally {
                  setCouponLoading(false);
                }
              }}
            >
              {couponLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {coupon ? <p className="text-xs text-ink-600 dark:text-mist-200">Applied: {coupon.code}</p> : null}
          {couponError ? <p className="text-xs text-accent-500">{couponError}</p> : null}
          <div className="flex items-center justify-between border-t border-mist-200 pt-4 text-sm font-semibold dark:border-ink-700">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
          <p className="text-xs text-ink-500 dark:text-mist-300">Stripe is mocked for the MVP. No real payment is processed.</p>
        </div>
      </div>
    </div>
  );
}

