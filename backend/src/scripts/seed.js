const dotenv = require('dotenv');
dotenv.config();

const bcrypt = require('bcryptjs');
const { connectDb } = require('../config/db');
const { User } = require('../models/User');
const { Seller } = require('../models/Seller');
const { Product } = require('../models/Product');
const { Coupon } = require('../models/Coupon');

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  await connectDb();

  const adminEmail = 'admin@novamart.dev';
  const sellerEmail = 'seller@novamart.dev';
  const password = 'password123';

  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $setOnInsert: {
        name: 'Admin',
        email: adminEmail,
        role: 'admin',
        passwordHash: await bcrypt.hash(password, 10)
      }
    },
    { upsert: true, new: true }
  );

  const sellerUser = await User.findOneAndUpdate(
    { email: sellerEmail },
    {
      $setOnInsert: {
        name: 'Nova Seller',
        email: sellerEmail,
        role: 'seller',
        passwordHash: await bcrypt.hash(password, 10)
      }
    },
    { upsert: true, new: true }
  );

  const seller = await Seller.findOneAndUpdate(
    { ownerUserId: sellerUser._id },
    { $setOnInsert: { ownerUserId: sellerUser._id, displayName: 'Nova Seller' } },
    { upsert: true, new: true }
  );

  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    const categories = ['Electronics', 'Home', 'Beauty', 'Sports', 'Toys', 'Fashion'];
    const brands = ['Nova', 'LiteCo', 'Spark', 'Zen', 'Orbit'];
    const now = Date.now();
    const docs = Array.from({ length: 40 }).map((_, idx) => ({
      sellerId: seller._id,
      title: `Deal Item #${idx + 1}`,
      description: 'Temu-style deal item for demo data.',
      category: pick(categories),
      brand: pick(brands),
      tags: ['deal', 'trending'],
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'],
      price: 10 + Math.round(Math.random() * 120),
      discountPercent: pick([0, 10, 15, 20, 30, 50, 70]),
      stockLeft: 1 + Math.floor(Math.random() * 40),
      flashDealEndsAt: idx < 6 ? new Date(now + 1000 * 60 * 60 * 6) : null
    }));
    await Product.insertMany(docs);
  }

  const existingCoupons = await Coupon.countDocuments();
  if (existingCoupons === 0) {
    await Coupon.insertMany([
      {
        code: 'NOVAMART20',
        type: 'percent',
        value: 20,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        usageLimit: 200,
        minOrderAmount: 25,
        active: true
      },
      {
        code: 'SAVE10',
        type: 'fixed',
        value: 10,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        usageLimit: 100,
        minOrderAmount: 30,
        active: true
      }
    ]);
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete.');
  // eslint-disable-next-line no-console
  console.log(`Admin: ${adminEmail} / ${password}`);
  // eslint-disable-next-line no-console
  console.log(`Seller: ${sellerEmail} / ${password}`);
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

