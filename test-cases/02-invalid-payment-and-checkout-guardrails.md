# MQA-02: Invalid payment and checkout guardrails

## Objective
Confirm the system rejects invalid orders and does not create inconsistent or partial business state when checkout validation fails.

## Priority
P0

## Risk area
Checkout validation, payment integrity, and data consistency

## Scope
This case checks the negative path for invalid addresses, malformed payment input, empty carts, and retry behavior after failure.

## Preconditions
- Demo stack is running
- Cart contains at least one product
- Payment scenarios for invalid or rejected transactions are available
- Browser session is active
- Telemetry and logs are available for validation

## Test steps
1. Add valid products to the cart.
2. Attempt checkout with a missing or invalid shipping address.
3. Attempt checkout with a malformed payment method or rejected payment.
4. Attempt checkout with an empty cart.
5. Retry checkout after a failed payment attempt.
6. Review the cart state after each failed attempt.
7. Confirm the system displays a clear error message and does not create a final order.
8. Observe telemetry and logs for failed requests and any partial processing.

## Expected results
- Invalid addresses are rejected with explicit validation errors
- Rejected payment does not result in a confirmed order
- Empty cart is blocked from checkout
- Failed attempts do not corrupt cart state or create hidden orders
- UI and backend remain consistent after retry or refresh

## Edge cases
- Payment failure after partial order preparation
- Missing ZIP, city, or country data
- User clears cart before retrying
- Refresh/back button during failed checkout
- Repeated failed attempts in the same session

## Defect criteria
Fail the test if any of the following occur:
- Order is accepted despite failed payment
- Empty cart can still be checked out
- Cart is emptied or modified unexpectedly after a failed attempt
- Partial order states are created without final confirmation
- Error messaging is vague or misleading

## Release risk statement
This path protects against bad data and partial transactions. It is a critical release gate because failures here create financial or operational inconsistency even when the happy path appears healthy.

## Sign-off
- Tester: __________________
- Date: ___________________
- Result: Pass / Fail / Blocked
- Notes: __________________
