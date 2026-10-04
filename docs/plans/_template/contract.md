---
title: <Short title in CONTEXT.md vocabulary>
type: feat # feat | fix | refactor — matches the branch prefix
status: draft # draft | approved — set to approved only on the human's explicit approval
approved: # YYYY-MM-DD, written on approval and bumped with each approved amendment
issue: # optional, e.g. "#5"
---

## Goal

<One or two sentences: what changes, for whom, and why.>

## Acceptance criteria

<!--
3–8 criteria. Each describes observable behaviour, not implementation, and has one Verify line.
Verify kinds: test | command | screenshot | manual.
fix: AC-1 is "A regression test reproduces <the bug>: it fails before the fix and passes after".
refactor: AC-1 is "Existing tests pass without modification".
-->

- **AC-1:** <observable behaviour>
  - Verify: test — <which test proves it>
- **AC-2:** <observable behaviour>
  - Verify: command — <which command, expected output>
- **AC-3:** <observable behaviour>
  - Verify: screenshot — <what the screenshot shows>

## Out of scope

- <What was discussed and deliberately left out.>

## Amendments

<!-- After approval only. Each: `- YYYY-MM-DD — AC-n: what changed — why`. Bump `approved:` in the same commit, only on the human's explicit approval. Never edit anything above this section after approval. -->
