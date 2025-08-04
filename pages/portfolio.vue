<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Portfolio</h1>
        <button @click="refreshPortfolio" class="btn-primary">Refresh</button>
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
              ${{ formatNumber(totalValue) }}
            </div>
          </div>
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">
              Tax-Free Value
            </h3>
            <div class="text-2xl font-bold text-crypto-green">
              ${{ formatNumber(taxFreeValue) }}
            </div>
          </div>
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">
              Taxable Value
            </h3>
            <div class="text-2xl font-bold text-crypto-red">
              ${{ formatNumber(taxableValue) }}
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

          <div v-if="filteredAssets.length === 0" class="text-center py-12">
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
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useWalletStore } from "~/stores/wallet";
import { usePortfolioStore } from "~/stores/portfolio";

const walletStore = useWalletStore();
const portfolioStore = usePortfolioStore();

const searchTerm = ref("");

const address = computed(() => walletStore.address);
const isLoading = computed(() => portfolioStore.isLoading);
const totalValue = computed(() => portfolioStore.totalValue);
const taxFreeValue = computed(() => portfolioStore.taxFreeValue);
const taxableValue = computed(() => portfolioStore.taxableValue);
const assets = computed(() => portfolioStore.assets);

const shortAddress = computed(() => {
  if (!address.value) return "";
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
});

const filteredAssets = computed(() => {
  if (!searchTerm.value) return assets.value;

  return assets.value.filter(
    (asset: any) =>
      asset.token.symbol
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase()) ||
      asset.token.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatBalance = (balance: string, decimals: number) => {
  const num = parseFloat(balance) / Math.pow(10, decimals);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num);
};

const refreshPortfolio = async () => {
  if (address.value) {
    await portfolioStore.refreshPortfolio(address.value);
  }
};

const disconnectWallet = () => {
  walletStore.disconnectWallet();
};

onMounted(async () => {
  if (address.value) {
    await refreshPortfolio();
  }
});
</script>
