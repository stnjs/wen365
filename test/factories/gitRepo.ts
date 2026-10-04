import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export interface GitRepo {
  dir: string;
  git: (...args: string[]) => string;
  write: (path: string, content: string) => void;
  commit: (message: string) => void;
  remove: () => void;
}

// Identity via env and hooks/signing via -c, so the fixture never touches any git config file.
const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "Fixture",
  GIT_AUTHOR_EMAIL: "fixture@example.invalid",
  GIT_COMMITTER_NAME: "Fixture",
  GIT_COMMITTER_EMAIL: "fixture@example.invalid",
};

/** A throwaway repo with one commit on `main`, checked out on a feature branch. No remote. */
export const makeGitRepo = (branch = "feat/example"): GitRepo => {
  const dir = mkdtempSync(join(tmpdir(), "wen-agent-workflow-"));
  const git = (...args: string[]) =>
    execFileSync("git", ["-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", ...args], {
      cwd: dir,
      env: GIT_ENV,
      encoding: "utf8",
    }).trimEnd();
  const write = (path: string, content: string) => {
    const full = join(dir, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  const commit = (message: string) => {
    git("add", "--all");
    git("commit", "--quiet", "-m", message);
  };

  git("init", "--quiet", "--initial-branch=main");
  write("README.md", "# fixture\n");
  commit("chore: init");
  git("checkout", "--quiet", "-b", branch);

  return { dir, git, write, commit, remove: () => rmSync(dir, { recursive: true, force: true }) };
};
