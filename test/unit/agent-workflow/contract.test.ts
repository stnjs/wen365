import { describe, expect, it } from "vitest";
import { parseContract } from "~~/scripts/agent-workflow/lib/contract.mjs";
import { makeContract, makeCriterion } from "~~/test/factories/contract";

describe("parseContract", () => {
  it("extracts each criterion with its verification kind and detail", () => {
    const contract = parseContract(makeContract());

    expect(contract.criteria.map(c => c.id)).toEqual(["AC-1", "AC-2", "AC-3"]);
    expect(contract.criteria[0]).toEqual({
      id: "AC-1",
      number: 1,
      text: "A signed-in user sees outcome 1 in the Portfolio",
      verify: { kind: "test", detail: "`test/unit/example.test.ts`" },
    });
  });

  it("leaves verify empty for a criterion without a Verify line", () => {
    const contract = parseContract(
      makeContract({ criteria: [makeCriterion(1), "- **AC-2:** No evidence named"] }),
    );

    expect(contract.criteria[1]?.verify).toBeNull();
  });

  it("accepts a capitalised Verify kind", () => {
    const contract = parseContract(
      makeContract({ criteria: [makeCriterion(1, "Shows the Wallet", "Test — wallet.test.ts")] }),
    );

    expect(contract.criteria[0]?.verify?.kind).toBe("test");
  });

  it("accepts a Verify label written in bold", () => {
    const contract = parseContract(
      makeContract({
        criteria: ["- **AC-1:** Shows the Wallet\n  - **Verify:** test — wallet.test.ts"],
      }),
    );

    expect(contract.criteria[0]?.verify).toEqual({ kind: "test", detail: "wallet.test.ts" });
  });

  it("treats an Amendments section holding only a comment as no amendments", () => {
    expect(parseContract(makeContract()).hasAmendments).toBe(false);
    expect(
      parseContract(makeContract({ amendments: "- 2026-10-06 — AC-2: dropped CSV — out of time" }))
        .hasAmendments,
    ).toBe(true);
  });

  it("parses a contract saved with Windows line endings", () => {
    const contract = parseContract(makeContract().replace(/\n/g, "\r\n"));

    expect(contract.frontmatter?.type).toBe("feat");
    expect(contract.criteria).toHaveLength(3);
    expect(contract.criteria[2]?.verify?.kind).toBe("test");
  });
});
