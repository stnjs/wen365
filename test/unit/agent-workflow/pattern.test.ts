import { describe, expect, it } from "vitest";
import {
  isCheckedByHand,
  lintPattern,
  parsePattern,
} from "~~/scripts/agent-workflow/lib/pattern.mjs";
import { makePattern } from "~~/test/factories/drift";

const exists = (path: string) => path === "app/AGENTS.md";

describe("lintPattern", () => {
  it("accepts a valid watching pattern", () => {
    expect(lintPattern(makePattern(), "redundant-ref-annotation", exists)).toEqual([]);
  });

  it("requires the slug to match the file name", () => {
    expect(
      lintPattern(makePattern({ slug: "double-typed-ref" }), "redundant-ref-annotation", exists),
    ).toEqual([
      "`slug` (double-typed-ref) must match the file name (redundant-ref-annotation.md).",
    ]);
  });

  it("rejects a status outside the allowed values, including capitalised ones", () => {
    expect(
      lintPattern(makePattern({ status: "Watching" }), "redundant-ref-annotation", exists),
    ).toEqual(['`status` must be one of watching, promoted, rejected; got "Watching".']);
  });

  it("requires a promoted pattern to name an existing file", () => {
    expect(
      lintPattern(
        makePattern({ status: "promoted", promotedTo: "app/AGENTS.md (Composables)" }),
        "redundant-ref-annotation",
        exists,
      ),
    ).toEqual([
      '`promoted-to` must name an existing file when `status` is promoted; got "app/AGENTS.md (Composables)".',
    ]);
    expect(
      lintPattern(
        makePattern({ status: "promoted", promotedTo: "app/AGENTS.md" }),
        "redundant-ref-annotation",
        exists,
      ),
    ).toEqual([]);
  });

  it("requires a reason for a rejected pattern", () => {
    expect(
      lintPattern(makePattern({ status: "rejected" }), "redundant-ref-annotation", exists),
    ).toEqual(["`rejected-reason` is required when `status` is rejected."]);
  });

  it("requires a description below the frontmatter", () => {
    expect(
      lintPattern(makePattern({ description: "" }), "redundant-ref-annotation", exists),
    ).toEqual(["Describe the pattern below the frontmatter."]);
  });
});

describe("isCheckedByHand", () => {
  it.each([
    ["a watching pattern", makePattern(), true],
    [
      "a pattern promoted into prose",
      makePattern({ status: "promoted", promotedTo: "app/AGENTS.md" }),
      true,
    ],
    [
      "a pattern promoted into a lint rule",
      makePattern({ status: "promoted", promotedTo: "eslint.config.mjs" }),
      false,
    ],
    ["a rejected pattern", makePattern({ status: "rejected", rejectedReason: "noise" }), false],
  ])("for %s returns %s", (_case, text, expected) => {
    expect(isCheckedByHand(parsePattern(text))).toBe(expected);
  });
});
