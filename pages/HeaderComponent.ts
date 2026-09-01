import { Locator, Page } from '@playwright/test';

/**
 * Site header: logo/home link, currency switcher, and cart icon.
 * Present on every page of the shop.
 */
export class HeaderComponent {
  private readonly page: Page;
  private readonly homeLink: Locator;
  private readonly currencySwitcher: Locator;
  private readonly cartIcon: Locator;
  private readonly cartItemCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.homeLink = page.locator('nav a[href="/"]').first();
    this.currencySwitcher = page.locator('[data-cy="currency-switcher"]');
    this.cartIcon = page.locator('[data-cy="cart-icon"]');
    this.cartItemCount = page.locator('[data-cy="cart-item-count"]');
  }

  async goToHome() {
    await this.homeLink.click();
  }

  async selectCurrency(currencyCode: string) {
    await this.currencySwitcher.selectOption(currencyCode);
  }

  async getSelectedCurrency(): Promise<string> {
    return this.currencySwitcher.inputValue();
  }

  async openCart() {
    await this.cartIcon.click();
  }

  async getCartItemCount(): Promise<string> {
    return (await this.cartItemCount.textContent())?.trim() ?? '0';
  }
}
