import { Locator, Page, expect } from '@playwright/test';
import { HeaderComponent } from './HeaderComponent';

/**
 * Product detail page: name, description, price, quantity, add-to-cart.
 */
export class ProductPage {
  readonly page: Page;
  readonly header: HeaderComponent;

  private readonly productDetail: Locator;
  private readonly productName: Locator;
  private readonly productPrice: Locator;
  private readonly quantitySelect: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.productDetail = page.locator('[data-cy="product-detail"]');
    this.productName = page.locator('[data-cy="product-name"]');
    // "product-detail" also wraps the "You May Also Like" recommendations, which carry
    // their own [data-cy="product-price"] spans; the main product's price is the first one.
    this.productPrice = this.productDetail.locator('[data-cy="product-price"]').first();
    this.quantitySelect = page.locator('[data-cy="product-quantity"]');
    this.addToCartButton = page.locator('[data-cy="product-add-to-cart"]');
  }

  async goto(productId: string) {
    await this.page.goto(`/product/${productId}`);
    await this.waitForLoaded();
  }

  /** Product details are fetched client-side after navigation; wait for real data. */
  async waitForLoaded() {
    await expect(this.productPrice).not.toHaveText('$ 0.00');
  }

  async getProductName(): Promise<string> {
    return (await this.productName.textContent())?.trim() ?? '';
  }

  async getProductPrice(): Promise<string> {
    return (await this.productPrice.textContent())?.trim() ?? '';
  }

  async selectQuantity(quantity: number) {
    await this.quantitySelect.selectOption(String(quantity));
  }

  async addToCart() {
    await this.addToCartButton.click();
  }
}
