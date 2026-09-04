import { z } from 'zod';

/** Query params for GET /api/v1/products. */
export const listQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
});
export type ListQuery = z.infer<typeof listQuerySchema>;

/** Path param for GET /api/v1/products/:slug. */
export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Invalid product slug'),
});

/** Query for GET /api/v1/products/:slug/emi. */
export const emiQuerySchema = z.object({
  variantId: z.string().uuid('Invalid variant id').optional(),
});
