<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel id="dashboard">
      <template #header>
        <UDashboardNavbar title="Dashboard">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <appkit-button />
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar>
          <template #right>
            <UTooltip text="Refresh Portfolio">
              <UButton
                icon="i-lucide-refresh-cw"
                color="neutral"
                variant="ghost"
                :disabled="isLoading"
                @click="refetchPortfolio()"
              />
            </UTooltip>
          </template>
        </UDashboardToolbar>
      </template>
      <template #body>
        <div>
          <!-- Empty State - No Wallet Connected -->
          <div v-if="!address" class="text-center py-12">
            <UEmpty
              icon="i-lucide-wallet"
              description="Connect your wallet to view your portfolio"
              class="text-zinc-400"
            >
              <template #actions>
                <UButton to="/" color="primary"> Go to Home </UButton>
              </template>
            </UEmpty>
          </div>

          <!-- Empty State - No Tokens -->
          <!-- <div v-else-if="tokens.length === 0" class="text-center py-12">
            <UEmpty icon="i-lucide-coins" description="No tokens found in your wallet">
              <template #actions>
                <UButton color="primary" @click="refetchPortfolio()"> Refresh </UButton>
              </template>
            </UEmpty>
          </div> -->

          <!-- Portfolio Content -->
          <div v-else class="space-y-6">
            <!-- Top Section: Net Worth & Graph -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Net Worth Card -->
              <UCard class="bg-zinc-900/50 border-white/5">
                <div
                  class="p-8 flex flex-col justify-between relative overflow-hidden min-h-[200px]"
                >
                  <div class="relative z-10">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider"
                        >Total Net Worth</span
                      >
                    </div>
                    <div class="text-4xl text-white font-semibold tracking-tight mb-2">
                      <span>{{ netWorthDollars }}</span
                      ><span class="text-2xl">.{{ netWorthCents }}</span>
                    </div>
                    <div
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                    >
                      <UIcon name="i-lucide-trending-up" class="w-3 h-3" />
                      <span>Portfolio Active</span>
                    </div>
                  </div>
                  <!-- Subtle grid in stats bg -->
                  <div
                    class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"
                  />
                </div>
              </UCard>

              <!-- Portfolio Graph Card -->
              <UCard class="bg-zinc-900/50 border-white/5 lg:col-span-2">
                <div class="p-6 relative h-[200px] flex items-end overflow-hidden">
                  <div class="absolute top-6 right-6 flex gap-2 z-10">
                    <div class="text-[10px] text-white bg-white/10 px-2 py-0.5 rounded">1D</div>
                    <div class="text-[10px] text-zinc-500 px-2 py-0.5 rounded">1W</div>
                    <div class="text-[10px] text-zinc-500 px-2 py-0.5 rounded">1M</div>
                  </div>
                  <!-- SVG Line Graph -->
                  <svg
                    class="w-full h-[80%] absolute bottom-0 left-0"
                    preserveAspectRatio="none"
                    viewBox="0 0 600 200"
                  >
                    <defs>
                      <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(16, 185, 129, 0.1)" />
                        <stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />
                      </linearGradient>
                    </defs>
                    <!-- Fill Area -->
                    <path
                      d="M0,150 C100,140 200,180 300,120 C400,60 500,80 600,40 V200 H0 Z"
                      fill="url(#graphGradient)"
                    />
                    <!-- Line -->
                    <path
                      d="M0,150 C100,140 200,180 300,120 C400,60 500,80 600,40"
                      fill="none"
                      stroke="#10b981"
                      stroke-width="2"
                      class="animate-draw"
                    />
                  </svg>
                </div>
              </UCard>
            </div>

            <!-- Middle Section: Asset Maturity & Allocation -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Asset Maturity Card -->
              <UCard class="bg-zinc-900/50 border-white/5 lg:col-span-2">
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium">Asset Maturity (Tax Status)</span>
                    <span class="text-[10px] text-zinc-600">Threshold: 365 Days</span>
                  </div>
                </template>
                <div class="p-6 space-y-5">
                  <!-- Placeholder maturity bars - will be replaced with real data -->
                  <div v-if="tokens.length > 0">
                    <div
                      v-for="(token, index) in tokens.slice(0, 3)"
                      :key="index"
                      class="space-y-1.5"
                    >
                      <div class="flex justify-between text-xs mb-1.5">
                        <div class="flex items-center gap-2 text-white">
                          <UIcon
                            :name="getTokenIcon(token.tokenMetadata?.symbol || '')"
                            class="w-3.5 h-3.5"
                            :class="getTokenIconColor(token.tokenMetadata?.symbol || '')"
                          />
                          {{ token.tokenMetadata?.symbol || "Token" }}
                        </div>
                        <span class="text-zinc-400">Short Term</span>
                      </div>
                      <div
                        class="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden relative"
                      >
                        <div class="h-full bg-zinc-500 w-[60%]" />
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-zinc-500 text-sm text-center py-4">
                    Connect wallet to see asset maturity
                  </div>
                </div>
              </UCard>

              <!-- Asset Allocation Card -->
              <UCard class="bg-zinc-900/50 border-white/5">
                <template #header>
                  <span class="text-xs font-medium text-zinc-400">Asset Allocation</span>
                </template>
                <div class="p-6 flex flex-col justify-center items-center relative">
                  <div
                    class="w-24 h-24 rounded-full border-[6px] border-zinc-800 border-t-emerald-500 border-r-blue-500 border-b-purple-500 border-l-orange-500 rotate-45"
                  />
                  <div class="absolute inset-0 flex items-center justify-center flex-col">
                    <span class="text-white text-sm font-medium">{{ tokens.length }}</span>
                    <span class="text-[10px] text-zinc-500 uppercase">Assets</span>
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Assets Table -->
            <AssetsTable :tokens="tokens" :is-loading="isLoading" />
          </div>
        </div>
      </template>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { usePortfolio } from "~/composables/queries/usePortfolio";
import { useAppKitAccount } from "@reown/appkit/vue";
import AssetsTable from "~/components/portfolio/AssetsTable/AssetsTable.vue";

// Protect this route with auth middleware
definePageMeta({
  middleware: "auth",
});

const accountData = useAppKitAccount();
const address = computed<string | undefined>(() => accountData.value?.address);

const { data: portfolio, isLoading, refetch: refetchPortfolio } = usePortfolio(address);

const tokens = computed<TokenDto[]>(() => portfolio.value?.tokens || []);

const netWorthDollars = computed<string>(() => {
  const value = portfolio.value?.totalValue || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.floor(value));
});

const netWorthCents = computed<string>(() => {
  const value = portfolio.value?.totalValue || 0;
  const cents = Math.floor((value % 1) * 100);
  return cents.toString().padStart(2, "0");
});

const getTokenIcon = (symbol: string): string => {
  const iconMap: Record<string, string> = {
    BTC: "i-lucide-bitcoin",
    ETH: "i-lucide-layers",
    USDC: "i-lucide-circle-dollar-sign",
    USDT: "i-lucide-circle-dollar-sign",
  };
  return iconMap[symbol.toUpperCase()] || "i-lucide-coins";
};

const getTokenIconColor = (symbol: string): string => {
  const colorMap: Record<string, string> = {
    BTC: "text-orange-500",
    ETH: "text-blue-500",
    USDC: "text-blue-400",
    USDT: "text-green-400",
  };
  return colorMap[symbol.toUpperCase()] || "text-zinc-400";
};

onMounted(async () => {
  if (address.value) {
    await refetchPortfolio();
  }
});
</script>
