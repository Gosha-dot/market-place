const mongoose = require('mongoose');
const { User } = require('../models/User');
const { Product } = require('../models/Product');

async function list(req, res) {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(200).lean();
  res.json({ items: users });
}

async function updateRole(req, res) {
  const { role } = req.body || {};
  if (!['user', 'seller', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  user.role = role;
  await user.save();
  res.json({ user: user.toSafeJSON() });
}

/**
 * Adds a product to a user's browse history for recommendations.
 * Keeps only the last 20 items (most recent first).
 */
async function addBrowseHistory(req, res) {
  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ message: 'productId is required' });

  const exists = await Product.exists({ _id: new mongoose.Types.ObjectId(productId) });
  if (!exists) return res.status(400).json({ message: 'Invalid productId' });

  const current = (req.user.recentlyViewed || []).map((id) => String(id));
  const next = [String(productId), ...current.filter((id) => id !== String(productId))].slice(0, 20);
  await User.updateOne({ _id: req.user._id }, { $set: { recentlyViewed: next } });
  res.status(204).end();
}

module.exports = { list, updateRole, addBrowseHistory };

