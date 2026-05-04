# 0002. TanStack Query for remote state, not Pinia

- **Status:** accepted
- **Date:** 2025-11-17

## Context

The Vue ecosystem default for state management is Pinia, which works well for local UI state but offers no first-class primitives for cache invalidation, background refetching, request deduplication, or stale-while-revalidate. Wen365's primary state is **remote** — Portfolios and Snapshots fetched from `/api/*` endpoints — with small amounts of local UI state that Vue refs handle natively.

## Decision

We use TanStack Vue Query for all remote server state. Composables under `app/composables/queries/` wrap `useQuery` / `useMutation` and encode URL construction. We do not create Pinia stores for data that already lives in a TanStack Query cache.

## Consequences

- **Positive**: automatic caching, deduplication, and refetching on window focus come for free; loading/error states are uniform across the app.
- **Positive**: one source of truth per query key — no sync bugs between a Pinia store and the network cache.
- **Negative**: contributors expecting the Vue default (Pinia) need to learn the Query patterns; TanStack Query's Vue adapter is less widespread than its React equivalent.
- **Out of scope**: **Session** state is served by `useUserSession` from `nuxt-auth-utils` — also not Pinia — for the same reason (the server owns it).
