# 0006. Shared Network registry as the single source of truth

- **Status:** accepted
- **Date:** 2026-05-07

## Context

Before this decision, "the supported networks" existed as four parallel lists that disagreed:

- `shared/types/NetworkId.ts` — a 10-slug union (`eth-mainnet`, `matic-mainnet`, `avax-mainnet`, `bnb-mainnet`, `zksync-mainnet`, `linea-mainnet`, `scroll-mainnet`, …) used by Zod validators across the API surface.
- `server/config/networks.ts` — defaulted to `["eth-mainnet", "base-mainnet"]` unless `SUPPORTED_NETWORKS` was set, with no relation to the Zod union.
- `app/config/wagmi.ts` — a hand-typed array of viem chains: `[mainnet, polygon, base, arbitrum]`. Optimism was missing despite `opt-mainnet` being a valid `NetworkId`.
- `app/components/portfolio/AssetsTable/config.ts` — a hand-maintained 10-entry map from `NetworkId` to icon name, with empty strings as placeholders for unfinished chains.
- The landing page (`app/pages/index.vue`) hard-coded "10 EVM networks" and listed five chain badges plus a "+5 more".

Adding or removing a chain meant editing five files and hoping the lists stayed in sync. The Polygon native-token metadata was wrong (POL vs MATIC) in two of those places. Three of the ten "supported" chains had no icon. The chain count in the marketing copy didn't match what Alchemy was actually queried for.

Separately, the `MIN_TOKEN_VALUE_USD` floor in `portfolio.service.ts` was `0.03`, which let through hundreds of dust-balance scam-airdrop tokens and made the assets table ugly on real wallets.

## Decision

We introduce **one** registry of supported Networks at [`shared/config/networks.ts`](../../shared/config/networks.ts) — a `readonly Network[]` whose entries carry every fact we know about a chain: Alchemy slug, EIP-155 `chainId`, display and short names, Tailwind icon name, and native-token metadata.

Every other consumer derives from it:

- `NetworkId` is `(typeof NETWORKS)[number]["alchemySlug"]`, and the Zod enum is built from the same array.
- `SUPPORTED_NETWORKS` defaults to the full registry; `SUPPORTED_NETWORKS=…` env var only narrows it. Unknown slugs are warned and skipped.
- `wagmi.ts` maps each registry entry through a `chainId → AppKitNetwork` lookup. Missing a viem chain throws a clear error at module load time.
- The `AssetsTable` icon and name maps are `Object.fromEntries` over `NETWORKS`.
- The landing page uses `NETWORKS.length` and `v-for="n in NETWORKS"` — the marketing copy can no longer drift from reality.

We deliberately narrow the supported set to **five chains** for now (Ethereum, Base, Arbitrum, Optimism, Polygon). Each chain costs Alchemy compute units per request and adds spam-token surface area; we'd rather ship five chains that work than ten that half-work.

We raise `MIN_TOKEN_VALUE_USD` from `$0.03` to `$0.50`. This drops the long tail of dust and most low-value airdrops without hiding meaningful balances.

## Consequences

- **Positive**: Adding a chain is one edit (`NETWORKS` + the matching viem chain in `APP_KIT_CHAIN_BY_ID`). The `as const satisfies readonly Network[]` keeps the literal types narrow so downstream `Record<NetworkId, …>` derivations stay exhaustive.
- **Positive**: The wagmi-side coupling is the **only** place viem chain types leak into our code, and a missing chain fails loudly at startup rather than at user wallet-connect time.
- **Positive**: Stored Snapshots in Supabase are unaffected — `tokens` is a JSONB blob; old slugs (`avax-mainnet`, `bnb-mainnet`) read back as plain strings even though they're no longer in the union. Reading historical Snapshots keeps working; new Snapshots only ever contain registry slugs.
- **Positive**: The $0.50 floor noticeably cleans up real-wallet portfolios; the demo data is unaffected because every demo token clears the floor.
- **Negative**: The Polygon entry needs a custom `nativeToken` (POL, not ETH); five other chains can share the same `ETH_NATIVE` literal. Adding any non-EVM-ETH chain in future will require its own `nativeToken` block.
- **Negative**: `NETWORK_BY_ID` and `NETWORK_BY_CHAIN_ID` are eager `Object.fromEntries` results — fine at five chains, would want a `Map` if this ever exceeded a few dozen.
- **Neutral**: Re-enabling a chain (e.g. Avalanche) is one registry entry plus one `APP_KIT_CHAIN_BY_ID` line; nothing else needs to change.
