import { Locator, Page, expect } from '@playwright/test';
import { HeaderComponent } from './HeaderComponent';

/**
 * Home page: hero banner and the "Hot Products" listing.
 */
export class HomePage {
  readonly page: Page;
  readonly header: HeaderComponent;

  private readonly hotProductsHeading: Locator;
  private readonly productList: Locator;
  private readonly productCards: Locator;
  private readonly goShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.hotProductsHeading = page.locator('[data-cy="hot-products"]');
    this.productList = page.locator('[data-cy="product-list"]');
    this.productCards = this.productList.locator('[data-cy="product-card"]');
    this.goShoppingButton = page.getByRole('button', { name: 'Go Shopping' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async verifyLoaded() {
    await expect(this.hotProductsHeading).toBeVisible();
    await expect(this.productCards.first()).toBeVisible();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  productCard(productName: string): Locator {
    return this.productCards.filter({ hasText: productName });
  }

  async openProduct(productName: string) {
    await this.productCard(productName).click();
  }

  async getProductCardPrice(productName: string): Promise<string> {
    return (await this.productCard(productName).locator('[data-cy="product-price"]').textContent())?.trim() ?? '';
  }

  async clickGoShopping() {
    await this.goShoppingButton.click();
  }
}
