import { z } from 'zod';

/**
 * Runtime schemas for everything the API returns. Parsing responses through
 * these guarantees the UI never trusts an unexpected shape, and the inferred
 * types are the single source of truth across the app.
 */

export const variantSchema = z.object({
  id: z.string(),
  label: z.string(),
  storage: z.string().nullable(),
  color: z.string().nullable(),
  hexColor: z.string().nullable(),
  finish: z.string().nullable(),
  price: z.number(),
  stock: z.number(),
  inStock: z.boolean(),
  imageUrl: z.string().nullable(),
});
export type Variant = z.infer<typeof variantSchema>;

export const emiPlanSchema = z.object({
  id: z.string(),
  tenureMonths: z.number(),
  interestRate: z.number(),
  isNoCost: z.boolean(),
  monthlyAmount: z.number(),
  totalPayable: z.number(),
  interestPaid: z.number(),
  cashbackAmount: z.number(),
  cashbackLabel: z.string().nullable(),
  effectiveCost: z.number(),
  isRecommended: z.boolean(),
});
export type EmiPlan = z.infer<typeof emiPlanSchema>;

export const productSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  brand: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  mrp: z.number(),
  minPrice: z.number(),
  maxPrice: z.number(),
  discountPercent: z.number(),
  variantCount: z.number(),
  lowestMonthly: z.number().nullable(),
  variants: z.array(variantSchema),
  emiPlans: z.array(emiPlanSchema),
});
export type ProductSummary = z.infer<typeof productSummarySchema>;

export const productDetailSchema = productSummarySchema.extend({
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type ProductDetail = z.infer<typeof productDetailSchema>;

export const pageMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
export type PageMeta = z.infer<typeof pageMetaSchema>;

export const listResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(productSummarySchema),
  meta: pageMetaSchema,
});

export const detailResponseSchema = z.object({
  success: z.literal(true),
  data: productDetailSchema,
});
