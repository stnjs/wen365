// @ts-check
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { printJson, readFlag, runCli } from "./lib/cli.mjs";
import { removeBlocks, visibleText } from "./lib/markdown.mjs";

/** Every reply the agent posts starts with this, because it posts under the human's account. */
export const AGENT_PREFIX = "🤖 wen-ship:";
const FIX_REPLY = /^🤖 wen-ship: fixed in ([0-9a-f]{7,40})\b/;
const BODY_LIMIT = 600;
const CODERABBIT_FOOTER = "<!-- This is an auto-generated reply by CodeRabbit -->";

/**
 * @typedef {{ author: { login: string } | null, body: string }} ThreadComment
 * @typedef {{
 *   isResolved: boolean,
 *   isOutdated: boolean,
 *   path: string,
 *   line: number | null,
 *   originalLine: number | null,
 *   comments: { nodes: ThreadComment[], pageInfo?: { hasNextPage: boolean } },
 * }} ReviewThread
 * @typedef {{ data: { repository: { pullRequest: { reviewThreads: { nodes: ReviewThread[], pageInfo?: { hasNextPage: boolean } } } | null } } }} ThreadsResponse
 * @typedef {{
 *   author: string,
 *   file: string,
 *   line: number | null,
 *   body: string,
 *   fixCommit: string | null,
 *   outdated: boolean,
 *   nitpick: boolean,
 * }} Correction
 */

// Up to 100 threads and 50 comments per thread; more fails rather than returning a partial list.
const QUERY = `query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        pageInfo { hasNextPage }
        nodes {
          isResolved
          isOutdated
          path
          line
          originalLine
          comments(first: 50) { pageInfo { hasNextPage } nodes { author { login } body } }
        }
      }
    }
  }
}`;

/**
 * Review threads that led to a change: the agent replied "fixed in <sha>", or
 * GitHub marks the thread outdated because the commented lines changed.
 * Threads with neither, threads the agent declined, and threads the agent
 * started are dropped.
 *
 * @param {ThreadsResponse} response `gh api graphql` output
 * @returns {Correction[]}
 */
export function collectCorrections(response) {
  const pullRequest = response.data.repository.pullRequest;
  if (pullRequest === null) throw new Error("Pull request not found.");
  if (pullRequest.reviewThreads.pageInfo?.hasNextPage) {
    throw new Error(
      "The PR has more than 100 review threads; review-threads.mjs does not page through them.",
    );
  }
  /** @type {Correction[]} */
  const corrections = [];
  for (const thread of pullRequest.reviewThreads.nodes) {
    if (thread.comments.pageInfo?.hasNextPage) {
      throw new Error(
        `A thread on ${thread.path} has more than 50 comments; review-threads.mjs does not page through them.`,
      );
    }
    const [first, ...replies] = thread.comments.nodes;
    if (first === undefined || first.body.trimStart().startsWith(AGENT_PREFIX)) continue;
    const fixCommit =
      replies.map(reply => FIX_REPLY.exec(reply.body.trim())?.[1]).find(sha => sha !== undefined) ??
      null;
    // Any other agent reply is a decline: the human gets the thread back, so it isn't a correction
    // even if later commits made it outdated.
    const declined =
      fixCommit === null && replies.some(reply => reply.body.trimStart().startsWith(AGENT_PREFIX));
    if (declined || (fixCommit === null && !thread.isOutdated)) continue;
    const author = first.author?.login ?? "ghost";
    corrections.push({
      author,
      file: thread.path,
      line: thread.line ?? thread.originalLine,
      body: summarize(first.body),
      fixCommit,
      outdated: thread.isOutdated,
      nitpick: isNitpick(author, first.body),
    });
  }
  return corrections;
}

/**
 * The comment without HTML comments and `<details>` blocks, shortened.
 *
 * @param {string} body
 */
function summarize(body) {
  // CodeRabbit appends status notes ("✅ Confirmed as addressed…") after this marker.
  const footer = body.indexOf(CODERABBIT_FOOTER);
  const own = footer === -1 ? body : body.slice(0, footer);
  const text = removeBlocks(visibleText(own), "<details>", "</details>", true)
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text.length > BODY_LIMIT ? `${text.slice(0, BODY_LIMIT)}…` : text;
}

/**
 * @param {string} author
 * @param {string} body
 */
function isNitpick(author, body) {
  const firstLine = body.trimStart().split("\n")[0] ?? "";
  return author.startsWith("coderabbitai") && /nitpick|🧹/i.test(firstLine);
}

/**
 * @param {number} number
 * @returns {ThreadsResponse}
 */
function fetchThreads(number) {
  const repo = JSON.parse(gh(["repo", "view", "--json", "owner,name"]));
  return JSON.parse(
    gh([
      "api",
      "graphql",
      "-f",
      `query=${QUERY}`,
      "-f",
      `owner=${repo.owner.login}`,
      "-f",
      `name=${repo.name}`,
      "-F",
      `number=${number}`,
    ]),
  );
}

/** @param {string[]} args */
function gh(args) {
  try {
    return execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`gh failed (is it installed and authenticated?): ${detail}`);
  }
}

/**
 * @param {string[]} args
 * @returns {number} exit code
 */
function main(args) {
  const input = readFlag(args, "input");
  if (input !== undefined) {
    printJson(collectCorrections(JSON.parse(readFileSync(input, "utf8"))));
    return 0;
  }
  const flag = readFlag(args, "pr");
  const number = Number(flag ?? gh(["pr", "view", "--json", "number", "--jq", ".number"]).trim());
  if (!Number.isInteger(number) || number <= 0)
    throw new Error(`Not a pull request number: ${flag}`);
  printJson(collectCorrections(fetchThreads(number)));
  return 0;
}

runCli(import.meta.url, main);
