/**
 * Operational error with an HTTP status code. Anything thrown that is an
 * AppError is a known, expected failure; everything else is treated as a bug
 * and surfaced as a 500 by the error middleware.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message = 'Bad request', details?: unknown): AppError {
    return new AppError(400, message, details);
  }
  static notFound(message = 'Resource not found'): AppError {
    return new AppError(404, message);
  }
  static tooMany(message = 'Too many requests'): AppError {
    return new AppError(429, message);
  }
  static internal(message = 'Internal server error'): AppError {
    return new AppError(500, message);
  }
}
