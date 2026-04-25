const mongoose = require('mongoose');
const { Product } = require('../models/Product');

/**
 * Simple recommendations:
 * - Use user's recentlyViewed categories/tags as signals
 * - Exclude already viewed items
 * - Fall back to "trending" (rating + discount + newest)
 */
async function getRecommendationsForUser({ user, limit = 12 }) {
  const viewed = (user.recentlyViewed || []).map((id) => new mongoose.Types.ObjectId(id));
  const viewedProducts = viewed.length
    ? await Product.find({ _id: { $in: viewed } }).select('category tags').lean()
    : [];

  const categoryCounts = new Map();
  const tagCounts = new Map();
  for (const p of viewedProducts) {
    if (p.category) categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
    for (const t of p.tags || []) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
  }

  const topCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

  const baseFilter = viewed.length ? { _id: { $nin: viewed } } : {};
  const signalFilter =
    topCategories.length || topTags.length
      ? {
          ...baseFilter,
          $or: [
            ...(topCategories.length ? [{ category: { $in: topCategories } }] : []),
            ...(topTags.length ? [{ tags: { $in: topTags } }] : [])
          ]
        }
      : baseFilter;

  const recs = await Product.find(signalFilter)
    .sort({ ratingAvg: -1, discountPercent: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  if (recs.length) return recs;

  // Fall back to trending
  return Product.find(baseFilter).sort({ ratingAvg: -1, discountPercent: -1, createdAt: -1 }).limit(limit).lean();
}

async function getSimilarProducts({ productId, limit = 8 }) {
  const product = await Product.findById(productId).select('category tags').lean();
  if (!product) return [];
  const filter = {
    _id: { $ne: product._id },
    $or: [{ category: product.category }, ...(product.tags?.length ? [{ tags: { $in: product.tags } }] : [])]
  };
  return Product.find(filter).sort({ ratingAvg: -1, discountPercent: -1 }).limit(limit).lean();
}

module.exports = { getRecommendationsForUser, getSimilarProducts };

