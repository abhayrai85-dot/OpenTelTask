import { test, expect } from '../../fixture/pages.fixture';
import { Products } from '../../testdata/products';

test.describe('Checkout', () => {
  test('should complete checkout with valid information and show order confirmation', async ({
    productPage,
    cartPage,
    orderConfirmationPage,
  }) => {
    await productPage.goto(Products.solarSystemColorImager.id);
    await productPage.addToCart();
    await cartPage.verifyLoaded();

    await cartPage.placeOrder();

    await orderConfirmationPage.verifyOrderComplete();
    const orderId = await orderConfirmationPage.getOrderId();
    expect(orderId).toMatch(/^[0-9a-f-]{36}$/i);
    await expect(orderConfirmationPage.page).toHaveURL(new RegExp(`/cart/checkout/${orderId}`));
  });

  test('should not place an order when the e-mail address is cleared', async ({ productPage, cartPage }) => {
    await productPage.goto(Products.solarSystemColorImager.id);
    await productPage.addToCart();
    await cartPage.verifyLoaded();

    await cartPage.fillShippingAddress({ email: '' });
    await cartPage.placeOrder();

    // Native form validation should block submission and keep the user on /cart.
    await expect(cartPage.page).toHaveURL(/\/cart$/);
    expect(await cartPage.isEmailFieldInvalid()).toBe(true);
  });

  test('should not place an order when the credit card number format is invalid', async ({ productPage, cartPage }) => {
    await productPage.goto(Products.solarSystemColorImager.id);
    await productPage.addToCart();
    await cartPage.verifyLoaded();

    await cartPage.fillPaymentDetails({ creditCardNumber: '1234' });
    await cartPage.placeOrder();

    await expect(cartPage.page).toHaveURL(/\/cart$/);
    expect(await cartPage.isCreditCardNumberFieldInvalid()).toBe(true);
  });
});
