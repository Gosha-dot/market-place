const { Coupon } = require('../models/Coupon');
const { validateCoupon, normalizeCode } = require('../services/couponService');

async function list(req, res) {
  const items = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json({ items });
}

async function create(req, res) {
  const { code, type, value, expiresAt, usageLimit, minOrderAmount, active } = req.body || {};
  const coupon = await Coupon.create({
    code: normalizeCode(code),
    type,
    value,
    expiresAt: new Date(expiresAt),
    usageLimit: Number(usageLimit || 0),
    minOrderAmount: Number(minOrderAmount || 0),
    active: active !== undefined ? Boolean(active) : true
  });
  res.status(201).json(coupon);
}

async function update(req, res) {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Not found' });

  const patch = req.body || {};
  if (patch.code !== undefined) coupon.code = normalizeCode(patch.code);
  if (patch.type !== undefined) coupon.type = patch.type;
  if (patch.value !== undefined) coupon.value = patch.value;
  if (patch.expiresAt !== undefined) coupon.expiresAt = new Date(patch.expiresAt);
  if (patch.usageLimit !== undefined) coupon.usageLimit = Number(patch.usageLimit || 0);
  if (patch.minOrderAmount !== undefined) coupon.minOrderAmount = Number(patch.minOrderAmount || 0);
  if (patch.active !== undefined) coupon.active = Boolean(patch.active);

  await coupon.save();
  res.json(coupon);
}

async function remove(req, res) {
  await Coupon.deleteOne({ _id: req.params.id });
  res.status(204).end();
}

async function validate(req, res) {
  const { code, subtotal } = req.body || {};
  const result = await validateCoupon({ code, subtotal: Number(subtotal || 0) });
  if (!result.ok) return res.status(400).json({ ok: false, message: result.message });
  res.json({
    ok: true,
    coupon: {
      code: result.coupon.code,
      type: result.coupon.type,
      value: result.coupon.value
    },
    discountTotal: result.discountTotal
  });
}

module.exports = { list, create, update, remove, validate };

