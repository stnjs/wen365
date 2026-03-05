# Wen365 — Crypto Portfolio Tracker

A full-stack crypto portfolio tracker built with **Nuxt 4**. Connect your wallet via Sign-In with Ethereum (SIWE), view token balances across EVM chains, and track portfolio value over time with daily snapshots.

This is a personal project built to demonstrate modern full-stack web development with blockchain integration. It is **not** a production financial service.

## Key Features

- **SIWE Authentication** — Wallet-based auth using EIP-4361 with nonce generation, signature verification, and encrypted sessions
- **Multi-Chain Portfolio** — Aggregates token balances and USD values across Ethereum, Polygon, Base, Arbitrum, Optimism, and more via the Alchemy API
- **Historical Snapshots** — CRON-driven daily snapshots stored in Supabase, powering portfolio performance charts over configurable time ranges

## Architecture

```
app/                          # Client (Nuxt 4 / Vue 3)
├── pages/                    # Route views (landing, dashboard)
├── components/               # UI components (charts, tables, wallet)
├── composables/queries/      # TanStack Query hooks for data fetching
├── config/                   # SIWE and AppKit configuration
├── layouts/                  # Landing page and dashboard layouts
└── middleware/               # Route auth guard

server/                       # Server (Nitro)
├── api/auth/                 # SIWE nonce, verify, session, signout
├── api/portfolio/            # Portfolio data and history endpoints
├── api/cron/                 # Automated snapshot endpoint
├── services/                 # Business logic (portfolio, wallet, snapshot)
└── utils/                    # Validation, error handling, retry, logging

shared/types/                 # Shared DTOs (auto-imported by Nuxt 4)

test/                         # Vitest test suites
├── unit/                     # Utils, services, mappers
└── nuxt/                     # Composables and API integration tests
```

### Authentication Flow

1. Client requests a nonce from `/api/auth/nonce`
2. User signs a SIWE message with their wallet (via Reown AppKit)
3. Server verifies the signature against a public RPC endpoint
4. Session is created with the wallet address and chain ID
5. Protected routes validate session ownership before returning data

### Data Pipeline

1. `/api/portfolio/[address]` fetches live token data from Alchemy
2. `/api/cron/snapshot` runs daily to persist portfolio state to Supabase
3. `/api/portfolio/[address]/history` returns snapshots for chart rendering
4. Client uses TanStack Query for caching, refetching, and loading states

## Tech Stack

| Layer           | Technology                  | Why                                                                   |
| --------------- | --------------------------- | --------------------------------------------------------------------- |
| Framework       | Nuxt 4 + Vue 3              | Full-stack SSR/SPA framework with file-based routing and auto-imports |
| Language        | TypeScript (strict)         | End-to-end type safety across client and server                       |
| UI              | Nuxt UI 4 + Tailwind CSS 4  | Component library with dark mode and design tokens                    |
| Auth            | SIWE + nuxt-auth-utils      | Decentralized wallet auth with encrypted server sessions              |
| Wallet          | Reown AppKit + Wagmi + Viem | Multi-wallet support (MetaMask, WalletConnect, Coinbase, etc.)        |
| Blockchain Data | Alchemy API                 | Token balances, metadata, and prices across EVM chains                |
| Database        | Supabase (PostgreSQL)       | Portfolio snapshots and wallet registry                               |
| Validation      | Zod                         | Runtime schema validation for all API boundaries                      |
| Data Fetching   | TanStack Vue Query          | Declarative async state management with caching                       |
| Visualization   | Unovis                      | Portfolio and allocation charts                                       |
| Testing         | Vitest + @nuxt/test-utils   | Unit and integration test suites                                      |

## Running Locally

### Prerequisites

- Node.js 18+
- pnpm 8+
- An Ethereum wallet (MetaMask, etc.)

### Setup

```bash
git clone https://github.com/stnjs/wen365.git
cd wen365
pnpm install
cp env.example .env
```

Fill in the required environment variables in `.env`:

| Variable                | Description                          | Where to Get It                            |
| ----------------------- | ------------------------------------ | ------------------------------------------ |
| `REOWN_PROJECT_ID`      | Reown AppKit project ID              | [cloud.reown.com](https://cloud.reown.com) |
| `ALCHEMY_API_KEY`       | Alchemy API key                      | [alchemy.com](https://www.alchemy.com/)    |
| `SUPABASE_URL`          | Supabase project URL                 | [supabase.com](https://supabase.com/)      |
| `SUPABASE_KEY`          | Supabase anon key                    | Supabase dashboard                         |
| `SUPABASE_SECRET_KEY`   | Supabase service role key            | Supabase dashboard                         |
| `NUXT_SESSION_PASSWORD` | Session encryption key (32+ chars)   | Generate any random string                 |
| `CRON_SECRET`           | CRON endpoint protection (16+ chars) | Generate any random string                 |

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only
pnpm lint             # Lint with ESLint
pnpm type-check       # TypeScript type checking
pnpm format           # Format with Prettier
```

## Roadmap

Features under consideration for future development:

- Multi-wallet aggregation (track multiple addresses)
- NFT tracking alongside token portfolio
- Holding period tracking with FIFO logic for tax awareness
- Asset flow visualization (Sankey diagrams)
- Push notifications for portfolio milestones

## License

MIT
