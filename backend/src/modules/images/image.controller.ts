import type { Request, Response } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { AppError } from '../../lib/AppError';
import { findImageById, findImageByKey } from './image.repository';
import { imageKeyParamSchema, imageParamSchema } from './image.schema';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type ImageRecord = NonNullable<Awaited<ReturnType<typeof findImageById>>>;

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
  const image = await findImageById(id);
  if (!image) throw AppError.notFound('Image not found');
  sendImage(req, res, image);
});

/** GET /api/v1/images/by-key/:key — stable URL for site imagery (e.g. banner). */
export const serveImageByKey = asyncHandler(async (req, res) => {
  const { key } = imageKeyParamSchema.parse(req.params);
  const image = await findImageByKey(key);
  if (!image) throw AppError.notFound('Image not found');
  sendImage(req, res, image);
});
