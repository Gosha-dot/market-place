const { Review } = require('../models/Review');
const { Product } = require('../models/Product');

async function listByProduct(req, res) {
  const items = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ items });
}

async function create(req, res) {
  const { productId, rating, title, body } = req.body || {};
  if (!productId) return res.status(400).json({ message: 'productId is required' });
  const r = Number(rating);
  if (!Number.isFinite(r) || r < 1 || r > 5) return res.status(400).json({ message: 'rating must be 1-5' });

  const review = await Review.create({
    userId: req.user._id,
    productId,
    rating: r,
    title: String(title || '').trim(),
    body: String(body || '').trim()
  });

  // Update product rating aggregates (recalculate is simplest for MVP).
  const agg = await Review.aggregate([
    { $match: { productId: review.productId } },
    { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const stats = agg[0];
  await Product.updateOne(
    { _id: review.productId },
    { $set: { ratingAvg: stats?.avg || 0, ratingCount: stats?.count || 0 } }
  );

  res.status(201).json(review);
}

module.exports = { listByProduct, create };

