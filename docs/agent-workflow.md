# Agent workflow

How feat, fix and refactor work moves from an idea to a merged PR in Wen365, and how recurring problems flow back into this repo's guidance. Design and rationale: [`docs/plans/2026-10-04-agent-workflow/design.md`](./plans/2026-10-04-agent-workflow/design.md).

Self-improvement = drift + repetition + human review. The loop improves the harness (guidance, lint rules, templates), not the model.

## What exists today

The workflow is being built in five PRs (design section 9). This table is updated by each one.

| Step                 | Skill / script                                               | Available |
| -------------------- | ------------------------------------------------------------ | --------- |
| Clarify the idea     | `/wen-grilling`                                              | ✅        |
| Write the contract   | `/wen-contract`, `contract-lint.mjs`                         | ✅        |
| Review the contract  | `/wen-contract-review`                                       | ✅        |
| Find the contract    | `plan.mjs`                                                   | ✅        |
| Implement            | `/wen-implement`, `/wen-tdd`                                 | ✅        |
| Self-check           | `/wen-self-check`, `gate-changes.mjs`, `self-check-lint.mjs` | ✅        |
| Code review          | `/wen-code-review`, `review-context.mjs`                     | ✅        |
| Drift and patterns   | `/wen-drift`, `review-threads.mjs`, `patterns.mjs`           | PR 3      |
| Orchestration and CI | `/wen-ship`, `status.mjs`, `check.mjs`                       | PR 4      |
| Automatic promotion  | `/wen-drift`                                                 | PR 5      |

Until a step exists, do it by hand the way the design describes, or skip it.

## Paths

The branch prefix decides the path: `feat`, `fix` or `refactor` followed by `/` or `-` is the **full path**; any other Conventional Commits type is the **small path**. The PR title type must agree.

- **Full path:** grilling (optional) → contract → contract review → ⏸ human approves → implement → self-check → code review → PR → ⏸ review → drift → ⏸ human merges.
- **Small path:** implement → lint, type-check, tests → PR → ⏸ review → corrections-only drift if review led to changes → ⏸ human merges.

## Contracts

A contract lives at `docs/plans/<YYYY-MM-DD>-<slug>/contract.md`, created from [`docs/plans/_template/contract.md`](./plans/_template/contract.md). It states _what_ will be delivered and how each part is verified, never _how_ to build it. A branch carries exactly one contract: the one added on that branch (`node scripts/agent-workflow/plan.mjs` finds it).

- 3–8 acceptance criteria, numbered AC-1…n, each describing observable behaviour in [`CONTEXT.md`](../CONTEXT.md) vocabulary.
- Each criterion has one `Verify:` line: `test`, `command`, `screenshot` or `manual`, plus what exactly. If you can't say how it would be verified, the criterion is too vague.
- `fix`: AC-1 is a regression test that fails before the fix and passes after. `refactor`: AC-1 is "Existing tests pass without modification".
- `status: approved` and the `approved:` date are written only when the human explicitly approves. After approval nothing above `## Amendments` changes. A scope change is an amendment entry plus an `approved:` bump in the same commit, again only on explicit approval.
- Structure is checked by `node scripts/agent-workflow/contract-lint.mjs <path>`; judgement by `/wen-contract-review`.
- The step-by-step implementation plan is the implementing agent's own working file. Write it to `docs/plans/<folder>/implementation-plan.md`: git ignores it, so it stays next to the contract for resuming on the same machine but is never committed. Only `contract.md`, `self-check.md` and `drift.md` are committed.

## Self-check

`/wen-self-check` writes `docs/plans/<folder>/self-check.md` from [`docs/plans/_template/self-check.md`](./plans/_template/self-check.md):

- **Criteria:** one table row per contract criterion, amended ones included: `| AC-n | <status> | <evidence> |`.
- **Gate changes:** every item `gate-changes.mjs` reports that you kept, as ``- `file` · kind · `text` — justified: <reason>``. Entries match by file, kind and text, so later commits that shift line numbers don't invalidate them.
- **Friction** and **Known patterns**, from the implementing session.
- **Review fixes**, appended by `/wen-code-review`, which also sets `reviewed:` to the last reviewed commit.

`node scripts/agent-workflow/self-check-lint.mjs` checks it: every criterion present with a known status, evidence for `met`, `not met` or `partial` only when an amendment covers the criterion, and every kept gate change justified. `not verified` is a warning, not a failure.

## Vocabulary

**Criterion status** (self-check): `met` (evidence on this branch, checked in this run) · `partial` · `not met` · `not verified`.

**Drift result** per criterion (code review, drift): `delivered` · `dropped` (not shipped) · `weakened` (less than agreed) · `substituted` (shipped differently than agreed) · `unverified` (claimed without evidence) · `amended` (changed by an approved amendment). `delivered` and `amended` are clean. **`added`**: shipped work no criterion asked for.

**Entry sources** that can carry a pattern slug: contract drift, `added`, PR review corrections that led to a change, self-caught issues (self-check and code-review fixes), friction.

## Patterns

A pattern is a recurring problem with a stable slug: `docs/patterns/<slug>.md`.

```markdown
---
slug: kebab-case-name
target: lint # lint | prose
status: watching # watching | promoted | rejected
promoted-to: # e.g. eslint.config.mjs, app/AGENTS.md
rejected-reason:
---

One-line description.

**Bad:** …
**Good:** …
```

- Reuse an existing slug whenever one fits; create a new one only when none does.
- Counting is by **distinct PRs** whose `drift.md` cites the slug, not by occurrences.
- Promotion threshold: `target: lint` → 2 PRs, `target: prose` → 3 PRs. The human can promote any time.
- Promotion target, highest that fits: lint/type rule → `AGENTS.md` line → ADR → plan template or self-check checklist. Promotions land as their own `chore(harness): promote <slug>` PR.
- Self-check and code review check against `watching` patterns and `promoted` patterns whose `promoted-to` is prose. Lint-promoted and `rejected` patterns are skipped.

## Skills and scripts

- Skills live in `.agents/skills/wen-*/SKILL.md` (plain Markdown, any agent) and are symlinked into `.claude/skills/` for Claude Code. The `wen-` prefix keeps them from colliding with personal skills of the same name.
- Scripts live in `scripts/agent-workflow/`: Node ESM, no dependencies, results on stdout, reasons on stderr, exit 1 on failure. Any step that can be done mechanically is a script; skills only add judgement.
- Agents commit and push freely on feature branches. They never commit to `main`, merge, force-push, skip hooks or edit `git config`.
