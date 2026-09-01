# Playwright E2E Automation Skill

## 1. Purpose

This skill defines the standard for creating, updating, reviewing, and healing Playwright E2E automation in this repository.

The existing Playwright framework is the source of truth.

All agents must understand and follow the existing framework before creating or modifying automation.

The framework uses:

* Playwright
* TypeScript
* Page Object Model (POM)
* Reusable fixtures
* Reusable utilities
* Centralized test data
* Storage-state based authentication where available

The agent must NOT introduce a new framework pattern when an existing pattern can be reused.

---

# 2. Core Agent Workflow

For every automation request, follow this process:

```text
Requirement
    ↓
Understand business scenario
    ↓
Inspect repository
    ↓
Read existing framework patterns
    ↓
Search similar tests
    ↓
Search existing Page Objects
    ↓
Search fixtures/utilities/test data
    ↓
Reuse existing implementation
    ↓
Extend framework only when required
    ↓
Create/update test
    ↓
Execute test
    ↓
Analyze result
    ↓
Fix only genuine automation issues
    ↓
Re-run validation
    ↓
Final result
```

Never generate generic Playwright code without first inspecting the repository.

---

# 3. Repository Inspection

Before creating or modifying a test, inspect the existing repository.

The agent should identify:

* Test/spec directory
* Page Object directory
* Fixture directory
* Utility directory
* Test-data directory
* Playwright configuration
* Authentication/storage-state configuration
* Existing test patterns
* Existing naming conventions

Search for similar functionality before implementing anything new.

Example:

If the requirement is:

```text
Create a new contact
```

Search for:

```text
contact
ContactPage
createContact
addContact
newContact
```

The agent must reuse existing functionality whenever possible.

---

# 4. Page Object Model

This project MUST follow the Page Object Model.

## Rules

* Page-level locators belong inside Page Object classes.
* UI interactions belong inside Page Object methods.
* Tests should contain business scenarios.
* Tests should not contain unnecessary UI implementation details.
* Do not duplicate Page Objects.
* Do not duplicate locators.
* Do not duplicate business logic.

### Test responsibility

The test should describe:

```text
WHAT the user is doing
```

The Page Object should describe:

```text
HOW the application is interacted with
```

### Good

```typescript
await contactPage.clickAddContact();
await contactPage.fillContactDetails(contactData);
await contactPage.saveContact();
await contactPage.verifyContactCreated();
```

### Bad

```typescript
await page.getByTestId('add_contact').click();
await page.getByTestId('first_name_input').fill('John');
await page.getByTestId('save_contact').click();
```

If a suitable Page Object method already exists, the test must use it.

---

# 5. Page Object Structure

Each Page Object should represent:

* A page
* A logical page section
* A reusable UI component

Example:

```typescript
export class ContactPage {
  constructor(private readonly page: Page) {}

  private readonly addContactButton =
    this.page.getByTestId('add_contact');

  private readonly firstNameInput =
    this.page.getByTestId('first_name_input');

  private readonly saveButton =
    this.page.getByTestId('save_contact');

  async clickAddContact() {
    await this.addContactButton.click();
  }

  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  async saveContact() {
    await this.saveButton.click();
  }
}
```

Locators should normally be private.

Expose business-level methods instead.

---

# 6. Page Object Method Design

Methods should represent meaningful actions.

Prefer:

```text
clickAddContact()
fillContactDetails()
selectContactType()
addAddress()
saveContact()
verifyContactCreated()
```

Avoid low-level methods that expose unnecessary implementation details:

```text
clickButton()
clickElement()
fillField()
performClick()
```

Methods should be:

* Reusable
* Small
* Clear
* Business-oriented
* Easy to understand

Before creating a new method, search existing Page Objects for equivalent functionality.

---

# 7. Locator Strategy

Use the following locator priority:

1. `getByTestId()`
2. `getByRole()`
3. `getByLabel()`
4. `getByText()`
5. CSS/XPath only when necessary

Prefer stable, semantic locators.

Avoid:

* Generated CSS classes
* Dynamic IDs
* Fragile XPath
* Positional selectors
* Unnecessary `nth()`
* Selectors dependent on DOM structure

