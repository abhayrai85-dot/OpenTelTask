import { test, expect } from '../../fixture/api/api-request-fixture';
import { ApiEndpoints, API_BASE_URL } from '../../enums/shop/apiEndpoints';
import { MoneySchema } from '../../fixture/api/schemas/shop/moneySchema';
import type { Money } from '../../fixture/api/schemas/shop/moneySchema';
import { Products } from '../../testdata/products';

// GET /api/shipping per api-restDocumentation.md section 9. itemList and
// address are JSON-encoded query-string values, not a request body.
const validParams = {
  itemList: JSON.stringify([{ productId: Products.nationalParkExplorascope.id, quantity: 1 }]),
  address: JSON.stringify({
    streetAddress: '1600 Amphitheatre Parkway',
    city: 'Mountain View',
    state: 'CA',
    country: 'USA',
    zipCode: '94043',
  }),
};

test.describe('GET /api/shipping', () => {
  test('should return a shipping quote for the given items and address', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Money>({
      method: 'GET',
      url: ApiEndpoints.SHIPPING,
      baseUrl: API_BASE_URL,
      params: { ...validParams, currencyCode: 'USD' },
    });

    expect(status).toBe(200);
    expect(MoneySchema.parse(body)).toBeTruthy();
    expect(body.currencyCode).toBe('USD');
  });

  test('should default the currency when currencyCode is omitted', { tag: '@api' }, async ({ apiRequest }) => {
    const { status, body } = await apiRequest<Money>({
      method: 'GET',
      url: ApiEndpoints.SHIPPING,
      baseUrl: API_BASE_URL,
      params: validParams,
    });

    expect(status).toBe(200);
    expect(MoneySchema.parse(body)).toBeTruthy();
  });

  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- both required
  // params below crash the route (missing itemList, and a non-JSON address
  // string) and return 500 "Internal Server Error" instead of 400. Verified
  // against the running app.
  const requiredParamCases: Array<{ description: string; params: Record<string, string> }> = [
    { description: 'itemList missing', params: { address: validParams.address } },
    { description: 'address is not valid JSON', params: { itemList: validParams.itemList, address: 'not-json' } },
  ];
  for (const { description, params } of requiredParamCases) {
    test(`should return 400 when ${description}`, { tag: '@api' }, async ({ apiRequest }) => {
      const { status } = await apiRequest({
        method: 'GET',
        url: ApiEndpoints.SHIPPING,
        baseUrl: API_BASE_URL,
        params,
      });

      expect(status).toBe(400);
    });
  }

  // FIXME: https://github.com/<org>/<repo>/issues/TBD -- an unsupported
  // method returns 504 "upstream request timeout" instead of 405. Verified
  // against the running app.
  test('should return 405 for an unsupported method', { tag: '@api' }, async ({ apiRequest }) => {
    const { status } = await apiRequest({
      method: 'POST',
      url: ApiEndpoints.SHIPPING,
      baseUrl: API_BASE_URL,
    });

    expect(status).toBe(405);
  });
});
