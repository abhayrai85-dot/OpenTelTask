import { Locator, Page, expect } from '@playwright/test';
import { HeaderComponent } from './HeaderComponent';

/**
 * Order confirmation page shown after a successful checkout
 * (URL: /cart/checkout/:orderId).
 */
export class OrderConfirmationPage {
  readonly page: Page;
  readonly header: HeaderComponent;

  private readonly confirmationHeading: Locator;
  private readonly orderIdValue: Locator;
  private readonly continueShoppingLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.confirmationHeading = page.getByRole('heading', { name: 'Your order is complete!' });
    this.orderIdValue = page.getByText('Order ID:', { exact: true }).locator('xpath=following-sibling::span[1]');
    this.continueShoppingLink = page.getByRole('link', { name: 'Continue Shopping' });
  }

  async verifyOrderComplete() {
    await expect(this.confirmationHeading).toBeVisible();
  }

  async getOrderId(): Promise<string> {
    return (await this.orderIdValue.textContent())?.trim() ?? '';
  }

  async clickContinueShopping() {
    await this.continueShoppingLink.click();
  }
}
