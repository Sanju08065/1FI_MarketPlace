import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../lib/logger';

/**
 * Single shared Prisma client. In dev we reuse it across hot reloads to avoid
 * exhausting the connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev ? ['warn', 'error'] : ['error'],
  });

if (env.isDev) globalForPrisma.prisma = prisma;

export async function connectDb(): Promise<void> {
  await prisma.$connect();
  logger.info('[db] PostgreSQL connected');
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
  logger.info('[db] PostgreSQL disconnected');
}
