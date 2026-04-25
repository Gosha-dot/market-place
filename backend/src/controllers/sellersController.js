const { Seller } = require('../models/Seller');
const { SellerRating } = require('../models/SellerRating');
const { Order } = require('../models/Order');

async function list(req, res) {
  const items = await Seller.find().sort({ ratingAvg: -1, ratingCount: -1 }).limit(100).lean();
  res.json({ items });
}

async function getById(req, res) {
  const seller = await Seller.findById(req.params.id).lean();
  if (!seller) return res.status(404).json({ message: 'Not found' });
  res.json(seller);
}

async function me(req, res) {
  const seller = await Seller.findOne({ ownerUserId: req.user._id }).lean();
  if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });
  res.json(seller);
}

/**
 * Rate a seller after purchase (requires delivered order containing seller).
 */
async function rate(req, res) {
  const { rating, comment, orderId } = req.body || {};
  const r = Number(rating);
  if (!Number.isFinite(r) || r < 1 || r > 5) return res.status(400).json({ message: 'rating must be 1-5' });
  if (!orderId) return res.status(400).json({ message: 'orderId is required' });

  const seller = await Seller.findById(req.params.id);
  if (!seller) return res.status(404).json({ message: 'Not found' });

  const order = await Order.findOne({ _id: orderId, userId: req.user._id, status: 'delivered' }).lean();
  if (!order) return res.status(400).json({ message: 'Order is not eligible for rating.' });
  const containsSeller = order.items.some((i) => String(i.sellerId) === String(seller._id));
  if (!containsSeller) return res.status(400).json({ message: 'Order does not include this seller.' });

  const created = await SellerRating.create({
    userId: req.user._id,
    sellerId: seller._id,
    orderId,
    rating: r,
    comment: String(comment || '').trim()
  });

  // Recalculate aggregates.
  const agg = await SellerRating.aggregate([
    { $match: { sellerId: seller._id } },
    { $group: { _id: '$sellerId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const stats = agg[0];
  seller.ratingAvg = stats?.avg || 0;
  seller.ratingCount = stats?.count || 0;
  await seller.save();

  res.status(201).json(created);
}

async function ratings(req, res) {
  const items = await SellerRating.find({ sellerId: req.params.id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ items });
}

module.exports = { list, getById, me, rate, ratings };

