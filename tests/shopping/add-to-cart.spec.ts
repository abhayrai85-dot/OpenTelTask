import { test, expect } from '../../fixture/pages.fixture';
import { Products } from '../../testdata/products';

test.describe('Add To Cart', () => {
  test('should add a product to the cart from the product detail page', async ({ productPage, cartPage }) => {
    await productPage.goto(Products.solarSystemColorImager.id);

    await productPage.addToCart();

    await cartPage.verifyLoaded();
    await cartPage.waitForItemInCart(Products.solarSystemColorImager.name);
    expect(await cartPage.getItemQuantity(Products.solarSystemColorImager.name)).toBe('1');
    expect(await cartPage.getItemTotal(Products.solarSystemColorImager.name)).toBe(
      Products.solarSystemColorImager.price
    );
  });

  test('should add multiple different products and reflect them all in the cart', async ({ productPage, cartPage }) => {
    await productPage.goto(Products.solarSystemColorImager.id);
    await productPage.addToCart();

    await productPage.goto(Products.nationalParkExplorascope.id);
    await productPage.addToCart();

    await cartPage.verifyLoaded();
    await cartPage.waitForItemInCart(Products.solarSystemColorImager.name);
    await cartPage.waitForItemInCart(Products.nationalParkExplorascope.name);

    const subtotal =
      parseFloat(Products.solarSystemColorImager.price.replace(/[^0-9.]/g, '')) +
      parseFloat(Products.nationalParkExplorascope.price.replace(/[^0-9.]/g, ''));
    // Shipping is calculated slightly after the item rows render, so poll for it to settle
    // rather than reading the grand total once.
    await expect
      .poll(async () => parseFloat((await cartPage.getGrandTotal()).replace(/[^0-9.]/g, '')))
      .toBeGreaterThan(subtotal);
  });

  test('should update the item quantity in the cart and recalculate its total', async ({ productPage, cartPage }) => {
    await productPage.goto(Products.solarSystemColorImager.id);
    await productPage.addToCart();
    await cartPage.verifyLoaded();

    await cartPage.setItemQuantity(Products.solarSystemColorImager.name, 3);

    expect(await cartPage.getItemQuantity(Products.solarSystemColorImager.name)).toBe('3');
    expect(await cartPage.getItemTotal(Products.solarSystemColorImager.name)).toBe('$ 525.00');
  });
});
