import type { Request, Response } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { AppError } from '../../lib/AppError';
import { findImageById, findImageByKey } from './image.repository';
import { imageKeyParamSchema, imageParamSchema } from './image.schema';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type ImageRecord = NonNullable<Awaited<ReturnType<typeof findImageById>>>;

/**
 * In-process LRU image buffer cache.
 *
 * Data structure: Map<id, ImageRecord>
 *
 * Why Map (not plain object):
 *   - O(1) get/set/delete with no prototype chain overhead.
 *   - ES2015+ Maps preserve insertion order — the oldest entry is always
 *     Map.keys().next().value, so LRU eviction is O(1) with no extra tracking.
 *
 * LRU eviction strategy:
 *   - On every read, delete + re-insert the entry to move it to the "newest"
 *     position (insertion-order refresh). The oldest entry is always at the
 *     front (first key in iteration order).
 *   - When the cache exceeds MAX_ENTRIES, delete the first (oldest) key.
 *
 * Capacity: MAX_ENTRIES = 50. At ~1.5 MB avg per image that's ~75 MB max —
 * well within the 512 MB Render free tier. Immutable images never need
 * invalidation, so no TTL is required.
 *
 * Result: O(n) DB fetches → O(1) memory reads after the first load per image.
 */
const MAX_ENTRIES = 50;
const imageCache = new Map<string, ImageRecord>();

function cacheGet(key: string): ImageRecord | undefined {
  const entry = imageCache.get(key);
  if (!entry) return undefined;
  // LRU refresh: move to "newest" position by delete + re-insert.
  imageCache.delete(key);
  imageCache.set(key, entry);
  return entry;
}

function cacheSet(key: string, value: ImageRecord): void {
  // Evict oldest entry (first key in insertion order) when at capacity.
  if (imageCache.size >= MAX_ENTRIES) {
    const oldest = imageCache.keys().next().value;
    if (oldest !== undefined) imageCache.delete(oldest);
  }
  imageCache.set(key, value);
}

/** Streams image bytes with aggressive caching + ETag / 304 support. */
function sendImage(req: Request, res: Response, image: ImageRecord): void {
  const etag = `"${image.id}"`;
  if (req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }
  res.set({
    'Content-Type': image.mimeType,
    'Content-Length': String(image.byteSize),
    'Cache-Control': `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
    ETag: etag,
    'Last-Modified': image.createdAt.toUTCString(),
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(image.data);
}

/** GET /api/v1/images/:id */
export const serveImage = asyncHandler(async (req, res) => {
  const { id } = imageParamSchema.parse(req.params);

  // Check in-process LRU cache first — O(1), no DB round trip.
  const cached = cacheGet(id);
  if (cached) {
    sendImage(req, res, cached);
    return;
  }

  const image = await findImageById(id);
  if (!image) throw AppError.notFound('Image not found');

  cacheSet(id, image);
  sendImage(req, res, image);
});

/** GET /api/v1/images/by-key/:key */
export const serveImageByKey = asyncHandler(async (req, res) => {
  const { key } = imageKeyParamSchema.parse(req.params);

  // Use key as the cache lookup — also O(1).
  const cached = cacheGet(key);
  if (cached) {
    sendImage(req, res, cached);
    return;
  }

  const image = await findImageByKey(key);
  if (!image) throw AppError.notFound('Image not found');

  cacheSet(key, image);
  sendImage(req, res, image);
});
