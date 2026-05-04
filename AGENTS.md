# AGENTS.md

Entry point for any coding agent (Cursor, Codex, Copilot CLI, Claude Code, Gemini CLI) working on Wen365. Keep this file short; link out for detail.

## What this repo is

Wen365 is a Nuxt 4 crypto-portfolio tracker. SIWE wallet auth, Alchemy for live token data, Supabase for daily Snapshots. See [`README.md`](./README.md) for the product overview and setup.

## Before you write code

Read these in order:

1. [`README.md`](./README.md) — product shape, tech stack, env vars, setup.
2. [`CONTEXT.md`](./CONTEXT.md) — domain vocabulary. Use these terms exactly (`Wallet`, `Portfolio`, `Snapshot`, `Session`, `Network`, `Token`, `Address`).
3. [`docs/adr/`](./docs/adr/) — decisions that are **not up for debate** unless explicitly revisiting. If you're about to propose something that contradicts an ADR, surface the conflict first.
4. **Cursor-specific style rules** in [`.cursor/rules/`](./.cursor/rules/) — detailed coding guidance (`server-api.mdc`, `testing.mdc`, `security.mdc`, `ui-components.mdc`). Read the relevant one before editing a matching file. Agents other than Cursor should treat these as advisory but they encode the project's conventions.

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

Run `pnpm type-check` and `pnpm lint` before claiming work is done.

## Conventions at a glance

- **TypeScript strict** is on. `any` needs a reason.
- **Shared types** in `shared/types/` are auto-imported by Nuxt — do not import them explicitly.
- **Zod at API boundaries** for request parsing (params, query, body). See `server/utils/validation.ts` and `server/types/common.ts`.
- **HTTP errors** use `createError({ statusCode, statusMessage })`. Do not leak internal error messages to clients (see `.cursor/rules/server-api.mdc`).
- **Logging** uses the structured logger at `server/utils/logger.ts`. No `console.log` in shipped code.
- **Server addresses** are normalized to lowercase before storage or lookup.
- **DTO pattern**: external API shapes (Alchemy) stay server-side; the client only sees types from `shared/types/`.

## Writing tests

- Unit tests go in `test/unit/`, Nuxt-env tests in `test/nuxt/`. The split is enforced by `vitest.config.ts`.
- Use fake timers (`vi.useFakeTimers()`) for anything that awaits retry delays.
- Mock at the seam, not at the implementation detail — see `.cursor/rules/testing.mdc`.

## MCP servers available in this workspace

See [`.cursor/rules/mcp-servers.mdc`](./.cursor/rules/mcp-servers.mdc) for the full list. Prefer MCP calls (`user-Vercel`, `user-Supabase`, `user-Context7`) over their CLI equivalents.

## Proposing changes

- **Surprising or hard-to-reverse decision?** Record it as an ADR in `docs/adr/` before the PR lands. Template at [`docs/adr/0000-template.md`](./docs/adr/0000-template.md).
- **New domain vocabulary?** Add the term to `CONTEXT.md` in the same PR. Don't introduce aliases ("the user's wallet address") when the canonical name exists (`Address`).
- **Touching an area with a Cursor rule?** Follow it.

## What NOT to do

- Don't add Pinia stores for data that TanStack Query already caches (see ADR-0002).
- Don't add SSR-dependent code — `ssr: false` (see ADR-0001).
- Don't leak Alchemy-shaped types into `shared/types/` or client code (see ADR-0003).
- Don't update `git config`, force-push to main, or skip hooks. Don't commit without an explicit request from the user.
