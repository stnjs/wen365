# server/ — Nitro API and services

Guidance for everything under `server/`. Root rules in [`../AGENTS.md`](../AGENTS.md) still apply.

Two ADRs shape this directory. Read them before writing server code:

- [ADR-0004](../docs/adr/0004-domain-error-taxonomy.md) — every throw below the HTTP edge is a `DomainError`. Handlers catch once and call `toHttp(err, event)`.
- [ADR-0005](../docs/adr/0005-repository-pattern-for-persistence.md) — services take `WalletRepo` / `SnapshotRepo` parameters, never `H3Event` or `SupabaseClient`. Handlers build repos with `reposFromEvent(event)`.

## Layers

| Directory           | Role                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `server/api/`       | HTTP edge. Auth, validation, build repos, call services, `toHttp` on failure.                                      |
| `server/services/`  | Business logic and orchestration. Takes repo interfaces, never sees `H3Event`.                                     |
| `server/repos/`     | Persistence. Supabase adapters plus in-memory adapters for tests.                                                  |
| `server/errors/`    | `DomainError` factories, `toHttp`, `wrapUpstream`.                                                                 |
| `server/mappers/`   | Pure functions turning Alchemy shapes into DTOs from `shared/types/`.                                              |
| `server/utils/`     | Validation, retry, logging, formatting helpers.                                                                    |
| `server/config/`    | Active Network set, derived from the shared registry and narrowed by `SUPPORTED_NETWORKS` (ADR-0006).              |
| `server/constants/` | Static data such as the blacklisted-Token list.                                                                    |
| `server/types/`     | Server-only types and Zod schemas (including Alchemy response shapes — these never leave `server/`, see ADR-0003). |

## Handler shape

Copy this shape. The reference implementation is `server/api/portfolio/[walletAddress].get.ts`.

```typescript
import { reposFromEvent } from "@server/repos";
import { forbidden, internal, toHttp } from "@server/errors";
import { validateParams } from "@server/utils/validation";
import { WalletAddressParamsSchema } from "@server/types/common";

export default defineEventHandler(async (event): Promise<PortfolioDto> => {
  try {
    const session = await requireUserSession(event);
    const config = useRuntimeConfig(event);
    if (!config.alchemyApiKey) throw internal("Server configuration error: missing alchemyApiKey");

    const { walletAddress } = validateParams(event, WalletAddressParamsSchema);
    if (session.user.address.toLowerCase() !== walletAddress.toLowerCase()) {
      throw forbidden("Session wallet does not match requested address");
    }

    const { wallets, snapshots } = reposFromEvent(event);
    return await getPortfolioWithDelta(walletAddress, wallets, snapshots);
  } catch (err) {
    toHttp(err, event);
  }
});
```

- **Authenticate first.** Any user-facing route that touches a Wallet's data calls `requireUserSession(event)` and checks the Session Address matches the requested one. The exception is `server/api/cron/snapshot.get.ts`, which has no Session and is guarded by the `CRON_SECRET` bearer token instead.
- **Validate before doing work.** Use `validateParams` / `validateQuery` / `validateBody` from `server/utils/validation.ts` with Zod schemas (shared ones live in `server/types/common.ts`). They turn a `ZodError` into a `validation` DomainError with structured `details`. Don't hand-roll `getRouterParam` + `isAddress` checks.
- **Check required config** (`useRuntimeConfig(event)`) and throw `internal(...)` when it's missing. Never hardcode keys.
- **Return DTOs** from `shared/types/` — never Alchemy or Supabase row shapes.

## Errors

Throw the most specific factory from `@server/errors`. Never `new Error(...)`, and never `createError` outside `server/errors/toHttp.ts`.

| Situation                                | Factory                                      | HTTP |
| ---------------------------------------- | -------------------------------------------- | ---- |
| Resource doesn't exist                   | `notFound("Wallet", { details })`            | 404  |
| Not authenticated                        | `unauthorized()`                             | 401  |
| Authenticated but not allowed            | `forbidden(message)`                         | 403  |
| Input shape invalid                      | `validation(message, { details })`           | 400  |
| State not suitable (expired nonce, etc.) | `preconditionFailed(message)`                | 400  |
| Upstream rate limit                      | `rateLimited()` — usually via `wrapUpstream` | 503  |
| Upstream failed otherwise                | `upstreamFailed("alchemy", { cause })`       | 502  |
| Programmer or configuration error        | `internal(message)`                          | 500  |

Status codes come from `kind` in `toHttp.ts`; don't pick them yourself. If a new case truly fits no kind, add the kind and its mapping in the same change.

`toHttp` sends only a fixed, safe message per kind plus `details` as `data`. The raw `message` and `cause` are logged, never sent. So: put nothing secret in `details`, and don't add manual sanitizing in handlers.

```typescript
// ❌ raw Error below the edge
throw new Error(`Failed to register wallet: ${err.message}`);
// ❌ createError in a service or handler
throw createError({ statusCode: 404, statusMessage: "Wallet not found" });
// ❌ mapping upstream status codes by hand
if (err.statusCode === 429) throw createError({ statusCode: 503 });
```

## Upstream calls

- **External HTTP APIs (Alchemy):** wrap the call with `wrapUpstream("alchemy", () => fetchWithRetry(url, options))`, as in `server/services/portfolio.service.ts`. It turns 429 into `rateLimited` and anything else into `upstreamFailed`.
- **Supabase:** stays inside the `*.supabase.ts` repo adapters, which check the client's `error` result and throw `upstreamFailed("supabase", { cause })` themselves.
- Use `fetchWithRetry` / `withRetry` from `server/utils/retryUtils.ts` rather than writing retry loops. `fetchWithRetry` defaults to a 30s timeout and 3 attempts with exponential backoff.
- Every pagination or polling loop has a hard cap (see `MAX_PAGES` in `server/services/portfolio.service.ts`).

## Logging

Use `logError` / `logWarn` / `logInfo` from `server/utils/logger.ts` — `(message, context)`. No bare `console.*`.

```typescript
logWarn("24h delta unavailable", { walletAddress, kind: err.kind, message: err.message });
```

- Never log API keys, session secrets, signatures, or full upstream payloads.
- `toHttp` already logs every DomainError with its path, kind, message, and cause. Only log before `toHttp` when you have context it lacks.
- For multi-step flows, generate a `requestId` with `crypto.randomUUID()` and put it in every log context so the steps can be correlated. `server/api/auth/verify.post.ts` shows both patterns.

## Data rules

- Keep Alchemy-shaped types in `server/types/alchemy.ts`; map to DTOs in `server/mappers/` (ADR-0003).
- Mappers are pure functions. Network I/O belongs in services and repos (plus the retry, logging, and Supabase-client helpers in `server/utils/`).
- Services are tested with `createInMemoryWalletRepo()` / `createInMemorySnapshotRepo()` — keep them free of `H3Event` so that stays possible.

## Reference files

- `server/api/portfolio/[walletAddress].get.ts` — handler shape
- `server/services/snapshot.service.ts` — service taking repo parameters, `compute24hDelta` degradation
- `server/services/portfolio.service.ts` — upstream wrapping, retry, page cap
- `server/repos/` — repo interfaces with Supabase and in-memory adapters
- `server/mappers/portfolio.mapper.ts` — mapper pattern
