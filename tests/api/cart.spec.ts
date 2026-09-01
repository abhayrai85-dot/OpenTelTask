import { test, expect } from '../../fixture/api/api-request-fixture';
import { ApiEndpoints, API_BASE_URL } from '../../enums/shop/apiEndpoints';
import { CartSchema, CartWithProductsSchema } from '../../fixture/api/schemas/shop/cartSchema';
import type { Cart, CartWithProducts } from '../../fixture/api/schemas/shop/cartSchema';
import { Products } from '../../testdata/products';

function generateTestUserId(): string {
  return `api-test-cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// POST/GET/DELETE /api/cart per api-restDocumentation.md sections 5-7 -- the
// add/retrieve/clear flow section 12 of the doc calls out as critical.
test.describe('Cart add -> retrieve -> clear flow', () => {
  test('should add an item, retrieve it, then clear the cart', { tag: '@api' }, async ({ apiRequest }) => {
    const userId = generateTestUserId();

    await test.step('Add item via POST /api/cart', async () => {
      const { status, body } = await apiRequest<Cart>({
        method: 'POST',
        url: ApiEndpoints.CART,
        baseUrl: API_BASE_URL,
        body: { userId, item: { productId: Products.nationalParkExplorascope.id, quantity: 1 } },
      });

      expect(status).toBe(200);
      // The POST response echoes only productId/quantity per item -- no
      // nested product (verified against the running app).
      expect(CartSchema.parse(body)).toBeTruthy();
      expect(body.userId).toBe(userId);
      expect(body.items).toContainEqual({ productId: Products.nationalParkExplorascope.id, quantity: 1 });
    });

    await test.step('Retrieve cart via GET /api/cart', async () => {
      const { status, body } = await apiRequest<CartWithProducts>({
        method: 'GET',
        url: ApiEndpoints.CART,
        baseUrl: API_BASE_URL,
        params: { sessionId: userId, currencyCode: 'USD' },
      });

      expect(status).toBe(200);
      // Unlike the POST response, GET nests the full product per item
      // (verified against the running app) -- a different schema is used
      // deliberately, not interchangeably with CartSchema.
      expect(CartWithProductsSchema.parse(body)).toBeTruthy();
      expect(body.items).toHaveLength(1);
      expect(body.items[0].product.id).toBe(Products.nationalParkExplorascope.id);
    });

    await test.step('Clear cart via DELETE /api/cart', async () => {
      const { status, body } = await apiRequest<null>({
        method: 'DELETE',
        url: ApiEndpoints.CART,
        baseUrl: API_BASE_URL,
        body: { userId },
      });

      expect(status).toBe(204);
      expect(body).toBeNull();
    });

    await test.step('Confirm the cart is empty via GET /api/cart', async () => {
      const { status, body } = await apiRequest<CartWithProducts>({
        method: 'GET',
        url: ApiEndpoints.CART,
        baseUrl: API_BASE_URL,
        params: { sessionId: userId },
      });

      expect(status).toBe(200);
      expect(body.items).toHaveLength(0);
    });
  });
});

test.describe('POST /api/cart - validation', () => {
  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- an empty body
  // crashes the route and returns 500 "Internal Server Error" instead of
  // 400. Verified against the running app.
  test('should return 400 for an empty body', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.CART,
      baseUrl: API_BASE_URL,
      body: {},
    });

    expect(status).toBe(400);
  });

  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- a body missing the
  // `item` object crashes the route and returns 500 instead of 400.
  // Verified against the running app.
  test('should return 400 when item is missing', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.CART,
      baseUrl: API_BASE_URL,
      body: { userId: generateTestUserId() },
    });

    expect(status).toBe(400);
  });

  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- omitting userId
  // does NOT return 400: the route silently accepts it and stores the
  // literal string "undefined" as the cart's userId (200). Verified against
  // the running app -- a data-integrity bug, not merely a status-code one.
  test('should return 400 when userId is missing', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.CART,
      baseUrl: API_BASE_URL,
      body: { item: { productId: Products.nationalParkExplorascope.id, quantity: 1 } },
    });

    expect(status).toBe(400);
  });

  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- omitting
  // item.productId does NOT return 400: the route silently stores the
  // literal string "undefined" as the productId (200). Verified against the
  // running app.
  test('should return 400 when item.productId is missing', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.CART,
      baseUrl: API_BASE_URL,
      body: { userId: generateTestUserId(), item: { quantity: 1 } },
    });

    expect(status).toBe(400);
  });

  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- item.quantity
  // accepts a non-numeric string and crashes (500); a negative number is
  // accepted outright (200), with no positive-quantity business rule
  // enforced. Verified against the running app for both cases below.
  test('should return 400 when item.quantity is a non-numeric string', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.CART,
      baseUrl: API_BASE_URL,
      body: { userId: generateTestUserId(), item: { productId: Products.nationalParkExplorascope.id, quantity: 'one' } },
    });

    expect(status).toBe(400);
  });

  test('should return 400 when item.quantity is negative', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.CART,
      baseUrl: API_BASE_URL,
      body: { userId: generateTestUserId(), item: { productId: Products.nationalParkExplorascope.id, quantity: -5 } },
    });

    expect(status).toBe(400);
  });

  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- an unsupported
  // method returns 504 "upstream request timeout" instead of 405. Verified
  // against the running app.
  test('should return 405 for an unsupported method', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'PUT',
      url: ApiEndpoints.CART,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(405);
  });
});
