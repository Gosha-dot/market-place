const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from env.
 * Keeps the connection logic isolated so tests/scripts can reuse it.
 */
async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);

  return mongoose.connection;
}

module.exports = { connectDb };

