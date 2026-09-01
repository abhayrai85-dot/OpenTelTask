# REST API Documentation for the Astronomy Shop Frontend API Layer

This document describes the REST-style endpoints exposed by the Next.js frontend API layer. These are application-layer APIs used by the web app and they map internally to the underlying gRPC services defined in [pb/demo.proto](pb/demo.proto).

Important note:
- The real backend contract is gRPC, not a formal REST OpenAPI document.
- The APIs below are the REST wrappers implemented in the frontend app under [src/frontend/pages/api](src/frontend/pages/api).
- These endpoints are intended for browser/server-side app usage, not as a standalone public API product.

---

## Base URL

Local app environment:

- http://localhost:8080/api

In the repo, these routes are implemented under:

- [src/frontend/pages/api](src/frontend/pages/api)

---

## 1) GET /api/products

Returns the list of products.

### Request

Method: GET

Query parameters:
- currencyCode (optional): target currency code, e.g. USD, EUR

Example:

```http
GET /api/products?currencyCode=USD
```

### Response

Status: 200 OK

```json
[
  {
    "id": "OLJCESPC7Z",
    "name": "Solar System Color Imager",
    "description": "A high-quality telescope accessory",
    "picture": "/images/solar-system-color-imager.jpg",
    "priceUsd": {
      "currencyCode": "USD",
      "units": 175,
      "nanos": 0
    },
    "categories": ["accessories", "telescopes"]
  }
]
```

---

## 2) GET /api/products/[productId]

Returns a single product by ID.

### Request

Method: GET

Query parameters:
- productId (required)
- currencyCode (optional)

Example:

```http
GET /api/products/OLJCESPC7Z?currencyCode=USD
```

### Response

Status: 200 OK

```json
{
  "id": "OLJCESPC7Z",
  "name": "Solar System Color Imager",
  "description": "A high-quality telescope accessory",
  "picture": "/images/solar-system-color-imager.jpg",
  "priceUsd": {
    "currencyCode": "USD",
    "units": 175,
    "nanos": 0
  },
  "categories": ["accessories", "telescopes"]
}
```

---

## 3) GET /api/recommendations

Returns recommended products for a user or product context.

### Request

Method: GET

Query parameters:
- productIds (optional): comma-delimited list of product ids or array-style request from app
- sessionId (optional)
- currencyCode (optional)

Example:

```http
GET /api/recommendations?productIds=OLJCESPC7Z,ASTRO1&sessionId=abc123&currencyCode=USD
```

### Response

Status: 200 OK

```json
[
  {
    "id": "ASTRO2",
    "name": "Helios Telescope",
    "description": "Portable telescope",
    "picture": "/images/helios-telescope.jpg",
    "priceUsd": {
      "currencyCode": "USD",
      "units": 250,
      "nanos": 0
    },
    "categories": ["telescopes"]
  }
]
```

---

## 4) GET /api/data

Returns advertising content for a given page context.

### Request

Method: GET

Query parameters:
- contextKeys (optional): comma-separated page words or keywords

Example:

```http
GET /api/data?contextKeys=telescope,astronomy
```

### Response

Status: 200 OK

```json
[
  {
    "redirectUrl": "https://example.com/product/helios",
    "text": "Buy now and save 10%"
  }
]
```

---

## 5) GET /api/cart

Returns the current cart for a user.

### Request

Method: GET

Query parameters:
- sessionId (optional)
- currencyCode (optional)

Example:

```http
GET /api/cart?sessionId=user-123&currencyCode=USD
```

### Response

Status: 200 OK

```json
{
  "userId": "user-123",
  "items": [
    {
      "productId": "OLJCESPC7Z",
      "quantity": 1,
      "product": {
        "id": "OLJCESPC7Z",
        "name": "Solar System Color Imager",
        "description": "A high-quality telescope accessory",
        "picture": "/images/solar-system-color-imager.jpg",
        "priceUsd": {
          "currencyCode": "USD",
          "units": 175,
          "nanos": 0
        },
        "categories": ["accessories", "telescopes"]
      }
    }
  ]
}
```

---

## 6) POST /api/cart

Adds an item to the cart.

### Request