---

# 8. Test ID Convention

All new UI elements should have unique and meaningful `data-testid` values.

Examples:

### Button

```text
add_member
```

### Input

```text
company_name_input
```

### Dropdown

```text
role_multi-select-trigger
```

### Save button

```text
save_member
```

### Search input

```text
contact_search_input
```

### Add address

```text
add_address
```

Use the existing project naming convention consistently.

Never create duplicate test IDs.

If an existing test ID already exists, reuse it.

---

# 9. Test Structure

Tests should be readable and business-oriented.

Example:

```typescript
test('should create a new contact with valid information', async ({
  page
}) => {
  const contactPage = new ContactPage(page);

  await contactPage.clickAddContact();
  await contactPage.fillContactDetails(contactData);
  await contactPage.saveContact();

  await contactPage.verifyContactCreated();
});
```

The test should clearly communicate the business scenario.

---

# 10. Positive and Negative Coverage

For new functionality, consider both positive and negative scenarios.

## Positive scenarios

Examples:

* Valid data
* Successful submission
* Expected success message
* Expected data displayed
* Successful navigation
* Successful update

## Negative scenarios

Examples:

* Missing required fields
* Invalid email
* Invalid phone number
* Invalid date
* Invalid format
* Duplicate data
* Boundary values
* Unauthorized operation
* Server/API error where applicable

Do not invent application behavior.

Inspect existing tests, requirements, and application behavior first.

---

# 11. Assertions

Tests must verify meaningful business outcomes.

Do not only verify that an action was performed.

Bad:

```typescript
await contactPage.clickSave();
```

Good:

```typescript
await contactPage.saveContact();

await expect(
  page.getByText('Contact created successfully')
).toBeVisible();
```

For navigation, verify:

* URL
* Page/component visibility
* Important business data

For data creation, verify:

* Success state
* Created record
* Important record details

---

# 12. Navigation

Use Playwright's built-in waiting mechanisms.

For URL navigation:

```typescript
await Promise.all([
  page.waitForURL(/order\/detail\?orderId=/),
  page.getByTestId('order_button').click(),
]);
```

Do not use arbitrary waits.

Never use:

```typescript
await page.waitForTimeout(3000);
```

unless there is a documented and unavoidable reason.

Prefer:

```typescript
await expect(locator).toBeVisible();
```

```typescript
await expect(locator).toHaveText(...);
```

```typescript
await page.waitForURL(...);
```

---

# 13. Authentication and Storage State

Use the existing authentication mechanism.

If the framework already provides a storage-state JSON, reuse it.

Do not create a separate login flow for every test.

The agent must inspect:

```text
playwright.config.ts
```

and existing fixtures before implementing authentication.

Reuse existing:

```text
storageState
fixtures
authenticated contexts
```

where available.

---

# 14. Test Data

Use existing test-data patterns.

Before creating test data:

1. Search existing test-data files.
2. Search fixtures.
3. Search data builders/factories.
4. Reuse existing data utilities.

Do not hard-code data if the framework already provides a reusable mechanism.

For dynamic data, use existing utilities.

Example:

```typescript
const email = generateUniqueEmail();
```

Do not create another utility if an equivalent one already exists.

---

# 15. Reusable Utilities

Common functionality should be implemented in utilities or appropriate Page Objects.

Examples:

* Date generation
* Unique email generation
* Random test data
* API helpers
* Authentication helpers
* Common navigation
* Common assertions

Before creating a utility, search the existing repository.

Do not create duplicate utilities.

---

# 16. Fixtures

Use existing Playwright fixtures where available.

Before creating a new fixture:

1. Search existing fixtures.
2. Understand how the fixture is initialized.
3. Reuse or extend it when appropriate.

Avoid putting setup logic directly inside every test.

---

# 17. Existing Test Reuse

When a requirement relates to existing functionality:

```text
Search → Understand → Reuse → Extend
```

Example:

If existing tests already create contacts for:

```text
Individual
Business
Organization
Other supported contact types
```

and a new requirement is to add an address after contact creation:

Do not recreate contact creation logic.

