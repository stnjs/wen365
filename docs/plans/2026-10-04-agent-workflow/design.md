# Agent workflow: self-check, drift and pattern promotion

- **Date:** 2026-10-04
- **Status:** approved; PRs 1–2 merged (#29, #30), PR 3 in progress
- **PR type:** `chore(harness)` (small path: this work creates the gate, so it cannot pass its own full-path checks)

This is the first plan folder in the repo. It holds a design doc rather than a `contract.md` because the contract template is one of the things this work creates.

## 1. Intent

Wen365 is built mostly by coding agents, with one human reviewer. Today the harness is guidance only (`AGENTS.md` files, `CONTEXT.md`, ADRs) plus CI and CodeRabbit on PRs. Nothing records where agents repeatedly fall short, so the same corrections are made by hand again and again.

This work adds a loop that turns repeated agent failures into harness improvements:

1. Every non-trivial change starts from a short, approved **contract** (goal + checkable acceptance criteria).
2. The implementing agent **self-checks** its work against the contract with evidence.
3. Before merge, a **drift** step records where shipped work differs from the contract and which review corrections were needed, each tagged with a **pattern** slug.
4. When the same pattern recurs across enough PRs, it is **promoted** into the harness (a lint rule, an `AGENTS.md` line, an ADR, or a template change) through a reviewed PR.

The loop improves the harness, not the model: self-improvement = drift + repetition + human review.

### Success criteria

- A repeated correction (example: `const foo: Ref<string> = ref<string>("…")` instead of `const foo = ref<string>("…")`) is logged with a stable slug each time it happens, and once it reaches the threshold a promotion PR proposing a lint rule is opened by the next drift run, without anyone remembering to do it.
- A feat/fix/refactor PR cannot pass CI without an approved contract (changed only through human-approved amendments), a complete self-check, and a current drift entry.
- Small changes (icons, copy, deps) are not slowed down.
- The whole workflow runs on any machine that checks out the repo, without personal skills or plugins.

### Constraints

- **Agent-agnostic.** Guidance is plain Markdown that any agent can read. Tool-specific files may only point back to it (root `AGENTS.md`, "Maintaining agent guidance").
- **Self-contained.** Every skill the workflow calls lives in the repo.
- **Scripts first.** Any mechanical step (lookup, diffing, counting, assembling output, status detection) is a script. The model only does judgement. Scripts are reused by CI where possible.
- **No collisions with personal skills.** Claude Code resolves same-named skills as personal over project ([skills docs](https://code.claude.com/docs/en/skills), "Resolve skills that share a name"), and only discovers `.claude/skills/`, not `.agents/skills/`. So every repo skill is prefixed `wen-` and symlinked into `.claude/skills/`.
- **Commit authority.** The `main` ruleset already requires a PR, squash merges only, the CI check, linear history, and blocks force-pushes and deletion. The root `AGENTS.md` rule "Don't commit without an explicit request from the user" dates from working directly on `main` and is removed in this work. Agents commit and push freely on feature branches. They still never commit to `main`, merge, force-push, skip hooks, or edit `git config`. They set `status: approved` or bump `approved:` only when the human explicitly approves in the conversation.

## 2. Workflow

Two paths. The path is decided by the **branch name prefix**, which is the one piece of state that exists from the first moment and survives across sessions: `feat`, `fix`, `refactor` followed by `/` or `-` → full path; any other Conventional Commits type prefix → small path. Branches without a recognised prefix are asked about once and the agent proposes a rename. The PR title type must agree (section 5.11, check 0).

**Full path** — `feat`, `fix`, `refactor`:

```
wen-grilling (optional)
  → wen-contract → contract-lint.mjs → wen-contract-review → author revises once
  ⏸ checkpoint 1: human approves contract
  → wen-implement → wen-self-check (same session) → wen-code-review → fixes
  → open PR
  ⏸ checkpoint 2: human + CodeRabbit review; agent addresses threads; repeat
  → wen-drift → promotion PRs (if due)
  ⏸ checkpoint 3: human merges
```

**Small path** — every other type (`style`, `chore`, `docs`, `test`, `ci`, `build`, `perf`):

```
build (implement + lint, type-check, tests) → open PR
⏸ review; agent addresses threads
→ corrections-only wen-drift, only if review threads led to changes
⏸ human merges
```

`/wen-ship` drives both paths (section 5.10). Each step is also runnable on its own.

## 3. File layout

```
.agents/skills/                       real skill files, any agent
  wen-ship/SKILL.md
  wen-grilling/SKILL.md               adapted from personal skill, Wen365 examples only
  wen-tdd/SKILL.md                    loop rules; test/AGENTS.md is the testing reference
  wen-contract/SKILL.md
  wen-contract-review/SKILL.md
  wen-implement/SKILL.md
  wen-self-check/SKILL.md
  wen-code-review/SKILL.md
  wen-drift/SKILL.md
.claude/skills/wen-*                  symlinks → ../../.agents/skills/wen-*

docs/agent-workflow.md                single source for the workflow, the drift vocabulary,
                                      the counting rule and promotion targets. Skills link here.
docs/plans/
  _template/contract.md
  _template/self-check.md
  _template/drift.md
  YYYY-MM-DD-<slug>/                  one folder per piece of work
    contract.md                       full path only
    self-check.md                     full path only
    drift.md                          full path always; small path only when there were corrections
    implementation-plan.md            optional, agent's working file, gitignored
docs/patterns/
  <slug>.md                           one file per pattern

scripts/agent-workflow/
  plan.mjs  review-context.mjs  gate-changes.mjs  contract-lint.mjs  self-check-lint.mjs  drift-lint.mjs
  review-threads.mjs  pr-body.mjs  patterns.mjs  status.mjs  check.mjs
  lib/                                shared helpers (frontmatter, markdown, git, cli, contract, self-check, pattern, drift)

.github/workflows/agent-workflow.yml  the CI gate
test/unit/agent-workflow/             script tests
```

- Folders are date-named, not numbered, so parallel worktrees never pick the same name.
- Drift entries and patterns are one file each, so parallel PRs rarely touch the same file. The one exception: two parallel PRs creating the same new pattern slug conflict on merge; the second one keeps the existing file.
- Root `AGENTS.md` gets a short "Workflow" section pointing to `docs/agent-workflow.md` and `/wen-ship`, and a table row for `.agents/skills/`.
- Root `AGENTS.md` "What NOT to do": drop "Don't commit without an explicit request from the user"; add "Never commit to `main`".
- Copied skills keep attribution to their source and comply with its license (to verify during implementation).

## 4. Shared vocabulary (lives in `docs/agent-workflow.md`)

**Criterion statuses** (self-check): `met` · `partial` · `not met` · `not verified`. `met` requires evidence on the branch that was checked in this run.

**Drift results** (code review, drift), per criterion: `delivered` · `dropped` (not shipped) · `weakened` (shipped with less than agreed) · `substituted` (shipped differently than agreed) · `unverified` (claimed without evidence) · `amended` (changed via an approved amendment). `delivered` and `amended` are clean: no slug, not counted. Plus `added`: shipped work no criterion asked for.

**Entry sources** that can carry a pattern slug: contract drift, `added`, PR review corrections, self-caught (self-check known patterns + review fixes), friction.

**Promotion targets**, highest first: lint/type rule → `AGENTS.md` line → ADR → plan template or self-check checklist.

**Patterns read by self-check and code review:** `status: watching`, plus `status: promoted` with a prose `promoted-to` (prose rules still need checking by hand). Patterns promoted to lint and `rejected` patterns are skipped.

## 5. Components

### 5.1 Contract (`docs/plans/_template/contract.md`)

```markdown
---
title: Multiple Wallets per Session
type: feat # feat | fix | refactor
status: draft # draft | approved — only the human approves
approved: # YYYY-MM-DD, set by the human on approval and on each amendment
issue: "#5" # optional
---

## Goal

One or two sentences: what changes, for whom, why.

## Acceptance criteria

- **AC-1:** <observable behaviour, CONTEXT.md vocabulary>
  - Verify: test | command | screenshot | manual — <what exactly>

## Out of scope

- …

## Amendments

<!-- After approval only. Each: date, AC, what changed, why. `approved:` is bumped in the same commit, only on the human's explicit approval. -->
```

There is no `branch:` field. A branch's contract is the single `docs/plans/*/contract.md` added in `merge-base(origin/main, HEAD)..HEAD`, so renaming the branch never breaks the link.

Rules: criteria describe observable behaviour, not implementation; every criterion has a `Verify:` line; 3–8 criteria (more means split the work); `fix` contracts start with a regression-test criterion (fails before, passes after); `refactor` contracts start with "existing tests pass without modification".

**Amendments.** After first approval, the body above `## Amendments` never changes. A scope change is an entry under `## Amendments` **plus** `approved:` bumped to the approval date in the same commit. The agent writes that bump only after the human explicitly approves the amendment in the conversation. An amendment without a bumped `approved:` is not approved (check 3). CI cannot prove who approved, so the job summary lists every commit that changed `approved:` for the reviewer to see.

### 5.2 `wen-contract`

Input: current conversation (usually after `/wen-grilling`) or an issue number. Reads `CONTEXT.md` and relevant ADRs, writes `contract.md` with `status: draft`, runs `contract-lint.mjs`, then `/wen-contract-review`, revises once, and presents the contract plus a review note (what was flagged, what changed, which suggestions are left to the human). Stops. On explicit human approval in the conversation, writes `status: approved` and the date the human gave, and commits as `docs(plan): <title>`.

### 5.3 `contract-lint.mjs`

Deterministic structure check: frontmatter fields present and valid; AC IDs sequential from AC-1; each AC has a `Verify:` line with an allowed kind; 3–8 ACs; type-specific first criterion for `fix` / `refactor`. Exit non-zero with a list of problems.

### 5.4 `wen-contract-review`

Fresh subagent; in Claude Code it runs with `model: fable`, other agents use their alternative model. It sees only the contract, `CONTEXT.md`, ADRs and relevant `AGENTS.md` files, not the authoring conversation. Checks: gaps the goal implies (error/empty states, phone width, dark mode, Session expiry); ambiguity; whether each `Verify:` is feasible in this repo; implementation disguised as criteria; ADR or vocabulary conflicts; scope size. Each finding is `blocking` or `suggestion`. The author fixes blocking findings in one round; no reviewer loop.

### 5.5 `wen-implement`

Based on the personal `implement` skill. Refuses to start without an approved contract (`plan.mjs`). Works criterion by criterion, `/wen-tdd` where `Verify:` is a test, type-check and single test files as it goes, full suite at the end, Conventional Commits. Does not call code review. Ends by invoking `/wen-self-check` in the same session. Re-entered whenever self-check reports a criterion `not met` or `partial` without an amendment.

### 5.6 `wen-self-check` and `gate-changes.mjs`

Writes `self-check.md`:

- **Criteria:** table of AC · status · evidence, listing every criterion including amended ones. Evidence is a test name, command, `file:line` or screenshot, and the agent re-runs any cited test.
- **Gate changes:** every item from `gate-changes.mjs` as `file · kind · text`, each either reverted or justified.
- **Friction:** what took several attempts or what the docs should have said. If self-check runs in a different session from implementation: "not recorded (fresh session)".
- **Known patterns:** each pattern from the read set (section 4) checked against the diff; hits listed and fixed.
- **Review fixes:** appended later by `wen-code-review`.

`gate-changes.mjs` scans `git diff merge-base(origin/main, HEAD)..HEAD` and reports: added lines containing `.skip(`, `.only(`, `.todo(`, `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `as any`; deleted test files; removed lines containing `expect(`; any change to `eslint.config.mjs`, `vitest.config.ts`, `tsconfig.json`, `.github/workflows/**`, or `scripts` in `package.json`. Output: JSON list of `{file, line, kind, text}`. `line` is informational only; matching (check 6) uses `file + kind + text`, so later commits that shift lines do not invalidate the self-check.

Outcome: all `met` and all gate changes resolved → continue. Otherwise fix and re-run once; if still not met, stop and report to the human (amend the contract or unblock).

### 5.7 `wen-code-review` and `review-context.mjs`

Based on the personal `code-review` skill: two axes, two parallel fresh subagents, reported side by side.

`review-context.mjs` outputs: base = merge-base with `origin/main`, diff command, commit list, changed files, applicable `AGENTS.md` files (root + per-directory for touched paths), ADR list, pattern files in the read set, contract and self-check paths.

- **Spec axis:** contract + self-check. Verifies each `met` claim's evidence actually demonstrates the criterion. Reports in drift vocabulary.
- **Standards axis:** applicable `AGENTS.md` files, ADRs, `CONTEXT.md`, the pattern read set, plus the Fowler smell baseline. Cites a pattern slug when a finding matches one. Skips what tooling enforces.

Removed from the personal version: issue-tracker setup references and asking for a fixed point. The implementing agent fixes findings and logs each fixed one in `self-check.md` `## Review fixes` with a slug where one fits, then marks the self-check as reviewed (a `reviewed: <sha>` line).

### 5.8 Opening the PR (`pr-body.mjs`)

Title `<type>: <contract title>` (type from the contract, which matches the branch prefix). Body: agent-written `## Summary` (a few lines), then script-assembled contract link, criteria table, gate changes and review fixes from `self-check.md`. Pushes and runs `gh pr create` as a normal (non-draft) PR so CodeRabbit reviews it.

### 5.9 `wen-drift`, `review-threads.mjs`, `patterns.mjs`

**Agent replies on threads.** Every reply the agent posts starts with `🤖 wen-ship:` because it posts under the human's GitHub account and is otherwise indistinguishable. A fix reply reads `🤖 wen-ship: fixed in <sha>` and the agent then resolves the thread. A decline reply gives the reason and leaves the thread unresolved for the human.

**Collect (scripts).** `review-threads.mjs` reads PR review threads via `gh api graphql` and keeps a thread as a correction if it has an agent `fixed in <sha>` reply or GitHub marks it `isOutdated` (the commented lines changed after the comment). Threads resolved with neither are dropped. CodeRabbit nitpicks are marked. Output: `{author, file, line, body, fixCommit, outdated, nitpick}` per thread. Using GitHub's own `isOutdated` and the agent's reply avoids matching commits by hash, which breaks after a rebase. Plus `plan.mjs` and `review-context.mjs`.

**Judge the contract (fresh subagent).** Sees contract, final diff and self-check, not the implementation conversation. Produces a result per criterion and the `added` list.

**Write `drift.md`.**

```markdown
---
pr: 42
path: full # full | small
---

## Contract

| AC | Result | Pattern |

## Added

## Corrections

## Self-caught

## Friction
```

The PR number is known because drift runs after the PR is open. Small-path drift contains only `## Corrections`. Every non-clean entry carries a slug. Existing slugs must be reused when one fits; otherwise a new `docs/patterns/<slug>.md` is created with `status: watching`. Committed in the feature PR as `docs(drift): <title>`.

**Pattern file.**

```markdown
---
slug: redundant-ref-annotation
target: lint # lint | prose — decides the threshold
status: watching # watching | promoted | rejected
promoted-to: # e.g. eslint.config.mjs, app/AGENTS.md
rejected-reason:
---

One-line description.

**Bad:** `const foo: Ref<string> = ref<string>("x")`
**Good:** `const foo = ref<string>("x")`
```

**Count (`patterns.mjs`).** After `git fetch`, reads every `drift.md` in the `origin/main` tree plus the current branch's own `drift.md`, and counts each slug by the number of distinct PR numbers that cite it, across all sections including self-caught. Thresholds in one constant: `target: lint` → 2 PRs, `target: prose` → 3 PRs. A slug is never due when it is `promoted` or `rejected`, or when a PR titled `chore(harness): promote <slug>` exists in any state (`gh pr list --state all --search`), so an open or closed promotion is never duplicated. Output: counts and the list of due slugs.

Known lag: parallel unmerged PRs don't see each other's drift. A slug that reaches the threshold through two parallel PRs becomes due on the next drift run after one of them merges.

**Promote.** For each due slug, create a scratch worktree from `origin/main` (`git worktree add`, never a checkout in the feature worktree), and open `chore(harness): promote <slug>` containing the change at the highest fitting target (with a reason if lower than the pattern's `target`), the pattern file set to `promoted` with `promoted-to`, and links to the triggering PRs. `/wen-drift promote <slug>` does the same on demand, regardless of count. `/wen-drift reject <slug> "<reason>"` records a rejection (`status: rejected`, `rejected-reason`) in its own small PR; closing a promotion PR unmerged already stops re-proposal, and `reject` makes the decision visible in the repo.

### 5.10 `status.mjs` and `wen-ship`

`status.mjs` prints JSON derived from git, the plan folder and `gh pr view`:

- `path` from the branch prefix (`full` | `small` | `unknown`)
- plan folder, contract status, latest `approved:` commit
- whether implementation commits exist after the latest approval commit
- self-check: exists, complete, unmet criteria, `reviewed` sha; **stale** if the contract changed after it
- PR: number, state, `awaitingAgent` (unresolved threads whose last comment has no `🤖 wen-ship:` prefix), `coderabbitDone` (a `coderabbitai[bot]` review whose `commit.oid` equals the head sha)
- drift: exists, **current** (same rule as check 7), stale if the contract changed after it
- promotions due
- derived `stage`

| Stage            | Condition (first match wins)                                                          | `/wen-ship` action                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `classify`       | `path: unknown`                                                                       | Ask full or small; propose a branch rename to a recognised prefix                                    |
| `contract`       | full, no contract or `status: draft`                                                  | `/wen-grilling` if the idea is unclear, then `/wen-contract`. ⏸ checkpoint 1                         |
| `implement`      | full, no implementation commits, or self-check has unmet criteria                     | `/wen-implement`                                                                                     |
| `self-check`     | full, self-check missing, incomplete or stale                                         | `/wen-self-check`                                                                                    |
| `code-review`    | full, self-check not `reviewed`                                                       | `/wen-code-review`, fix, log review fixes                                                            |
| `build`          | small, no PR                                                                          | Implement if asked, run lint/type-check/tests; ask before opening the PR                             |
| `open-pr`        | no PR, all prior stages done                                                          | `pr-body.mjs` (full) or a short body (small), push, `gh pr create`. ⏸ checkpoint 2                   |
| `address-review` | `awaitingAgent > 0`, or `coderabbitDone` false                                        | Reply to and fix or decline each thread, resolve fixed ones, push; wait if CodeRabbit is still going |
| `drift`          | full and drift missing or not current; small and corrections exist without a drift.md | `/wen-drift`, promotion PRs. ⏸ checkpoint 3                                                          |
| `done`           | otherwise                                                                             | Summary: PR, drift entries, pattern counts that changed, promotion PRs opened                        |

One stage per invocation. "Review finished" is signalled by running `/wen-ship` again. After drift is pushed, CodeRabbit reviews the docs-only commit; a short `address-review` round on `drift.md` is expected and does not make drift stale (check 7 ignores `docs/`). If addressing review changes code after drift, drift becomes stale and the stage returns to `drift`. All state lives in git, the plan folder and GitHub, so any fresh session resumes correctly.

### 5.11 CI gate (`check.mjs`, `.github/workflows/agent-workflow.yml`)

Separate workflow so title/description edits re-run only the gate: `pull_request` types `[opened, synchronize, reopened, edited]` on `main`, checkout of `github.event.pull_request.head.sha` (not the synthetic merge ref) with `fetch-depth: 0`, `permissions: contents: read`. Commit range everywhere: `merge-base(origin/main, head)..head`, `--no-merges`, so merging `main` into the branch never affects results. Check name: **agent-workflow: ready to merge**. Also runnable locally as `pnpm agent-workflow:check`, which reads the PR title via `gh` or takes `--title`.

| #   | Check                     | Fails when                                                                                                                                                                                 |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0   | Path                      | Title type and branch prefix disagree on full vs small. Full if either says `feat`/`fix`/`refactor`. Warns if a small-path PR changes more than 50 lines under `app/` or `server/`         |
| 1   | Plan folder               | Full path and not exactly one `docs/plans/*/contract.md` added in the range                                                                                                                |
| 2   | Approved                  | `status` ≠ `approved` or no `approved` date                                                                                                                                                |
| 3   | Contract changed properly | The body above `## Amendments` differs from the first approval commit, or the file differs from the latest commit that changed `approved:` (job summary lists all commits that changed it) |
| 4   | Self-check complete       | `self-check.md` missing or missing any criterion, including amended ones                                                                                                                   |
| 5   | Criteria met              | Any criterion `not met` / `partial` without an approved amendment (`not verified` warns)                                                                                                   |
| 6   | Gate changes accounted    | A `gate-changes.mjs` item whose `file + kind + text` is not listed under `## Gate changes`                                                                                                 |
| 7   | Drift current             | `drift.md` missing or missing a criterion, or a non-merge commit after the last commit touching `drift.md` changes files outside `docs/`                                                   |
| 8   | Slugs exist               | `drift.md` cites a slug with no pattern file                                                                                                                                               |

Checks 1–8 only run on the full path. `check.mjs` reads the PR title and head sha from the event payload and does not need `gh`. Results go to `$GITHUB_STEP_SUMMARY` as a ✅/⚠️/❌ table with reasons. On full-path PRs the check is red until drift runs, by design.

Making the check required means adding `agent-workflow: ready to merge` to the required status checks of the existing `main` ruleset, which the human does; until then the gate is advisory. The ruleset only allows squash merges, and nothing after merge depends on the branch's commit history.

## 6. Error handling

- Scripts exit non-zero with a human-readable reason on bad input (no plan folder, more than one contract in range, malformed frontmatter, `gh` not authenticated, not on a branch). Skills surface that reason and stop rather than guessing.
- `gh`-dependent scripts (`review-threads`, `status`, `pr-body`, `patterns`) fail clearly when `gh` is missing or unauthenticated.
- Self-check and contract review each get one revision round, then hand the decision to the human. No unbounded agent loops.
- A fresh-session self-check records friction as not recorded instead of inventing it.

## 7. Testing

Scripts are unit-tested in the existing `unit` Vitest project under `test/unit/agent-workflow/`, following `test/AGENTS.md`. Git-dependent behaviour uses small temporary git repos as fixtures. `gh`-dependent code takes injected JSON so tests need no network. Must-cover cases:

- `contract-lint`: valid contract; missing `Verify:`; non-sequential IDs; wrong count; missing type-specific first criterion.
- `gate-changes`: each flagged kind; unrelated diffs not flagged.
- `plan`: finds the contract after a branch rename; fails on zero or two contracts in range.
- `check`: small path passes; title/branch disagreement fails; contract body edited after approval fails; amendment with bumped `approved:` passes; amendment without bump fails; stale drift fails; docs-only commit after drift passes; merge from `main` after drift passes; gate change with shifted line still matches; unlisted gate change fails; `not verified` warns only.
- `patterns`: counts distinct PRs, not occurrences; lint vs prose thresholds; promoted/rejected never due; slug with an existing promotion PR (open or closed) never due.
- `review-threads`: agent `fixed in` reply kept; outdated thread kept; resolved with neither dropped.
- `status`: each stage derived from fixture state, including stale self-check after an amendment and `implement` re-entry on unmet criteria.

Skills are not unit-tested; they are exercised by using `/wen-ship` on the first real feature after this lands.

## 8. Acceptance criteria for this work

- **AC-1:** All nine `wen-*` skills exist in `.agents/skills/` with working `.claude/skills/` symlinks, and appear in Claude Code's skill list.
  - Verify: command — `ls -l .claude/skills/`; manual — skills listed in a fresh Claude Code session.
- **AC-2:** `docs/agent-workflow.md`, `docs/plans/_template/contract.md` and `docs/patterns/` exist, and root `AGENTS.md` links the workflow and no longer forbids commits without an explicit request.
  - Verify: manual — read through.
- **AC-3:** All scripts in section 5 exist and pass the must-cover tests in section 7.
  - Verify: test — `pnpm test:unit`.
- **AC-4:** The CI gate runs on PRs, passes small-path PRs (including its own PR), and fails a feat PR with no plan folder.
  - Verify: test — `check` fixtures; command — CI run on this PR.
- **AC-5:** `redundant-ref-annotation` is seeded as the first pattern (`target: lint`, `status: watching`).
  - Verify: manual — file exists with bad/good example.
- **AC-6:** `pnpm type-check`, `pnpm lint`, `pnpm format:check` and `pnpm test` pass.
  - Verify: command.

## 9. Delivery

Built as five PRs, each usable on its own and each titled `chore(harness): …` (small path). From PR 2 onwards, each PR is built using the parts already merged, so the harness is exercised on itself before it is complete.

| PR  | Contents                                                                                                                                                                                                                                                        | Usable after merge                                  | ACs (section 8)                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| 1   | `docs/agent-workflow.md`, `docs/plans/_template/contract.md`, `docs/patterns/` with `redundant-ref-annotation`, `scripts/agent-workflow/lib/`, `plan.mjs`, `contract-lint.mjs`, `wen-contract`, `wen-contract-review`, `wen-grilling`, root `AGENTS.md` changes | Write, lint and review contracts                    | AC-2, AC-5; part of AC-1, AC-3 |
| 2   | `gate-changes.mjs`, `review-context.mjs`, `self-check-lint.mjs`, `docs/plans/_template/self-check.md`, `wen-implement`, `wen-tdd`, `wen-self-check`, `wen-code-review`                                                                                          | Implement, self-check and review against a contract | part of AC-1, AC-3             |
| 3   | `review-threads.mjs`, `patterns.mjs`, `drift-lint.mjs`, `docs/plans/_template/drift.md`, pattern file validation, `wen-drift` with manual `promote` / `reject`                                                                                                  | Drift is logged and counted; promotion by hand      | part of AC-1, AC-3             |
| 4   | `status.mjs`, `pr-body.mjs`, `wen-ship`, `check.mjs`, `.github/workflows/agent-workflow.yml`, `pnpm agent-workflow:check`                                                                                                                                       | Full orchestrated loop, enforced in CI              | rest of AC-1, AC-3; AC-4       |
| 5   | Automatic promotion PRs from `wen-drift` (section 5.9 "Promote" for due slugs)                                                                                                                                                                                  | Promotion without remembering                       | —                              |

Every PR must satisfy AC-6. PR 5 starts only after a few real drift runs show that slugs stay consistent and the thresholds feel right; until then `/wen-drift` reports due slugs and the human runs `promote`. Each PR gets its own implementation plan, written when the previous one has merged, so it can use what was learned. Implementation plans are gitignored working files (`implementation-plan*.md`), not part of the record.

## 10. Out of scope / next

- **Coverage enforcement in CI** — next task, separate plan.
- Making the gate a required check (human edit to the `main` ruleset).
- Automated post-merge or scheduled drift; revisit if drift gets skipped in practice or the counting lag (section 5.9) proves annoying.
- Logging contract-review findings as patterns.
- Wrappers for agents other than Claude Code (add a pointer file when one is used).

## 11. Decisions log

| Decision                        | Choice                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Where the contract lives        | Plan file in the repo, feat/fix/refactor only                                                              |
| When drift runs                 | Last step before merge, inside the PR                                                                      |
| Contract vs implementation plan | Contract holds goal + criteria only; implementation detail is the agent's                                  |
| Signals collected               | Contract drift + review corrections that led to a change (+ self-caught, friction)                         |
| Same-pattern identity           | Pattern registry with slugs                                                                                |
| Enforcement                     | Skills + CI gate, no Claude hooks                                                                          |
| Self-check vs code review       | Separate steps; self-check first                                                                           |
| Packaging                       | All skills in repo, `wen-` prefix, `.agents/skills` + `.claude/skills` symlinks                            |
| Scripts                         | Every mechanical step is a script under `scripts/agent-workflow/`                                          |
| Promotion threshold             | 2 PRs for lint-able, 3 for prose, manual any time, rejection sticks                                        |
| Small changes                   | Short path; corrections-only drift when review led to changes                                              |
| Contract review                 | Fresh subagent on a different model (Fable in Claude Code), one revision round                             |
| Path detection                  | Branch prefix; PR title must agree                                                                         |
| Contract ↔ branch link          | The single contract added on the branch; no `branch:` field                                                |
| Amendments                      | Only with `approved:` bumped on explicit human approval; body above Amendments frozen after first approval |
| Delivery                        | Five PRs; automatic promotion last, after real drift data                                                  |
| wen-tdd                         | Loop rules only; no copy of generic tests.md/mocking.md                                                    |
| Self-check validation           | `self-check-lint.mjs` in PR 2; PR 4's `check.mjs` reuses it                                                |
| Drift validation                | `drift-lint.mjs` in PR 3; PR 4's `check.mjs` reuses it                                                     |
| Pattern files                   | Validated by `patterns.mjs`; malformed values are errors, not silent skips                                 |
| Commit authority                | Agents commit and push freely on feature branches; `main` is protected by the ruleset                      |
