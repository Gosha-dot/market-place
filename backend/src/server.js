const dotenv = require('dotenv');
dotenv.config();

const { connectDb } = require('./config/db');
const { createApp } = require('./app');

async function main() {
  await connectDb();
  const app = createApp();

  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

