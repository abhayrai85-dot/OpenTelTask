import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';
import { ProductSchema } from './productSchema';

// POST /api/cart echoes back only productId/quantity per item (verified
// against the running app -- api-restDocumentation.md section 6's example
// matches this).
export const CartItemSchema = z.strictObject({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

// GET /api/cart nests the full product per item -- a real asymmetry with the
// POST response above, not a documentation simplification (verified against
// the running app). See references/examples.md Example 2.
export const CartItemWithProductSchema = CartItemSchema.extend({
  product: ProductSchema,
});

export const CartSchema = z.strictObject({
  userId: z.string(),
  items: z.array(CartItemSchema),
});

export const CartWithProductsSchema = z.strictObject({
  userId: z.string(),
  items: z.array(CartItemWithProductSchema),
});

export type Cart = zOutput<typeof CartSchema>;
export type CartWithProducts = zOutput<typeof CartWithProductsSchema>;
