import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { collectCorrections } from "~~/scripts/agent-workflow/review-threads.mjs";

const SCRIPT = fileURLToPath(
  new URL("../../../scripts/agent-workflow/review-threads.mjs", import.meta.url),
);

interface ThreadParts {
  isResolved: boolean;
  isOutdated: boolean;
  path: string;
  line: number | null;
  originalLine: number | null;
  comments: Array<{ author: string; body: string }>;
}

const thread = (overrides: Partial<ThreadParts> = {}) => {
  const parts: ThreadParts = {
    isResolved: true,
    isOutdated: false,
    path: "app/composables/useWallets.ts",
    line: 12,
    originalLine: 12,
    comments: [{ author: "stnjs", body: "Type the call, not the variable." }],
    ...overrides,
  };
  return {
    ...parts,
    comments: { nodes: parts.comments.map(c => ({ author: { login: c.author }, body: c.body })) },
  };
};

const response = (...threads: ReturnType<typeof thread>[]) => ({
  data: { repository: { pullRequest: { number: 42, reviewThreads: { nodes: threads } } } },
});

const fixReply = { author: "stnjs", body: "🤖 wen-ship: fixed in a1b2c3d" };

describe("collectCorrections", () => {
  it("keeps a thread the agent fixed, with the fix commit", () => {
    const corrections = collectCorrections(
      response(
        thread({
          comments: [{ author: "stnjs", body: "Type the call, not the variable." }, fixReply],
        }),
      ),
    );

    expect(corrections).toEqual([
      {
        author: "stnjs",
        file: "app/composables/useWallets.ts",
        line: 12,
        body: "Type the call, not the variable.",
        fixCommit: "a1b2c3d",
        outdated: false,
        nitpick: false,
      },
    ]);
  });

  it("keeps an outdated thread without an agent reply and falls back to the original line", () => {
    const [correction] = collectCorrections(
      response(thread({ isOutdated: true, line: null, originalLine: 7 })),
    );

    expect(correction).toMatchObject({ line: 7, outdated: true, fixCommit: null });
  });

  it("drops a thread resolved without a fix or a changed line", () => {
    expect(collectCorrections(response(thread()))).toEqual([]);
  });

  it("drops a thread the agent declined", () => {
    const declined = thread({
      isResolved: false,
      comments: [
        { author: "coderabbitai", body: "Consider a Map." },
        { author: "stnjs", body: "🤖 wen-ship: keeping the Set; order matters here." },
      ],
    });

    expect(collectCorrections(response(declined))).toEqual([]);
  });

  it("ignores threads the agent started itself", () => {
    expect(
      collectCorrections(
        response(
          thread({ isOutdated: true, comments: [{ author: "stnjs", body: "🤖 wen-ship: note" }] }),
        ),
      ),
    ).toEqual([]);
  });

  it("marks CodeRabbit nitpicks and strips its details blocks and comments", () => {
    const body =
      "_🧹 Nitpick_ | _🔵 Trivial_\n\n**Rename `x`.**\n\n<details>\n<summary>Fix</summary>\n<details>inner</details>\nmore\n</details>\n<!-- fingerprint -->";
    const [correction] = collectCorrections(
      response(thread({ comments: [{ author: "coderabbitai", body }, fixReply] })),
    );

    expect(correction).toMatchObject({
      author: "coderabbitai",
      nitpick: true,
      body: "_🧹 Nitpick_ | _🔵 Trivial_\n\n**Rename `x`.**",
    });
  });

  it("fails clearly when the pull request is missing", () => {
    expect(() => collectCorrections({ data: { repository: { pullRequest: null } } })).toThrow(
      "Pull request not found.",
    );
  });
});

describe("review-threads CLI", () => {
  it("reads injected GraphQL JSON and prints the corrections", () => {
    const dir = mkdtempSync(join(tmpdir(), "wen-review-threads-"));
    const input = join(dir, "threads.json");
    writeFileSync(input, JSON.stringify(response(thread({ isOutdated: true }))));
    const result = spawnSync("node", [SCRIPT, "--input", input], { encoding: "utf8" });
    rmSync(dir, { recursive: true, force: true });

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject([
      { file: "app/composables/useWallets.ts", outdated: true },
    ]);
  });
});
