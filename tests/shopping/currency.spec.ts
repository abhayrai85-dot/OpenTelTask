import { test, expect } from '../../fixture/pages.fixture';
import { Products } from '../../testdata/products';

test.describe('Currency Selection', () => {
  test('should update displayed product prices when the currency is changed', async ({ homePage }) => {
    await homePage.goto();
    await homePage.verifyLoaded();

    const originalPrice = await homePage.getProductCardPrice(Products.solarSystemColorImager.name);
    expect(originalPrice.startsWith('$')).toBe(true);

    await homePage.header.selectCurrency('EUR');

    await expect(async () => {
      const updatedPrice = await homePage.getProductCardPrice(Products.solarSystemColorImager.name);
      // [Healer Agent 2026-09-01] Fixed expected currency symbol: test selects EUR but asserted '£' (GBP) — see HEALER_REPORT.md
      expect(updatedPrice.startsWith('€')).toBe(true);
      expect(updatedPrice).not.toBe(originalPrice);
    }).toPass();
  });
});
