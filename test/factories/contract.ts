export interface ContractParts {
  title: string;
  type: string;
  status: string;
  approved: string;
  goal: string;
  criteria: string[];
  outOfScope: string;
  amendments: string;
}

/** One criterion block: the AC bullet plus its nested Verify line. */
export const makeCriterion = (
  n: number,
  text = `A signed-in user sees outcome ${n} in the Portfolio`,
  verify = "test — `test/unit/example.test.ts`",
): string => `- **AC-${n}:** ${text}\n  - Verify: ${verify}`;

/** A well-formed draft contract; each test varies one part. */
export const makeContract = (overrides: Partial<ContractParts> = {}): string => {
  const parts: ContractParts = {
    title: "Multiple Wallets per Session",
    type: "feat",
    status: "draft",
    approved: "",
    goal: "A signed-in user can track more than one Wallet in one Portfolio.",
    criteria: [1, 2, 3].map(n => makeCriterion(n)),
    outOfScope: "- Removing Wallets.",
    amendments: "<!-- After approval only. -->",
    ...overrides,
  };
  return [
    "---",
    `title: ${parts.title}`,
    `type: ${parts.type}`,
    `status: ${parts.status}`,
    `approved: ${parts.approved}`,
    "---",
    "",
    "## Goal",
    "",
    parts.goal,
    "",
    "## Acceptance criteria",
    "",
    parts.criteria.join("\n"),
    "",
    "## Out of scope",
    "",
    parts.outOfScope,
    "",
    "## Amendments",
    "",
    parts.amendments,
    "",
  ].join("\n");
};
