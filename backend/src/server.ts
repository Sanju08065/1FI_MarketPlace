import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { connectDb, disconnectDb } from './db/prisma';

async function main(): Promise<void> {
  await connectDb();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(
      `[server] 1Fi Marketplace API on http://localhost:${env.PORT}  (docs: /api/docs)`,
    );
  });

  const shutdown = (signal: string): void => {
    logger.info(`[server] ${signal} received — shutting down gracefully`);
    server.close(() => {
      void disconnectDb().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error({ err }, '[server] failed to start');
  process.exit(1);
});
