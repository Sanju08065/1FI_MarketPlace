import pino from 'pino';
import { env } from '../config/env';

/**
 * Structured logger. Pretty-printed in development, JSON in production
 * (ready for log aggregators like Datadog / CloudWatch).
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),
});
