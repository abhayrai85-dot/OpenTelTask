import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

// GET /api/data per api-restDocumentation.md section 4.
export const AdSchema = z.strictObject({
  redirectUrl: z.string().min(1),
  text: z.string().min(1),
});

export const AdListSchema = z.array(AdSchema);

export type Ad = zOutput<typeof AdSchema>;
