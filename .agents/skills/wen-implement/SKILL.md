---
name: wen-implement
description: Implement a Wen365 feat, fix or refactor against its approved contract, criterion by criterion, then hand over to /wen-self-check in the same session. Use once the human has approved the contract, when /wen-ship reaches the implement stage, or when self-check found unmet criteria.
---

> Adapted from an earlier version of `implement` in [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see [`../LICENSE-mattpocock-skills.txt`](../LICENSE-mattpocock-skills.txt)).

# wen-implement

## 1. Load the contract

Run `node scripts/agent-workflow/plan.mjs`.

- `status: "approved"` → continue.
- `status: "draft"` → stop. The human hasn't approved the contract yet; point them to it.
- Fails → stop and show the message. "No contract on this branch" means the work needs `/wen-contract` first.

Read the contract in full, including `## Amendments`, plus [`docs/agent-workflow.md`](../../../docs/agent-workflow.md) and the `AGENTS.md` of every directory you will touch.

If `self-check.md` already exists in the plan folder, you are re-entering: work only on the criteria it marks `not met` or `partial`.

## 2. Plan locally (optional)

For anything beyond a few steps, write `docs/plans/<folder>/implementation-plan.md`. Git ignores it; never commit it. The contract stays the spec.

## 3. Work criterion by criterion

For each criterion, in order:

- `Verify: test` → use `/wen-tdd` at the seam the criterion names.
- Any other kind → implement, then produce the evidence the Verify line names: run the command, take the screenshot, or write down the manual check for the human.
- Run `pnpm type-check` and the affected test files as you go.
- Commit when the criterion is done, with the contract's type: `feat: …`, `fix: …` or `refactor: …`.

Change only what a criterion needs. Unplanned changes show up as `added` in drift; if something else should change, note it for the human instead.

Never weaken a gate to get green: no `.skip`, `.only`, lint or type suppressions, deleted assertions, or config changes unless the work truly requires one. Self-check will ask you to justify each.

Keep a note of friction while you work: anything that took several attempts, or that the docs should have told you.

## 4. Finish

Run `pnpm test run`, `pnpm lint` and `pnpm type-check`, and commit. Then run `/wen-self-check` **in this same session**: it needs your memory of what was hard.
