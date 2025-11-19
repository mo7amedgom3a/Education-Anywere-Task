import app from './app';
import config from './config';
import { connectDB } from './data/mongo';

const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
