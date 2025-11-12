<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Portfolio</h1>
        <UButton @click="refetchPortfolio" color="primary" :disabled="isLoading">
          <span v-if="isLoading">Loading...</span>
          <span v-else>Refresh</span>
        </UButton>
        <appkit-button />
      </div>

      <!-- Empty State - No Wallet Connected -->
      <div v-if="!address" class="text-center py-12">
        <UEmpty icon="i-lucide-wallet" description="Connect your wallet to view your portfolio">
          <template #actions>
            <UButton to="/" color="primary"> Go to Home </UButton>
          </template>
        </UEmpty>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="text-center py-12">
        <USpinner size="xl" class="mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">Loading your portfolio...</p>
      </div>

      <!-- Empty State - No Tokens -->
      <div v-else-if="tokens.length === 0" class="text-center py-12">
        <UEmpty icon="i-lucide-coins" description="No tokens found in your wallet">
          <template #actions>
            <UButton @click="refetchPortfolio" color="primary"> Refresh </UButton>
          </template>
        </UEmpty>
      </div>

      <!-- Portfolio Content -->
      <div v-else>
        <!-- Portfolio Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <UCard>
            <template #header>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
            </template>
            <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {{ totalValue }}
            </div>
          </UCard>
          <UCard>
            <template #header>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tokens</h3>
            </template>
            <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {{ tokens.length }}
            </div>
          </UCard>
          <UCard>
            <template #header>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Networks</h3>
            </template>
            <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {{ uniqueNetworks }}
            </div>
          </UCard>
        </div>
        <!-- Assets Table -->
        <AssetsTable :tokens="tokens" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { usePortfolio } from "~/composables/queries/usePortfolio";
import { useAppKitAccount } from "@reown/appkit/vue";
import AssetsTable from "~/components/portfolio/AssetsTable/AssetsTable.vue";

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
