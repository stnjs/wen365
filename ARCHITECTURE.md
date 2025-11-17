# Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Data Flow](#data-flow)
6. [Component Architecture](#component-architecture)
7. [Server Architecture](#server-architecture)
8. [State Management](#state-management)
9. [Styling Architecture](#styling-architecture)
10. [API Design](#api-design)
11. [Type System](#type-system)
12. [Key Design Decisions](#key-design-decisions)

---

## Overview

Wen365 is a modern crypto portfolio tracking application built with **Nuxt 4** and **Vue 3**. The application follows a **layered architecture** with clear separation of concerns between the client-side application, server-side API, and shared types.

### Core Features

- **Multi-chain Portfolio Tracking**: Track crypto assets across multiple blockchains (Ethereum, Polygon, etc.)
- **Wallet Integration**: Connect wallets via Reown AppKit (formerly WalletConnect)
- **Real-time Data**: Fetch portfolio data from Alchemy API
- **Modern UI**: Built with Nuxt UI 4 components and Tailwind CSS

### Architecture Principles

- **Separation of Concerns**: Clear boundaries between API handlers, services, mappers, and utilities
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Component-scoped Styling**: Styles are co-located with components where possible
- **DTO Pattern**: Data Transfer Objects for API contracts
- **Pure Functions**: Mappers and utilities are pure transformation functions

---

## Tech Stack

### Frontend

| Technology             | Version | Purpose                          |
| ---------------------- | ------- | -------------------------------- |
| **Nuxt**               | 4.1.2   | Full-stack Vue framework         |
| **Vue**                | 3.x     | Progressive JavaScript framework |
| **TypeScript**         | 5.8.3   | Type-safe JavaScript             |
| **Nuxt UI**            | 4.1.0   | Component library                |
| **Tailwind CSS**       | 4.1.13  | Utility-first CSS framework      |
| **TanStack Vue Query** | 5.90.7  | Data fetching and caching        |
| **Pinia**              | Latest  | State management                 |

### Web3 / Blockchain

| Technology       | Version | Purpose                     |
| ---------------- | ------- | --------------------------- |
| **Reown AppKit** | 1.8.13  | Wallet connection UI        |
| **Wagmi**        | 2.19.2  | React Hooks for Ethereum    |
| **Viem**         | 2.38.6  | TypeScript Ethereum library |

### Backend / API

| Technology      | Purpose                  |
| --------------- | ------------------------ |
| **Nitro**       | Nuxt's server engine     |
| **Alchemy API** | Blockchain data provider |
| **Axios**       | HTTP client              |

### Development Tools

| Technology   | Purpose         |
| ------------ | --------------- |
| **ESLint**   | Code linting    |
| **Prettier** | Code formatting |
| **Vue TSC**  | Type checking   |
| **pnpm**     | Package manager |

---

## Project Structure

```
wen365/
├── app/                          # Client-side application
│   ├── assets/                   # Static assets
│   │   ├── css/
│   │   │   └── main.css          # Global styles, theme variables
│   │   └── images/               # Image assets
│   ├── components/               # Vue components
│   │   ├── ConnectWalletButton.vue
│   │   └── portfolio/
│   │       └── AssetsTable/
│   ├── composables/              # Reusable composition functions
│   │   └── queries/
│   │       └── usePortfolio.ts   # TanStack Query composable
│   ├── config/                   # Configuration files
│   │   └── wagmi.ts              # Wagmi/Wagmi adapter config
│   ├── layouts/                  # Layout components
│   │   └── landingPage.vue
│   ├── pages/                    # File-based routing
│   │   ├── index.vue             # Landing page
│   │   └── portfolio.vue         # Portfolio page
│   ├── plugins/                  # Nuxt plugins
│   │   ├── 01.vue-query.ts       # TanStack Query setup
│   │   └── 02.wagmi.ts           # Wagmi setup
│   ├── stores/                   # Pinia stores
│   │   ├── portfolio.ts
│   │   └── wallet.ts
│   ├── app.config.ts             # Nuxt UI config
│   └── app.vue                   # Root component
│
├── server/                        # Server-side code
│   ├── api/                      # API route handlers
│   │   ├── health.get.ts
│   │   └── portfolio/
│   │       └── [walletAddress].get.ts
│   ├── constants/                # Server constants
│   │   ├── blacklistedTokens.ts
│   │   ├── nativeTokens.ts
│   │   └── networks.ts
│   ├── mappers/                  # Data transformation layer
│   │   └── portfolio.mapper.ts
│   ├── services/                 # Business logic layer
│   │   └── portfolio.service.ts
│   ├── types/                    # Server-only types
│   │   ├── alchemy.ts
│   │   └── index.ts
│   └── utils/                   # Utility functions
│       ├── blockchainUtils.ts
│       └── formatterUtils.ts
│
├── shared/                       # Shared code (client + server)
│   └── types/                    # Shared TypeScript types
│       ├── NetworkId.ts
│       ├── PortfolioDto.ts
│       ├── TokenDto.ts
│       └── TokenMetadataDto.ts
│
├── nuxt.config.ts                # Nuxt configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## Architecture Patterns

### 1. Layered Architecture

The application follows a **layered architecture** pattern with clear separation:

```
┌─────────────────────────────────────┐
│         Client Layer                │
│  (Pages, Components, Composables)   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         API Layer                   │
│  (Route Handlers - HTTP concerns)   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Service Layer               │
│  (Business Logic, Orchestration)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Mapper Layer                │
│  (Pure Data Transformation)         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Utility Layer               │
│  (Pure Helper Functions)            │
└─────────────────────────────────────┘
```

### 2. DTO Pattern

**Data Transfer Objects (DTOs)** are used for API contracts:

- **Shared DTOs** (`shared/types/`): Types shared between client and server
  - `PortfolioDto`: Portfolio response structure
  - `TokenDto`: Token data structure
  - `TokenMetadataDto`: Token metadata structure

- **Internal Types** (`server/types/`): Server-only types
  - `AlchemyToken`: Alchemy API response structure
  - `AlchemyTokensByAddressResponse`: Alchemy API response wrapper

### 3. Service Layer Pattern

Business logic is encapsulated in **service functions**:

- **Orchestration**: Coordinates data fetching, transformation, and calculations
- **Business Rules**: Filtering, sorting, calculations
- **External API Calls**: Handles communication with third-party APIs (Alchemy)

Example: `portfolio.service.ts` orchestrates:

1. Fetching data from Alchemy API
2. Enriching native token metadata
3. Transforming to DTOs
4. Filtering and sorting tokens
5. Calculating total portfolio value

### 4. Mapper Pattern

**Mappers** are pure transformation functions:

- **No side effects**: Pure functions that transform data
- **No business logic**: Only data structure transformation
- **Reusable**: Can be tested independently

Example: `portfolio.mapper.ts` transforms `AlchemyToken` → `TokenDto`

### 5. Component-scoped Styling

Styles are **co-located** with components:

- **Global styles**: Theme variables, base styles in `main.css`
- **Component styles**: Component-specific styles in `<style scoped>` blocks
- **CSS Variables**: Global variables in `:root`, component variables on container elements

---

## Data Flow

### Portfolio Data Flow

```
┌──────────────┐
│   User       │
│  (Wallet)    │
└──────┬───────┘
       │
       ↓
┌─────────────────────────┐
│  portfolio.vue          │
│  - useAppKitAccount()   │
│  - usePortfolio()       │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  usePortfolio composable│
│  (TanStack Query)       │
└──────┬──────────────────┘
       │
       ↓ HTTP GET
┌─────────────────────────┐
│  /api/portfolio/        │
│  [walletAddress].get.ts │
│  (API Handler)          │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  portfolio.service.ts   │
│  getPortfolio()         │
└──────┬──────────────────┘
       │
       ├─→ getAlchemyTokensByAddress()
       │   (External API Call)
       │
       ├─→ enrichNativeTokenMetadata()
       │   (Business Logic)
       │
       ├─→ mapToTokenDto()
       │   (Mapper)
       │
       ├─→ Filter & Sort
       │   (Business Logic)
       │
       └─→ mapToPortfolioDto()
           (Mapper)
       │
       ↓
┌─────────────────────────┐
│  PortfolioDto           │
│  (Response)             │
└─────────────────────────┘
```

### Wallet Connection Flow

```
┌──────────────┐
│   User       │
│  (Browser)   │
└──────┬───────┘
       │
       ↓
┌─────────────────────────┐
│  ConnectWalletButton    │
│  - useAppKit()          │
│  - useAppKitAccount()   │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Reown AppKit           │
│  (Wallet Modal)         │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Wallet Provider        │
│  (MetaMask, etc.)       │
└─────────────────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
app.vue (Root)
└── NuxtLayout (landingPage)
    ├── UHeader
    │   ├── Logo
    │   ├── ConnectWalletButton
    │   └── UColorModeButton
    │
    ├── NuxtPage
    │   ├── index.vue (Landing Page)
    │   │   ├── Animated Background
    │   │   └── ConnectWalletButton
    │   │
    │   └── portfolio.vue
    │       ├── Portfolio Summary Cards
    │       └── AssetsTable
    │           └── Token (rows)
    │
    └── UFooter
```

### Component Patterns

#### 1. Presentational Components

Components that focus on UI presentation:

- `ConnectWalletButton.vue`: Reusable wallet connection button
- `AssetsTable.vue`: Table display component
- `Token.vue`: Token row component

#### 2. Page Components

Components that handle data fetching and orchestration:

- `index.vue`: Landing page with wallet connection flow
- `portfolio.vue`: Portfolio page with data fetching

#### 3. Layout Components

Components that provide page structure:

- `landingPage.vue`: Layout for landing page with transparent header

---

## Server Architecture

### API Layer (`server/api/`)

**Thin API handlers** that handle HTTP concerns:

- **Route parameters**: Extract from URL
- **Request validation**: Validate input
- **Error handling**: HTTP error responses
- **Service delegation**: Call service layer functions

Example: `[walletAddress].get.ts`

```typescript
export default defineEventHandler(async (event): Promise<PortfolioDto> => {
  const walletAddress = getRouterParam(event, "walletAddress");
  // Validation
  // Service call
  // Error handling
});
```

### Service Layer (`server/services/`)

**Business logic orchestration**:

- **External API calls**: Alchemy API integration
- **Data enrichment**: Add metadata, enrich native tokens
- **Business rules**: Filtering, sorting, calculations
- **Orchestration**: Coordinate multiple operations

Example: `portfolio.service.ts`

- Fetches from Alchemy
- Enriches native token metadata
- Transforms data
- Filters and sorts
- Calculates totals

### Mapper Layer (`server/mappers/`)

**Pure data transformation**:

- **Input**: Alchemy API types
- **Output**: DTOs
- **No side effects**: Pure functions
- **No business logic**: Only transformation

Example: `portfolio.mapper.ts`

- `mapToTokenDto()`: `AlchemyToken` → `TokenDto`
- `mapToPortfolioDto()`: Data → `PortfolioDto`

### Utility Layer (`server/utils/`)

**Pure helper functions**:

- **Blockchain utilities**: Balance conversion, value calculations
- **Formatter utilities**: Number formatting, rounding

Example: `blockchainUtils.ts`

- `convertTokenBalanceToNumber()`: Hex to decimal
- `calculateTokenUsdValue()`: Balance × price

### Constants (`server/constants/`)

**Configuration and constants**:

- `networks.ts`: Supported blockchain networks
- `nativeTokens.ts`: Native token metadata
- `blacklistedTokens.ts`: Tokens to exclude

---

## State Management

### TanStack Vue Query

**Primary state management for remote data**:

- **Caching**: Automatic caching of API responses
- **Refetching**: Automatic refetching on window focus
- **Loading states**: Built-in loading and error states
- **Query invalidation**: Manual cache invalidation

Usage: `usePortfolio()` composable wraps TanStack Query

```typescript
const { data, isLoading, refetch } = usePortfolio(address);
```

### Pinia Stores

**Local/UI state management**:

- `wallet.ts`: Wallet connection state (minimal, mostly handled by AppKit)
- `portfolio.ts`: Portfolio state (if needed for UI state)

**Note**: Remote data primarily lives in TanStack Query cache, not Pinia.

### Reown AppKit

**Wallet state management**:

- `useAppKitAccount()`: Wallet account data
- `useAppKit()`: Wallet connection methods
- Handles wallet connection state internally

---

## Styling Architecture

### Global Styles (`app/assets/css/main.css`)

**Global configuration**:

- **CSS Variables**: Theme colors, coin animation variables
- **Base Styles**: HTML, body styles
- **Global Animations**: Reusable animations (e.g., `animate-gradient`)

### Component-scoped Styles

**Component-specific styles**:

- **Location**: `<style scoped>` blocks in components
- **Scope**: Styles are scoped to component
- **CSS Variables**: Can define local variables on container elements

Example: `index.vue` has scoped styles for crypto coin animations

### Tailwind CSS

**Utility-first styling**:

- **Primary styling method**: Most styles use Tailwind utilities
- **Custom utilities**: Extended via `@layer utilities`
- **Theme integration**: Uses Nuxt UI theme system

### Nuxt UI

**Component library**:

- **Pre-built components**: `UButton`, `UCard`, `UHeader`, etc.
- **Theme system**: Integrated with Tailwind
- **Dark mode**: Built-in color mode support

---

## API Design

### RESTful API Design

**File-based routing** in Nuxt:

```
server/api/
├── health.get.ts              → GET /api/health
└── portfolio/
    └── [walletAddress].get.ts → GET /api/portfolio/:walletAddress
```

### Response Format

**Consistent DTO structure**:

```typescript
interface PortfolioDto {
  totalValue: number;
  totalValueChange24h: number;
  totalValueChangePercent24h: number;
  tokens: TokenDto[];
}
```

### Error Handling

**Standardized error responses**:

```typescript
throw createError({
  statusCode: 400,
  statusMessage: "Wallet address is required",
});
```

---

## Type System

### Type Organization

#### Shared Types (`shared/types/`)

**Types used by both client and server**:

- `PortfolioDto`: API response structure
- `TokenDto`: Token data structure
- `TokenMetadataDto`: Token metadata
- `NetworkId`: Network identifier type

#### Server Types (`server/types/`)

**Server-only types**:

- `AlchemyToken`: Alchemy API response structure
- `AlchemyTokensByAddressResponse`: Alchemy API wrapper

### Type Safety

- **Strict TypeScript**: `strict: true` in `tsconfig.json`
- **Type checking**: `typeCheck: true` in Nuxt config
- **Auto-imports**: Shared types are auto-imported (no explicit imports needed)

---

## Key Design Decisions

### 1. SSR Disabled

**Decision**: `ssr: false` in `nuxt.config.ts`

**Rationale**:

- Client-side only application
- Wallet connection requires browser APIs
- Simpler deployment

### 2. TanStack Query for Data Fetching

**Decision**: Use TanStack Query instead of Pinia for remote data

**Rationale**:

- Built-in caching and refetching
- Better loading/error state management
- Automatic cache invalidation
- Industry standard for data fetching

### 3. Service Layer Pattern

**Decision**: Separate service layer from API handlers

**Rationale**:

- Clear separation of HTTP concerns vs. business logic
- Easier testing
- Reusability
- Better organization

### 4. DTO Pattern

**Decision**: Use DTOs for API contracts

**Rationale**:

- Clear API contracts
- Separation of internal and external types
- Type safety across client/server boundary
- Easier API versioning

### 5. Component-scoped Styling

**Decision**: Co-locate styles with components

**Rationale**:

- Better maintainability
- Styles are scoped to component
- Easier to understand component styling
- Follows Vue best practices

### 6. Mapper Pattern

**Decision**: Separate mappers from services

**Rationale**:

- Pure transformation functions
- Easier to test
- Reusable
- Clear separation of concerns

---

## Future Considerations

### Potential Improvements

1. **Error Boundaries**: Add error boundary components
2. **Loading States**: Improve loading state UX
3. **Caching Strategy**: Fine-tune TanStack Query cache settings
4. **API Versioning**: Add API versioning if needed
5. **Testing**: Add unit and integration tests
6. **Documentation**: Add JSDoc comments to functions
7. **Performance**: Add performance monitoring
8. **Accessibility**: Improve a11y compliance

---

## References

- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Nuxt UI Documentation](https://ui.nuxt.com)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Reown AppKit Documentation](https://docs.reown.com)
- [Vue 3 Documentation](https://vuejs.org)
