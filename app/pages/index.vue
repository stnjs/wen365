<template>
  <NuxtLayout name="landing-page">
    <!-- Hero Section -->
    <section class="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-default bg-white/5 backdrop-blur-sm mb-8 animate-fade-up"
          :style="{ animationDelay: '0ms' }"
        >
          <UIcon name="i-lucide-code-2" class="w-3.5 h-3.5 text-default" />
          <span class="text-xs text-default font-medium tracking-wide uppercase"
            >Open-Source Demo</span
          >
        </div>

        <h1
          class="text-5xl md:text-7xl font-medium text-default tracking-tighter mb-6 leading-[1.1] animate-fade-up"
          :style="{ animationDelay: '100ms' }"
        >
          Portfolio clarity.<br />
          <span class="text-dimmed">Multi-chain tracking.</span>
        </h1>

        <p
          class="text-lg md:text-xl text-muted max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up"
          :style="{ animationDelay: '200ms' }"
        >
          A full-stack crypto portfolio tracker with SIWE authentication, multi-chain aggregation,
          and historical snapshots. Built with Nuxt 4.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          :style="{ animationDelay: '300ms' }"
        >
          <ConnectWalletButton
            v-if="!isConnected"
            class="transition-all sm:w-auto"
            label="Connect Wallet"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
          />
          <UButton
            v-else
            to="/dashboard"
            class="rounded-full transition-all sm:w-auto"
            color="neutral"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
          >
            Go to Dashboard
          </UButton>
          <UButton
            v-if="!isConnected"
            class="rounded-full transition-all sm:w-auto"
            color="primary"
            size="lg"
            leading-icon="i-lucide-flask-conical"
            @click="handleViewDemo"
          >
            Explore Demo
          </UButton>
        </div>
      </div>
      <DashboardPreview />
    </section>

    <!-- Features Bento Grid -->
    <section id="features" class="py-24 px-6 max-w-7xl mx-auto">
      <div class="mb-16">
        <h2 class="text-3xl md:text-4xl font-medium text-default tracking-tight mb-4">
          What's implemented.
        </h2>
        <p class="text-muted text-lg max-w-2xl">
          Track token balances across EVM chains, visualize portfolio performance over time, and
          authenticate securely with your wallet.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1: Multi-Chain Portfolio -->
        <div
          class="md:col-span-2 p-8 rounded-3xl border border-default bg-app-card-light hover:bg-zinc-900/40 transition-colors group overflow-hidden relative"
        >
          <div
            class="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <UIcon name="i-lucide-globe" class="w-64 h-64 text-default stroke-1" />
          </div>
          <div class="relative z-10">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-default border border-default"
            >
              <UIcon name="i-lucide-wallet" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-medium text-default mb-2">Multi-Chain Portfolio</h3>
            <p class="text-muted text-sm leading-relaxed max-w-md">
              Aggregates token balances and USD values across 10 EVM networks via the Alchemy API.
              Paginated fetching, native token enrichment, and deduplication built in.
            </p>
            <div class="mt-8 flex flex-wrap gap-2">
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >ETH</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >MATIC</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >BASE</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >ARB</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >OPT</span
              >
              <span
                class="px-2 py-1 text-[10px] uppercase tracking-wide border border-default rounded bg-app-overlay text-muted"
                >+5 more</span
              >
            </div>
          </div>
        </div>

        <!-- Card 2: SIWE Authentication -->
        <div
          class="md:col-span-1 p-8 rounded-3xl border border-default bg-app-card-light hover:bg-zinc-900/40 transition-colors relative group overflow-hidden"
        >
          <div
            class="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/30 transition-all"
          />
          <div class="relative z-10 h-full flex flex-col">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-default border border-default"
            >
              <UIcon name="i-lucide-shield-check" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-medium text-default mb-2">SIWE Authentication</h3>
            <p class="text-muted text-sm leading-relaxed mb-6">
              Wallet-based auth using EIP-4361. Nonce generation, signature verification via viem,
              and encrypted server sessions.
            </p>

            <!-- Mini auth flow visual -->
            <div class="mt-auto space-y-2">
              <div
                v-for="(step, i) in ['Nonce generated', 'Message signed', 'Signature verified', 'Session created']"
                :key="i"
                class="flex items-center gap-2 text-[11px]"
              >
                <div
                  class="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[9px] font-medium flex-shrink-0"
                >
                  {{ i + 1 }}
                </div>
                <span class="text-muted">{{ step }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 3: Historical Snapshots -->
        <div
          class="md:col-span-1 p-8 rounded-3xl border border-default bg-app-card-light hover:bg-zinc-900/40 transition-colors group"
        >
          <div
            class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-default border border-default"
          >
            <UIcon name="i-lucide-database" class="w-5 h-5" />
          </div>
          <h3 class="text-xl font-medium text-default mb-2">Historical Snapshots</h3>
          <p class="text-muted text-sm leading-relaxed mb-6">
            CRON-driven daily snapshots stored in Supabase. Powers portfolio performance charts over
            1W, 1M, 3M, and 1Y time ranges.
          </p>

          <!-- Mini time range visual -->
          <div class="flex gap-1">
            <span
              v-for="range in ['1W', '1M', '3M', '1Y']"
              :key="range"
              class="px-2 py-1 text-[10px] font-medium rounded border border-default text-muted"
              :class="range === '1M' ? 'bg-white/10 text-default' : 'bg-app-overlay'"
            >
              {{ range }}
            </span>
          </div>
        </div>

        <!-- Card 4: Portfolio Analytics -->
        <div
          class="md:col-span-2 p-8 rounded-3xl border border-default bg-app-card-light hover:bg-zinc-900/40 transition-colors flex flex-col md:flex-row items-center gap-8 overflow-hidden"
        >
          <div class="flex-1">
            <div
              class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-default border border-default"
            >
              <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-medium text-default mb-2">Portfolio Analytics</h3>
            <p class="text-muted text-sm leading-relaxed max-w-sm">
              Interactive area charts with crosshair tooltips (Unovis), asset allocation donut, and a
              searchable, sortable token table with chain indicators and pagination.
            </p>
          </div>
          <div class="w-full md:w-1/2">
            <!-- Mini chart visual -->
            <div class="bg-black border border-zinc-800 rounded-xl p-4 shadow-2xl">
              <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] text-dimmed uppercase tracking-wider">Net Worth</span>
                <span class="text-xs text-emerald-400 font-medium">+2.4%</span>
              </div>
              <svg class="w-full h-16" preserveAspectRatio="none" viewBox="0 0 200 60">
                <defs>
                  <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(16, 185, 129, 0.15)" />
                    <stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,45 C30,42 60,50 90,35 C120,20 150,25 200,10 V60 H0 Z"
                  fill="url(#miniGrad)"
                />
                <path
                  d="M0,45 C30,42 60,50 90,35 C120,20 150,25 200,10"
                  fill="none"
                  stroke="#10b981"
                  stroke-width="1.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Roadmap Section -->
    <section class="py-16 px-6 max-w-7xl mx-auto">
      <div class="mb-10">
        <h2 class="text-2xl md:text-3xl font-medium text-default tracking-tight mb-3">
          What's next.
        </h2>
        <p class="text-muted text-sm max-w-2xl">
          Planned features under consideration for future development.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="item in roadmapItems"
          :key="item.title"
          class="p-5 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors"
        >
          <div
            class="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center mb-4 text-dimmed border border-zinc-700"
          >
            <UIcon :name="item.icon" class="w-4 h-4" />
          </div>
          <h3 class="text-sm font-medium text-muted mb-1">{{ item.title }}</h3>
          <p class="text-dimmed text-xs leading-relaxed">{{ item.description }}</p>
        </div>
      </div>
    </section>

    <!-- How It's Built -->
    <section id="architecture" class="py-24 px-6 max-w-7xl mx-auto">
      <div class="mb-16">
        <h2 class="text-3xl md:text-4xl font-medium text-default tracking-tight mb-4">
          How it's built.
        </h2>
        <p class="text-muted text-lg max-w-2xl">
          A look at the two core data flows that power the application.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Authentication Flow -->
        <div class="p-6 rounded-2xl border border-default bg-app-card-light">
          <div class="flex items-center gap-2 mb-6">
            <UIcon name="i-lucide-shield-check" class="w-4 h-4 text-emerald-400" />
            <h3 class="text-sm font-medium text-default uppercase tracking-wider">
              Authentication Flow
            </h3>
          </div>
          <div class="space-y-4">
            <div
              v-for="(step, i) in authSteps"
              :key="i"
              class="flex items-start gap-3"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-medium flex-shrink-0"
                >
                  {{ i + 1 }}
                </div>
                <div
                  v-if="i < authSteps.length - 1"
                  class="w-px h-6 bg-zinc-700 mt-1"
                />
              </div>
              <div class="pt-1">
                <p class="text-sm text-default font-medium">{{ step.title }}</p>
                <p class="text-xs text-dimmed mt-0.5">{{ step.detail }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Pipeline -->
        <div class="p-6 rounded-2xl border border-default bg-app-card-light">
          <div class="flex items-center gap-2 mb-6">
            <UIcon name="i-lucide-database" class="w-4 h-4 text-blue-400" />
            <h3 class="text-sm font-medium text-default uppercase tracking-wider">
              Data Pipeline
            </h3>
          </div>
          <div class="space-y-4">
            <div
              v-for="(step, i) in pipelineSteps"
              :key="i"
              class="flex items-start gap-3"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-medium flex-shrink-0"
                >
                  {{ i + 1 }}
                </div>
                <div
                  v-if="i < pipelineSteps.length - 1"
                  class="w-px h-6 bg-zinc-700 mt-1"
                />
              </div>
              <div class="pt-1">
                <p class="text-sm text-default font-medium">{{ step.title }}</p>
                <p class="text-xs text-dimmed mt-0.5">{{ step.detail }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical highlight badges -->
      <div class="flex flex-wrap gap-3 justify-center">
        <span
          v-for="badge in techBadges"
          :key="badge"
          class="px-4 py-2 text-xs font-medium text-muted border border-default rounded-full bg-app-overlay"
        >
          {{ badge }}
        </span>
      </div>
    </section>

    <!-- Tech Stack -->
    <section id="tech" class="py-16 border-y border-default bg-app-overlay">
      <div class="max-w-6xl mx-auto px-6">
        <p class="text-xs font-medium text-dimmed uppercase tracking-widest mb-10 text-center">
          Tech Stack
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          <div
            v-for="group in stackGroups"
            :key="group.label"
          >
            <p class="text-[10px] uppercase tracking-widest text-dimmed font-medium mb-3">
              {{ group.label }}
            </p>
            <div class="space-y-2">
              <div
                v-for="item in group.items"
                :key="item.name"
                class="flex items-center gap-2"
              >
                <UIcon :name="item.icon" class="w-4 h-4 text-muted" />
                <span class="text-sm text-default">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32 px-6 text-center relative overflow-hidden">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-150 bg-white/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div class="relative z-10 max-w-2xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-medium text-default tracking-tighter mb-6">
          Explore the source code.
        </h2>
        <p class="text-muted text-lg mb-4">
          This project is open-source. Dive into the codebase to see how SIWE authentication,
          multi-chain portfolio aggregation, and historical snapshots are implemented.
        </p>
        <p class="text-dimmed text-sm mb-10">
          Built as a full-stack portfolio project demonstrating blockchain integration, production
          architecture, and modern web development practices.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <UButton
            to="https://github.com/mtp721/wen365"
            target="_blank"
            class="rounded-full transition-all"
            color="neutral"
            size="lg"
            leading-icon="i-lucide-github"
          >
            View on GitHub
          </UButton>
          <UButton
            v-if="!isConnected"
            class="rounded-full transition-all"
            color="primary"
            size="lg"
            leading-icon="i-lucide-flask-conical"
            @click="handleViewDemo"
          >
            Explore Demo
          </UButton>
          <UButton
            v-else
            to="/dashboard"
            class="rounded-full transition-all"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
          >
            Go to Dashboard
          </UButton>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAppKitAccount } from "@reown/appkit/vue";
import DashboardPreview from "~/components/landingPage/DashboardPreview.vue";

const router = useRouter();
const accountData = useAppKitAccount();
const { enableDemo } = useDemoMode();

const isConnected = computed<boolean>(() => accountData.value?.isConnected || false);

const roadmapItems = [
  {
    icon: "i-lucide-users",
    title: "Multi-Wallet Aggregation",
    description: "Track multiple addresses and aggregate portfolio data across wallets.",
  },
  {
    icon: "i-lucide-piggy-bank",
    title: "Tax Optimization Engine",
    description: "FIFO-based holding period tracking for long-term capital gains awareness.",
  },
  {
    icon: "i-lucide-workflow",
    title: "Asset Flow Visualization",
    description: "Sankey diagrams tracing liquidity movement from on-ramps to DeFi protocols.",
  },
  {
    icon: "i-lucide-bell-ring",
    title: "Maturity Notifications",
    description: "Alerts when positions qualify for long-term tax rates.",
  },
];

const authSteps = [
  { title: "Nonce requested", detail: "Client fetches a one-time nonce from /api/auth/nonce" },
  { title: "SIWE message signed", detail: "User signs an EIP-4361 message via Reown AppKit" },
  { title: "Signature verified", detail: "Server validates signature with viem against a public RPC" },
  { title: "Session created", detail: "Encrypted session stored with wallet address and chain ID" },
];

const pipelineSteps = [
  { title: "Alchemy API", detail: "Paginated token fetches across 10 EVM networks with retry" },
  { title: "Portfolio endpoint", detail: "Zod-validated response with dedup, filtering, and enrichment" },
  { title: "CRON snapshot", detail: "Daily Vercel CRON persists portfolio state to Supabase" },
  { title: "History & charts", detail: "TanStack Query fetches snapshots, Unovis renders the chart" },
];

const stackGroups = [
  {
    label: "Frontend",
    items: [
      { icon: "i-lucide-layers", name: "Nuxt 4" },
      { icon: "i-lucide-component", name: "Vue 3" },
      { icon: "i-lucide-code-2", name: "TypeScript" },
      { icon: "i-lucide-layout-template", name: "Nuxt UI 4" },
      { icon: "i-lucide-paintbrush", name: "Tailwind CSS 4" },
    ],
  },
  {
    label: "Data",
    items: [
      { icon: "i-lucide-refresh-cw", name: "TanStack Query" },
      { icon: "i-lucide-bar-chart-3", name: "Unovis Charts" },
      { icon: "i-lucide-table-2", name: "TanStack Table" },
    ],
  },
  {
    label: "Auth",
    items: [
      { icon: "i-lucide-shield-check", name: "SIWE (EIP-4361)" },
      { icon: "i-lucide-wallet", name: "Reown AppKit" },
      { icon: "i-lucide-link", name: "Wagmi / Viem" },
    ],
  },
  {
    label: "Backend",
    items: [
      { icon: "i-lucide-server", name: "Nitro" },
      { icon: "i-lucide-database", name: "Supabase" },
      { icon: "i-lucide-globe", name: "Alchemy API" },
    ],
  },
  {
    label: "Quality",
    items: [
      { icon: "i-lucide-shield", name: "Zod" },
      { icon: "i-lucide-test-tubes", name: "Vitest" },
      { icon: "i-lucide-check-circle", name: "ESLint" },
    ],
  },
];

const techBadges = [
  "Zod validation at all API boundaries",
  "TanStack Query with stale-time caching",
  "Layered service architecture",
  "Vitest test suites (unit + integration)",
  "TypeScript strict mode end-to-end",
];

const handleViewDemo = () => {
  enableDemo();
  router.push("/dashboard");
};
</script>
