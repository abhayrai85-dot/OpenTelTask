import { test, expect } from '../../fixture/api/api-request-fixture';
import { ApiEndpoints, API_BASE_URL } from '../../enums/shop/apiEndpoints';
import { ProductListSchema } from '../../fixture/api/schemas/shop/productSchema';
import type { Product } from '../../fixture/api/schemas/shop/productSchema';
import { Products } from '../../testdata/products';

// GET /api/recommendations per api-restDocumentation.md section 3. Returns
// the same Product shape as /api/products (verified against the running app).
test.describe('GET /api/recommendations', () => {
  test('should return recommended products for a given context', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Product[]>({
      method: 'GET',
      url: ApiEndpoints.RECOMMENDATIONS,
      baseUrl: API_BASE_URL,
      params: {
        productIds: Products.nationalParkExplorascope.id,
        sessionId: 'api-test-recs-session',
        currencyCode: 'USD',
      },
    });

    expect(status).toBe(200);
    expect(ProductListSchema.parse(body)).toBeTruthy();
  });

  // All three query params are documented as optional -- verified against
  // the running app that a bare call still returns 200.
  test('should return recommendations with no query parameters', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Product[]>({
      method: 'GET',
      url: ApiEndpoints.RECOMMENDATIONS,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(200);
    expect(ProductListSchema.parse(body)).toBeTruthy();
  });

  test('should return 405 for an unsupported method', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.RECOMMENDATIONS,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(405);
  });
});
