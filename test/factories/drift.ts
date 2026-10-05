export interface PatternParts {
  slug: string;
  target: string;
  status: string;
  promotedTo: string;
  rejectedReason: string;
  description: string;
}

/** A valid watching pattern file; each test varies one part. */
export const makePattern = (overrides: Partial<PatternParts> = {}): string => {
  const parts: PatternParts = {
    slug: "redundant-ref-annotation",
    target: "lint",
    status: "watching",
    promotedTo: "",
    rejectedReason: "",
    description: "A `ref` typed on the variable and on the call.",
    ...overrides,
  };
  return [
    "---",
    `slug: ${parts.slug}`,
    `target: ${parts.target}`,
    `status: ${parts.status}`,
    `promoted-to: ${parts.promotedTo}`,
    `rejected-reason: ${parts.rejectedReason}`,
    "---",
    "",
    parts.description,
    "",
  ].join("\n");
};

export interface DriftParts {
  pr: string;
  path: string;
  rows: string[];
  added: string[];
  corrections: string[];
  selfCaught: string[];
  friction: string[];
}

/** One `## Contract` row. */
export const driftRow = (id: string, result = "delivered", slug = ""): string =>
  `| ${id} | ${result} | ${slug === "" ? "" : `\`${slug}\``} |`;

/** A valid full-path drift for the default three-criterion contract with no findings. */
export const makeDrift = (overrides: Partial<DriftParts> = {}): string => {
  const parts: DriftParts = {
    pr: "42",
    path: "full",
    rows: ["AC-1", "AC-2", "AC-3"].map(id => driftRow(id)),
    added: [],
    corrections: [],
    selfCaught: [],
    friction: [],
    ...overrides,
  };
  const list = (items: string[]) => (items.length > 0 ? items : ["None."]);
  return [
    "---",
    `pr: ${parts.pr}`,
    `path: ${parts.path}`,
    "---",
    "",
    "## Contract",
    "",
    "| AC | Result | Pattern |",
    "| --- | --- | --- |",
    ...parts.rows,
    "",
    "## Added",
    "",
    ...list(parts.added),
    "",
    "## Corrections",
    "",
    ...list(parts.corrections),
    "",
    "## Self-caught",
    "",
    ...list(parts.selfCaught),
    "",
    "## Friction",
    "",
    ...list(parts.friction),
    "",
  ].join("\n");
};
