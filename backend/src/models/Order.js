const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    title: { type: String, required: true },
    image: { type: String, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending', index: true },
    items: { type: [OrderItemSchema], default: [] },
    couponCode: { type: String, default: null },
    discountTotal: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    shippingTotal: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    payment: {
      provider: { type: String, default: 'mock' },
      paymentIntentId: { type: String, default: '' }
    },
    shippingAddress: {
      name: { type: String, default: '' },
      address1: { type: String, default: '' },
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      zip: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

module.exports = { Order };

