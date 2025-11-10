<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Portfolio
        </h1>
        <UButton @click="refetchPortfolio" color="primary">Refresh</UButton>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <USpinner size="xl" class="mx-auto mb-4" />
        <p class="text-gray-600">Loading your portfolio...</p>
      </div>

      <!-- Portfolio Content -->
      <div v-else>
        <!-- Portfolio Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <UCard>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
            <div class="text-2xl font-bold">{{ totalValue }}</div>
          </UCard>
        </div>
        <!-- Assets Table -->
        <AssetsTable :tokens="tokens" />
        {{ tokens }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { usePortfolio } from "~/composables/queries/usePortfolio";
import { useAppKitAccount } from "@reown/appkit/vue";
import AssetsTable from "~/components/portfolio/AssetsTable/AssetsTable.vue";

const accountData = useAppKitAccount();
const address = computed<string | undefined>(() => accountData.value?.address);

const {
  data: portfolio,
  isLoading,
  refetch: refetchPortfolio,
} = usePortfolio(address);

const totalValue = computed<string>(() => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(portfolio.value?.totalValue || 0);
});
const tokens = computed<TokenDto[]>(() => portfolio.value?.tokens || []);

const searchTerm = ref("");

onMounted(async () => {
  if (address.value) {
    await refetchPortfolio();
  }
});
</script>
