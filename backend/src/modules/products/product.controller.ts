import { asyncHandler } from '../../lib/asyncHandler';
import { AppError } from '../../lib/AppError';
import { ok } from '../../lib/http';
import * as service from './product.service';
import { emiQuerySchema, listQuerySchema, slugParamSchema } from './product.schema';

export const listProducts = asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const { data, meta } = await service.listProducts(query);
  // Cache the product list at the CDN/proxy layer for 60 s.
  // stale-while-revalidate=300 lets Cloudflare serve stale content while
  // revalidating in the background — zero latency for the user.
  // Result: O(users × requests) DB queries → O(1 per 60s) globally.
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  ok(res, data, meta);
});

export const getProduct = asyncHandler(async (req, res) => {
  const { slug } = slugParamSchema.parse(req.params);
  const product = await service.getProductBySlug(slug);
  if (!product) throw AppError.notFound('Product not found');
  // Product detail pages are also largely stable — cache for 30 s.
  res.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
  ok(res, product);
});

export const getProductEmi = asyncHandler(async (req, res) => {
  const { slug } = slugParamSchema.parse(req.params);
  const { variantId } = emiQuerySchema.parse(req.query);
  const result = await service.getProductEmi(slug, variantId);
  if (!result) throw AppError.notFound('Product not found');
  ok(res, result);
});
