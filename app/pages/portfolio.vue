<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-mint-500">Portfolio</h1>
        <button @click="refetchPortfolio" class="btn-primary">Refresh</button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading your portfolio...</p>
      </div>

      <!-- Portfolio Content -->
      <div v-else>
        <!-- Portfolio Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
            <div class="text-2xl font-bold text-gray-900">
              ${{ totalValue }}
            </div>
          </div>
        </div>

        <!-- Assets Table -->
        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Your Assets</h2>
            <div class="flex space-x-2">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Search assets..."
                class="input-field w-64"
              />
            </div>
          </div>
          {{ portfolio }}
          {{ address }}

          <!-- <div v-if="filteredAssets.length === 0" class="text-center py-12">
            <div class="text-4xl mb-4">📊</div>
            <p class="text-gray-600">No assets found</p>
            <p class="text-sm text-gray-500">
              Connect your wallet to see your portfolio
            </p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Asset
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Balance
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Value
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Avg. Holding Days
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tax-Free %
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="asset in filteredAssets" :key="asset.token.address">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div
                        class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4"
                      >
                        <span class="text-primary-600 font-semibold">{{
                          asset.token.symbol.slice(0, 2)
                        }}</span>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">
                          {{ asset.token.symbol }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ asset.token.name }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ formatBalance(asset.balance, asset.token.decimals) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ asset.token.symbol }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      ${{ formatNumber(asset.balanceUsd) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ asset.averageHoldingDays }} days
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          class="bg-crypto-green h-2 rounded-full"
                          :style="{ width: `${asset.taxFreePercentage}%` }"
                        ></div>
                      </div>
                      <span class="text-sm text-gray-900"
                        >{{ asset.taxFreePercentage.toFixed(1) }}%</span
                      >
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-primary-600 hover:text-primary-900">
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div> -->
        </div>
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

const searchTerm = ref("");

onMounted(async () => {
  if (address.value) {
    await refetchPortfolio();
  }
});
</script>
