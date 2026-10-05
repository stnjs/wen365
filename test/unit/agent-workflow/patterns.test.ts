import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parsePattern } from "~~/scripts/agent-workflow/lib/pattern.mjs";
import { countPatterns, loadPatternInputs } from "~~/scripts/agent-workflow/patterns.mjs";
import { makeDrift, makePattern } from "~~/test/factories/drift";
import { makeGitRepo, type GitRepo } from "~~/test/factories/gitRepo";

const SCRIPT = fileURLToPath(
  new URL("../../../scripts/agent-workflow/patterns.mjs", import.meta.url),
);
const lint = parsePattern(makePattern({ slug: "redundant-ref-annotation", target: "lint" }));
const prose = parsePattern(makePattern({ slug: "drive-by-refactor", target: "prose" }));
const cites = (pr: number, ...slugs: string[]) => ({ pr, slugs });

describe("countPatterns", () => {
  it("counts distinct PRs, not citations", () => {
    const { counts } = countPatterns({
      patterns: [lint],
      drifts: [
        cites(1, "redundant-ref-annotation"),
        cites(1, "redundant-ref-annotation"),
        cites(2, "redundant-ref-annotation"),
      ],
      promotionTitles: [],
    });

    expect(counts[0]).toMatchObject({
      slug: "redundant-ref-annotation",
      prs: [1, 2],
      threshold: 2,
      due: true,
    });
  });

  it("makes a prose pattern due only at three PRs", () => {
    const twoPrs = [cites(1, "drive-by-refactor"), cites(2, "drive-by-refactor")];

    expect(countPatterns({ patterns: [prose], drifts: twoPrs, promotionTitles: [] }).due).toEqual(
      [],
    );
    expect(
      countPatterns({
        patterns: [prose],
        drifts: [...twoPrs, cites(3, "drive-by-refactor")],
        promotionTitles: [],
      }).due,
    ).toEqual(["drive-by-refactor"]);
  });

  it("never makes promoted or rejected patterns due", () => {
    const drifts = [cites(1, "redundant-ref-annotation"), cites(2, "redundant-ref-annotation")];
    const promoted = { ...lint, status: "promoted", promotedTo: "eslint.config.mjs" };
    const rejected = { ...lint, status: "rejected", rejectedReason: "noise" };

    expect(countPatterns({ patterns: [promoted], drifts, promotionTitles: [] }).due).toEqual([]);
    expect(countPatterns({ patterns: [rejected], drifts, promotionTitles: [] }).due).toEqual([]);
  });

  it("does not propose a pattern again once a promotion PR exists", () => {
    const drifts = [cites(1, "redundant-ref-annotation"), cites(2, "redundant-ref-annotation")];

    expect(
      countPatterns({
        patterns: [lint],
        drifts,
        promotionTitles: ["chore(harness): promote redundant-ref-annotation"],
      }).due,
    ).toEqual([]);
  });

  it("ignores drift without a PR number", () => {
    const result = countPatterns({
      patterns: [lint],
      drifts: [{ pr: null, slugs: ["redundant-ref-annotation"] }],
      promotionTitles: [],
    });

    expect(result.counts[0]?.prs).toEqual([]);
  });

  it("reports cited slugs that have no pattern file", () => {
    const result = countPatterns({
      patterns: [lint],
      drifts: [cites(4, "formatting-churn")],
      promotionTitles: [],
    });

    expect(result.unknownSlugs).toEqual(["formatting-churn"]);
  });
});

describe("loadPatternInputs", () => {
  let repo: GitRepo;
  beforeEach(() => {
    repo = makeGitRepo();
  });
  afterEach(() => {
    repo.remove();
  });

  it("collects drift merged on main plus the branch's own, skipping the template", () => {
    repo.baseline({
      "docs/patterns/redundant-ref-annotation.md": makePattern(),
      "docs/plans/2026-10-01-old/drift.md": makeDrift({
        pr: "1",
        corrections: ["- a → `redundant-ref-annotation`"],
      }),
      "docs/plans/_template/drift.md": makeDrift({ pr: "" }),
    });
    repo.write(
      "docs/plans/2026-10-05-new/drift.md",
      makeDrift({ pr: "2", corrections: ["- b → `redundant-ref-annotation`"] }),
    );

    const { drifts, problems } = loadPatternInputs({ cwd: repo.dir });

    expect(drifts.map(drift => drift.pr).sort()).toEqual([1, 2]);
    expect(problems).toEqual([]);
  });

  it("reports invalid pattern files with their path", () => {
    repo.write("docs/patterns/redundant-ref-annotation.md", makePattern({ target: "rule" }));

    expect(loadPatternInputs({ cwd: repo.dir }).problems).toEqual([
      'docs/patterns/redundant-ref-annotation.md: `target` must be one of lint, prose; got "rule".',
    ]);
  });
});

describe("patterns CLI", () => {
  let repo: GitRepo;
  beforeEach(() => {
    repo = makeGitRepo();
  });
  afterEach(() => {
    repo.remove();
  });

  it("prints the pattern report using injected promotion PRs", () => {
    repo.write("docs/patterns/redundant-ref-annotation.md", makePattern());
    repo.write(
      "docs/plans/2026-10-01-a/drift.md",
      makeDrift({ pr: "1", corrections: ["- a → `redundant-ref-annotation`"] }),
    );
    repo.write(
      "docs/plans/2026-10-02-b/drift.md",
      makeDrift({ pr: "2", corrections: ["- b → `redundant-ref-annotation`"] }),
    );
    const promotionPrs = join(repo.dir, "promotion-prs.json");
    writeFileSync(promotionPrs, "[]");
    const result = spawnSync("node", [SCRIPT, "--promotion-prs", promotionPrs], {
      cwd: repo.dir,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      due: ["redundant-ref-annotation"],
      problems: [],
    });
  });
});
