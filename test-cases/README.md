# Manual QA Test Plan for Critical Business Flows

## Document Control

- Project: OpenTelemetry Astronomy Shop demo
- Document type: Manual QA validation
- Scope: Highest-risk business flows
- Release gate: Required before release signoff
- Owner: QA / release lead with service pod participation

## 1. Objective

This manual QA plan validates the flows that represent the greatest customer and business risk in the demo system: the purchase journey and the async post-purchase processing path. The intent is to confirm the system behaves correctly under normal operations and under failure conditions that can create partial or inconsistent order outcomes.

## 2. Scope and prioritization

The following flows are the priority for manual verification:

1. Purchase flow: browse -> add to cart -> checkout -> payment -> fulfillment signals
2. Async order processing: checkout emits to Kafka, `fraud-detection` and `accounting` process it
3. Failure and recovery behavior: invalid cart, unstable payment, delayed shipping/quote, and telemetry visibility

This is not a full regression checklist for all 20 services. It is a release-oriented validation of the paths most likely to cause user-visible business disruption.

---

## 3. Test execution summary

| Test ID | Test name | Priority | Risk area | Status |
| --- | --- | --- | --- | --- |
| MQA-01 | Successful checkout end-to-end | P0 | Commerce flow | Pending |
| MQA-02 | Invalid payment and checkout guardrails | P0 | Payment and validation | Pending |
| MQA-03 | Kafka async downstream processing | P0 | Async reliability | Pending |

---

## 4. Environment and prerequisites

### Environment
- Demo stack running in default or full mode
- Frontend and backend reachable from browser/test workstation
- Observability stack available for traces/log/metrics review
- Kafka-enabled path available for full-mode validation

### Preconditions
- Product catalog contains inventory
- Payment service is healthy for positive-path validation
- At least one valid user/cart state exists
- Test analyst has access to logs, traces, and service health checks

---

## 5. Manual test case: MQA-01 - Successful checkout end-to-end

### 5.1 Purpose
Validate the normal commerce flow works end-to-end and that downstream side effects complete without silent loss or duplication.

### 5.2 Preconditions
- Demo stack is running in the default or full profile
- Frontend is reachable
- Product catalog is populated
- At least one valid user/cart state exists
- Payment service is healthy
- Kafka and downstream consumers are healthy for full-mode validation

### 5.3 Steps
1. Open the storefront and browse a few products.
2. Add at least one item to the cart.
3. Open the cart and verify item quantity, pricing, formatting, and total.
4. Proceed to checkout.
5. Enter valid shipping data and a valid payment method.
6. Submit the order.
7. Confirm the user receives a successful order confirmation.
8. Review the trace chain in telemetry tooling: frontend -> cart -> checkout -> payment -> shipping/email.
9. In full mode, confirm the Kafka event is emitted and consumed by `fraud-detection` and `accounting`.
10. Review logs and metrics for the expected service names and verify no error spans indicate a broken path.

### 5.4 Expected results
- Cart total matches selected items and conversion logic
- Checkout completes without error and creates a confirmed order
- Downstream services emit telemetry and complete their side effects
- No duplicate records or missing downstream updates
- User sees a single successful confirmation

### 5.5 Edge cases
- Multiple quantities of the same item
- Mixed products requiring different pricing/currency handling
- Repeat checkout in the same session without reloading
- Slow downstream dependencies during order completion

### 5.6 Quality risk to flag before release
- Payment succeeds but shipping or email activity is missing
- Retry logic creates duplicate orders
- Kafka event is lost or processed out of order
- Trace gaps prevent root-cause identification

### 5.7 Signoff
- Tester: __________
- Date: __________
- Result: Pass / Fail / Blocked
- Notes: ________________________________

---

## 6. Manual test case: MQA-02 - Invalid payment and checkout guardrails

### 6.1 Purpose
Confirm the system rejects invalid or unsafe checkout attempts without creating hidden or inconsistent order state.

### 6.2 Preconditions
- Demo stack is running
- Cart contains one or more products
- Payment scenarios for invalid or rejected transactions are available

### 6.3 Steps
1. Add valid products to the cart.
2. Attempt checkout with an invalid address or missing required shipping field.
3. Attempt checkout with a malformed or rejected payment method.
4. Attempt checkout with an empty cart.
5. Repeat checkout for the same cart after a failed attempt.
6. Verify cart and order state after each failed submission.

### 6.4 Expected results
- Invalid addresses are rejected with clear user-visible errors
- Rejected payment does not create a confirmed order
- Empty cart cannot be checked out
- Failed attempts do not corrupt cart state or produce hidden orders
- UI and backend show consistent failure state

### 6.5 Edge cases
- Payment failure after partial provisioning
- Missing city / ZIP / unsupported country
- Cart emptied by user before retry
- Refresh or back navigation during failed checkout

### 6.6 Quality risk to flag before release
- Order accepted despite payment rejection
- Error handling hides the root cause from the user
- Cart state is reset or corrupted after failed purchase attempts
- Partial order records are created without a valid final state

### 6.7 Signoff
- Tester: __________
- Date: __________
- Result: Pass / Fail / Blocked
- Notes: ________________________________

---

## 7. Manual test case: MQA-03 - Kafka async downstream processing under delay or failure

### 7.1 Purpose
Verify the post-checkout event is processed asynchronously without data loss, duplication, or inconsistent downstream state.

### 7.2 Preconditions
- Full demo profile or Kafka-enabled environment
- `fraud-detection` and `accounting` running
- Ability to inspect logs, Kafka topics, and telemetry data
- Optional: delayed downstream processing or failure injection

### 7.3 Steps
1. Create a valid cart and complete checkout.
2. Confirm the order event is emitted from checkout through the Kafka path.
3. Check that `fraud-detection` consumes the event and records or flags it appropriately.
4. Check that `accounting` records the transaction once.
5. Execute multiple orders to look for duplication or missed processing.
6. Introduce a delay or temporary outage in a downstream dependency and observe recovery behavior.

### 7.4 Expected results
- Order events are emitted once per checkout
- Downstream consumers update state without duplicates
- User-visible checkout remains predictable even when one consumer is slow
- Recovery after outage does not create inconsistent state

### 7.5 Edge cases
- Kafka broker restart or downtime
- Duplicate event caused by retry behavior
- Slow fraud evaluation causing backlog accumulation
- Consumer crash after reading event but before record write

### 7.6 Quality risk to flag before release
- Duplicate accounting or multiple fraud evaluations
- Order loss in downstream systems despite successful checkout
- Recovery creates inconsistent state that cannot be reconciled
- Missing telemetry makes event loss hard to diagnose

### 7.7 Signoff
- Tester: __________
- Date: __________
- Result: Pass / Fail / Blocked
- Notes: ________________________________

---

## 8. Release decision criteria

The release is not approved if any of the following conditions are observed:

- Checkout succeeds without accurate downstream order processing
- Invalid payment or address attempts create partial orders
- Async event processing cannot be traced or reconciled
- Critical flow telemetry is missing or inconsistent
- A known issue impacts business-critical checkout behavior without documented mitigation

## 9. Approvals

| Role | Name | Signature | Date |
| --- | --- | --- | --- |
| QA / manual tester |  |  |  |
| Release lead |  |  |  |
| Service owner (commerce) |  |  |  |
| Service owner (async reliability) |  |  |  |

## 10. Final recommendation

If all P0 manual checks pass with no unresolved defects in the critical purchase path, the release may proceed. Any failed or blocked P0 scenario should be treated as a release blocker until resolved or explicitly accepted by the release owner.
