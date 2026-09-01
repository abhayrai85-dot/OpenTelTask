---
name: heal-tests
description: Run the Playwright suite (or a subset), and for every failure dispatch the playwright-healer subagent to diagnose and, where it's a genuine automation defect, fix it — autonomously, with no commit and no human input required until final review. Use when a QA engineer wants failing tests investigated and fixed without babysitting the process, e.g. "heal the tests", "fix whatever's failing", "run and heal".
---

# Heal Tests

Runs Playwright tests and automatically diagnoses + fixes genuine automation defects, one subagent
(`playwright-healer`) per failing test. Nothing gets committed — every fix lands as an uncommitted, tagged
change in the working tree for a human to review with `git diff` before deciding to commit.

## Arguments

`$ARGUMENTS` may name a spec file, a `-g`/grep pattern, or be empty (whole suite). Pass it straight through
to `npx playwright test`.

## Steps

1. **Run the tests** to find current failures:
   ```bash
   npx playwright test $ARGUMENTS --reporter=list
   ```
   If everything passes, say so and stop — there is nothing to heal.

2. **Identify each distinct failing test** (file + test title + project/browser). Playwright retries are
   already reflected in the reporter output — a test that eventually passed after a retry is not a failure
   to heal.

   If the same test fails identically across multiple browser projects, treat it as one failure (the fix is
   almost always project-independent) and note the other projects in the healer's prompt so it can confirm
   the fix there too.

3. **Dispatch one `playwright-healer` subagent per distinct failure**, in parallel when there is more than
   one (independent failures don't need to wait on each other — send the `Agent` calls in a single message).
   Give each agent enough context to work without coming back to ask:
   - The exact test file path and test title (and how to run just that test)
   - The failure output you saw for it
   - The path to this repo and confirmation it's not a git repo yet (so "don't commit" is about not running
     git at all, not about a specific branch)

4. **Wait for all healer agents to finish**, then read their reports.

5. **Present a consolidated summary** to the user:
   - Fixed (with a one-line reason per test)
   - Reported as PRODUCT_DEFECT or ENVIRONMENT_ISSUE (not touched — these need human attention on the app
     or environment, not the test code)
   - Left unresolved (attempted but not confidently fixed)
   - Point them at `HEALER_REPORT.md` for full detail and remind them nothing was committed — review with
     `git diff` (once the repo has git initialized) or by re-running `npx playwright test` before deciding
     to keep the changes.

Do not commit, stage, or run any git command yourself at any point in this flow either — that constraint
applies to the orchestration, not just to the healer subagents.
