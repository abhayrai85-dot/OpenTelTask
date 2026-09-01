import { test, expect } from '../../fixture/pages.fixture';
import { Products } from '../../testdata/products';

test.describe('Cart Management', () => {
  test('should empty the cart and display the empty cart state', async ({ productPage, cartPage }) => {
    await productPage.goto(Products.solarSystemColorImager.id);
    await productPage.addToCart();
    await cartPage.verifyLoaded();

    await cartPage.emptyCart();

    await cartPage.verifyEmpty();
    await cartPage.waitForItemRemoved(Products.solarSystemColorImager.name);
  });

  test('should navigate to the home page from an empty cart via Continue Shopping', async ({ cartPage, homePage }) => {
    await cartPage.goto();
    await cartPage.verifyEmpty();

    await cartPage.clickContinueShopping();

    await expect(cartPage.page).toHaveURL(/\/$/);
    await homePage.verifyLoaded();
  });
});
