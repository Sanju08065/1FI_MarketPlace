import type { Response } from 'express';

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Success envelope: `{ success: true, data, meta? }`. */
export function ok<T>(res: Response, data: T, meta?: PageMeta): Response {
  return res.json(meta ? { success: true, data, meta } : { success: true, data });
}

export function buildMeta(total: number, page: number, limit: number): PageMeta {
  return { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
