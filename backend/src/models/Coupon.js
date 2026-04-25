const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date, required: true },
    usageLimit: { type: Number, default: 0, min: 0 }, // 0 -> unlimited
    usedCount: { type: Number, default: 0, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = { Coupon };

