/**
 * REST endpoint paths for the Astronomy Shop frontend API layer, per
 * api-restDocumentation.md. Single source of truth for path strings so spec
 * files never hardcode them.
 */
export const ApiEndpoints = {
  PRODUCTS: '/api/products',
  RECOMMENDATIONS: '/api/recommendations',
  DATA: '/api/data',
  CART: '/api/cart',
  CURRENCY: '/api/currency',
  SHIPPING: '/api/shipping',
  CHECKOUT: '/api/checkout',
} as const;

/**
 * Base URL for the frontend API layer. Overridable via API_URL so the suite
 * can target a non-local environment without code changes.
 */
export const API_BASE_URL = process.env.API_URL ?? 'http://localhost:8080';
