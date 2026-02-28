<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel id="dashboard">
      <template #header>
        <UDashboardNavbar title="Dashboard">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <ConnectWalletButton />
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
              class="text-muted"
            >
              <template #actions>
                <UButton to="/" color="primary"> Go to Home </UButton>
              </template>
            </UEmpty>
          </div>
          <!-- Portfolio Content -->
          <div v-else class="space-y-6">
            <!-- Top Section: Net Worth & Graph -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <NetWorthCard
                :total-value="portfolio?.totalValue"
                :value-change-24h="portfolio?.totalValueChange24h"
                :value-change-percent-24h="portfolio?.totalValueChangePercent24h"
              />

              <!-- Portfolio Graph Card -->
              <UCard class="bg-app-card border-muted lg:col-span-2">
                <PortfolioChart :address="address" :current-value="portfolio?.totalValue" />
              </UCard>
            </div>

            <!-- Middle Section: Asset Maturity & Allocation -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Asset Maturity Card -->
              <UCard class="bg-app-card border-muted lg:col-span-2">
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium">Asset Maturity (Tax Status)</span>
                    <span class="text-[10px] text-toned">Threshold: 365 Days</span>
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
                        <div class="flex items-center gap-2 text-default">
                          <UIcon
                            :name="getTokenIcon(token.tokenMetadata?.symbol || '')"
                            class="w-3.5 h-3.5"
                            :class="getTokenIconColor(token.tokenMetadata?.symbol || '')"
                          />
                          {{ token.tokenMetadata?.symbol || "Token" }}
                        </div>
                        <span class="text-muted">Short Term</span>
                      </div>
                      <div
                        class="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden relative"
                      >
                        <div class="h-full bg-zinc-500 w-[60%]" />
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-dimmed text-sm text-center py-4">
                    Connect wallet to see asset maturity
                  </div>
                </div>
              </UCard>

              <!-- Asset Allocation Card -->
              <UCard class="bg-app-card border-muted">
                <template #header>
                  <span class="text-xs font-medium text-muted">Asset Allocation</span>
                </template>
                <AssetAllocationChart
                  :data="tokens"
                  :total-value="portfolio?.totalValue"
                  :is-loading="isLoading"
                />
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
import AssetAllocationChart from "~/components/AssetAllocationChart.vue";
import PortfolioChart from "~/components/portfolio/PortfolioChart.vue";
import NetWorthCard from "~/components/portfolio/NetWorthCard.vue";

// Protect this route with auth middleware
// definePageMeta({
//   middleware: "auth",
// });

const accountData = useAppKitAccount();
const address = computed<string | undefined>(() => accountData.value?.address);

const { data: portfolio, isLoading, refetch: refetchPortfolio } = usePortfolio(address);

const tokens = computed<TokenDto[]>(() => portfolio.value?.tokens || []);

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
  return colorMap[symbol.toUpperCase()] || "text-muted";
};

onMounted(async () => {
  if (address.value) {
    await refetchPortfolio();
  }
});
</script>
