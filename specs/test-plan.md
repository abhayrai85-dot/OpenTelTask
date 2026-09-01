# Test Plan — OpenTelemetry Demo Astronomy Shop (http://localhost:8080)

## Application summary

The app under test is the OpenTelemetry demo "Astronomy Shop", a single-tenant
e-commerce demo with no login/authentication. Discovered pages:

- **Home** (`/`) — hero banner, "Hot Products" grid (9 products)
- **Product Detail** (`/product/:id`) — name, description, price, quantity
  selector, Add To Cart, "You May Also Like" recommendations
- **Cart / Checkout** (`/cart`) — combined cart + shipping address + payment
  form + Place Order, on a single page
- **Order Confirmation** (`/cart/checkout/:orderId`) — order summary
- Site-wide header: currency switcher (32 currencies), cart icon/badge

## Explicitly not present (not tested)

Login/auth, user accounts, search, filters/sorting, pagination, order
history, file upload/download, notifications, permissions/roles.

## Test coverage map

| # | Test Case | Business Flow | Priority | Type |
|---|---|---|---|---|
| 1 | Display hot products with names/prices on home page | Product Listing | CRITICAL | Positive |
| 2 | Navigate from home page to product detail page | Product Listing → Detail | HIGH | Positive |
| 3 | Add a product to the cart from product detail | Add To Cart | CRITICAL | Positive |
| 4 | Add multiple different products to the cart | Add To Cart | HIGH | Positive |
| 5 | Update item quantity in cart, recalculate total | Cart Management | HIGH | Positive |
| 6 | Empty the cart, show empty-cart state | Cart Management | HIGH | Positive |
| 7 | Continue Shopping from empty cart returns home | Cart Management | MEDIUM | Positive |
| 8 | Complete checkout with valid info, reach confirmation | Checkout | CRITICAL | Positive (E2E) |
| 9 | Block order placement when e-mail is cleared | Checkout | CRITICAL | Negative/Validation |
| 10 | Block order placement on invalid credit card format | Checkout | HIGH | Negative/Validation |
| 11 | Update displayed prices when currency changes | Currency Selection | HIGH | Positive |

Skipped (MEDIUM/edge, not automated in this pass): invalid CVV format
validation, "You May Also Like" recommendation navigation, ad banner
click-through, and behavior for a non-existent product id (page renders a
degraded/empty state with backend GraphQL errors rather than a 404 — not
automated because it reflects unclear/undefined intended behavior rather
than a concrete assertable outcome).

## Detailed test cases

### 1. Display hot products with names and prices on the home page
- **Priority:** CRITICAL | **Type:** Positive
- **Preconditions:** None (fresh session)
- **Steps:** 1) Navigate to `/`. 2) Observe "Hot Products" section.
- **Test data:** N/A
- **Expected result:** At least one product card is visible; "Solar System
  Color Imager" card shows price "$ 175.00".

### 2. Navigate to product detail page from home page
- **Priority:** HIGH | **Type:** Positive
- **Steps:** 1) Go to `/`. 2) Click a product card.
- **Expected result:** URL becomes `/product/<id>`; product name and price
  match the clicked card.

### 3. Add a product to the cart from product detail
- **Priority:** CRITICAL | **Type:** Positive
- **Steps:** 1) Go to product detail page. 2) Click "Add To Cart".
- **Expected result:** Redirected to `/cart`; item appears with quantity 1
  and correct line total.

### 4. Add multiple different products to the cart
- **Priority:** HIGH | **Type:** Positive
- **Steps:** 1) Add product A to cart. 2) Navigate to product B, add to cart.
- **Expected result:** Both products listed in cart; grand total exceeds the
  item subtotal (includes shipping).

### 5. Update item quantity in cart
- **Priority:** HIGH | **Type:** Positive
- **Steps:** 1) Add product to cart. 2) Change quantity selector to 3.
- **Expected result:** Line total recalculates to unit price × 3.

### 6. Empty the cart
- **Priority:** HIGH | **Type:** Positive
- **Steps:** 1) Add product to cart. 2) Click "Empty Cart".
- **Expected result:** Empty-cart state ("Your shopping cart is empty!") is
  shown; item no longer present.

### 7. Continue Shopping from empty cart
- **Priority:** MEDIUM | **Type:** Positive
- **Steps:** 1) Go to `/cart` with no items. 2) Click "Continue Shopping".
- **Expected result:** Navigates back to `/`.

### 8. Complete checkout with valid information
- **Priority:** CRITICAL | **Type:** Positive (full E2E flow)
- **Preconditions:** Cart has at least one item; shipping/payment fields
  carry the app's own valid defaults.
- **Steps:** 1) Add product to cart. 2) Click "Place Order".
- **Test data:** Default prefilled shipping/payment values.
- **Expected result:** Navigated to `/cart/checkout/:orderId`; "Your order is
  complete!" heading shown; a valid order id (UUID) is displayed.

### 9. Block order placement when e-mail is cleared
- **Priority:** CRITICAL | **Type:** Negative/Validation
- **Steps:** 1) Add product to cart. 2) Clear the e-mail field.
  3) Click "Place Order".
- **Expected result:** Stays on `/cart`; e-mail field reports invalid
  (native HTML5 `required`/`type=email` validation).

### 10. Block order placement on invalid credit card format
- **Priority:** HIGH | **Type:** Negative/Validation
- **Steps:** 1) Add product to cart. 2) Set credit card number to `1234`.
  3) Click "Place Order".
- **Expected result:** Stays on `/cart`; credit card field reports invalid
  (pattern `\d{4}-\d{4}-\d{4}-\d{4}`).

### 11. Currency selection updates prices
- **Priority:** HIGH | **Type:** Positive
- **Steps:** 1) Go to `/`. 2) Switch currency to EUR.
- **Expected result:** Displayed price for a known product changes from a
  `$`-prefixed value to a `€`-prefixed value.

## Framework notes

- App exposes a `data-cy` test-id convention (from the upstream project's own
  Cypress suite) on most key elements — used as the primary locator strategy.
  Shipping/payment form fields have no `data-cy`/label, so stable `#id`
  selectors are used instead (documented in `pages/CartPage.ts`).
- Each Playwright test runs in an isolated browser context, so the cart
  (session-scoped, cookie-based) is naturally isolated per test — no shared
  cart state or manual reset is required between tests.
