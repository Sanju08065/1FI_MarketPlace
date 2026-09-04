import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './lib/logger';
import { apiRateLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/error';
import productRoutes from './modules/products/product.routes';
import imageRoutes from './modules/images/image.routes';
import { openapiSpec } from './docs/openapi';

/** Assembles the Express app. Kept separate from bootstrap for testability. */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // correct client IPs behind Render/Vercel proxies

  // Security & platform middleware
  app.use(
    helmet({
      // allow <img> on the frontend origin to load images from this API
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.corsOrigins,
      methods: ['GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '16kb' }));
  if (!env.isTest) app.use(pinoHttp({ logger }));

  // Health check (unthrottled)
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: { status: 'ok', uptime: process.uptime(), env: env.NODE_ENV },
    });
  });

  // API v1
  app.use('/api/v1', apiRateLimiter);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/images', imageRoutes);

  // Interactive docs
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, { customSiteTitle: '1Fi Marketplace API' }),
  );

  // 404 + centralised error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
