const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
const { Seller } = require('../models/Seller');
const { signJwt } = require('../middleware/auth');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function register(req, res) {
  const { name, email, password, role } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return res.status(400).json({ message: 'Email is required.' });
  if (String(password || '').length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ message: 'Email is already in use.' });

  // Allow seller signup for local/dev flows.
  const allowSellerSignup = String(process.env.ALLOW_SELLER_SIGNUP || '').toLowerCase() === 'true';
  const nextRole = role === 'seller' && allowSellerSignup ? 'seller' : 'user';

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name: String(name || '').trim(), email: normalizedEmail, passwordHash, role: nextRole });

  if (user.role === 'seller') {
    await Seller.create({
      ownerUserId: user._id,
      displayName: user.name || normalizedEmail.split('@')[0] || 'Seller'
    });
  }

  const token = signJwt({ sub: user._id.toString(), role: user.role });
  res.status(201).json({ token, user: user.toSafeJSON() });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const ok = await bcrypt.compare(String(password || ''), user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

  const token = signJwt({ sub: user._id.toString(), role: user.role });
  res.json({ token, user: user.toSafeJSON() });
}

async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

module.exports = { register, login, me };

