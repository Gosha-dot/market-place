const mongoose = require('mongoose');
const { Cart } = require('../models/Cart');
const { Product } = require('../models/Product');

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((i) => ({
      productId: i.productId,
      quantity: Math.max(1, Math.floor(Number(i.quantity || 1)))
    }))
    .filter((i) => i.productId);
}

async function getCart(req, res) {
  const cart = await Cart.findOne({ userId: req.user._id }).lean();
  res.json({ items: cart?.items || [] });
}

/**
 * Replaces the cart with the provided list (simple, predictable API).
 * The frontend can also keep localStorage cart and only use this endpoint if desired.
 */
async function putCart(req, res) {
  const items = normalizeItems(req.body?.items);

  // Validate product ids exist (basic integrity check)
  const ids = items.map((i) => new mongoose.Types.ObjectId(i.productId));
  const count = ids.length ? await Product.countDocuments({ _id: { $in: ids } }) : 0;
  if (count !== ids.length) return res.status(400).json({ message: 'Invalid productId in cart.' });

  const cart = await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { items } },
    { upsert: true, new: true }
  ).lean();
  res.json({ items: cart.items });
}

async function clearCart(req, res) {
  await Cart.deleteOne({ userId: req.user._id });
  res.status(204).end();
}

module.exports = { getCart, putCart, clearCart };

