import { describe, expect, it } from "vitest";
import {
  criterionRows,
  removeBlocks,
  visibleText,
} from "~~/scripts/agent-workflow/lib/markdown.mjs";

describe("removeBlocks", () => {
  it("removes nested blocks when asked to count nesting", () => {
    const text = "keep <details>a <details>b</details> c</details> end";

    expect(removeBlocks(text, "<details>", "</details>", true)).toBe("keep  end");
  });

  it("ends an unnested block at the first close, as HTML comments do", () => {
    expect(visibleText("a <!-- x <!-- y --> b")).toBe("a  b");
  });

  it("treats an unclosed block as hiding the rest", () => {
    expect(visibleText("a <!-- never closed\nmore")).toBe("a ");
  });
});

describe("criterionRows", () => {
  it("returns AC rows as cells and skips header, separator and comments", () => {
    const section =
      "<!-- AC-9 in a comment -->\n| AC | Status |\n| --- | --- |\n| AC-1 | met | a \\| b |";

    expect(criterionRows(section)).toEqual({ rows: [["AC-1", "met", "a \\| b"]], unreadable: [] });
  });

  it("returns lines that mention a criterion but are not a readable row", () => {
    expect(criterionRows("| ac-1 | met | x |\nAC-2 | met | y").unreadable).toEqual([
      "| ac-1 | met | x |",
      "AC-2 | met | y",
    ]);
  });
});
