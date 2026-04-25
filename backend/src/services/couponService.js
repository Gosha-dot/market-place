const { Coupon } = require('../models/Coupon');

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
}

/**
 * Validates a coupon for an order subtotal.
 * Returns { ok, coupon?, discountTotal?, message? }.
 */
async function validateCoupon({ code, subtotal }) {
  const normalized = normalizeCode(code);
  if (!normalized) return { ok: false, message: 'Coupon code is required.' };

  const coupon = await Coupon.findOne({ code: normalized });
  if (!coupon || !coupon.active) return { ok: false, message: 'Coupon is invalid.' };

  const now = new Date();
  if (coupon.expiresAt.getTime() <= now.getTime()) return { ok: false, message: 'Coupon has expired.' };
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return { ok: false, message: 'Coupon usage limit reached.' };
  if (subtotal < coupon.minOrderAmount) return { ok: false, message: `Minimum order amount is ${coupon.minOrderAmount}.` };

  const discountTotal =
    coupon.type === 'percent'
      ? Math.max(0, Math.min(subtotal, (subtotal * coupon.value) / 100))
      : Math.max(0, Math.min(subtotal, coupon.value));

  return { ok: true, coupon, discountTotal };
}

async function incrementCouponUsage(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return;
  await Coupon.updateOne({ code: normalized }, { $inc: { usedCount: 1 } });
}

module.exports = { validateCoupon, incrementCouponUsage, normalizeCode };

