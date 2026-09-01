# Healer Agent Report

## 2026-09-01 — tests/shopping/currency.spec.ts › Currency Selection › should update displayed product prices when the currency is changed

**Classification:** TEST_DEFECT

**Evidence:**
- Reproduced the failure with `npx playwright test tests/shopping/currency.spec.ts --project=chromium --reporter=list`. It failed with `Test timeout of 30000ms exceeded` on the `expect(...).toPass()` block, specifically `expect(updatedPrice.startsWith('£')).toBe(true)`.
- The test selects currency `'EUR'` via `homePage.header.selectCurrency('EUR')`, but then asserts the resulting price string starts with `£` (the GBP symbol) instead of `€` (the EUR symbol) — an internal mismatch within the test itself.
- The saved accessibility snapshot (`test-results/shopping-currency-Currency-7cfe7-hen-the-currency-is-changed-chromium/error-context.md`) shows the app behaving correctly: the currency `<select>` has `option "EUR" [selected]`, and every product card price reads e.g. `€ 154.80`. The application correctly switched to and rendered EUR pricing; only the test's expected symbol was wrong.

**Root cause:** Incorrect expected currency symbol in the test assertion (`£` instead of `€`), unrelated to any application behavior. Because the assertion could never be satisfied, Playwright's `toPass()` polling kept retrying until the 30s test timeout elapsed, producing the observed timeout-style failure.

**Files changed:**
- `tests/shopping/currency.spec.ts` — line 16: changed `expect(updatedPrice.startsWith('£')).toBe(true);` to `expect(updatedPrice.startsWith('€')).toBe(true);`, matching the `'EUR'` currency actually selected earlier in the test. Added an inline `// [Healer Agent 2026-09-01] ...` tag comment above the changed line.

**Validation result:** Re-ran the test 5 times total after the fix (`--repeat-each=3` then `--repeat-each=2`, both `--project=chromium`) — 5/5 passed, each run completing in under 2 seconds (versus the prior 29s timeout failure).

**Tag:** Fixed by Healer Agent — not committed, pending human review
