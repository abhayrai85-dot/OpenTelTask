# Test Strategy for the OpenTelemetry Astronomy Shop Demo

## 1. Purpose and scope

This project is a distributed microservice demo with roughly 20 application services plus supporting observability and infrastructure components. The test strategy is intentionally risk-based: we do not attempt to give equal attention to every service. We focus on the service paths that can create user-facing business impact or silent data inconsistency.

The highest-risk business flow is the commerce transaction path:

- frontend / frontend-proxy
- cart
- checkout
- payment
- currency
- shipping / quote
- email
- Kafka async downstream path
- accounting and fraud-detection

This is the flow that most directly affects customer trust and business correctness.

---

## 2. What carries the most quality risk

### Business-critical services
These services carry the highest risk because they are directly on the customer transaction path and can produce monetary or order integrity problems:

- checkout: highest criticality in the repo configuration; it orchestrates the purchase flow and emits downstream events
- payment: errors here create direct financial risk
- cart: incorrect totals or cart state can cause bad orders
- currency: conversions must be accurate and consistent across the purchase flow
- shipping / quote: incorrect shipping calculations create customer-visible order errors
- frontend / frontend-proxy: these are the user-facing entry points and often reveal system-wide issues first

### Async reliability risk
The second major risk area is the Kafka event path:

- checkout emits an order message to Kafka
- fraud-detection and accounting consume the same order stream
- if these processes fail, duplicate, lag, or lose events, the user can see a successful order while downstream systems remain inconsistent

This is the classic distributed-system defect pattern: success at the UI layer, silent inconsistency downstream.

### Observability and platform paths
These are not direct business flows, but they are necessary for quality and debugging:

- OpenTelemetry collector
- Jaeger
- Prometheus
- OpenSearch
- flagd
- Kafka
- valkey and supporting infrastructure

If these fail, the system becomes hard to verify and diagnose, which creates quality risk even when app-level logic is correct.

---

## 3. Test pyramid

### Unit tests
Unit tests are the largest layer and should cover deterministic logic in each service:

- cart item totals and quantity handling
- currency conversion correctness and rounding
- shipping cost calculations
- payment validation and error handling
- fraud logic if formalized later
- order result formation and serialization

These tests should be fast, isolated, and run in PR pipelines.

### Integration tests
This is the most important operational layer for this system. The objective is to verify cross-service behavior using real dependencies but without a full end-user workflow.

Examples:

- cart -> checkout -> payment
- checkout -> shipping -> quote
- checkout -> email
- checkout -> Kafka -> accounting
- checkout -> Kafka -> fraud-detection
- frontend -> backend service calls

These tests should run frequently and be the main guardrail for correctness in the distributed system.

### Contract tests
Contract tests are essential because the suite spans many languages and protocols.

They should validate:

- gRPC interfaces
- HTTP payloads
- Kafka message schemas and payload format
- telemetry schema expectations
- compatibility of event content between producers and consumers

This is especially important in a repo where services are implemented in Go, .NET, Java, Python, Ruby, and Node.js.

### End-to-end tests
E2E tests should be deliberately small but high-value.

Minimum set:

- successful purchase flow
- invalid payment or invalid address
- empty cart checkout blocked
- async downstream processing verified end-to-end

We should not attempt to automate every front-end path. The goal is to validate the critical customer journey and a small set of failure states.

### Performance and load tests
The repo already contains k6-based load-generation patterns, which is the right tool for this workload.

Focus areas:

- browse-heavy traffic mix
- checkout traffic spikes
- cart and checkout latency under load
- Kafka lag under queue stress
- recovery behavior after slowdown or outage

These are not the first layer of regression defense; they are the release confidence layer for scale and resilience.

### Deliberately left unautomated
We should not over-invest in automation for:

- broad exploratory breakage testing across every service
- purely visual UX polish checks
- every possible failure combination across all 20 services
- long-tail chaotic conditions that are better handled with manual exploratory testing and monitoring

These belong in exploratory QA and production observability practice rather than in the regular automated suite.

---

## 4. QA ownership in a pod model

With a system of about 20 services, ownership should follow functional pods, not individual service count.

### Recommended pod structure

- Commerce pod
  - frontend, frontend-proxy, cart, checkout, product-catalog, currency, payment, shipping, quote, email
- Async reliability pod
  - kafka, accounting, fraud-detection
- Experience and discovery pod
  - ad, recommendation, image-provider, load-generator
- Platform / observability pod
  - otel-collector, jaeger, prometheus, opensearch, flagd, valkey, postgres
- Agentic / assistant pod
  - agent, mcp, chatbot

### Ownership rules
Each pod owns:

- service-level quality for its services
- interface validation at pod boundaries
- regression triage in its flows
- operational health checks for its services

There must also be one release owner for the critical business flow. The full purchase journey is not owned by a single service team; it spans multiple pods. That flow owner is the person who decides whether the system is ready to ship.

---

## 5. Quality gates in CI/CD

### Pull request gate
Required for every PR that touches app code or service configuration:

- unit tests for changed services
- integration tests for changed interfaces
- contract checks for API or schema updates
- minimal telemetry sanity tests

This is the fast feedback gate.

### Pre-deploy gate
Before the system is promoted to a shared environment:

- end-to-end smoke test of the full stack
- checkout success path
- invalid payment / invalid address path
- async downstream ordering validation
- basic performance sanity check

### Nightly gate
Nightly or scheduled runs should include:

- broader E2E regression matrix
- load and latency checks
- failure and recovery exercise
- observability and telemetry validation

### Release gate
Before final release or signoff:

- critical checkout flow passes
- Kafka async path is validated
- no open defects in critical business flows
- performance is within acceptable baseline
- QA signoff is completed

---

## 6. Metrics to track

The metrics must reflect risk and release confidence, not just test volume.

### Core QA metrics
- defect leakage: defects found after merge or after deployment
- escaped defects: defects that reach the user or release candidate without being caught in QA/CI
- automation coverage: % of critical user flows and service interfaces covered by automated tests
- regression stability: pass rate of checkout and async integration tests over time
- flaky test rate: separate from real failures
- mean time to detect and triage: especially important for async issues
- telemetry coverage: % of critical services emitting expected traces, metrics, and logs

The most important KPI is not “how many tests exist” but “how often critical purchase-flow defects escape to the customer or release candidate.”

---

## 7. Release decision standard

The system should not be considered ready for release unless the following are true:

- the critical purchase flow passes end-to-end
- payment and validation failure paths behave safely
- the Kafka-based async order path is verified for consistency and recovery
- telemetry remains reliable enough to identify failures
- the pod owners agree the affected flows are stable

This is a distributed system, so quality evidence must come from both business-flow validation and observability-based verification.

---

## 8. Executive summary

The demo is a large distributed system, but the quality strategy does not need to be broad and shallow. It needs to be deep on the right edges.

The system’s highest-value testing is concentrated in:

- the purchase journey
- checkout validation and payment safety
- Kafka-driven async processing
- observable service-to-service contracts

If we protect those, we protect the system’s real business integrity.
