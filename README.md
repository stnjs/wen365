<h1 align="center">Wen365</h1>

<p align="center">
  A full-stack crypto-portfolio tracker. Sign in with your wallet, see your tokens across five EVM chains, and watch the value move over time.
</p>

<p align="center">
  <a href="https://github.com/stnjs/wen365/actions/workflows/ci.yml"><img src="https://github.com/stnjs/wen365/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/stnjs/wen365?color=blue" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="https://www.wen365.xyz/"><strong>Live demo →</strong></a>
</p>

<p align="center">
  <!-- TODO: record a 20-30s capture of the demo flow and drop it at docs/screenshots/dashboard.gif -->
  <img src="docs/screenshots/dashboard.gif" alt="Wen365 dashboard demo" width="820" />
</p>

> **No wallet?** The live demo has a one-click "Try the demo" button that loads the dashboard with deterministic fixture data — every chart and table is real, only the wallet is fake.

---

## What it does

- **SIWE wallet auth.** Sign-In with Ethereum (EIP-4361) via Reown AppKit + Wagmi + Viem. Server-side nonce, signature verification, and an encrypted session cookie.
- **Multi-chain portfolio.** Aggregates token balances and USD values across **Ethereum, Base, Arbitrum, Optimism, and Polygon** through the Alchemy API. Dust and known-spam tokens filtered out at the seam.
- **Daily snapshots.** A Vercel Cron writes one `portfolio_snapshots` row per Wallet per day to Supabase, which powers the value-over-time chart and 24-hour delta.
- **Holding-period tracking _(next)._** The original motivation: in Germany, crypto held more than a year is income-tax-free. The next milestone is a per-lot FIFO countdown that tells you exactly when each holding crosses the 1-year line.

## Why it exists

This is a personal project — my playground for trying new tools, AI coding workflows, and architectural ideas worth writing down. It is **not** a production financial service.

If you're a recruiter or reviewer, the things probably worth your time are:

- **The ADRs in [`docs/adr/`](./docs/adr/)** — short, dated records of the six architectural decisions that shape the codebase (CSR-only, TanStack Query for remote state, DTO contracts at the boundary, domain error taxonomy, repository pattern, and the shared Network registry).
- **[`CONTEXT.md`](./CONTEXT.md)** — the project's domain vocabulary. Code, commits, and conversations all use the same six nouns.
- **[`AGENTS.md`](./AGENTS.md)** — the entry point for AI coding agents (Cursor, Copilot, Claude Code). Doubles as a fast onboarding doc for a human.

## Tech stack

| Layer           | Technology                  | Why                                                            |
| --------------- | --------------------------- | -------------------------------------------------------------- |
| Framework       | Nuxt 4 + Vue 3              | Full-stack framework with file-based routing and auto-imports  |
| Language        | TypeScript (strict)         | End-to-end type safety; `any` needs a reason                   |
| UI              | Nuxt UI 4 + Tailwind CSS 4  | Design-token-driven components with first-class dark mode      |
| Auth            | SIWE + nuxt-auth-utils      | Decentralised wallet auth with encrypted server sessions       |
| Wallet          | Reown AppKit + Wagmi + Viem | Multi-wallet support (MetaMask, WalletConnect, Coinbase, …)    |
| Blockchain data | Alchemy API                 | Token balances, metadata, and prices across EVM chains         |
| Database        | Supabase (PostgreSQL)       | Wallet registry and daily portfolio snapshots                  |
| Validation      | Zod                         | Runtime schema validation at every API boundary                |
| Data fetching   | TanStack Vue Query          | Declarative async state management, caching, and request dedup |
| Visualisation   | Unovis                      | Portfolio value-over-time and allocation charts                |
| Testing         | Vitest + @nuxt/test-utils   | Unit and Nuxt-env test suites, run in parallel projects        |
| Deployment      | Vercel                      | Production hosting + Cron triggers                             |

## Architecture

