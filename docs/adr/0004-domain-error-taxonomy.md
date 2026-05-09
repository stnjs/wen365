# 0004. Domain error taxonomy with HTTP translation at the edge

- **Status:** accepted
- **Date:** 2026-05-05

## Context

Before this decision, server-side error handling was incoherent across three patterns:

- Services threw plain `new Error("Failed to register wallet: ...")` whose only signal was a string.
- `server/utils/errorHandler.ts` only knew how to map errors that already had a `statusCode`; anything else became a generic 500, including Supabase PostgREST failures, blockchain client errors, and business rule violations.
- API handlers mixed `createError`, `throw new Error`, and manual rethrows, and one handler (`cron/snapshot.get.ts`) leaked raw error messages to the response body.

The result: impossible to reason about what a service might throw, no way to distinguish a missing Wallet from an upstream outage, and internal detail occasionally escaping to clients.

## Decision

We introduce a single `DomainError` class in `server/errors/` with a `kind` discriminant drawn from a closed set:

`notFound | unauthorized | forbidden | validation | preconditionFailed | rateLimited | upstreamFailed | internal`

Every throw site below the HTTP edge — services, repos, utilities — constructs a `DomainError` via a factory (`notFound("Wallet")`, `upstreamFailed("alchemy", { cause })`, etc.). `DomainError` carries three fields:

- `message` — developer-facing, never sent to clients.
- `details` — client-safe metadata, used as `data:` on the HTTP response.
- `cause` — raw underlying error, logged only.

A single `toHttp(err, event)` helper in `server/errors/toHttp.ts` is called from the outer `try/catch` of every handler. It maps `kind → { HTTP status, sanitized status message }`, logs at ERROR for `internal` and `upstreamFailed` and at WARN for everything else, attaches `details` as `data`, and re-raises H3-shaped errors unchanged.

Zod failures are converted to `DomainError("validation")` inside `server/utils/validation.ts` so handlers only ever reason about `DomainError`.

Upstream failures are normalized at the adapter boundary via `wrapUpstream(source, fn)` — HTTP 429 becomes `rateLimited`, everything else becomes `upstreamFailed(source)`. This is the only place upstream-specific error shapes are understood.

## Consequences

- **Positive**: The type of a service is now also the spec of what can go wrong. `getPortfolio` either returns a `PortfolioDto` or throws a `DomainError`, with a finite, enumerable set of failure modes.
- **Positive**: Handlers collapse to `try { ...work... } catch (err) { toHttp(err, event) }`. No more scattered `createError` calls or ad-hoc status mapping.
- **Positive**: Clients get consistent, sanitized error messages and structured `data` for validation errors; internal details and `cause` never leak.
- **Positive**: Logs are structured and levelled by kind, so operational dashboards can reliably distinguish "user typed a bad address" from "Alchemy is down".
- **Negative**: A new file (`server/errors/`) and a new discipline. Any future throw site that uses `new Error(...)` below the HTTP edge is now a bug.
- **Negative**: `DomainError` encodes _our_ taxonomy, not HTTP. If the HTTP-level mapping ever becomes inadequate, the translation table in `toHttp.ts` has to change in lockstep with any new kinds.
- **Deliberate degradation**: `compute24hDelta` catches `DomainError` and returns `null` rather than propagating — Snapshot-infra failures must not break the live Portfolio view. See inline comment in `snapshot.service.ts`.
