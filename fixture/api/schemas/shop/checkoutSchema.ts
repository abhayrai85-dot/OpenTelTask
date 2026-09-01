import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';
import { MoneySchema } from './moneySchema';
import { ProductSchema } from './productSchema';

// Shared by the POST /api/checkout request body and its response's
// shippingAddress, per api-restDocumentation.md section 10.
export const AddressSchema = z.strictObject({
  streetAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  zipCode: z.string().min(1),
});

export const CreditCardSchema = z.strictObject({
  creditCardNumber: z.string().min(1),
  creditCardCvv: z.number().int(),
  creditCardExpirationYear: z.number().int(),
  creditCardExpirationMonth: z.number().int(),
});

export const CheckoutRequestSchema = z.strictObject({
  userId: z.string().min(1),
  userCurrency: z.string().length(3),
  address: AddressSchema,
  email: z.string().email(),
  creditCard: CreditCardSchema,
});

const OrderItemSchema = z.strictObject({
  cost: MoneySchema,
  item: z.strictObject({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    // Verified against the running app: the full product is nested here,
    // not just { id, name } as section 10's example shows -- the doc's JSON
    // sample is abbreviated for readability, not a smaller contract.
    product: ProductSchema,
  }),
});

export const CheckoutResponseSchema = z.strictObject({
  orderId: z.string().min(1),
  shippingTrackingId: z.string().min(1),
  shippingCost: MoneySchema,
  shippingAddress: AddressSchema,
  items: z.array(OrderItemSchema),
});

export type CheckoutRequest = zOutput<typeof CheckoutRequestSchema>;
export type CheckoutResponse = zOutput<typeof CheckoutResponseSchema>;
