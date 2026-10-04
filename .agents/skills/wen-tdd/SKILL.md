---
name: wen-tdd
description: Test-driven development in Wen365 — red then green, one vertical slice at a time, at the seams the contract's Verify lines name. Use from /wen-implement, or whenever building or fixing something test-first.
---

> Adapted from an earlier version of `tdd` in [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see [`../LICENSE-mattpocock-skills.txt`](../LICENSE-mattpocock-skills.txt)).

# wen-tdd

TDD is the red → green loop. [`test/AGENTS.md`](../../../test/AGENTS.md) defines what a good test is in this repo: what earns a test, where to mock, naming, factories and Vitest mechanics. Read it before the first test. This skill only adds the loop and where the seams come from.

## Seams come from the contract

A seam is the public boundary a test observes behaviour through. On the full path, every criterion whose `Verify:` kind is `test` names its seam: test there. If you need a seam the contract doesn't imply, ask the human before writing that test. On the small path, agree the seam with the human before the first test.

## Rules of the loop

- **Red before green.** Write the failing test, run it, and read the failure: it must fail because the behaviour is missing, not because of a typo or an import error. Then write only enough code to pass.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle. Never write all the tests first.
- **Expected values come from outside the code:** a literal, a worked example, the contract. Never compute the expected value the way the code does.
- **Refactoring is not part of the loop.** It happens after `/wen-code-review`, with the tests green.
