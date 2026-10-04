---
name: wen-contract
description: Write the contract (goal + acceptance criteria) for a feat, fix or refactor in Wen365, have it cold-reviewed, and stop for the human's approval. Use after planning or grilling and before any implementation, when amending an approved contract, or when /wen-ship reaches the contract stage.
---

# wen-contract

A contract says **what** will be delivered and how each part is verified, never how to build it. Format and rules: [`docs/agent-workflow.md`](../../../docs/agent-workflow.md#contracts). Read that section before writing.

## 1. Check for an existing contract

Run `node scripts/agent-workflow/plan.mjs`.

- `status: "draft"` → continue at step 4 with that file.
- `status: "approved"` → this branch already has an approved contract. For a scope change go to **Amendments** below; otherwise stop.
- Any other `status` (empty or misspelled frontmatter) → run `node scripts/agent-workflow/contract-lint.mjs <contractPath>`, fix what it reports, then continue at step 4.
- Fails with "More than one contract" → run `git fetch origin` once and retry (a stale `origin/main` can make an already-merged contract look like part of this branch); if it still fails, stop and show the human the message.
- Fails with "No contract on this branch" → continue.
- Fails with "Base ref not found" → run `git fetch origin` once and retry; if it still fails, stop and show the message.

## 2. Gather

- Source: the current conversation (usually after `/wen-grilling`), or the issue the human named (`gh issue view <n>`).
- Read [`CONTEXT.md`](../../../CONTEXT.md), the ADRs in `docs/adr/` that touch the area, and the `AGENTS.md` of each directory involved.
- Read code only as far as needed to make criteria concrete.
- If the request contradicts an ADR, stop and raise the conflict before writing anything.

## 3. Write

Create `docs/plans/<YYYY-MM-DD>-<slug>/contract.md` from `docs/plans/_template/contract.md` (today's date; slug is the title in kebab-case, at most five words). Fill it:

- `type` from the branch prefix. If the branch prefix isn't `feat`, `fix` or `refactor`, stop: small-path work has no contract.
- `status: draft`, `approved:` empty.
- **Goal:** one or two sentences, from the user's point of view.
- **Acceptance criteria:** observable behaviour only, `CONTEXT.md` terms only, one `Verify:` line each, 3–8 of them. Remove the template's placeholder criteria and the guidance comment.
- `fix`: AC-1 is exactly the form "A regression test reproduces <the bug>: it fails before the fix and passes after".
- `refactor`: AC-1 is "Existing tests pass without modification".
- **Out of scope:** everything discussed and deliberately excluded.
- **Amendments:** leave only the template comment.

## 4. Lint

Run `node scripts/agent-workflow/contract-lint.mjs <path>` and fix until it exits 0.

## 5. Review

Run `/wen-contract-review <path>`. Fix every **blocking** finding, once, then lint again. Do not run the review a second time.

## 6. Present and stop

Show the human:

1. the contract path and its full contents
2. **Review notes:** each blocking finding and how it was fixed; each suggestion not applied, with a one-line reason

Ask them to approve or request changes. **Stop.** Do not commit and do not change `status`.

If they request changes: edit, lint, present again. Run the review again only if they ask.

## 7. On approval

Only when the human explicitly approves in the conversation:

1. Set `status: approved` and `approved:` to today's date (or the date they give).
2. Run `node scripts/agent-workflow/contract-lint.mjs <path>`; it must exit 0.
3. Commit only the contract:

```bash
git add <folder>/contract.md
git commit -m "docs(plan): <title>"
```

## Amendments

After approval, never edit anything above `## Amendments`.

1. Append `- YYYY-MM-DD — AC-n: <what changed> — <why>` under `## Amendments`. One line per criterion; an amendment touching two criteria is two lines.
2. Show the human the amendment and ask for approval. **Stop.**
3. On explicit approval: bump `approved:` to today's date and commit the amendment and the bump together as `docs(plan): amend <title>`. An amendment without a bumped `approved:` does not count.
