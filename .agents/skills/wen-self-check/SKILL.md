---
name: wen-self-check
description: Check a Wen365 implementation against its contract with evidence, account for every weakened gate, and record friction and known patterns in self-check.md. Use right after /wen-implement in the same session, or when /wen-ship reaches the self-check stage.
---

# wen-self-check

Writes `docs/plans/<folder>/self-check.md` from [`docs/plans/_template/self-check.md`](../../../docs/plans/_template/self-check.md). Format and vocabulary: [`docs/agent-workflow.md`](../../../docs/agent-workflow.md#self-check).

Commit all implementation work first: the scripts read committed changes only.

## 1. Inputs

- `node scripts/agent-workflow/plan.mjs` → the contract (`contractPath`, `folder`).
- `node scripts/agent-workflow/review-context.mjs` → `diffCommand` and `patterns`.

## 2. Known patterns

Read each file in `patterns` and check the diff (`diffCommand`) for it. Fix every hit and commit. Record ``- `slug`: <n> found and fixed`` per pattern with hits, or "None found."

## 3. Gate changes

Run `node scripts/agent-workflow/gate-changes.mjs`. For each item, either revert it (commit, rerun the script; it disappears) or keep it and list it under `## Gate changes` as:

``- `file` · kind · `text` — justified: <reason>``

Copy `file`, `kind` and `text` exactly from the script's output. If `text` contains backticks, wrap it in double backticks with spaces: ` `` text `` `.

## 4. Criteria

One row per contract criterion, amended ones included.

- `met` only with evidence on this branch that you checked in this run: re-run any test you cite (`pnpm vitest run <file> -t "<test name>"`) and read it pass. Name the test, command, `file:line` or screenshot path.
- If you can't prove it: `not verified`, with the reason. Never round up.
- `partial` / `not met`: say what's missing.

## 5. Friction

From your memory of the implementation: what took several attempts, and what the docs should have told you. If this session did not implement the work: "Not recorded (fresh session)."

## 6. Lint and decide

Leave `reviewed:` and `## Review fixes` empty; `/wen-code-review` fills them.

Run `node scripts/agent-workflow/self-check-lint.mjs`.

- **Exit 0** → commit `docs(self-check): <contract title>` and hand over to `/wen-code-review`. Mention any `warning:` lines (`not verified`) to the human; they go into the PR.
- **A criterion `not met` or `partial`** → go back to `/wen-implement` for it, then run this skill again. Do this **once**. If it is still not met, stop and tell the human: they either amend the contract (`/wen-contract`, Amendments) or unblock you. Don't commit a failing self-check.
- **Any other problem** (missing row, unjustified gate change) → fix the self-check and lint again.
