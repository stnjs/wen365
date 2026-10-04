export interface SelfCheckParts {
  reviewed: string;
  rows: string[];
  gateChanges: string[];
  friction: string;
  knownPatterns: string;
  reviewFixes: string;
}

/** One `## Criteria` table row. */
export const makeRow = (
  id: string,
  status = "met",
  evidence = "test `test/unit/example.test.ts › shows the Wallet` (ran, passes)",
): string => `| ${id} | ${status} | ${evidence} |`;

/** A complete self-check for the default three-criterion contract; each test varies one part. */
export const makeSelfCheck = (overrides: Partial<SelfCheckParts> = {}): string => {
  const parts: SelfCheckParts = {
    reviewed: "",
    rows: ["AC-1", "AC-2", "AC-3"].map(id => makeRow(id)),
    gateChanges: [],
    friction: "None.",
    knownPatterns: "None found.",
    reviewFixes: "",
    ...overrides,
  };
  return [
    "---",
    `reviewed: ${parts.reviewed}`,
    "---",
    "",
    "## Criteria",
    "",
    "| AC | Status | Evidence |",
    "| --- | --- | --- |",
    ...parts.rows,
    "",
    "## Gate changes",
    "",
    ...(parts.gateChanges.length > 0 ? parts.gateChanges : ["None."]),
    "",
    "## Friction",
    "",
    parts.friction,
    "",
    "## Known patterns",
    "",
    parts.knownPatterns,
    "",
    "## Review fixes",
    "",
    parts.reviewFixes,
    "",
  ].join("\n");
};
