# MQA-01: Successful checkout end-to-end

## Objective
Validate the normal commerce flow works from storefront browsing to confirmation, and that downstream fulfillment and telemetry remain consistent.

## Priority
P0

## Risk area
Commerce flow and business-critical checkout path

## Scope
This test validates the highest-impact user journey in the demo: browse -> add to cart -> checkout -> payment -> order confirmation -> async downstream processing.

## Preconditions
- Demo stack is running in default or full mode
- Frontend is reachable
- Product catalog contains inventory
- At least one valid user/cart state exists
- Payment service is healthy
- Kafka consumers are available in full mode
- Telemetry stack is available for trace/log/metric verification

## Test steps
1. Open the storefront.
2. Browse a few products and select at least one item.
3. Add the item to cart.
4. Open the cart and verify item quantity, unit cost, and total value.
5. Proceed to checkout.
6. Enter valid shipping information.
7. Enter a valid payment method.
8. Submit the order.
9. Confirm the user receives a successful order confirmation.
10. Review the end-to-end trace in Jaeger or similar tooling.
11. Confirm the order path includes frontend -> cart -> checkout -> payment -> email/shipping services.
12. In full mode, confirm the Kafka event is emitted and observed by `fraud-detection` and `accounting`.
13. Review logs and metrics for service-level errors, missing spans, or missing telemetry.

## Expected results
- Cart totals match the selected products and pricing logic
- Checkout completes without error
- Order confirmation is displayed once
- Payment, shipping, and email steps complete successfully
- No duplicate order records are produced
- Kafka events are emitted once and consumed by downstream services
- Telemetry shows a consistent trace chain without missing spans

## Edge cases
- Multiple quantities of the same product
- Mixed items requiring different price conversion or shipping logic
- Repeat checkout without page refresh
- Slow downstream dependency or delayed Kafka consumer
- Payment service healthy but one downstream system slow

## Defect criteria
Fail the test if any of the following are observed:
- Payment succeeds but order confirmation is missing or inconsistent
- Order completes twice
- Missing downstream notification or fulfillment event
- Trace gaps prevent root-cause analysis
- Kafka message is lost or processed more than once

## Release risk statement
This is the single most important release gate because it exercises the system’s core business transaction. If this flow fails, the demo is not production-ready from a customer-impact perspective.

## Sign-off
- Tester: __________________
- Date: ___________________
- Result: Pass / Fail / Blocked
- Notes: __________________