Method: POST

Body:

```json
{
  "userId": "user-123",
  "item": {
    "productId": "OLJCESPC7Z",
    "quantity": 1
  }
}
```

### Response

Status: 200 OK

```json
{
  "userId": "user-123",
  "items": [
    {
      "productId": "OLJCESPC7Z",
      "quantity": 1
    }
  ]
}
```

---

## 7) DELETE /api/cart

Removes all items from the cart for a user.

### Request

Method: DELETE

Body:

```json
{
  "userId": "user-123"
}
```

### Response

Status: 204 No Content

---

## 8) GET /api/currency

Returns the supported currencies.

### Request

Method: GET

Example:

```http
GET /api/currency
```

### Response

Status: 200 OK

```json
["USD", "EUR", "JPY", "CAD"]
```

---

## 9) GET /api/shipping

Returns the shipping cost for an address and cart items, converted to the requested currency.

### Request

Method: GET

Query parameters:
- itemList (required): JSON-encoded list of cart items
- address (required): JSON-encoded address object
- currencyCode (optional): target currency, default USD

Example:

```http
GET /api/shipping?itemList=[{"productId":"OLJCESPC7Z","quantity":1}]&address={"streetAddress":"123 Main St","city":"Austin","state":"TX","country":"USA","zipCode":"78701"}&currencyCode=USD
```

### Response

Status: 200 OK

```json
{
  "currencyCode": "USD",
  "units": 15,
  "nanos": 0
}
```

---

## 10) POST /api/checkout

Places an order using the selected user, address, and card details.

### Request

Method: POST

Query parameters:
- currencyCode (optional)

Body:

```json
{
  "userId": "user-123",
  "userCurrency": "USD",
  "address": {
    "streetAddress": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "country": "USA",
    "zipCode": "78701"
  },
  "email": "user@example.com",
  "creditCard": {
    "creditCardNumber": "4111111111111111",
    "creditCardCvv": 123,
    "creditCardExpirationYear": 2030,
    "creditCardExpirationMonth": 12
  }
}
```

### Response

Status: 200 OK

```json
{
  "orderId": "12345",
  "shippingTrackingId": "TRACK-0001",
  "shippingCost": {
    "currencyCode": "USD",
    "units": 15,
    "nanos": 0
  },
  "shippingAddress": {
    "streetAddress": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "country": "USA",
    "zipCode": "78701"
  },
  "items": [
    {
      "cost": {
        "currencyCode": "USD",
        "units": 175,
        "nanos": 0
      },
      "item": {
        "productId": "OLJCESPC7Z",
        "quantity": 1,
        "product": {
          "id": "OLJCESPC7Z",
          "name": "Solar System Color Imager"
        }
      }
    }
  ]
}
```

---

## 11) gRPC API contracts behind these routes

The REST endpoints are wrappers over the gRPC service definitions in [pb/demo.proto](pb/demo.proto).

Main services:

- CartService
  - AddItem
  - GetCart
  - EmptyCart
- RecommendationService
  - ListRecommendations
- ProductCatalogService
  - ListProducts
  - GetProduct
  - SearchProducts
- ShippingService
  - GetQuote
  - ShipOrder
- CurrencyService
  - GetSupportedCurrencies
  - Convert
- PaymentService
  - Charge
- EmailService
  - SendOrderConfirmation
- CheckoutService
  - PlaceOrder
- AdService
  - GetAds
- FeatureFlagService
  - GetFlag
  - CreateFlag
  - UpdateFlag
  - ListFlags
  - DeleteFlag

---

## 12) Notes for QA and API testing

- These endpoints expose application behavior, not a formal public API contract.
- For system-level testing, validate the end-to-end business flow in addition to direct endpoint checks.
- The most critical flows are:
  - cart add / retrieve / clear
  - product listing and recommendation retrieval
  - shipping quote calculation
  - checkout and payment processing
  - async Kafka downstream processing after order placement

---

## 13) Related files

- [pb/demo.proto](pb/demo.proto)
- [src/frontend/pages/api](src/frontend/pages/api)
- [src/frontend/gateways](src/frontend/gateways)
- [src/frontend/services](src/frontend/services)
