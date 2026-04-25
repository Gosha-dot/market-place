const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

function signJwt(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function authRequired() {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const [type, token] = header.split(' ');
      if (type !== 'Bearer' || !token) return res.status(401).json({ message: 'Unauthorized' });

      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET is not set');
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.sub).select('-passwordHash');
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { signJwt, authRequired, requireRole };

