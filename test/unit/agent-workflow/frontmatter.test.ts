import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "~~/scripts/agent-workflow/lib/frontmatter.mjs";

describe("parseFrontmatter", () => {
  it("reads flat key/value pairs and returns the body after the block", () => {
    const parsed = parseFrontmatter("---\ntitle: Multiple Wallets\ntype: feat\n---\n\n## Goal\n");

    expect(parsed).toEqual({
      data: { title: "Multiple Wallets", type: "feat" },
      body: "\n## Goal\n",
    });
  });

  it("drops trailing comments from unquoted values but keeps # inside quotes", () => {
    const parsed = parseFrontmatter(
      '---\nstatus: draft # draft | approved\napproved: # YYYY-MM-DD\nissue: "#5" # optional\n---\n',
    );

    expect(parsed?.data).toEqual({ status: "draft", approved: "", issue: "#5" });
  });

  it("keeps a # that is part of an unquoted value", () => {
    const parsed = parseFrontmatter("---\ntitle: Fix #5 stale Portfolio total\n---\n");

    expect(parsed?.data.title).toBe("Fix #5 stale Portfolio total");
  });

  it("returns null when the file has no frontmatter block", () => {
    expect(parseFrontmatter("## Goal\n")).toBeNull();
    expect(parseFrontmatter("---\ntitle: never closed\n")).toBeNull();
  });

  it("parses files with Windows line endings like LF files", () => {
    const parsed = parseFrontmatter("---\r\ntitle: Wallets\r\n---\r\nbody\r\n");

    expect(parsed).toEqual({ data: { title: "Wallets" }, body: "body\n" });
  });
});
