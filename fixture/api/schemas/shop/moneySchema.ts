import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

export const MoneySchema = z.strictObject({
  currencyCode: z.string().length(3),
  units: z.number().int(),
  nanos: z.number().int(),
});

export type Money = zOutput<typeof MoneySchema>;
