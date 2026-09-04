import { z } from 'zod';

export const imageParamSchema = z.object({
  id: z.string().uuid('Invalid image id'),
});

export const imageKeyParamSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Invalid image key'),
});
