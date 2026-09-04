import { asyncHandler } from '../../lib/asyncHandler';
import { AppError } from '../../lib/AppError';
import { ok } from '../../lib/http';
import * as service from './product.service';
import { emiQuerySchema, listQuerySchema, slugParamSchema } from './product.schema';

export const listProducts = asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const { data, meta } = await service.listProducts(query);
  ok(res, data, meta);
});

export const getProduct = asyncHandler(async (req, res) => {
  const { slug } = slugParamSchema.parse(req.params);
  const product = await service.getProductBySlug(slug);
  if (!product) throw AppError.notFound('Product not found');
  ok(res, product);
});

export const getProductEmi = asyncHandler(async (req, res) => {
  const { slug } = slugParamSchema.parse(req.params);
  const { variantId } = emiQuerySchema.parse(req.query);
  const result = await service.getProductEmi(slug, variantId);
  if (!result) throw AppError.notFound('Product not found');
  ok(res, result);
});
