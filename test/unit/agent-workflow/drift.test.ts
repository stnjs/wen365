import { describe, expect, it } from "vitest";
import { driftSlugs, lintDrift, parseDrift } from "~~/scripts/agent-workflow/lib/drift.mjs";
import { makeContract } from "~~/test/factories/contract";
import { driftRow, makeDrift } from "~~/test/factories/drift";

const contract = makeContract({ status: "approved", approved: "2026-10-05" });
const knownSlugs = new Set(["redundant-ref-annotation", "drive-by-refactor"]);

describe("parseDrift", () => {
  it("parses contract rows plus entries with their slugs", () => {
    const report = parseDrift(
      makeDrift({
        rows: [
          driftRow("AC-1"),
          driftRow("AC-2", "weakened", "redundant-ref-annotation"),
          driftRow("AC-3"),
        ],
        corrections: ["- @stnjs `app/a.ts:3` typed the ref twice → `redundant-ref-annotation`"],
      }),
    );

    expect(report.pr).toBe(42);
    expect(report.rows[1]).toEqual({
      id: "AC-2",
      result: "weakened",
      slug: "redundant-ref-annotation",
    });
    expect(report.entries).toEqual([
      {
        section: "Corrections",
        text: "@stnjs `app/a.ts:3` typed the ref twice",
        slug: "redundant-ref-annotation",
      },
    ]);
  });

  it("lists each cited slug once", () => {
    const report = parseDrift(
      makeDrift({
        corrections: ["- a → `redundant-ref-annotation`", "- b → `redundant-ref-annotation`"],
        added: ["- c → `drive-by-refactor`"],
      }),
    );

    expect(driftSlugs(report)).toEqual(["drive-by-refactor", "redundant-ref-annotation"]);
  });
});

describe("lintDrift", () => {
  it("accepts a clean full-path drift", () => {
    expect(lintDrift({ drift: makeDrift(), contract, knownSlugs })).toEqual([]);
  });

  it("reports a criterion missing from ## Contract", () => {
    const drift = makeDrift({ rows: [driftRow("AC-1"), driftRow("AC-3")] });

    expect(lintDrift({ drift, contract, knownSlugs })).toEqual([
      "AC-2 is missing from ## Contract.",
    ]);
  });

  it("requires a slug for a result that is not clean", () => {
    const drift = makeDrift({
      rows: [driftRow("AC-1", "dropped"), driftRow("AC-2"), driftRow("AC-3")],
    });

    expect(lintDrift({ drift, contract, knownSlugs })).toEqual([
      "AC-1 is dropped and needs a pattern slug.",
    ]);
  });

  it("rejects a slug on a clean result", () => {
    const drift = makeDrift({
      rows: [
        driftRow("AC-1"),
        driftRow("AC-2", "delivered", "drive-by-refactor"),
        driftRow("AC-3"),
      ],
    });

    expect(lintDrift({ drift, contract, knownSlugs })).toEqual([
      "AC-2 is delivered and takes no pattern slug.",
    ]);
  });

  it("rejects amended for a criterion no amendment names", () => {
    const drift = makeDrift({
      rows: [driftRow("AC-1", "amended"), driftRow("AC-2"), driftRow("AC-3")],
    });

    expect(lintDrift({ drift, contract, knownSlugs })).toEqual([
      "AC-1 is amended, but no entry under ## Amendments names it.",
    ]);
  });

  it("requires an amended criterion to be marked amended, not delivered", () => {
    const amendedContract = makeContract({
      status: "approved",
      approved: "2026-10-06",
      amendments: "- 2026-10-06 — AC-2: CSV export moved to a later contract — out of time",
    });

    expect(lintDrift({ drift: makeDrift(), contract: amendedContract, knownSlugs })).toEqual([
      "AC-2 was changed by an amendment; mark it amended, or with a finding if even the amended version wasn't met.",
    ]);
    const marked = makeDrift({
      rows: [driftRow("AC-1"), driftRow("AC-2", "amended"), driftRow("AC-3")],
    });
    expect(lintDrift({ drift: marked, contract: amendedContract, knownSlugs })).toEqual([]);
  });

  it("reports an unknown result", () => {
    const drift = makeDrift({
      rows: [driftRow("AC-1", "done"), driftRow("AC-2"), driftRow("AC-3")],
    });

    expect(lintDrift({ drift, contract, knownSlugs })).toEqual([
      'AC-1 result must be one of delivered, amended, dropped, weakened, substituted, unverified; got "done".',
    ]);
  });

  it("requires a slug on every entry", () => {
    const drift = makeDrift({ friction: ["- mocking useUserSession took three attempts"] });

    expect(lintDrift({ drift, contract, knownSlugs })).toEqual([
      'Entry under ## Friction must be one line ending in → `slug`: "mocking useUserSession took three attempts"',
    ]);
  });

  it("reports a slug with no pattern file", () => {
    const drift = makeDrift({ added: ["- reworked formatCurrency → `formatting-churn`"] });

    expect(lintDrift({ drift, contract, knownSlugs })).toEqual([
      "Unknown pattern slug `formatting-churn`: add docs/patterns/formatting-churn.md or reuse an existing slug.",
    ]);
  });

  it("accepts small-path drift that records only corrections, without a contract", () => {
    const drift = makeDrift({
      path: "small",
      rows: [],
      corrections: ["- @stnjs `app/a.ts:3` typed the ref twice → `redundant-ref-annotation`"],
    });

    expect(lintDrift({ drift, contract: null, knownSlugs })).toEqual([]);
  });

  it("rejects small-path drift with entries outside ## Corrections", () => {
    const drift = makeDrift({ path: "small", rows: [], added: ["- c → `drive-by-refactor`"] });

    expect(lintDrift({ drift, contract: null, knownSlugs })).toEqual([
      "Small-path drift only records ## Corrections; found entries under ## Added.",
    ]);
  });

  it("requires the PR number", () => {
    expect(lintDrift({ drift: makeDrift({ pr: "" }), contract, knownSlugs })).toEqual([
      "Frontmatter `pr` must be the pull request number.",
    ]);
  });

  it("requires a known path", () => {
    expect(lintDrift({ drift: makeDrift({ path: "medium" }), contract, knownSlugs })).toEqual([
      'Frontmatter `path` must be full or small; got "medium".',
    ]);
  });

  it("names a line it cannot read", () => {
    const drift = makeDrift({ corrections: ["typed the ref twice → `redundant-ref-annotation`"] });

    expect(lintDrift({ drift, contract, knownSlugs })).toEqual([
      'Could not read this line under ## Corrections: "typed the ref twice → `redundant-ref-annotation`"',
    ]);
  });
});
