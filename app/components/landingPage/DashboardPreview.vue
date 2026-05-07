<template>
  <!-- Hero visual — a stylised twin of `app/pages/dashboard.vue`. -->
  <div
    class="mt-24 relative max-w-6xl mx-auto animate-fade-up group cursor-default"
    :style="{ animationDelay: '400ms' }"
  >
    <div
      class="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/10 blur-[80px] rounded-full"
    />

    <!-- Browser frame -->
    <div
      class="border border-accented bg-[#0c0c0e] backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl shadow-black relative z-10 ring-1 ring-white/5 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
    >
      <!-- Browser chrome -->
      <div
        class="h-11 bg-zinc-900/80 border-b border-muted flex items-center px-4 justify-between sticky top-0 z-20"
      >
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div class="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div class="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <div
          class="flex items-center justify-center gap-2 bg-app-overlay-light border border-muted rounded px-4 md:px-32 py-1"
        >
          <UIcon name="i-lucide-lock" class="w-3 h-3 text-dimmed" />
          <span class="text-xs text-dimmed font-medium">wen365.xyz/dashboard</span>
        </div>
        <div class="w-14" />
      </div>

      <div class="flex min-h-150 pointer-events-none select-none">
        <!-- Sidebar — mirrors the real dashboard sidebar (Dashboard + Feedback + Help) -->
        <div class="w-64 border-r border-muted bg-zinc-900/30 hidden md:flex flex-col p-6">
          <div class="flex items-baseline gap-0 mb-10">
            <span class="text-default font-bold text-2xl tracking-tight">wen</span>
            <span class="text-dimmed font-bold text-xl tracking-tight">365</span>
          </div>

          <div class="space-y-4">
            <div
              class="h-9 bg-zinc-800/50 rounded-lg w-full flex items-center px-3 gap-2 border border-muted"
            >
              <UIcon name="i-lucide-search" class="w-3.5 h-3.5 text-toned" />
              <span class="text-xs text-toned">Search...</span>
            </div>

            <div
              class="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 border border-accented text-default text-sm font-medium"
            >
              <UIcon name="i-lucide-house" class="w-4 h-4" />
              Dashboard
            </div>

            <!-- Blurred placeholders for sections still on the roadmap (multi-Wallet, NFTs, …) -->
            <div class="space-y-4 pt-2">
              <div v-for="i in 4" :key="i" class="h-8 w-full flex items-center px-3 gap-3">
                <div class="w-4 h-4 rounded-sm bg-zinc-800/50" />
                <div class="h-3 w-24 bg-zinc-800/50 rounded-sm blur-[2px]" />
              </div>
            </div>
          </div>

          <div class="mt-auto space-y-2">
            <div class="flex items-center gap-3 px-3 py-2 text-dimmed text-sm">
              <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
              Feedback
              <UIcon name="i-lucide-arrow-up-right" class="w-3 h-3 ml-auto opacity-60" />
            </div>
            <div class="flex items-center gap-3 px-3 py-2 text-dimmed text-sm">
              <UIcon name="i-lucide-info" class="w-4 h-4" />
              Help &amp; Support
              <UIcon name="i-lucide-arrow-up-right" class="w-3 h-3 ml-auto opacity-60" />
            </div>
          </div>
        </div>

        <!-- Main content -->
        <div class="flex-1 bg-[#0c0c0e] flex flex-col">
          <!-- Top: Net Worth (1/3) + Chart (2/3) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 border-b border-muted h-64">
            <div
              class="p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-muted relative overflow-hidden"
            >
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-medium text-dimmed uppercase tracking-wider"
                    >Total Net Worth</span
                  >
                </div>
                <div class="text-4xl text-default font-semibold tracking-tight mb-3">
                  $47,832<span class="text-dimmed text-2xl">.61</span>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                  >
                    <UIcon name="i-lucide-trending-up" class="w-3 h-3" />
                    +$1,243.87 (2.67%)
                  </div>
                  <span class="text-xs text-dimmed">24H</span>
                </div>
              </div>
              <div
                class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"
              />
            </div>

            <div class="col-span-2 relative h-full flex items-end p-0 overflow-hidden bg-[#0c0c0e]">
              <div class="absolute top-6 left-6 flex items-center gap-2 z-10">
                <span class="text-emerald-400 text-sm font-medium">+$4,273.32</span>
                <span
                  class="inline-flex items-center gap-1 text-emerald-400 text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded"
                >
                  <UIcon name="i-lucide-trending-up" class="w-3 h-3" />
                  9.98%
                </span>
              </div>

              <div class="absolute top-6 right-6 flex gap-1 z-10">
                <div class="text-[10px] text-dimmed px-2 py-0.5 rounded">1W</div>
                <div class="text-[10px] text-default bg-white/10 px-2 py-0.5 rounded">1M</div>
                <div class="text-[10px] text-dimmed px-2 py-0.5 rounded">3M</div>
                <div class="text-[10px] text-dimmed px-2 py-0.5 rounded">1Y</div>
              </div>

              <svg
                class="w-full h-[80%] absolute bottom-0 left-0"
                preserveAspectRatio="none"
                viewBox="0 0 600 200"
              >
                <defs>
                  <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(16, 185, 129, 0.18)" />
                    <stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,150 C100,140 200,180 300,120 C400,60 500,80 600,40 V200 H0 Z"
                  fill="url(#graphGradient)"
                />
                <path
                  d="M0,150 C100,140 200,180 300,120 C400,60 500,80 600,40"
                  fill="none"
                  stroke="#10b981"
                  stroke-width="2"
                  class="animate-draw"
                />
              </svg>
            </div>
          </div>

          <!-- Middle: Holding-period tracker (2/3, future-state mock) + Allocation (1/3) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 border-b border-muted">
            <div
              class="col-span-1 lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-muted"
            >
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-hourglass" class="w-3.5 h-3.5 text-amber-400" />
                  <span class="text-xs font-medium text-default">Holding-period tracker</span>
                </div>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  Coming soon
                </span>
              </div>

              <div class="space-y-4">
                <!-- ETH — past the 365-day threshold -->
                <div>
                  <div class="flex justify-between text-xs mb-1.5">
                    <div class="flex items-center gap-2 text-default">
                      <UIcon name="i-token-branded-ethereum" class="w-3.5 h-3.5" />
                      ETH
                    </div>
                    <span class="text-emerald-400 font-medium">Tax-free (420 days)</span>
                  </div>
                  <div class="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden relative">
                    <div class="absolute left-[88%] top-0 h-full w-px bg-white/30 z-10" />
                    <div class="h-full bg-emerald-500 w-full" />
                  </div>
                </div>

                <!-- USDC — still inside the speculative window -->
                <div>
                  <div class="flex justify-between text-xs mb-1.5">
                    <div class="flex items-center gap-2 text-default">
                      <UIcon name="i-lucide-circle-dollar-sign" class="w-3.5 h-3.5 text-blue-400" />
                      USDC
                    </div>
                    <span class="text-muted">Holding (215 / 365 days)</span>
                  </div>
                  <div class="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden relative">
                    <div class="absolute right-0 top-0 h-full w-px bg-white/30 z-10" />
                    <div class="h-full bg-amber-500/80 w-[58%]" />
                  </div>
                </div>

                <!-- WETH — early lifecycle -->
                <div>
                  <div class="flex justify-between text-xs mb-1.5">
                    <div class="flex items-center gap-2 text-default">
                      <UIcon name="i-lucide-circle" class="w-3.5 h-3.5 text-violet-400" />
                      WETH
                    </div>
                    <span class="text-muted">Holding (61 / 365 days)</span>
                  </div>
                  <div class="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden relative">
                    <div class="absolute right-0 top-0 h-full w-px bg-white/30 z-10" />
                    <div class="h-full bg-zinc-500 w-[17%]" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Allocation — donut sized & coloured to match `AssetAllocationChart` -->
            <div class="p-6 flex flex-col items-center justify-center relative">
              <span class="absolute top-6 left-6 text-xs font-medium text-muted">
                Asset Allocation
              </span>
              <div class="relative w-36 h-36 flex items-center justify-center mt-2">
                <div class="absolute inset-0 rounded-full" :style="donutGradient" />
                <div class="absolute inset-[14px] rounded-full bg-[#0c0c0e]" />
                <div class="relative z-10 flex flex-col items-center gap-1 px-2">
                  <span class="text-[10px] text-dimmed font-light">Total Portfolio Value:</span>
                  <span class="text-default text-lg font-medium leading-none">$47,832.61</span>
                  <span
                    class="mt-0.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5"
                  >
                    100.0%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom: Assets table (Token | Chain | Balance | Value, mirrors AssetsTable.vue) -->
          <div class="bg-app-card-light flex-1">
            <div
              class="px-6 py-3 flex items-center justify-between border-b border-muted text-sm text-default font-medium"
            >
              <span>Assets</span>
              <div
                class="flex items-center gap-2 bg-app-overlay border border-muted rounded px-2 py-1 text-xs text-toned"
              >
                <UIcon name="i-lucide-search" class="w-3 h-3" />
                Search tokens...
              </div>
            </div>

            <div
              class="px-6 py-2 border-b border-muted grid grid-cols-12 text-[10px] uppercase tracking-wider font-medium text-dimmed"
            >
              <div class="col-span-5">Token</div>
              <div class="col-span-2">Chain</div>
              <div class="col-span-2 text-right">Balance</div>
              <div class="col-span-3 text-right">Value</div>
            </div>

            <div
              v-for="row in tableRows"
              :key="row.symbol + row.chainName"
              class="px-6 py-3 border-b border-muted grid grid-cols-12 items-center hover:bg-white/[0.02] transition-colors"
            >
              <div class="col-span-5 flex items-center gap-3">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center"
                  :class="row.iconBg"
                >
                  <UIcon :name="row.tokenIcon" class="w-4 h-4" :class="row.iconColor" />
                </div>
                <div class="leading-tight">
                  <div class="text-sm text-default font-medium">{{ row.name }}</div>
                  <div class="text-[11px] text-dimmed uppercase tracking-wide">
                    {{ row.symbol }}
                  </div>
                </div>
              </div>
              <div class="col-span-2 flex items-center gap-2 text-sm text-muted">
                <UIcon :name="row.chainIcon" class="w-4 h-4" />
                {{ row.chainName }}
              </div>
              <div class="col-span-2 text-right text-sm text-default font-medium tabular-nums">
                {{ row.balance }}
              </div>
              <div class="col-span-3 text-right text-sm text-default font-medium tabular-nums">
                {{ row.value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Donut proportions match the top assets in `DEMO_PORTFOLIO`:
//   ETH 57.13% · WETH 14.28% · USDC 10.87% · ETH(Base) 8.48% · Other 9.24%
// Palette mirrors `colorPalette` in app/components/AssetAllocationChart.vue.
const donutGradient =
  "background: conic-gradient(" +
  "var(--color-emerald-400) 0deg 205.7deg," +
  "var(--color-sky-400) 205.7deg 257.1deg," +
  "var(--color-violet-400) 257.1deg 296.2deg," +
  "var(--color-amber-400) 296.2deg 326.7deg," +
  "var(--color-zinc-500) 326.7deg 360deg)";

interface PreviewRow {
  name: string;
  symbol: string;
  chainName: string;
  chainIcon: string;
  tokenIcon: string;
  iconBg: string;
  iconColor: string;
  balance: string;
  value: string;
}

const tableRows: PreviewRow[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    chainName: "Ethereum",
    chainIcon: "i-token-branded-ethereum",
    tokenIcon: "i-token-branded-ethereum",
    iconBg: "bg-emerald-500/10 border border-emerald-500/20",
    iconColor: "",
    balance: "8.4215",
    value: "$27,328.98",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    chainName: "Arbitrum",
    chainIcon: "i-token-branded-arbitrum-one",
    tokenIcon: "i-lucide-circle-dollar-sign",
    iconBg: "bg-blue-500/10 border border-blue-500/20",
    iconColor: "text-blue-400",
    balance: "5,200.00",
    value: "$5,200.00",
  },
  {
    name: "Wrapped Ether",
    symbol: "WETH",
    chainName: "Polygon",
    chainIcon: "i-token-branded-polygon",
    tokenIcon: "i-lucide-circle",
    iconBg: "bg-violet-500/10 border border-violet-500/20",
    iconColor: "text-violet-400",
    balance: "2.105",
    value: "$6,830.98",
  },
];
</script>
