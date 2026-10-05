---
name: wen-drift
description: Record how a Wen365 PR drifted from its contract and which review corrections it needed, tag each with a pattern slug, and count recurring patterns; promote or reject a pattern by hand. Use as the last step before merge, when /wen-ship reaches the drift stage, or as `/wen-drift promote <slug>` or `/wen-drift reject <slug> "<reason>"`.
---

# wen-drift

Format, vocabulary and counting rules: [`docs/agent-workflow.md`](../../../docs/agent-workflow.md#drift). Run it once review has settled, right before merge.

## 1. Preconditions

- Run `git fetch origin`.
- `gh pr view --json number,title` must show the PR; note its number and title.
- Work out the path from the branch prefix ([Paths](../../../docs/agent-workflow.md#paths)).
- **Full path:** `node scripts/agent-workflow/plan.mjs` must show an approved contract, and its folder must contain `self-check.md`. If not, stop and say which step is missing.
- Every review thread must be answered (see [Replying to review threads](../../../docs/agent-workflow.md#replying-to-review-threads)). If one isn't, stop: drift records finished review.

## 2. Collect

- `node scripts/agent-workflow/review-threads.mjs` → corrections: review threads that led to a change.
- **Full path:** `node scripts/agent-workflow/review-context.mjs` → `diffCommand`. Read `self-check.md`: Known patterns, Review fixes and Friction.
- **Small path with no corrections** → stop. Nothing to record and no drift file; tell the human.

## 3. Judge the contract (full path)

Use a fresh subagent that doesn't see this conversation. In Claude Code: Agent tool, `subagent_type: general-purpose`, `model: fable`; if this session itself runs on Fable, use `model: opus`. Give it the contract, `diffCommand`, `self-check.md` and the "Vocabulary" section of `docs/agent-workflow.md`. Brief:

> For each criterion of the contract, judge the final diff: `delivered`, `amended` (an entry under `## Amendments` changed it), `dropped`, `weakened`, `substituted` or `unverified`. Treat the self-check's evidence as a pointer and check it yourself. Then list every change in the diff that no criterion asked for (`added`). For each result other than delivered or amended, and each added item, say in one line what happened. Under 400 words.

## 4. Assign pattern slugs

Every entry that isn't clean gets a slug: contract results other than `delivered`/`amended`, each added item, each correction, each self-caught item (Known patterns hits and Review fixes), and each friction item.

- Read every file in `docs/patterns/` first. **Reuse a slug whenever its description fits**; counting only works if the same habit always gets the same slug.
- Only when nothing fits, create `docs/patterns/<slug>.md` in the format from [Patterns](../../../docs/agent-workflow.md#patterns): `status: watching`; `target: lint` if a lint or type rule could catch it mechanically, otherwise `prose`. Name the habit, not this instance: `redundant-ref-annotation`, not `wallet-ref-in-usewallets`.
- A correction you disagree with still gets a slug: the human made it.

## 5. Write drift.md

- **Full path:** `docs/plans/<folder>/drift.md`, next to the contract. **Small path:** a new folder `docs/plans/<YYYY-MM-DD>-<slug>/` named after the PR, containing only `drift.md`.
- Start from [`docs/plans/_template/drift.md`](../../../docs/plans/_template/drift.md). Set `pr` and `path`. On the small path, delete the Contract row and leave every section except `## Corrections` empty.
- Each entry is one line. Correction lines: `` - @author `file:line` what was corrected → `slug` ``; add `(nitpick)` after the author for CodeRabbit nitpicks, never after the slug.
- Run `node scripts/agent-workflow/drift-lint.mjs` and fix until it exits 0.
- Commit `docs(drift): <PR title without its type prefix>` (plus any new pattern files) and push.

## 6. Count and report

Run `node scripts/agent-workflow/patterns.mjs`. If it exits 1, fix the pattern files it lists, commit, and run it again.

Report to the human:

- new patterns created
- each slug this drift cited, with its PR count and threshold
- every slug in `due`, with `/wen-drift promote <slug>` as the next step

Don't promote without being asked; automatic promotion comes later. Then stop: the human merges.

## promote `<slug>`

1. `node scripts/agent-workflow/patterns.mjs` → the slug's `prs` are the evidence. Promote even if it isn't due: the human asked.
2. Work in a scratch worktree from `origin/main`; never switch the feature worktree:
   `git worktree add -b chore/promote-<slug> "$(mktemp -d)/promote-<slug>" origin/main`, then `pnpm install` inside it (lint and type-check need `node_modules` and `.nuxt`, which `pnpm install` prepares).
3. Pick the target, the highest that fits: a lint or type rule → a line in the nearest `AGENTS.md` → an ADR → the plan template or self-check checklist. For a lint rule, prefer `no-restricted-syntax` or an existing ESLint rule, run it on real code, and fix or justify every existing violation it now flags. If you pick a lower target than the pattern's `target`, say why in the PR.
4. In the pattern file, set `status: promoted` and `promoted-to:` the path of the file you changed.
5. Run `pnpm lint`, `pnpm type-check` and `pnpm test run`; commit `chore(harness): promote <slug>`; push; then `gh pr create --title "chore(harness): promote <slug>"` with a body that shows the rule, why this target, a bad/good example, and links to the PRs in `prs`.
6. Remove the worktree (`git worktree remove <path>`), give the human the PR link, and stop.

## reject `<slug>` `"<reason>"`

A scratch worktree as in promote step 2, on branch `chore/reject-<slug>`. Set `status: rejected` and `rejected-reason: <reason>`, commit `chore(harness): reject <slug>`, push, open a PR with that title, remove the worktree, and stop. Closing a promotion PR unmerged already stops the pattern from being proposed again; `reject` records the decision in the repo.
