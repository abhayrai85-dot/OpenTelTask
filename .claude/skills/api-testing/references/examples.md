# API Testing — Worked Examples

Three end-to-end walkthroughs aligned with the 8-phase `ai-native-workflow`, grounded in the real contract documented in [api-restDocumentation.md](../../../../api-restDocumentation.md) for this app's REST layer (`src/frontend/pages/api`, `http://localhost:8080/api`). The phase numbers below refer to `api-testing/SKILL.md`'s in-skill phases.

**Deviations from the generic Phase 5 matrix that apply to every example below**, per the documented contract:

- **No auth layer.** None of these routes require an `Authorization` header — skip the 401/403 rows from the Phase 5 matrix entirely.
- **No response envelope.** Responses are the raw resource (object or array) — there is no `{ success, message, data, errors }` wrapper to mirror in schemas.
- **IDs are short strings, not UUIDs** (e.g. `"OLJCESPC7Z"`) — don't reach for `z.uuid()` or `INVALID_UUID_VALUES`.
- **The doc itself is the contract**, even though it isn't OpenAPI/Swagger. Phase 1 still applies as written: build schemas and tests strictly from `api-restDocumentation.md`, and only make a real request if a route you need isn't covered there.

## Example 1: Adding tests for a brand-new endpoint

User says: _"Add API tests for `GET /api/products/[productId]`."_

1. **Phase 1** — Source the contract from section 2 of `api-restDocumentation.md`: `productId` is a required path segment (surfaced as a query param by Next.js), `currencyCode` is optional, response is a single `Product` object with no envelope.
2. **Phase 2** — Create `fixtures/api/schemas/shop/productSchema.ts` with a `ProductSchema` (`id`, `name`, `description`, `picture`, `priceUsd: { currencyCode, units, nanos }`, `categories: string[]`) mirrored field-by-field from the doc — no `CreateXResponseSchema` envelope needed, `ProductSchema` doubles as the response schema.
3. **Phase 3** — Write the happy-path test: `apiRequest<Product>({ method: 'GET', url: `${ApiEndpoints.PRODUCTS}/OLJCESPC7Z`, baseUrl: process.env.API_URL })`, then `expect(ProductSchema.parse(body)).toBeTruthy()`.
4. **Phase 5** — Trim the matrix to what actually applies here: 200 happy path, 404 for a non-existent `productId`, 405 for an unsupported method. No 401/403 (no auth on this route) and no request-body validation (it's a GET).
5. **Phase 6** — Skip per-field body validation (no body), but still run the mandatory path-parameter fuzzing loop against `productId` (numeric string, special characters, injection attempts).
6. **Phase 7** — If the live response includes extra fields not in the doc, or omits `categories`, that's a doc/backend mismatch — `test.skip` + `// FIXME:` rather than loosening the schema.

Result: a `product.spec.ts` that validates against the documented gRPC-backed contract without inventing auth or envelope checks this app doesn't have.

## Example 2: Verifying a multi-step workflow

User says: _"Test the cart add → retrieve → clear flow."_ (This is one of the critical flows section 12 of the doc calls out explicitly.)

1. **Phase 3** — Use `apiRequest` inside a single `test`, no auth headers needed.
2. **Phase 4** — Wrap each of the three calls in its own `test.step`:
   - `test.step('Add item via POST /api/cart', ...)` — body `{ userId, item: { productId, quantity } }`, assert 200 and `CartSchema.parse(body)`.
   - `test.step('Retrieve cart via GET /api/cart', ...)` — query `?sessionId=...`, assert the added item is present, including the nested `product` object the GET response returns (unlike the POST response, which only echoes `productId`/`quantity`).
   - `test.step('Clear cart via DELETE /api/cart', ...)` — body `{ userId }` (this endpoint takes the id in the body, not a path segment), assert `status === 204` and `expect(body).toBeNull()`.
3. **Phase 2** — Validate against a shared `CartSchema` for the POST/GET steps; no schema needed for the 204.

Result: one test, three clearly named steps in the trace, matching the real add/retrieve/clear flow the doc flags as critical — including the GET-vs-POST response-shape asymmetry (nested `product` only on GET) that a schema copied from one response would miss.

## Example 3: Locking down validation for a request body

User says: _"We only check empty body — add full validation coverage for `POST /api/checkout`."_

1. **Phase 6** — Add one `test.describe('POST /api/checkout - validation', ...)` block. This is the richest documented body (section 10): top-level `userId`, `userCurrency`, `email`, plus nested `address` (`streetAddress`, `city`, `state`, `country`, `zipCode`) and nested `creditCard` (`creditCardNumber`, `creditCardCvv`, `creditCardExpirationYear`, `creditCardExpirationMonth`).
2. Build `validPayload` from the doc's example body (no factory exists yet for this shape — add one under `test-data/factories/shop/` if it's reused across 3+ specs, otherwise inline).
3. For top-level fields, run the standard `for...of` loops against `INVALID_STRING_VALUES` (`userId`, `userCurrency`, `email`) — combine `email` with a domain-specific invalid-email set per the three-tier rule.
4. For nested `address` and `creditCard` fields, override one nested field at a time: `{ ...validPayload, address: { ...validPayload.address, zipCode: invalidValue } }` — nested spread, not a flat override, since these are objects-within-the-body rather than top-level fields.
5. Add a second `for...of` loop that omits each required top-level field via destructure + rest; do the same one level down for `address` and `creditCard` (a payload missing `creditCard.creditCardCvv` entirely, not just `creditCard`).
6. `creditCardExpirationYear`/`creditCardExpirationMonth` are numbers with real-world constraints (past dates, month outside 1–12) — treat those as tier-3 inline boundary values per the three-tier rule, not universal `INVALID_NUMBER_VALUES`.
7. Assert `BadRequestResponseSchema.parse(body)` on every 400 — but if the live endpoint 500s on a malformed `creditCard` instead of 400ing, that's Phase 7: `test.skip` + `// FIXME:`, not a loosened assertion.

Result: coverage goes from one empty-body test to full top-level **and** nested-field coverage (fields × invalid-values + fields omitted, at both nesting levels) for the one endpoint in this app's contract with a genuinely nested body.