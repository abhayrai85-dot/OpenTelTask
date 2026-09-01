import { test, expect } from '../../fixture/pages.fixture';
import { Products } from '../../testdata/products';

test.describe('Product Browsing', () => {
  test('should display hot products with names and prices on the home page', async ({ homePage }) => {
    await homePage.goto();
    await homePage.verifyLoaded();

    expect(await homePage.getProductCount()).toBeGreaterThan(0);
    await expect(homePage.productCard(Products.solarSystemColorImager.name)).toBeVisible();
    expect(await homePage.getProductCardPrice(Products.solarSystemColorImager.name)).toBe(
      Products.solarSystemColorImager.price
    );
  });

  test('should navigate to the product detail page when a product is selected', async ({ homePage, productPage }) => {
    await homePage.goto();
    await homePage.verifyLoaded();

    await homePage.openProduct(Products.solarSystemColorImager.name);

    await expect(productPage.page).toHaveURL(new RegExp(`/product/${Products.solarSystemColorImager.id}`));
    await productPage.waitForLoaded();
    expect(await productPage.getProductName()).toBe(Products.solarSystemColorImager.name);
    expect(await productPage.getProductPrice()).toBe(Products.solarSystemColorImager.price);
  });
});
