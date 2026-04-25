const mongoose = require('mongoose');

const SellerRatingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

SellerRatingSchema.index({ userId: 1, sellerId: 1, orderId: 1 }, { unique: true });

const SellerRating = mongoose.model('SellerRating', SellerRatingSchema);

module.exports = { SellerRating };

