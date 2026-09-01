import { Locator, Page, expect } from '@playwright/test';
import { HeaderComponent } from './HeaderComponent';

export interface ShippingAddress {
  email: string;
  streetAddress: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
}

export interface PaymentDetails {
  creditCardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
}

/**
 * Cart / checkout page: cart items, shipping address form, payment form,
 * and order placement. This app combines the cart and checkout on one page.
 */
export class CartPage {
  readonly page: Page;
  readonly header: HeaderComponent;

  private readonly cartHeading: Locator;
  private readonly emptyCartHeading: Locator;
  private readonly emptyCartButton: Locator;
  private readonly continueShoppingLink: Locator;
  private readonly placeOrderButton: Locator;
  private readonly shippingValue: Locator;
  private readonly grandTotalValue: Locator;

  private readonly emailInput: Locator;
  private readonly streetAddressInput: Locator;
  private readonly zipCodeInput: Locator;
  private readonly cityInput: Locator;
  private readonly stateInput: Locator;
  private readonly countryInput: Locator;
  private readonly creditCardNumberInput: Locator;
  private readonly expirationMonthSelect: Locator;
  private readonly expirationYearSelect: Locator;
  private readonly cvvInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);

    // exact: true avoids matching "Your shopping cart is empty!" in the empty-cart state.
    this.cartHeading = page.getByRole('heading', { name: 'Shopping Cart', exact: true });
    this.emptyCartHeading = page.getByRole('heading', { name: 'Your shopping cart is empty!' });
    this.emptyCartButton = page.getByRole('button', { name: 'Empty Cart' });
    this.continueShoppingLink = page.getByRole('link', { name: 'Continue Shopping' });
    this.placeOrderButton = page.locator('[data-cy="checkout-place-order"]');
    this.shippingValue = page.getByText('Shipping', { exact: true }).locator('xpath=following-sibling::span[1]');
    this.grandTotalValue = page
      .getByRole('heading', { name: 'Total', exact: true })
      .locator('xpath=following-sibling::h3[1]');

    // No data-cy/label is exposed on these form fields; ids are the stable identifier available.
    this.emailInput = page.locator('#email');
    this.streetAddressInput = page.locator('#street_address');
    this.zipCodeInput = page.locator('#zip_code');
    this.cityInput = page.locator('#city');
    this.stateInput = page.locator('#state');
    this.countryInput = page.locator('#country');
    this.creditCardNumberInput = page.locator('#credit_card_number');
    this.expirationMonthSelect = page.locator('#credit_card_expiration_month');
    this.expirationYearSelect = page.locator('#credit_card_expiration_year');
    this.cvvInput = page.locator('#credit_card_cvv');
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async verifyLoaded() {
    await expect(this.cartHeading).toBeVisible();
  }

  async verifyEmpty() {
    await expect(this.emptyCartHeading).toBeVisible();
  }

  private cartItemRow(productName: string): Locator {
    // The same product can also appear as a "You May Also Like" recommendation link
    // elsewhere on this page, so scope to rows that actually carry a quantity selector.
    return this.page
      .getByRole('link', { name: productName })
      .locator('xpath=..')
      .filter({ has: this.page.locator('select') });
  }

  async isItemInCart(productName: string): Promise<boolean> {
    return (await this.cartItemRow(productName).count()) > 0;
  }

  /**
   * Waits for a product to appear in the cart. Adding an item navigates to /cart
   * before the add-to-cart mutation is guaranteed to have settled, so callers that
   * need to assert presence right after adding should wait rather than read once.
   */
  async waitForItemInCart(productName: string) {
    await expect(this.cartItemRow(productName)).toBeVisible();
  }

  /** Symmetric counterpart to {@link waitForItemInCart}, for after a removing action. */
  async waitForItemRemoved(productName: string) {
    await expect(this.cartItemRow(productName)).toHaveCount(0);
  }

  async getItemQuantity(productName: string): Promise<string> {
    return this.cartItemRow(productName).getByRole('combobox').inputValue();
  }

  async setItemQuantity(productName: string, quantity: number) {
    const quantitySelect = this.cartItemRow(productName).getByRole('combobox');
    await quantitySelect.selectOption(String(quantity));
    // The cart re-fetches and re-renders after a quantity change; wait for it to settle
    // before returning, so callers immediately see the updated line total.
    await expect(quantitySelect).toHaveValue(String(quantity));
  }

  async getItemTotal(productName: string): Promise<string> {
    return (
      (await this.cartItemRow(productName).locator('[data-cy="product-price"]').nth(1).textContent())?.trim() ?? ''
    );
  }

  async getShippingCost(): Promise<string> {
    return (await this.shippingValue.textContent())?.trim() ?? '';
  }

  async getGrandTotal(): Promise<string> {
    return (await this.grandTotalValue.textContent())?.trim() ?? '';
  }

  async emptyCart() {
    await this.emptyCartButton.click();
  }

  async clickContinueShopping() {
    await this.continueShoppingLink.click();
  }

  async fillShippingAddress(address: Partial<ShippingAddress>) {
    if (address.email !== undefined) await this.emailInput.fill(address.email);
    if (address.streetAddress !== undefined) await this.streetAddressInput.fill(address.streetAddress);
    if (address.zipCode !== undefined) await this.zipCodeInput.fill(address.zipCode);
    if (address.city !== undefined) await this.cityInput.fill(address.city);
    if (address.state !== undefined) await this.stateInput.fill(address.state);
    if (address.country !== undefined) await this.countryInput.fill(address.country);
  }

  async fillPaymentDetails(payment: Partial<PaymentDetails>) {
    if (payment.creditCardNumber !== undefined) await this.creditCardNumberInput.fill(payment.creditCardNumber);
    if (payment.expirationMonth !== undefined) await this.expirationMonthSelect.selectOption(payment.expirationMonth);
    if (payment.expirationYear !== undefined) await this.expirationYearSelect.selectOption(payment.expirationYear);
    if (payment.cvv !== undefined) await this.cvvInput.fill(payment.cvv);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }

  async isEmailFieldInvalid(): Promise<boolean> {
    return this.emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
  }

  async isCreditCardNumberFieldInvalid(): Promise<boolean> {
    return this.creditCardNumberInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
  }
}
