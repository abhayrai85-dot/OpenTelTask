import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';
import { MoneySchema } from './moneySchema';

// Mirrors GET /api/products and GET /api/products/[productId] per
// api-restDocumentation.md sections 1-2. Also reused as-is for
// GET /api/recommendations (section 3), which returns the same shape.
export const ProductSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  picture: z.string(),
  priceUsd: MoneySchema,
  categories: z.array(z.string()),
});

export const ProductListSchema = z.array(ProductSchema);

export type Product = zOutput<typeof ProductSchema>;
