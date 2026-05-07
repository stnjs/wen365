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
          <template #left>
            <div
              v-if="isDemoMode && !address"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <UIcon name="i-lucide-flask-conical" class="size-3.5 text-amber-400" />
              <span class="text-xs text-amber-400 font-medium">
                Viewing demo data.
                <span class="hidden sm:inline text-amber-400/70"
                  >Connect your wallet to see your real portfolio.</span
                >
              </span>
            </div>
          </template>
          <template #right>
            <div class="flex items-center gap-2">
              <span v-if="lastUpdated" class="text-xs text-dimmed">
                Last updated: {{ lastUpdated }}
              </span>
              <UTooltip text="Refresh Portfolio">
                <UButton
                  icon="i-lucide-refresh-cw"
                  color="neutral"
                  variant="ghost"
                  :disabled="isLoading"
                  @click="refetchPortfolio()"
                />
              </UTooltip>
            </div>
          </template>
        </UDashboardToolbar>
      </template>
      <template #body>
        <div>
          <!-- Empty State - No Wallet Connected and not in demo mode -->
          <div v-if="!address && !isDemoMode" class="text-center py-12">
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
                <PortfolioChart
                  :address="address"
                  :current-value="portfolio?.totalValue"
                  :demo="showDemo"
                />
              </UCard>
            </div>

            <!-- Middle Section: Holding-period tracker (placeholder) & Allocation -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Holding-period tracker — roadmap feature, see README -->
              <UCard class="bg-app-card border-muted lg:col-span-2">
                <template #header>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-hourglass" class="size-3.5 text-amber-400" />
                      <span class="text-xs font-medium">Holding-period tracker</span>
                    </div>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    >
                      Coming soon
                    </span>
                  </div>
                </template>
                <div class="p-6 flex flex-col items-start justify-center gap-3 h-full min-h-40">
                  <p class="text-sm text-muted leading-relaxed max-w-lg">
                    Per-lot FIFO countdown to the 1-year tax-free threshold (Germany's 365-day
                    rule). The feature that started this project.
                  </p>
                  <p class="text-xs text-dimmed">
                    Track which holdings are about to mature and which are still inside the
                    speculative window.
                  </p>
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

const accountData = useAppKitAccount();
const address = computed<string | undefined>(() => accountData.value?.address);

const { isDemoMode } = useDemoMode();
const showDemo = computed<boolean>(() => isDemoMode.value && !address.value);

const {
  data: portfolio,
  isLoading,
  refetch: refetchPortfolio,
  dataUpdatedAt,
} = usePortfolio(address, { demo: showDemo });

const lastUpdated = computed<string>(() => {
  if (!dataUpdatedAt.value) return "";
  return new Date(dataUpdatedAt.value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
});

const tokens = computed<TokenDto[]>(() => portfolio.value?.tokens || []);

onMounted(async () => {
  if (address.value) {
    await refetchPortfolio();
  }
});
</script>
