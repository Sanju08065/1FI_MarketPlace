import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { env } from '../config/env';

/** 404 for unmatched routes. Registered after all routes. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

/** Centralised error handler — always JSON, never leaks internals in prod. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  const message =
    env.isProd ? 'Internal server error' : (err as Error)?.message ?? 'Internal server error';
  res.status(500).json({ success: false, error: message });
}