```
app/                          Client (Nuxt 4 / Vue 3)
├── pages/                    Landing + dashboard routes (CSR-only, see ADR-0001)
├── components/               UI components (charts, tables, wallet)
├── composables/queries/      TanStack Query hooks (see ADR-0002)
├── config/                   Reown / Wagmi / SIWE configuration
├── layouts/                  Landing and dashboard shells
├── middleware/               Route-level auth guard
└── utils/                    Demo fixtures, formatters

server/                       Server (Nitro)
├── api/auth/                 SIWE: nonce, verify, session, signout
├── api/portfolio/            Live portfolio + snapshot history
├── api/cron/                 Daily snapshot job (Vercel Cron)
├── api/health.get.ts         Health probe (reads version from package.json)
├── repos/                    Repository pattern over Supabase (see ADR-0005)
├── services/                 Business logic (portfolio, snapshot)
├── mappers/                  Alchemy → DTO translation (see ADR-0003)
├── errors/                   Domain error taxonomy + HTTP edge (see ADR-0004)
└── utils/                    Validation, retry, structured logging

shared/                       Shared between client and server
├── config/networks.ts        Single source of truth for the 5 EVM chains (see ADR-0006)
└── types/                    DTOs auto-imported by Nuxt 4

docs/adr/                     Architecture Decision Records
test/
├── unit/                     Pure unit tests (Node env)
└── nuxt/                     Component & composable tests (Nuxt env)
```

### Authentication flow

1. Client requests a one-time nonce from `/api/auth/nonce`.
2. User signs an EIP-4361 message with their wallet via Reown AppKit.
3. Server verifies the signature against a public RPC.
4. An encrypted session cookie is issued, bound to the Wallet Address and chain.
5. Protected routes check that the path Address matches the Session Address — otherwise 403.

### Data pipeline

1. `GET /api/portfolio/:address` paginates Alchemy across the five active chains, deduplicates, enriches native-token metadata, drops sub-$0.50 dust, and returns a Zod-validated `PortfolioDto`.
2. `GET /api/cron/snapshot` runs once a day (Vercel Cron, `0 0 * * *`) and persists each Wallet's current `PortfolioDto` as a row in Supabase's `portfolio_snapshots`.
3. `GET /api/portfolio/:address/history?days=N` reads those rows back and returns the value-over-time series for the chart.
4. The client uses TanStack Query to cache, refetch, and dedupe — no Pinia store for remote data (ADR-0002).

## Running locally

### Prerequisites

- Node.js 18+
- pnpm 8+
- An EVM wallet (MetaMask, Rabby, …) — only needed if you want to test real wallet auth; the demo mode works without one.

### Setup

```bash
git clone https://github.com/stnjs/wen365.git
cd wen365
pnpm install
cp env.example .env
```

Fill in the required environment variables in `.env`:

| Variable                | Description                          | Where to get it                            |
| ----------------------- | ------------------------------------ | ------------------------------------------ |
| `REOWN_PROJECT_ID`      | Reown AppKit project ID              | [cloud.reown.com](https://cloud.reown.com) |
| `ALCHEMY_API_KEY`       | Alchemy API key                      | [alchemy.com](https://www.alchemy.com/)    |
| `SUPABASE_URL`          | Supabase project URL                 | [supabase.com](https://supabase.com/)      |
| `SUPABASE_KEY`          | Supabase anon key                    | Supabase dashboard                         |
| `SUPABASE_SECRET_KEY`   | Supabase service-role key            | Supabase dashboard                         |
| `NUXT_SESSION_PASSWORD` | Session encryption key (32+ chars)   | `openssl rand -hex 32`                     |
| `CRON_SECRET`           | CRON endpoint protection (16+ chars) | `openssl rand -hex 32`                     |

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
pnpm dev          # Dev server on :3000
pnpm build        # Production build
pnpm test         # All tests (unit + nuxt env)
pnpm test:unit    # Unit tests only
pnpm test:nuxt    # Nuxt-env tests only
pnpm lint         # ESLint
pnpm type-check   # vue-tsc strict check
pnpm format       # Prettier
```

## Testing

There are two Vitest projects, split by what they need:

- **`test/unit/`** — pure functions, services, repos, mappers, error helpers. Runs in plain Node, mocks at the seam (Alchemy, Supabase). Fast.
- **`test/nuxt/`** — composables and components that need Nuxt's auto-imports, `useState`, or component mounting. Runs in `@nuxt/test-utils` env.

CI runs `pnpm lint && pnpm type-check && pnpm test run` on every PR and push to `main`. See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## Deployment

Deployed to [www.wen365.xyz](https://www.wen365.xyz/) on Vercel. The Vercel Cron schedule lives in [`vercel.json`](./vercel.json) and triggers `/api/cron/snapshot` daily at 00:00 UTC.

## Roadmap

Next things I'd build, in rough order:

- **Holding-period tracker** — FIFO per Token, with a per-lot countdown to the tax-free threshold (e.g. Germany's 1-year rule). The feature that started this project.
- **Multi-Wallet aggregation** — track several Addresses under one Session.
- **NFT line in the Portfolio** — alongside fungible Tokens.
- **Push notifications** — opt-in alerts when a Portfolio crosses a threshold.

## License

[MIT](./LICENSE) — Copyright (c) 2026 stnjs.
