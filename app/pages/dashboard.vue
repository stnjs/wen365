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
            <UEmpty icon="i-lucide-wallet" description="Connect your wallet to view your portfolio">
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
          <div v-else>
            <!-- Portfolio Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <UCard>
                <template #header>
                  <h3 class="text-sm font-medium text-gray-400">Total Value</h3>
                </template>
                <div class="text-3xl font-bold text-gray-100">
                  {{ totalValue }}
                </div>
              </UCard>
              <UCard>
                <template #header>
                  <h3 class="text-sm font-medium text-gray-400">Total Tokens</h3>
                </template>
                <div class="text-3xl font-bold text-gray-100">
                  {{ tokens.length }}
                </div>
              </UCard>
              <UCard>
                <template #header>
                  <h3 class="text-sm font-medium text-gray-400">Networks</h3>
                </template>
                <div class="text-3xl font-bold text-gray-100">
                  {{ uniqueNetworks }}
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

const totalValue = computed<string>(() => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(portfolio.value?.totalValue || 0);
});

const tokens = computed<TokenDto[]>(() => portfolio.value?.tokens || []);

const uniqueNetworks = computed<number>(() => {
  const networks = new Set(tokens.value.map(token => token.network));
  return networks.size;
});

onMounted(async () => {
  if (address.value) {
    await refetchPortfolio();
  }
});
</script>