Reuse the existing contact creation flow and add the address-specific coverage.

---

# 18. Data-Driven Testing

When the same scenario applies to multiple entities/contact types, prefer the existing data-driven pattern.

Example:

```typescript
for (const contactType of contactTypes) {
  test(`should add address for ${contactType}`, async ({ page }) => {
    // Reuse common flow
  });
}
```

Follow the existing framework's preferred parameterization/data-driven approach.

Do not create separate duplicated tests when the framework already supports reusable test data.

---

# 19. Test Naming

Use clear business-oriented names.

Good:

```text
should create a new contact with valid information
```

```text
should display validation when required contact fields are missing
```

```text
should add an address to an existing contact
```

Bad:

```text
test1
contactTest
testAddress
clickTest
```

---

# 20. Code Duplication

Avoid duplication.

Before adding code:

1. Search the repository.
2. Search Page Objects.
3. Search utilities.
4. Search fixtures.
5. Search existing tests.

If similar functionality exists, reuse it.

Do not create:

```text
addContact()
createContact()
createNewContact()
performContactCreation()
```

if they perform the same business action.

Use one clear reusable method.

---

# 21. Error Handling

Tests should fail for meaningful reasons.

Use descriptive assertions.

Example:

```typescript
await expect(
  contactPage.contactTable,
  'Contact should be displayed after creation'
).toBeVisible();
```

Avoid swallowing errors.

Do not use:

```typescript
try {
  ...
} catch {
  // ignore
}
```

unless there is a specific framework requirement.

---

# 22. No Artificial Waiting

Never add arbitrary waits to make a test pass.

Do not use:

```typescript
page.waitForTimeout()
```

as a general synchronization mechanism.

Instead use:

* Locator assertions
* `waitForURL`
* `waitForResponse`
* `waitForLoadState`
* Playwright auto-waiting
* Appropriate application state assertions

---

# 23. Test Isolation

Tests should be independent whenever possible.

Do not rely on another test having executed first.

Each test should establish the required state using:

* Fixtures
* APIs
* Test data
* Storage state
* Existing setup mechanisms

Avoid unnecessary dependencies between tests.

---

# 24. API Usage in E2E Tests

If the existing framework provides API utilities, reuse them.

API calls may be used for:

* Test data setup
* Test data cleanup
* Backend verification
* Faster preconditions

Do not directly connect to the database unless the project explicitly requires it.

Prefer existing application APIs or framework utilities.

---

# 25. Git Diff / Change Impact

When the automation request originates from a Git change or PR:

1. Read the Git diff.
2. Identify changed functionality.
3. Identify impacted Page Objects.
4. Identify impacted tests.
5. Search for related existing coverage.
6. Determine what tests need to be created or updated.

Do not run the entire test suite automatically if the framework supports targeted execution.

Prefer impacted tests first.

---

# 26. Test Execution

After generating or modifying automation:

1. Run the affected test.
2. Analyze the result.
3. Fix genuine automation issues.
4. Re-run the failed test.
5. Run related tests when appropriate.

Example:

```bash
npx playwright test tests/contact.spec.ts
```

Do not claim that a test passed unless it was actually executed.

---

# 27. Failure Classification

When a test fails, classify the failure before modifying code.

Supported classifications:

```text
PRODUCT_DEFECT
TEST_DEFECT
ENVIRONMENT_ISSUE
TEST_DATA_ISSUE
FLAKY_TEST
```

## PRODUCT_DEFECT

The application behavior is incorrect.

Action:

```text
Do not modify the test to hide the defect.
Report the defect for human review.
```

## TEST_DEFECT

The automation is incorrect.

Examples:

* Incorrect locator
* Incorrect assertion
* Incorrect test data
* Incorrect test flow

Action:

```text
Make the smallest safe fix.
Re-run the test.
```

## ENVIRONMENT_ISSUE

Examples:

* Application unavailable
* Service unavailable
* Network failure
* Environment configuration issue

Action:

```text
Do not modify the test unnecessarily.
Report the environment issue.
```

## TEST_DATA_ISSUE

The test data is invalid, unavailable, or conflicting.

Action:

```text
Use the existing test-data strategy to correct it.
```

