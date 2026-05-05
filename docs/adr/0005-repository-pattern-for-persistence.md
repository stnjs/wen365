# 0005. Repository pattern for Wallet and Snapshot persistence

- **Status:** accepted
- **Date:** 2026-05-05

## Context

Before this decision, server-side services were tightly coupled to Nitro's `H3Event` and to Supabase:

- `wallet.service.ts` and `snapshot.service.ts` each took `event: H3Event` as their first argument purely so they could call `useSupabaseAdmin(event)` inside the function.
- `snapshot.service.ts` duplicated Wallet lookups (a direct `supabase.from("wallets").select(...)` instead of using `wallet.service`), so any change to how Wallets are stored had to be mirrored in two places.
- Services were untestable without a running Nuxt server — no way to exercise "what does `createSnapshot` do when a Wallet is new?" without a real Supabase project.
- Running the same logic from a non-HTTP context (e.g. a pure CLI backfill job) would require fabricating a fake `H3Event`.

The result: business logic was welded to the HTTP framework and to the concrete database driver, for no reason other than "that's where the Supabase client came from".

## Decision

We introduce two repository interfaces in `server/repos/` — `WalletRepo` and `SnapshotRepo` — that present collection-like access to the `wallets` and `portfolio_snapshots` tables. Each has two implementations:

- `createSupabaseWalletRepo(supabase)` / `createSupabaseSnapshotRepo(supabase)` — the production adapter.
- `createInMemoryWalletRepo(seed?)` / `createInMemorySnapshotRepo(seed?)` — the test adapter, satisfying the same contract with a `Map` and `crypto.randomUUID()`.

Services accept `WalletRepo` and/or `SnapshotRepo` as parameters. They never see `H3Event`, `SupabaseClient`, or any persistence-specific type.

At the HTTP edge, `reposFromEvent(event)` builds the Supabase-backed repos once per request and hands them to the services. This is the only line in the codebase that couples repos to Nitro.

Repos return `null` / `[]` for expected absence (no Wallet for this Address, no Snapshots yet). Infrastructure failures (PostgREST errors, network errors) throw `DomainError("upstreamFailed", "supabase", { cause })` — see ADR-0004.

The old `server/services/wallet.service.ts` is removed; its two responsibilities now live in the right places: `createSupabaseWalletRepo` (talks to the DB) and `snapshot.service.ts` (orchestrates).

## Consequences

- **Positive**: Services describe **business rules**, not **storage**. `createSnapshot(address, apiKey, wallets, snapshots)` reads as a sentence; the old `createSnapshot(event, address, apiKey)` told you nothing.
- **Positive**: `snapshot.service.ts` is unit-testable with the in-memory repos. The new tests (`test/unit/services/snapshot.service.test.ts`, `test/unit/repos/*.test.ts`) cover the previously-untested core without touching Supabase.
- **Positive**: Swapping databases, fronting with a cache, or adding an observability layer is now a seam change, not a codebase change. Callers don't notice.
- **Positive**: The same services can run from a CRON handler, a CLI, or a future queue worker — none of them are HTTP-specific.
- **Negative**: One more indirection per call. Callers have to obtain repos before calling services.
- **Negative**: The Supabase `get_or_create_wallet` RPC returns only the UUID, so `getOrCreate` has to do a follow-up `SELECT` to return the full `Wallet` row. Acceptable for the auth path; if it shows up in profiles, the RPC itself can be widened to return the row.
- **Neutral**: Repos return `null` on "not found"; services decide whether that's an error (throw `notFound`) or an expected state (return `null` / `[]`). This keeps the policy in one place — the service — rather than duplicated across every query site.
