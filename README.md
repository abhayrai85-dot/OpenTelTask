# OpenTelTask

Playwright + TypeScript automation suite for the [OpenTelemetry Demo](https://opentelemetry.io/docs/demo/) "Astronomy Shop" — a single-tenant e-commerce demo app with no login/authentication. This repository contains **only the test automation**; the application under test (frontend + backend microservices) must already be running separately at `http://localhost:8080`.

## 1. Project Overview

- **Purpose:** UI and API regression coverage for the Astronomy Shop's critical commerce flows — product browsing, cart, checkout, currency selection — plus a dedicated API test suite for its REST layer (`/api/*`), built from [api-restDocumentation.md](api-restDocumentation.md).
- **Framework/technology:**
  - [Playwright Test](https://playwright.dev/) `^1.62.1` (`@playwright/test`)
  - TypeScript `^7.0.2`
  - [Zod](https://zod.dev/) `^4.5.4` (`zod/v4`) for API response schema validation
  - Page Object Model for UI tests, a custom `apiRequest` fixture for API tests
  - No test runner other than Playwright's own (no Jest/Mocha/Cucumber)

## 2. Project Setup

### Requirements
- Node.js (tested with v24; see `@types/node` in `package.json`)
- The Astronomy Shop app reachable at `http://localhost:8080` (this repo does not start it — no `webServer` is configured in `playwright.config.ts`, and no docker-compose file exists in this repo)

### Install
```bash
npm install
npx playwright install --with-deps
```

### Configuration
- `playwright.config.ts` — `testDir: './tests'`, `baseURL: 'http://localhost:8080'` (used by UI tests via `page.goto('/...')`), `trace: 'on-first-retry'`, HTML reporter, projects for Chromium/Firefox/WebKit, CI-only retries.
- `enums/shop/apiEndpoints.ts` — `API_BASE_URL` for the API suite, read from `process.env.API_URL` and falling back to `http://localhost:8080`. Set `API_URL` if the app runs somewhere else; no `.env` file is present or loaded (no `dotenv` dependency).
- `tsconfig.json` — `strict: true`, ES2021 target, CommonJS modules.

### Authentication
Not applicable — the app under test has no login/user accounts (see [specs/test-plan.md](specs/test-plan.md)). No storage-state setup exists in this repo.

## 3. Project Structure

```
tests/
  shopping/          UI specs (Page Object Model): add-to-cart, cart-management, checkout, currency, product-browsing
  api/               API specs against the /api/* REST layer: products, cart, checkout, shipping, currency, recommendations, ads
  example.spec.ts    Unmodified Playwright starter test (hits playwright.dev)
  seed.spec.ts       Empty placeholder test group
pages/               Page Object classes: HomePage, ProductPage, CartPage, OrderConfirmationPage, HeaderComponent
fixture/
  pages.fixture.ts   Extends Playwright's test with homePage/productPage/cartPage/orderConfirmationPage fixtures
  api/               apiRequest fixture + plain HTTP function + Zod schemas (fixture/api/schemas/shop/*)
testdata/
  products.ts        Known product fixtures (id/name/price) used by UI tests
  static/invalidValues.ts  Shared invalid-value arrays for API negative testing
enums/shop/apiEndpoints.ts  API endpoint path constants + API_BASE_URL
api-restDocumentation.md    REST contract reference the API suite is built from
specs/test-plan.md          UI test plan mapped to the automated tests/shopping specs
test-cases/                 Manual QA test cases (MQA-01/02/03) — not automated
test-strategy.md            Overall QA strategy document (risk areas, test pyramid, pod ownership)
HEALER_REPORT.md            Log of fixes made by the playwright-healer agent
.claude/                    Claude Code skills and agent (see sections 7-10)
.github/agents/             GitHub Copilot custom agents (see sections 7-10)
.github/workflows/          CI (see section 4)
```

## 4. How to Run Tests

There are no `npm` scripts defined (`package.json` has `"scripts": {}`) — use the Playwright CLI directly.

```bash
# Run everything under tests/
npx playwright test

# Run one file
npx playwright test tests/shopping/checkout.spec.ts
npx playwright test tests/api/products.spec.ts

# Run a single test by name
npx playwright test tests/shopping/currency.spec.ts -g "should update displayed product prices"

# Run only one browser project
npx playwright test --project=chromium

# Headed / debug / UI mode (standard Playwright flags, not custom scripts)
npx playwright test --headed
npx playwright test --debug
npx playwright test --ui

# View the last HTML report
npx playwright show-report
```

**CI:** [.github/workflows/playwright.yml](.github/workflows/playwright.yml) runs `npx playwright test` on push/PR to `main`/`master` (Ubuntu, `npm ci` + `npx playwright install --with-deps`) and uploads `playwright-report/` as an artifact. There's a second workflow, [.github/workflows/copilot-setup-steps.yml](.github/workflows/copilot-setup-steps.yml), that provisions the environment for the GitHub Copilot coding agent (not for running the test suite).

> **Note:** `npx playwright test` currently reports failures in `tests/api/*` **by design** — those tests assert the *correct* REST behavior and are intentionally left failing (not skipped) where the live app misbehaves, so the defect is visible in the run. See section 6.

## 5. Playwright Framework

### Page Object Model (UI tests)
`fixture/pages.fixture.ts` extends Playwright's `test` with ready-to-use page objects (`homePage`, `productPage`, `cartPage`, `orderConfirmationPage`), each defined in `pages/*.ts`. `HeaderComponent` (currency switcher, cart icon) is composed into every top-level page object rather than exposed as its own fixture. Tests import `{ test, expect }` from `../../fixture/pages.fixture` and only call page-object methods (`productPage.addToCart()`, `cartPage.verifyLoaded()`, etc.) — no raw locators in spec files.

### Locator strategy
Per `[data-cy]` attributes are the primary locator, inherited from the upstream app's own Cypress test-id convention (e.g. `[data-cy="product-card"]`, `[data-cy="product-add-to-cart"]`). Playwright role-based locators (`getByRole`) are used for headings/buttons/links that don't carry a `data-cy`. Raw CSS `#id` selectors are used only for the shipping/payment form fields in `CartPage.ts`, which expose neither a `data-cy` nor an accessible label (documented inline in that file).

### Fixtures, utilities, test data
- `fixture/pages.fixture.ts` — page-object fixtures for UI tests.
- `fixture/api/api-request-fixture.ts` + `plain-function.ts` — an `apiRequest` fixture wrapping Playwright's `request` context for the API suite; response bodies that aren't valid JSON (this app sometimes returns plain-text error bodies) fall back to raw text instead of throwing.
- `fixture/api/schemas/shop/*.ts` — Zod schemas (`ProductSchema`, `CartSchema`, `CheckoutResponseSchema`, etc.) validated in tests via `expect(Schema.parse(body)).toBeTruthy()`.
- `testdata/products.ts` — hard-coded known product id/name/price used across UI specs.
- `testdata/static/invalidValues.ts` — `INVALID_STRING_VALUES` / `INVALID_NUMBER_VALUES` arrays reused across API negative tests.
- `enums/shop/apiEndpoints.ts` — endpoint path constants (`ApiEndpoints.CART`, etc.) and `API_BASE_URL`.

## 6. Data-Driven Testing

Used in the API suite (`tests/api/`) via plain `for...of` loops over data arrays — not a custom data-driven runner. Example from `tests/api/checkout.spec.ts`:

```typescript
const requiredCreditCardFields = [
  'creditCardNumber',
  'creditCardCvv',
  'creditCardExpirationYear',
  'creditCardExpirationMonth',
] as const;
for (const field of requiredCreditCardFields) {
  test(`should return 400 when creditCard.${field} is missing`, { tag: '@api' }, async ({ apiRequest }) => {
    // ...omit `field` from a valid payload, assert the response...
  });
}
```

The same pattern drives the invalid-productId loop in `products.spec.ts`, the invalid-query-param loop in `shipping.spec.ts`, and the `INVALID_STRING_VALUES`/`INVALID_NUMBER_VALUES` loops in `checkout.spec.ts`. UI specs under `tests/shopping/` do not currently use this pattern — they use fixed test cases per scenario.

## 7. Skill Files

Located under `.claude/skills/`, used by Claude Code when working in this repo:

- **`api-testing`** ([SKILL.md](.claude/skills/api-testing/SKILL.md)) — the standard for writing/updating `tests/api/*` specs: `apiRequest` fixture usage, Zod schema conventions, `test.step` for multi-call flows, per-field negative testing, and path-parameter fuzzing. Its `references/` subfolder (`examples.md`, `negative-testing.md`, `test-step-patterns.md`, `helper-fixture-example.md`, `troubleshooting.md`) holds the longer code examples this project's API tests were built from.
- **`playwright-e2e`** ([SKILL.md](.claude/skills/playwright-e2e/SKILL.md)) — the broader standard for this repo's Playwright automation: Page Object Model rules, locator priority, test-data/fixture reuse, failure classification (`PRODUCT_DEFECT` / `TEST_DEFECT` / `ENVIRONMENT_ISSUE` / `TEST_DATA_ISSUE` / `FLAKY_TEST`), and self-healing rules. It also describes conceptual Planner/Generator/Healer/Orchestrator agent roles (see section 9).
- **`heal-tests`** ([SKILL.md](.claude/skills/heal-tests/SKILL.md)) — runs the suite (or a subset), and dispatches one `playwright-healer` subagent per distinct failure to diagnose/fix it, without committing anything.
- **`playwright-cli`** ([SKILL.md](.claude/skills/playwright-cli/SKILL.md)) — a general-purpose browser-automation/debugging skill (open a browser, click/fill/snapshot, network mocking, tracing). Not specific to this app's test-authoring conventions; used for ad-hoc interaction/debugging rather than writing specs.

## 8. Agents

Two independent agent setups exist in this repo, for two different tools:

### Claude Code
- **`playwright-healer`** ([.claude/agents/playwright-healer.md](.claude/agents/playwright-healer.md)) — a Claude Code subagent that diagnoses and, where appropriate, fixes one failing Playwright test. It classifies the failure per the `playwright-e2e` skill's rules, never runs any `git` command, never commits, and never hides a real product/environment defect by weakening a test. Every fix it makes is tagged inline (`// [Healer Agent YYYY-MM-DD] ...`) and logged as a new entry in [HEALER_REPORT.md](HEALER_REPORT.md).

### GitHub Copilot coding agent
- **`playwright-test-planner`** ([.github/agents/playwright-test-planner.agent.md](.github/agents/playwright-test-planner.agent.md)) — explores a page live via an MCP `playwright-test` server and writes a structured test plan (markdown) with `planner_save_plan`.
- **`playwright-test-generator`** ([.github/agents/playwright-test-generator.agent.md](.github/agents/playwright-test-generator.agent.md)) — walks a test-plan scenario live in the browser via the same MCP server, then writes the resulting Playwright spec with `generator_write_test`.
- **`playwright-test-healer`** ([.github/agents/playwright-test-healer.agent.md](.github/agents/playwright-test-healer.agent.md)) — runs the suite (`test_run`), debugs failures interactively (`test_debug`, browser snapshots/console/network), fixes them, and re-runs until green; falls back to `test.fixme()` with an explanatory comment if it can't resolve a failure confidently.

These `.github/agents/*.agent.md` files are GitHub Copilot custom agent definitions (each declares its own `mcp-servers: playwright-test` block, backed by `npx playwright run-test-mcp-server`, matching the MCP server also registered in [.vscode/mcp.json](.vscode/mcp.json)). They are a separate mechanism from the Claude Code agent above — neither system invokes the other.

## 9. Agent Workflow

The only workflow actually wired together (not just described) is the Claude Code one, in `heal-tests`:

```
npx playwright test $ARGUMENTS --reporter=list
        ↓
identify each distinct failing test (file + title + project)
        ↓
dispatch one playwright-healer subagent per distinct failure (in parallel)
        ↓
each healer: reproduce → read logs/error-context → classify → fix if TEST_DEFECT/TEST_DATA_ISSUE/genuine FLAKY_TEST → validate (re-run 3x)
        ↓
heal-tests presents a consolidated summary (fixed / reported-as-defect / unresolved)
```

Nothing is committed at any point — fixes are left uncommitted in the working tree for human review via `git diff`. [HEALER_REPORT.md](HEALER_REPORT.md) already contains one real entry produced by this flow (a `TEST_DEFECT` in `tests/shopping/currency.spec.ts`, fixed and validated).

The `playwright-e2e` skill additionally *describes* Planner → Generator → Healer → Orchestrator roles and a "Requirement → Inspect → Reuse → Create → Execute → Fix → Validate" process, but no Claude Code planner/generator/orchestrator agent exists in this repo — only `playwright-healer` does. The equivalent Planner/Generator/Healer roles that do exist as separate, runnable agents are the three GitHub Copilot agents in section 8, which are driven through Copilot's own interface, not through the `heal-tests` skill.

## 10. How to Use the Agents

**Claude Code — `heal-tests` skill** (runs tests and dispatches `playwright-healer` automatically):
```
/heal-tests
/heal-tests tests/shopping/checkout.spec.ts
/heal-tests -g "should update displayed product prices"
```

**Claude Code — `playwright-healer` directly**, when you already know which test failed: invoke it as a subagent with the failing test's file path, test title, and the failure output.

**GitHub Copilot agents** — selected as a custom agent inside GitHub Copilot Chat's agent mode (VS Code) or the GitHub Copilot coding agent, e.g. picking `playwright-test-planner` to explore a page and produce a plan, then `playwright-test-generator` to turn a plan scenario into a spec file, then `playwright-test-healer` to fix failures. These are invoked through Copilot's own UI, not through a Claude Code slash command.

## 11. Troubleshooting

- **Tests time out / can't connect:** the app isn't running at `http://localhost:8080` (or wherever `API_URL` points). This repo has no `webServer` config and doesn't start the app itself.
- **`tests/api/*` show failures:** many are intentional — they assert correct REST behavior (e.g. `400` on a missing field) against an app that currently returns `500` or silently accepts bad input. Each has a comment explaining the observed vs. expected behavior; this is not a broken test suite.
- **`GET /api/currency` test fails / returns unexpected values:** `tests/api/checkout.spec.ts`'s `userCurrency` fuzz cases write into the app's shared/global currency list as a side effect of a real backend bug (unvalidated `userCurrency` gets persisted). If the running app's currency list has been polluted with values like `"null"`/`"123"`, restart the app to reset it.
- **`ZodError` on an API test:** the live response no longer matches the schema in `fixture/api/schemas/shop/`. Per the `api-testing` skill, treat this as a contract bug to investigate rather than loosening the schema.
- **`npx playwright test` reports 0 tests / can't find files:** confirm you're running from the repo root — `testDir` is `./tests` in `playwright.config.ts`.
- **Browsers not installed:** run `npx playwright install --with-deps` (required once per environment, including CI).

## 12. Quick Start

```bash
npm install
npx playwright install --with-deps
# Ensure the Astronomy Shop app is reachable at http://localhost:8080
npx playwright test
npx playwright show-report
```
