import { test, expect } from '../../fixture/api/api-request-fixture';
import { ApiEndpoints, API_BASE_URL } from '../../enums/shop/apiEndpoints';
import { ProductSchema, ProductListSchema } from '../../fixture/api/schemas/shop/productSchema';
import type { Product } from '../../fixture/api/schemas/shop/productSchema';
import { Products } from '../../testdata/products';

test.describe('GET /api/products', () => {
  test('should return the product catalog', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Product[]>({
      method: 'GET',
      url: ApiEndpoints.PRODUCTS,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(200);
    expect(ProductListSchema.parse(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('should price the catalog in the requested currency', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Product[]>({
      method: 'GET',
      url: ApiEndpoints.PRODUCTS,
      baseUrl: API_BASE_URL,
      params: { currencyCode: 'USD' },
    });

    expect(status).toBe(200);
    expect(ProductListSchema.parse(body)).toBeTruthy();
    expect(body[0].priceUsd.currencyCode).toBe('USD');
  });

  test('should return 405 for an unsupported method', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'DELETE',
      url: ApiEndpoints.PRODUCTS,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(405);
  });
});

test.describe('GET /api/products/:productId', () => {
  test('should return a single product by id', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Product>({
      method: 'GET',
      url: `${ApiEndpoints.PRODUCTS}/${Products.nationalParkExplorascope.id}`,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(200);
    expect(ProductSchema.parse(body)).toBeTruthy();
    expect(body.id).toBe(Products.nationalParkExplorascope.id);
    expect(body.name).toBe(Products.nationalParkExplorascope.name);
  });

  test('should price the product in the requested currency', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Product>({
      method: 'GET',
      url: `${ApiEndpoints.PRODUCTS}/${Products.nationalParkExplorascope.id}`,
      baseUrl: API_BASE_URL,
      params: { currencyCode: 'USD' },
    });

    expect(status).toBe(200);
    expect(ProductSchema.parse(body)).toBeTruthy();
    expect(body.priceUsd.currencyCode).toBe('USD');
  });

  // BUG: a non-existent productId crashes the route handler and returns 500
  // "Internal Server Error" (plain text) instead of a 404 JSON response.
  // Intentionally left as a failing test (not test.skip) so it shows up red
  // in the run and gets flagged to dev rather than staying invisible.
  test(
    'should return 404 for a non-existent productId',
    { tag: '@api' },
    async ({ apiRequest }) => {
      const { status } = await apiRequest({
        method: 'GET',
        url: `${ApiEndpoints.PRODUCTS}/does-not-exist`,
        baseUrl: API_BASE_URL,
      });

      expect(status).toBe(404);
    }
  );

  // Mandatory per the api-testing skill regardless of whether the doc calls
  // it out. Every value below 500s instead of 404ing -- same root cause as
  // the case above (any productId absent from the catalog crashes the
  // handler). Left failing on purpose, see comment above.
  const invalidProductIds = [
    { description: 'non-existent numeric id', value: '99999' },
    { description: 'boolean-like string', value: 'true' },
    { description: 'special characters / XSS attempt', value: '<script>' },
    { description: 'SQL injection attempt', value: '1 OR 1=1' },
  ];
  for (const { description, value } of invalidProductIds) {
    test(
      `should return 404 for invalid productId - ${description}`,
      { tag: '@api' },
      async ({ apiRequest }) => {
        const { status } = await apiRequest({
          method: 'GET',
          url: `${ApiEndpoints.PRODUCTS}/${encodeURIComponent(value)}`,
          baseUrl: API_BASE_URL,
        });

        expect(status).toBe(404);
      }
    );
  }

  test('should return 405 for an unsupported method', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'DELETE',
      url: `${ApiEndpoints.PRODUCTS}/${Products.nationalParkExplorascope.id}`,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(405);
  });
});
