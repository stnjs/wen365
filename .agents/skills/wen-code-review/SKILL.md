---
name: wen-code-review
description: Two-axis review of a Wen365 branch against main — Standards (AGENTS.md, ADRs, CONTEXT.md, known patterns, smell baseline) and Spec (the contract and the self-check's claims) — in parallel fresh subagents, then fix and log the findings. Use after /wen-self-check, when /wen-ship reaches the code-review stage, or to review any branch.
---

> Adapted from an earlier version of `code-review` in [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see [`../LICENSE-mattpocock-skills.txt`](../LICENSE-mattpocock-skills.txt)).

# wen-code-review

Two axes, reported separately: code can follow every rule and build the wrong thing, or build the right thing and break the rules. Keeping them apart stops one from hiding the other.

## 1. Context

Run `node scripts/agent-workflow/review-context.mjs`. The base is `origin/main` (falling back to `main`); the script reports it as `base`.

- `changedFiles` empty → stop: nothing to review.
- The path comes from the branch prefix (see [Paths](../../../docs/agent-workflow.md#paths)), not from whether a contract exists:
  - **Full path** (`feat`, `fix`, `refactor`) and `contract` null → stop: the work needs `/wen-contract` first.
  - **Full path** and `selfCheck` null → stop: run `/wen-self-check` first; the Spec reviewer checks its claims.
  - **Small path** → `contract` is null by design: skip the Spec axis and say so in the report.

## 2. Two reviewers in parallel

Send one message with two subagents, both with fresh context: they get only what is listed here, not this conversation.

- **Claude Code:** Agent tool, `subagent_type: general-purpose`, `model: fable`; if this session itself runs on Fable, use `model: opus`.
- **Other agents:** fresh-context subagents on a different model from the author's, if available.

**Standards reviewer.** Give it `diffCommand`, `commits`, `changedFiles`, the files in `agentsFiles`, `adrs`, `CONTEXT.md`, the files in `patterns`, and the smell baseline below pasted in full. Brief:

> Review the diff for this repo's standards. Report, per file and hunk: (a) every place the diff breaks a documented rule, citing the file and the rule; (b) any baseline smell, naming it and quoting the hunk; (c) any hunk that matches a known pattern, citing its slug. Documented rules can be hard violations; baseline smells are always judgement calls, and a documented rule overrides the baseline. Skip anything ESLint, Prettier or vue-tsc already enforce. Under 400 words.

**Spec reviewer** (full path only). Give it `diffCommand`, `commits`, the `contract` and `selfCheck` files, and the "Vocabulary" section of `docs/agent-workflow.md`. Brief:

> Check the diff against the contract and the self-check's claims. For each criterion: is it delivered, and does the evidence the self-check cites actually show it? A test named after a behaviour that asserts nothing useful is not evidence. Report every criterion as `delivered`, `amended` (changed by an entry under `## Amendments`; not a finding), `dropped`, `weakened`, `substituted` or `unverified`, quoting the criterion for anything not delivered, plus `added` for changes no criterion asked for. Under 400 words.

## 3. Report

Show both reports under `## Standards` and `## Spec`, lightly cleaned, not merged or reranked. End with one line per axis: the number of findings and the worst one.

## 4. Fix and log

As the implementing agent:

- Fix hard violations and Spec findings. For judgement calls you disagree with, say why in one line.
- Rerun the affected tests, then `pnpm lint` and `pnpm type-check`, and commit the fixes.
- **Full path:** for each finding you fixed, append to `## Review fixes` in `self-check.md`:
  `` - [Standards|Spec] `file:line` <what was wrong> → `<slug>` `` (omit `` → `<slug>` `` if no pattern fits).
  Update the criteria table if a fix changed the evidence. Set `reviewed:` to `git rev-parse --short HEAD`: the last code commit, before the self-check commit that records it. Then run `node scripts/agent-workflow/self-check-lint.mjs`, and commit `docs(self-check): review fixes`.
- **Small path:** fix and commit; nothing to log.

## Smell baseline

Applies even where the repo documents nothing; a documented rule overrides it. Each smell is a judgement call, never a hard violation.

- **Mysterious Name** — a name that doesn't reveal what it does or holds. → Rename; if no honest name comes, the design is murky.
- **Duplicated Code** — the same logic shape in more than one hunk or file. → Extract the shared shape.
- **Feature Envy** — a function that reaches into another object's data more than its own. → Move it to the data.
- **Data Clumps** — the same few fields or params travelling together. → Bundle them into one type.
- **Primitive Obsession** — a primitive standing in for a domain concept. → Give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if` cascade on the same type in several places. → One map or polymorphism.
- **Shotgun Surgery** — one logical change forces scattered edits. → Gather what changes together.
- **Divergent Change** — one module edited for several unrelated reasons. → Split it.
- **Speculative Generality** — abstraction, parameters or hooks the contract doesn't need. → Delete; inline until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation. → Hide the walk behind one method.
- **Middle Man** — a function or class that mostly delegates. → Call the real target.
- **Refused Bequest** — an implementer that ignores most of what it inherits. → Composition instead of inheritance.
