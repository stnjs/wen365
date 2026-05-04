# 0001. Client-side rendering only (`ssr: false`)

- **Status:** accepted
- **Date:** 2025-11-17

## Context

Wen365 is a Nuxt 4 application, and Nuxt's default mode is universal (SSR + hydration). Our primary flows — SIWE authentication, wallet connection via Reown AppKit, and wagmi/viem interactions — depend on browser-only APIs (`window.ethereum`, `indexedDB`, `crypto.subtle` in several code paths, wallet provider injection). Rendering these on the server produces mismatches, duplicated effort to gate code behind `import.meta.client`, and a slower perceived-load because the server cannot produce the authenticated view anyway.

## Decision

We run Nuxt in SPA mode (`ssr: false` in `nuxt.config.ts`). The server serves only the shell + static assets and the `/api/*` routes; all interactive rendering happens on the client.

## Consequences

- **Positive**: no SSR/CSR hydration mismatches for wallet UI; simpler reasoning ("code runs in the browser"); smaller server bundle; easier to reason about Session-bound routes.
- **Positive**: Vercel deploys serve a static shell for unauthenticated traffic.
- **Negative**: initial paint has no content from the server; SEO is limited (acceptable — Wen365 is a tool, not a content site).
- **Negative**: any future server-rendered marketing pages would need a separate route or a change to this decision.
