const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/error');

const { authRouter } = require('./routes/auth');
const { productsRouter } = require('./routes/products');
const { usersRouter } = require('./routes/users');
const { couponsRouter } = require('./routes/coupons');
const { ordersRouter } = require('./routes/orders');
const { reviewsRouter } = require('./routes/reviews');
const { sellersRouter } = require('./routes/sellers');
const { cartRouter } = require('./routes/cart');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));

  const origin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
  app.use(
    cors({
      origin,
      credentials: true
    })
  );

  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/coupons', couponsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/sellers', sellersRouter);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
