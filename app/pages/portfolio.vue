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
            <div class="text-2xl font-bold text-gray-900">
              ${{ totalValue }}
            </div>
          </UCard>
        </div>

        <!-- Assets Table -->
        <UCard>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Your Assets</h2>
            <div class="flex space-x-2">
              <UInput
                v-model="searchTerm"
                placeholder="Search assets..."
                class="w-64"
              />
            </div>
          </div>
          {{ tokens }}
          <!-- <div v-if="filteredAssets.length === 0" class="text-center py-12">
            <div class="text-4xl mb-4">📊</div>
            <p class="text-gray-600">No assets found</p>
            <p class="text-sm text-gray-500">
              Connect your wallet to see your portfolio
            </p>
          </div>

          <div v-else class="overflow-x-auto">
            <UTable :rows="filteredAssets" :columns="tableColumns" />
          </div> -->
        </UCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { usePortfolio } from "~/composables/queries/usePortfolio";
import { useAppKitAccount } from "@reown/appkit/vue";

const accountData = useAppKitAccount();
const address = computed<string | undefined>(() => accountData.value?.address);

const {
  data: portfolio,
  isLoading,
  refetch: refetchPortfolio,
} = usePortfolio(address);

const totalValue = computed<number>(() => portfolio.value?.totalValue || 0);
const tokens = computed<TokenDto[]>(() => portfolio.value?.tokens || []);

const searchTerm = ref("");

onMounted(async () => {
  if (address.value) {
    await refetchPortfolio();
  }
});
</script>
