const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, trim: true, index: true },
    brand: { type: String, default: '', trim: true, index: true },
    tags: [{ type: String, trim: true, index: true }],
    images: [{ type: String, trim: true }],
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    stockLeft: { type: Number, default: 0, min: 0 },
    // Rating aggregated from product reviews.
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    // Flash deals
    flashDealEndsAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

module.exports = { Product };

