import { test, expect } from '../../fixture/api/api-request-fixture';
import { ApiEndpoints, API_BASE_URL } from '../../enums/shop/apiEndpoints';
import { AdListSchema } from '../../fixture/api/schemas/shop/adSchema';
import type { Ad } from '../../fixture/api/schemas/shop/adSchema';

// GET /api/data per api-restDocumentation.md section 4.
test.describe('GET /api/data', () => {
  test('should return ads for the given context keys', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Ad[]>({
      method: 'GET',
      url: ApiEndpoints.DATA,
      baseUrl: API_BASE_URL,
      params: { contextKeys: 'telescope,astronomy' },
    });

    expect(status).toBe(200);
    expect(AdListSchema.parse(body)).toBeTruthy();
  });

  // contextKeys is documented as optional -- verified against the running
  // app that a bare call still returns 200 with a (different) ad set.
  test('should return ads with no context keys', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Ad[]>({
      method: 'GET',
      url: ApiEndpoints.DATA,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(200);
    expect(AdListSchema.parse(body)).toBeTruthy();
  });

  test('should return 405 for an unsupported method', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.DATA,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(405);
  });
});
