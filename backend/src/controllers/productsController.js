const mongoose = require('mongoose');
const { Product } = require('../models/Product');
const { Seller } = require('../models/Seller');
const { Review } = require('../models/Review');
const { getRecommendationsForUser, getSimilarProducts } = require('../services/recommendationService');

function parseNumber(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseString(v) {
  return String(v || '').trim();
}

function parseList(v) {
  const s = parseString(v);
  if (!s) return [];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

async function list(req, res) {
  const page = Math.max(1, Math.floor(parseNumber(req.query.page, 1)));
  const limit = Math.min(48, Math.max(1, Math.floor(parseNumber(req.query.limit, 24))));

  const category = parseString(req.query.category);
  const q = parseString(req.query.q);
  const minPrice = parseNumber(req.query.minPrice, null);
  const maxPrice = parseNumber(req.query.maxPrice, null);
  const minRating = parseNumber(req.query.minRating, null);
  const brands = parseList(req.query.brand);
  const hasDiscount = String(req.query.hasDiscount || '').toLowerCase() === 'true';
  const inStock =
    req.query.inStock === undefined ? null : String(req.query.inStock || '').toLowerCase() === 'true';
  const ids = parseList(req.query.ids);
  const flash = String(req.query.flash || '').toLowerCase() === 'true';
  const sort = parseString(req.query.sort) || 'newest';

  const filter = {};
  if (category) filter.category = category;
  if (ids.length) filter._id = { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
  if (flash) filter.flashDealEndsAt = { $gt: new Date() };
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { brand: rx }, { category: rx }, { tags: rx }];
  }
  if (brands.length) filter.brand = { $in: brands };
  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) filter.price.$gte = minPrice;
    if (maxPrice !== null) filter.price.$lte = maxPrice;
  }
  if (minRating !== null) filter.ratingAvg = { $gte: minRating };
  if (hasDiscount) filter.discountPercent = { $gt: 0 };
  if (inStock === true) filter.stockLeft = { $gt: 0 };
  if (inStock === false) filter.stockLeft = { $lte: 0 };

  const total = await Product.countDocuments(filter);
  const sortMap =
    sort === 'price_asc'
      ? { price: 1 }
      : sort === 'price_desc'
        ? { price: -1 }
        : sort === 'rating_desc'
          ? { ratingAvg: -1 }
          : sort === 'name_asc'
            ? { title: 1 }
            : { createdAt: -1 };

  const items = await Product.find(filter)
    .sort(sortMap)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Attach seller info for product cards.
  const sellerIds = [...new Set(items.map((p) => String(p.sellerId)))];
  const sellers = sellerIds.length ? await Seller.find({ _id: { $in: sellerIds } }).lean() : [];
  const sellerById = new Map(sellers.map((s) => [String(s._id), s]));
  const hydrated = items.map((p) => ({
    ...p,
    seller: sellerById.get(String(p.sellerId))
      ? {
          _id: sellerById.get(String(p.sellerId))._id,
          name: sellerById.get(String(p.sellerId)).displayName,
          rating: sellerById.get(String(p.sellerId)).ratingAvg,
          ratingCount: sellerById.get(String(p.sellerId)).ratingCount
        }
      : null,
    rating: p.ratingAvg || 0
  }));

  res.json({ items: hydrated, total, page, limit });
}

async function getById(req, res) {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).json({ message: 'Not found' });

  const seller = await Seller.findById(product.sellerId).lean();
  const hydrated = {
    ...product,
    rating: product.ratingAvg || 0,
    seller: seller
      ? { _id: seller._id, name: seller.displayName, rating: seller.ratingAvg, ratingCount: seller.ratingCount }
      : null
  };
  res.json(hydrated);
}

async function categories(req, res) {
  const cats = await Product.distinct('category');
  res.json(cats.filter(Boolean).sort());
}

async function brands(req, res) {
  const brands = await Product.distinct('brand');
  res.json(brands.filter(Boolean).sort());
}

async function suggestions(req, res) {
  const q = parseString(req.query.q).toLowerCase();
  if (q.length < 2) return res.json({ suggestions: [] });

  const products = await Product.find({ title: new RegExp(q, 'i') }).select('title brand category').limit(10).lean();
  const seen = new Set();
  const suggestions = [];
  const add = (v) => {
    const value = String(v || '').trim();
    if (!value) return;
    const k = value.toLowerCase();
    if (!k.includes(q)) return;
    if (seen.has(k)) return;
    seen.add(k);
    suggestions.push(value);
  };
  for (const p of products) {
    add(p.title);
    add(p.brand);
    add(p.category);
    if (suggestions.length >= 10) break;
  }
  res.json({ suggestions });
}

async function create(req, res) {
  const { title, description, category, brand, tags, images, price, discountPercent, stockLeft, flashDealEndsAt } =
    req.body || {};

  // sellers only (or admin) create products under their seller profile
  const seller = await Seller.findOne({ ownerUserId: req.user._id }).lean();
  if (!seller && req.user.role !== 'admin') return res.status(403).json({ message: 'Seller profile not found.' });

  const sellerId = seller?._id;
  const product = await Product.create({
    sellerId: req.user.role === 'admin' && req.body?.sellerId ? req.body.sellerId : sellerId,
    title: String(title || '').trim(),
    description: String(description || ''),
    category: String(category || '').trim(),
    brand: String(brand || '').trim(),
    tags: Array.isArray(tags) ? tags : [],
    images: Array.isArray(images) ? images : [],
    price: Number(price || 0),
    discountPercent: Number(discountPercent || 0),
    stockLeft: Number(stockLeft || 0),
    flashDealEndsAt: flashDealEndsAt ? new Date(flashDealEndsAt) : null
  });
  res.status(201).json(product);
}

async function update(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });

  if (req.user.role === 'seller') {
    const seller = await Seller.findOne({ ownerUserId: req.user._id }).lean();
    if (!seller || String(product.sellerId) !== String(seller._id)) return res.status(403).json({ message: 'Forbidden' });
  }

  const patch = req.body || {};
  const editable = [
    'title',
    'description',
    'category',
    'brand',
    'tags',
    'images',
    'price',
    'discountPercent',
    'stockLeft',
    'flashDealEndsAt'
  ];
  for (const key of editable) {
    if (patch[key] !== undefined) product[key] = patch[key];
  }

  await product.save();
  res.json(product);
}

async function remove(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });

  if (req.user.role === 'seller') {
    const seller = await Seller.findOne({ ownerUserId: req.user._id }).lean();
    if (!seller || String(product.sellerId) !== String(seller._id)) return res.status(403).json({ message: 'Forbidden' });
  }

  await Product.deleteOne({ _id: product._id });
  await Review.deleteMany({ productId: product._id });
  res.status(204).end();
}

async function recommendations(req, res) {
  const items = await getRecommendationsForUser({ user: req.user, limit: Number(req.query.limit || 12) });
  res.json({ items });
}

async function similar(req, res) {
  const items = await getSimilarProducts({ productId: req.params.id, limit: Number(req.query.limit || 8) });
  res.json({ items });
}

async function mine(req, res) {
  const seller = await Seller.findOne({ ownerUserId: req.user._id }).lean();
  if (!seller) return res.status(403).json({ message: 'Seller profile not found.' });

  const items = await Product.find({ sellerId: seller._id }).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ items });
}

module.exports = {
  list,
  getById,
  categories,
  brands,
  suggestions,
  create,
  update,
  remove,
  recommendations,
  similar,
  mine
};
