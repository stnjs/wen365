# AGENTS.md

Entry point for any coding agent (Claude Code, Codex, Cursor, Copilot, Gemini CLI) working on Wen365. Keep this file short; link out for detail.

## What this repo is

Wen365 is a Nuxt 4 crypto-portfolio tracker. SIWE wallet auth, Alchemy for live token data, Supabase for daily Snapshots. See [`README.md`](./README.md) for the product overview and setup.

## Before you write code

Read these in order:

1. [`README.md`](./README.md) — product shape, tech stack, env vars, setup.
2. [`CONTEXT.md`](./CONTEXT.md) — domain vocabulary. Use these terms exactly (`Wallet`, `Portfolio`, `Snapshot`, `Session`, `Network`, `Token`, `Address`).
3. [`docs/adr/`](./docs/adr/) — decisions that are **not up for debate** unless explicitly revisiting. If you're about to propose something that contradicts an ADR, surface the conflict first.
4. The `AGENTS.md` in the directory you're editing. Most agents load it automatically when they touch a file there; if yours doesn't, read it yourself.

| Editing                                                                               | Read                                                 | Covers                                                                                 |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `server/**`                                                                           | [`server/AGENTS.md`](./server/AGENTS.md)             | Handler shape, DomainError taxonomy, validation, upstream calls, logging, security     |
| `app/**`                                                                              | [`app/AGENTS.md`](./app/AGENTS.md)                   | TanStack Query, Network registry, Nuxt UI, component conventions                       |
| `test/**`                                                                             | [`test/AGENTS.md`](./test/AGENTS.md)                 | What earns a test, where to mock, queries, Vitest mechanics                            |
| `.agents/skills/**`, `scripts/agent-workflow/**`, `docs/plans/**`, `docs/patterns/**` | [`docs/agent-workflow.md`](./docs/agent-workflow.md) | Contract → self-check → drift workflow, pattern registry, skill and script conventions |

## Canonical commands

```bash
pnpm install          # install deps (uses pnpm workspace)
pnpm dev              # dev server on :3000
pnpm build            # production build
pnpm test             # all tests
pnpm test:unit        # unit tests only (node env)
pnpm test:nuxt        # Nuxt tests (composables, integration)
pnpm lint             # ESLint
pnpm type-check       # vue-tsc strict check
pnpm format           # Prettier
```

Run `pnpm type-check` and `pnpm lint` before claiming work is done. CI also runs `pnpm format:check`.

## Workflow

Feature, fix and refactor work starts from an approved contract in `docs/plans/` and ends with a drift entry that feeds recurring problems back into this guidance. The workflow, its vocabulary and which steps exist so far are in [`docs/agent-workflow.md`](./docs/agent-workflow.md). Repo skills live in `.agents/skills/` (symlinked into `.claude/skills/`) and are prefixed `wen-`. `/wen-ship`, which runs the whole workflow, arrives in a later PR.

## Conventions at a glance

- **TypeScript strict** is on. `any` needs a reason.
- **Shared types** in `shared/types/` are auto-imported by Nuxt — do not import them explicitly.
- **Zod at API boundaries** for request parsing (params, query, body). See `server/utils/validation.ts` and `server/types/common.ts`.
- **Server errors** are `DomainError`s from `server/errors/`, translated once at the edge by `toHttp` (ADR-0004). No `createError` outside `server/errors/toHttp.ts`, and no internal messages sent to clients.
- **Logging** uses `logError` / `logWarn` / `logInfo` from `server/utils/logger.ts`. No bare `console.*` in shipped code.
- **Server addresses** are normalized to lowercase before storage or lookup.
- **DTO pattern**: external API shapes (Alchemy) stay server-side; the client only sees types from `shared/types/`.

## MCP servers

No MCP config is committed; each developer configures servers in their own tool. If your agent has these servers, prefer them over the equivalent CLI:

- **Context7** — current docs for Nuxt, Nuxt UI, TanStack Query, Vitest, etc. Check it before writing code against a library API.
- **Vercel** — deployments, logs, domains. Use instead of the `vercel` CLI.
- **Chrome DevTools** — inspect the running app in a browser, profile performance.
- **Supabase** — schema and data inspection. Read-only use only: schema changes are made by a human and documented in [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md), never through the MCP.

## Proposing changes

- **Surprising or hard-to-reverse decision?** Record it as an ADR in `docs/adr/` before the PR lands. Template at [`docs/adr/0000-template.md`](./docs/adr/0000-template.md).
- **New domain vocabulary?** Add the term to `CONTEXT.md` in the same PR. Don't introduce aliases ("the user's wallet address") when the canonical name exists (`Address`).
- **Touching a directory with its own `AGENTS.md`?** Follow it.

## Maintaining agent guidance

- Plain Markdown only, so every agent can read it. Repo-wide rules go here; rules for one area go in that directory's `AGENTS.md`. Add a row to the table above when you create one.
- Don't copy guidance into tool-specific files (`.cursor/rules/`, `.github/copilot-instructions.md`, …). A tool-specific file that only points back here is fine.
- Claude Code reads `AGENTS.md` only when a directory has no `CLAUDE.md`. If you ever add a `CLAUDE.md`, its first line must be `@AGENTS.md`.
- Write only what is specific to this repo. Generic advice the agent already knows ("validate inputs", "write clear names") is noise.
- Check examples against the code when you change a convention; stale examples are worse than none.

## What NOT to do

- Don't add Pinia stores for data that TanStack Query already caches (see ADR-0002).
- Don't add SSR-dependent code — `ssr: false` (see ADR-0001).
- Don't leak Alchemy-shaped types into `shared/types/` or client code (see ADR-0003).
- Don't update `git config`, force-push, or skip hooks. Never commit to `main`: every change lands through a PR, and the `main` ruleset enforces it.
