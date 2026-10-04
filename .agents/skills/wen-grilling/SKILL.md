---
name: wen-grilling
description: Grill the user relentlessly about a plan or design for Wen365 before a contract is written. Use when the user wants to stress-test a plan before building, uses any 'grill' trigger phrases, or /wen-ship needs the idea clarified.
---

> Adapted from an earlier version of `grilling` in [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see [`../LICENSE-mattpocock-skills.txt`](../LICENSE-mattpocock-skills.txt)).

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a _fact_ can be found by exploring the codebase, look it up rather than asking me. The _decisions_, though, are mine: put each one to me and wait for my answer.

Do not enact the plan until I confirm we have reached a shared understanding.

## How to ask a question

A question the user cannot decode is a question they cannot answer. They accept the recommendation instead of deciding, and the session produces a plan they do not understand. Every question carries the same six parts, in this order:

1. **Context first:** two to four sentences on what the decision is about, why it comes up now, and what later work depends on it.
2. **The question itself**, in one sentence.
3. **Options described by what concretely happens** if chosen, in everyday language.
4. **Every option states its real cost**, not only its benefit.
5. **A recommendation, with its reason.**
6. **Any technical term defined at first use**, beside the question, not inside it.

Banned, without exception:

- Metaphors of any kind.
- Abstract labels as option names ("event-driven approach", "the reactive variant").
- Content-free adjectives: robust, seamless, elegant, clean, powerful, flexible.
- Naming a pattern instead of describing its effect.
- More than one question at a time.

### Worked example: follows the rules

> When a user adds a second Wallet, the Portfolio total jumps. The daily Snapshots stored so far only cover the first Wallet, so the value-over-time chart would show a sudden spike that never happened. How we handle this decides whether we need a backfill job and what the chart shows on day one.
>
> **Question:** What should the chart show right after a Wallet is added?
>
> - **Start the new Wallet's history from today.** The chart shows a step on the day the Wallet was added, with a marker explaining it. Nothing extra to build. Cost: the step can be misread as a gain unless the marker is noticed.
> - **Rebuild past Snapshots including the new Wallet.** The chart looks as if the Wallet had always been tracked. Cost: needs historical balances from Alchemy for every past day, which is slow and uses API quota.
>
> **Recommendation:** The first. It is honest about what was tracked when, and it needs no new Alchemy calls.

💡 **Snapshot:** the stored daily value of a Portfolio, used to draw the chart.

### Counter-example: do not do this

> **Question:** Should Snapshot reconciliation be eager or lazy?
>
> - Eager backfill (robust, consistent)
> - Lazy reconciliation

Five violations: no context before the question; pattern names instead of effects; "robust" and "consistent" carry no information; no costs; no recommendation.

### Which language

- Ask in whatever language the user is writing in, and switch when they switch.
- Never switch the user's language because a document, the codebase or `CONTEXT.md` uses another one.

### Before sending a question, check

- [ ] Is there a term here the user would have to ask me to explain? Replace or define it.
- [ ] Does every option say what actually happens, not what it is called?
- [ ] Does every option state its cost?
- [ ] Is there exactly one question?
- [ ] Did I give a recommendation and say why?

## Handing over

When the plan is settled and the work is a `feat`, `fix` or `refactor`, hand over to `/wen-contract`, which turns this conversation into a contract. For any other kind of change, there is no contract; go straight to the work.