## FLAKY_TEST

The test passes and fails inconsistently without a product change.

Action:

```text
Investigate synchronization, data isolation, timing,
network dependency, and other root causes.
```

Do not simply add a hard wait.

---

# 28. Self-Healing Rules

When healing a test:

```text
Failure
   ↓
Analyze
   ↓
Classify
   ↓
Identify root cause
   ↓
Make smallest safe change
   ↓
Run failed test
   ↓
Run related tests
   ↓
Validate
```

Never heal by:

* Removing assertions
* Skipping tests
* Disabling tests
* Adding arbitrary waits
* Weakening validation
* Changing unrelated code
* Hiding product defects

---

# 29. Human-in-the-Loop

Automation agents may create or modify test code according to these rules.

However, potentially risky changes should be surfaced for human review.

Examples:

* Application code changes
* Major framework changes
* Deleting tests
* Disabling tests
* Removing assertions
* Large-scale refactoring
* Changes affecting unrelated modules
* Changes with low confidence

The agent should prefer:

```text
Small change → Validate → Report
```

rather than:

```text
Large change → Assume correct
```

---

# 30. Agent Roles

The framework may be used by multiple QA agents.

## Planner

Responsible for:

* Understanding requirements
* Analyzing Git changes
* Identifying impacted functionality
* Finding existing coverage
* Identifying missing coverage
* Producing a structured test plan

Planner should not modify automation code unless explicitly requested.

## Generator

Responsible for:

* Implementing the approved test plan
* Reusing existing Page Objects
* Reusing utilities and fixtures
* Creating/updating tests
* Executing tests
* Reporting results

## Healer

Responsible for:

* Investigating failed tests
* Classifying failures
* Identifying root causes
* Making safe automation fixes
* Re-running tests
* Reporting the result

## Orchestrator

Responsible for coordinating the workflow:

```text
Requirement
    ↓
Planner
    ↓
Generator
    ↓
Test Execution
    ↓
Healer (only if required)
    ↓
Validation
    ↓
Final Report
```

---

# 31. Agent Communication

Agents should exchange structured information where possible.

Example Planner output:

```json
{
  "feature": "Add Address",
  "impactedTests": [
    "tests/contact.spec.ts"
  ],
  "existingPageObjects": [
    "ContactPage"
  ],
  "requiredCoverage": [
    "Create address with valid data",
    "Required field validation",
    "Invalid address data"
  ],
  "risk": "MEDIUM"
}
```

Generator consumes this information and implements the test.

If execution fails, the result is passed to the Healer.

---

# 32. Framework Extension Rules

Only extend the framework when existing functionality cannot satisfy the requirement.

Before adding:

* Page Object
* Utility
* Fixture
* Test-data builder
* Helper
* Base class

search for existing alternatives.

When extending:

* Follow existing naming conventions.
* Follow existing folder structure.
* Follow existing coding patterns.
* Keep the change focused.
* Avoid unrelated refactoring.

---

# 33. Definition of Done

A Playwright automation task is complete only when:

* Requirement is covered.
* Positive scenarios are covered where applicable.
* Negative scenarios are covered where applicable.
* Existing framework patterns are followed.
* Existing Page Objects/utilities are reused.
* No unnecessary duplication exists.
* Appropriate assertions exist.
* Test has been executed.
* Failures have been analyzed.
* Any automation fix has been validated.
* Final result is reported clearly.

---

# 34. Golden Rules

Always follow these rules:

```text
1. The existing framework is the source of truth.

2. Search before creating.

3. Reuse before duplicating.

4. Tests describe WHAT.

5. Page Objects describe HOW.

6. Locators belong in Page Objects.

7. Use stable locators.

8. Do not use arbitrary waits.

9. Verify business outcomes.

10. Do not hide product defects.

11. Make the smallest safe change.

12. Always validate generated or healed automation.
```

## Final Principle

The agent must behave like an engineer joining an existing Playwright team.

It should first understand the repository, follow established patterns,
reuse existing implementation, make minimal changes, execute the tests,
and provide evidence for its result.

Never treat this repository as a blank project when existing framework
functionality is available.
