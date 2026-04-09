# QA Room — Room Identity

## What This Room Is
The QA room handles all testing strategy, test implementation, coverage analysis,
and quality gates. It works with every other room to ensure that what ships works correctly.

**Primary AI:** Codex (for test implementation)
**Secondary AI:** Claude (for test strategy and coverage analysis)

## This Room Owns
- Test strategy and coverage targets
- Unit test implementation
- Integration test implementation
- End-to-end (E2E) test implementation
- Test fixture and mock data management
- CI coverage reporting and quality gates
- Regression test identification
- Performance test design

## This Room Does NOT Own
- Fixing the bugs tests find (→ relevant implementation room)
- Test infrastructure/CI setup (→ devops room)
- Security testing (→ security room handles that)

## Test Standards
- Unit tests: every new function has at least one test
- Integration tests: every new API endpoint has request/response tests
- E2E tests: every critical user flow has an E2E test
- Coverage target: ≥80% for new code (or match existing project target)
- Tests must be deterministic: no flaky tests shipped

## Files In This Room
- ROOM.md — you are here
- PROMPT.md — copy-paste to enter this room in Codex
- CONTEXT.md — current test coverage and strategy state

## Handoff Rules
**Receives feature specs from:** architect/product rooms
**Reports test results to:** HANDOFF.md + outbox/reports/
**Blocks deployments if:** failing tests — report to devops room

End of session: update CONTEXT.md + HANDOFF.md.
