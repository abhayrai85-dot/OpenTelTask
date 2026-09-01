# MQA-03: Kafka async order-processing path

## Objective
Validate that the post-checkout event is processed asynchronously without duplication, loss, or inconsistent downstream state.

## Priority
P0

## Risk area
Async reliability, Kafka consumer behavior, and downstream data integrity

## Scope
This test validates the Kafka path triggered by checkout, including `fraud-detection` and `accounting` consumers. It focuses on the non-user-visible but high-risk portion of the system.

## Preconditions
- Full demo profile or Kafka-enabled environment is running
- `fraud-detection` and `accounting` are active
- Kafka topic is available and healthy
- Observability tools are available to inspect messages and spans
- Optional: feature flags or delay injection are available for failure simulation

## Test steps
1. Create a valid cart and place an order.
2. Confirm that checkout emits an event to Kafka.
3. Observe the emitted message and verify the event is structured correctly.
4. Confirm `fraud-detection` consumes the event and logs/records the order.
5. Confirm `accounting` also processes the same order without duplication.
6. Repeat the flow multiple times to detect duplicate or missing records.
7. Introduce a delayed downstream condition or temporary consumer outage.
8. Observe recovery behavior and confirm backlog processing is consistent.
9. Review telemetry for lost spans, duplicate processing, or delayed handling.

## Expected results
- Order event is emitted once per checkout
- Downstream services consume the message without duplicate writes
- No data loss occurs during normal processing
- Recovery after delay or outage is consistent and coherent
- Telemetry provides enough visibility to trace the async path

## Edge cases
- Kafka restart or temporary broker disruption
- Consumer lag caused by delayed fraud processing
- Duplicate event due to retry behavior
- Crash after message read but before persistent write
- High-order volume burst in a short interval

## Defect criteria
Fail the test if any of the following are observed:
- Duplicate order processing in `accounting` or `fraud-detection`
- Order event missing after a successful checkout
- Recovery path creates inconsistent record state
- Telemetry cannot prove message flow or identify the failure point

## Release risk statement
This is the hidden-risk path: the user may see a successful order while downstream systems are inconsistent. This is precisely the type of defect that escapes happy-path QA unless async validation is included.

## Sign-off
- Tester: __________________
- Date: ___________________
- Result: Pass / Fail / Blocked
- Notes: __________________
