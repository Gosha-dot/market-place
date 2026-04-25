const mongoose = require('mongoose');
const { Order } = require('../models/Order');
const { Product } = require('../models/Product');
const { Seller } = require('../models/Seller');
const { validateCoupon, incrementCouponUsage } = require('../services/couponService');
const { createPaymentIntentMock } = require('../services/stripeService');

function computeDiscountedPrice({ price, discountPercent }) {
  const discounted = price * (1 - (Number(discountPercent || 0) / 100));
  return Math.max(0, discounted);
}

async function listMine(req, res) {
  const items = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ items });
}

async function getMineById(req, res) {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
}

async function listForSeller(req, res) {
  const seller = await Seller.findOne({ ownerUserId: req.user._id }).lean();
  if (!seller) return res.status(403).json({ message: 'Seller profile not found.' });

  const items = await Order.find({ 'items.sellerId': seller._id }).sort({ createdAt: -1 }).lean();
  res.json({ items });
}

async function updateStatus(req, res) {
  const { status } = req.body || {};
  if (!['pending', 'shipped', 'delivered'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });

  if (req.user.role === 'seller') {
    const seller = await Seller.findOne({ ownerUserId: req.user._id }).lean();
    if (!seller) return res.status(403).json({ message: 'Seller profile not found.' });
    const containsSeller = order.items.some((i) => String(i.sellerId) === String(seller._id));
    if (!containsSeller) return res.status(403).json({ message: 'Forbidden' });
  }

  order.status = status;
  await order.save();
  res.json({ order });
}

/**
 * Checkout endpoint:
 * - Validates products, stock, calculates totals
 * - Applies coupon (if provided)
 * - Creates mock payment intent
 * - Decrements stock and creates order
 */
async function checkout(req, res) {
  const { items, couponCode, shippingAddress, shippingMode } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Cart is empty.' });

  const normalizedItems = items
    .map((i) => ({
      productId: i.productId,
      quantity: Math.max(1, Math.floor(Number(i.quantity || 1)))
    }))
    .filter((i) => i.productId);

  const productIds = normalizedItems.map((i) => new mongoose.Types.ObjectId(i.productId));
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  // Validate all items exist + have stock
  for (const item of normalizedItems) {
    const p = byId.get(String(item.productId));
    if (!p) return res.status(400).json({ message: 'Some items are unavailable.' });
    if (p.stockLeft < item.quantity) return res.status(400).json({ message: `Not enough stock for ${p.title}.` });
  }

  const orderItems = normalizedItems.map((item) => {
    const p = byId.get(String(item.productId));
    return {
      productId: p._id,
      sellerId: p.sellerId,
      title: p.title,
      image: p.images?.[0] || '',
      unitPrice: p.price,
      discountPercent: p.discountPercent || 0,
      quantity: item.quantity
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + computeDiscountedPrice(i) * i.quantity, 0);
  const shippingTotal = String(shippingMode || '').toLowerCase() === 'express' ? 12 : 0;

  let discountTotal = 0;
  let appliedCouponCode = null;
  if (couponCode) {
    const result = await validateCoupon({ code: couponCode, subtotal });
    if (!result.ok) return res.status(400).json({ message: result.message });
    discountTotal = result.discountTotal;
    appliedCouponCode = result.coupon.code;
  }

  const total = Math.max(0, subtotal + shippingTotal - discountTotal);
  const paymentIntent = await createPaymentIntentMock({ amount: Math.round(total * 100), currency: 'usd' });

  // Decrement stock (best-effort atomic-ish using conditional updates)
  for (const item of normalizedItems) {
    const updated = await Product.updateOne(
      { _id: new mongoose.Types.ObjectId(item.productId), stockLeft: { $gte: item.quantity } },
      { $inc: { stockLeft: -item.quantity } }
    );
    if (updated.modifiedCount !== 1) return res.status(409).json({ message: 'Stock changed, please retry.' });
  }

  if (appliedCouponCode) await incrementCouponUsage(appliedCouponCode);

  const order = await Order.create({
    userId: req.user._id,
    status: 'pending',
    items: orderItems,
    couponCode: appliedCouponCode,
    discountTotal,
    subtotal,
    shippingTotal,
    total,
    payment: { provider: 'mock', paymentIntentId: paymentIntent.id },
    shippingAddress: {
      name: String(shippingAddress?.name || ''),
      address1: String(shippingAddress?.address1 || ''),
      city: String(shippingAddress?.city || ''),
      country: String(shippingAddress?.country || ''),
      zip: String(shippingAddress?.zip || '')
    }
  });

  res.status(201).json({ order });
}

module.exports = { listMine, getMineById, listForSeller, checkout, updateStatus };
