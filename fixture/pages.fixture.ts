import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';

type PageFixtures = {
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  orderConfirmationPage: OrderConfirmationPage;
};

/**
 * Extends the base Playwright test with ready-to-use Page Objects so specs
 * don't need to instantiate them by hand.
 */
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  orderConfirmationPage: async ({ page }, use) => {
    await use(new OrderConfirmationPage(page));
  },
});

export { expect } from '@playwright/test';
