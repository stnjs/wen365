# app/ — Vue client (Nuxt 4, Nuxt UI 4, Tailwind CSS 4)

Guidance for everything under `app/`. Root rules in [`../AGENTS.md`](../AGENTS.md) still apply.

The app is client-only (`ssr: false`, [ADR-0001](../docs/adr/0001-client-side-rendering-only.md)). Don't add code that depends on server rendering.

## Data and state

- **Remote state goes through TanStack Query** ([ADR-0002](../docs/adr/0002-tanstack-query-for-remote-state.md)). Add a composable under `app/composables/queries/` that wraps `useQuery` / `useMutation` and owns the URL. No Pinia stores for data that lives in the query cache. See `usePortfolio.ts` for the shape.
- **Session** comes from `useUserSession` (`nuxt-auth-utils`), not a store.
- **Networks** come from `#shared/config/networks` ([ADR-0006](../docs/adr/0006-shared-network-registry.md)). Never hand-write a list of Networks, a Network count, or Network icons — derive them from `NETWORKS`.
- The client only sees DTOs from `shared/types/` ([ADR-0003](../docs/adr/0003-dto-contracts-at-client-server-boundary.md)).

## Components

**Use Nuxt UI first.** Check https://ui.nuxt.com/docs/components before building a custom button, card, table, modal, or form control. Custom components wrap or compose Nuxt UI; they don't replace it.

**Style with Tailwind utilities** and Nuxt UI's theme tokens. No inline `style=` when a utility exists. Theme variables live in `app/assets/css/main.css`. Every component must work in light and dark mode and at phone width.

**Props use a named interface:**

```typescript
// ✅
interface NetWorthCardProps {
  totalValue?: number;
  valueChange24h?: number;
}
const props = defineProps<NetWorthCardProps>();

// ❌ inline shape
const props = defineProps<{ totalValue?: number }>();
```

**Type `ref` and `computed` explicitly:** `ref<string>("")`, `computed<TokenDto[]>(() => …)`.

**`<script setup>` order:**

1. Imports
2. Props and emits
3. Template refs
4. Reactive state (`ref`)
5. Computed
6. Methods and event handlers
7. Configuration (e.g. table column definitions)
8. Lifecycle hooks

Prefer event handlers over `watch` where either works.

**Accessibility.** Use semantic elements, give icon-only buttons an `aria-label`, and keep Nuxt UI's built-in ARIA intact. Tests query by role and accessible name, so this is load-bearing (see [`../test/AGENTS.md`](../test/AGENTS.md)).

**No `v-html`** with anything derived from Token metadata or other upstream data — token names and symbols are attacker-controlled. ESLint warns on `v-html`; treat the warning as an error.

## Reference files

- `app/components/portfolio/NetWorthCard.vue` — named props interface, typed computed
- `app/composables/queries/usePortfolio.ts` — query composable
- `app/components/portfolio/AssetsTable/config.ts` — deriving from the Network registry
