---
name: wen-contract-review
description: Cold review of a Wen365 contract (docs/plans/*/contract.md) by a fresh subagent on a different model, returning blocking findings and suggestions. Use from /wen-contract before the human approves, or on demand for any draft contract.
---

# wen-contract-review

Input: the path to a `contract.md`. Without one, use `contractPath` from `node scripts/agent-workflow/plan.mjs`.

## 1. Lint first

Run `node scripts/agent-workflow/contract-lint.mjs <path>`. If it fails, return the problems and stop: structure gets fixed before judgement.

## 2. Dispatch a fresh reviewer

The reviewer must not share this conversation, so the author's assumptions don't carry over.

- **Claude Code:** Agent tool, `subagent_type: general-purpose`, `model: fable`.
- **Other agents:** a fresh-context subagent on a different model from the author's, if available.
- **No subagent available:** tell the human the review can't run independently and stop. Do not review the contract yourself in this context.

Send exactly this prompt, with `<path>` filled in:

> You are reviewing a contract cold, in the Wen365 repo. Read only: `<path>`, `CONTEXT.md`, `docs/adr/*.md`, `docs/agent-workflow.md` (section "Contracts"), and the `AGENTS.md` files of the directories the goal concerns (root, `app/`, `server/`, `test/`). Read-only: do not edit anything.
>
> A contract states what will be delivered and how each criterion is verified. It deliberately does not say how to build it. Check:
>
> 1. **Gaps:** behaviour the goal implies that no criterion covers, such as error states, empty states, loading, phone width and dark mode for UI, signed-out access or Session expiry.
> 2. **Ambiguity:** a criterion two reasonable reviewers would judge met/not met differently.
> 3. **Feasible verification:** can each `Verify:` actually be produced in this repo? Check `vitest.config.ts` for test projects; a screenshot needs a running app with an `ALCHEMY_API_KEY`.
> 4. **Implementation in disguise:** a criterion that prescribes files, functions, libraries or patterns instead of behaviour.
> 5. **Conflicts:** contradicts an ADR, or uses a term that isn't in `CONTEXT.md` or is an alias for one that is.
> 6. **Scope:** several deliverables that should be separate contracts, or something important missing from "Out of scope".
>
> Ignore prose style and structure (already linted). Report each finding as: **BLOCKING** or **SUGGESTION** · criterion ID or "contract" · the problem · a proposed rewrite. BLOCKING means drift could not be judged fairly later, or the work would be built wrong. Under 500 words. If there is nothing to report, answer "No findings."

## 3. Return

Return the reviewer's findings verbatim to the caller. When called by `/wen-contract`, the author fixes blocking findings once; this skill never edits the contract.
