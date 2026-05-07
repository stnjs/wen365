# Wen365 Context

Shared vocabulary for the Wen365 portfolio tracker. Use these terms exactly in code, commits, docs, and conversations — pick the preferred word over its aliases.

## Language

**Wallet**:
A registered on-chain address that we persist a row for and attach Snapshots to.
_Avoid_: user, account, owner.

**Address**:
The raw on-chain identifier (`0x…`), normalized to lowercase before storage or lookup.
_Avoid_: wallet address (use **Address** alone; **Wallet** means the record, **Address** means the identifier).

**Session**:
An authenticated caller, proven by a SIWE signature and bound to a Wallet Address and chain, encoded in an encrypted cookie.
_Avoid_: user session, login, auth (the last is fine when describing the flow, not the entity).

**Portfolio**:
The live USD-valued view of a Wallet's tokens returned by the Alchemy pipeline; optionally enriched with Snapshot-derived deltas.
_Avoid_: holdings, balance, assets.

**Token**:
A single line-item inside a Portfolio: a `(Network, Address-or-native)` pair with balance, metadata, and a USD value.
_Avoid_: asset, coin, position.

**Snapshot**:
A persisted row in `portfolio_snapshots` recording a Wallet's total Portfolio value and token breakdown at a point in time, produced by the daily CRON.
_Avoid_: history entry, record, checkpoint (the table name is the noun).

**Network**:
A supported EVM chain, identified by an Alchemy network slug (e.g. `eth-mainnet`, `base-mainnet`). The single source of truth is the shared `Network` registry at [`shared/config/networks.ts`](./shared/config/networks.ts) — every other consumer (server `SUPPORTED_NETWORKS`, wagmi `networks`, `NetworkId` type, landing page count) derives from it.
_Avoid_: chain, blockchain (`chainId` is fine when referring specifically to the EIP-155 integer).

## Relationships

- A **Session** authenticates exactly one **Wallet Address** on exactly one **Network**.
- A **Wallet** has zero or more **Snapshots**, one per CRON run at most.
- A **Portfolio** is always computed for one **Wallet Address** across many **Networks**.
- A **Snapshot** contains a frozen list of **Tokens** at the time it was taken; a **Portfolio** contains the current list.
- Every **Token** belongs to exactly one **Network**.

## Example dialogue

> **Dev:** "Should the `/api/portfolio/:address` route require a **Session**?"
> **Maintainer:** "Yes, and the **Session**'s Wallet Address must match the path's Address — we 403 otherwise."
> **Dev:** "What if the **Wallet** has no **Snapshots** yet?"
> **Maintainer:** "Return the live **Portfolio** without 24h deltas. Missing **Snapshot** history is normal for a new **Wallet**, not an error."

## Resolved ambiguities

- **"wallet" vs "address"** — previously used interchangeably. **Wallet** is the persisted record (has a UUID, `last_snapshot_at`, etc.); **Address** is the on-chain string. `getOrCreateWallet(address)` takes an Address and returns a Wallet.
- **"supported networks"** — server, client, and type list previously disagreed. The shared registry at [`shared/config/networks.ts`](./shared/config/networks.ts) is now the only source; `SUPPORTED_NETWORKS`, the wagmi chain list, and the `NetworkId` type all derive from it. See [ADR-0006](./docs/adr/0006-shared-network-registry.md).
- **"portfolio"** — previously ambiguous between "live Alchemy view" and "live view + 24h deltas from Snapshots". **Portfolio** is the live view; 24h delta fields are present but may be `null` / `0` when Snapshot history is absent.
