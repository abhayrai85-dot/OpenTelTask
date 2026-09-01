import { z } from 'zod/v4';
import { test, expect } from '../../fixture/api/api-request-fixture';
import { ApiEndpoints, API_BASE_URL } from '../../enums/shop/apiEndpoints';

// GET /api/currency per api-restDocumentation.md section 8. A bare array of
// ISO 4217 codes -- no envelope, so the schema is defined inline here rather
// than in fixture/api/schemas (nothing else in this app returns a bare
// string array).
const CurrencyListSchema = z.array(z.string().length(3));

test.describe('GET /api/currency', () => {
  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- this is a more
  // severe bug than a status-code mismatch. POST /api/checkout's
  // userCurrency field is never validated against a known currency list --
  // it gets appended to this app's *shared, global* supported-currency
  // registry as-is. Fuzzing checkout with userCurrency values of
  // 123/true/null/undefined (see checkout.spec.ts) has already left "null",
  // "123", "true", and "undefined" as permanent entries in this response on
  // the currently running instance, breaking the 3-char ISO-code contract
  // for every consumer of this endpoint, not just this test run. Confirmed
  // clean (32 valid ISO codes, no junk) before that test ran.
  test('should return the supported currency codes', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<string[]>({
      method: 'GET',
      url: ApiEndpoints.CURRENCY,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(200);
    expect(CurrencyListSchema.parse(body)).toBeTruthy();
    expect(body).toContain('USD');
  });

  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- an unsupported
  // method returns 504 "upstream request timeout" instead of 405. Verified
  // against the running app.
  test('should return 405 for an unsupported method', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.CURRENCY,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(405);
  });
});
