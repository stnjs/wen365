<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading your portfolio...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="refetchPortfolio" class="btn-primary">Try Again</button>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- Portfolio Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">
              Total Portfolio Value
            </h3>
            <div class="text-2xl font-bold text-gray-900">
              ${{ formatNumber(totalValue) }}
            </div>
            <div class="flex items-center mt-2">
              <span
                :class="
                  totalValueChangePercent24h >= 0
                    ? 'text-crypto-green'
                    : 'text-crypto-red'
                "
              >
                {{ totalValueChangePercent24h >= 0 ? "+" : ""
                }}{{ totalValueChangePercent24h.toFixed(2) }}%
              </span>
              <span class="text-gray-500 text-sm ml-2">24h</span>
            </div>
          </div>

          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">
              Tax-Free Value
            </h3>
            <div class="text-2xl font-bold text-crypto-green">
              ${{ formatNumber(taxFreeValue) }}
            </div>
            <div class="text-sm text-gray-500 mt-2">
              {{ taxFreeAssets.length }} assets
            </div>
          </div>

          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">
              Taxable Value
            </h3>
            <div class="text-2xl font-bold text-crypto-red">
              ${{ formatNumber(taxableValue) }}
            </div>
            <div class="text-sm text-gray-500 mt-2">
              {{ taxableAssets.length }} assets
            </div>
          </div>

          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Total Assets</h3>
            <div class="text-2xl font-bold text-gray-900">
              {{ assets.length }}
            </div>
            <div class="text-sm text-gray-500 mt-2">Unique tokens</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <router-link
            to="/portfolio"
            class="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex items-center">
              <div class="text-3xl mr-4">📊</div>
              <div>
                <h3 class="font-semibold text-gray-900">View Portfolio</h3>
                <p class="text-sm text-gray-600">Detailed asset breakdown</p>
              </div>
            </div>
          </router-link>

          <router-link
            to="/tax-free"
            class="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex items-center">
              <div class="text-3xl mr-4">⏳</div>
              <div>
                <h3 class="font-semibold text-gray-900">Tax-Free Assets</h3>
                <p class="text-sm text-gray-600">Countdown timers</p>
              </div>
            </div>
          </router-link>

          <router-link
            to="/export"
            class="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex items-center">
              <div class="text-3xl mr-4">📤</div>
              <div>
                <h3 class="font-semibold text-gray-900">Export Data</h3>
                <p class="text-sm text-gray-600">CSV for tax advisor</p>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button @click="refreshPortfolio" class="btn-secondary text-sm">
              Refresh
            </button>
          </div>

          <div v-if="transactions.length === 0" class="text-center py-8">
            <div class="text-4xl mb-4">📝</div>
            <p class="text-gray-600">No recent transactions found</p>
            <p class="text-sm text-gray-500">
              Connect your wallet to see your transaction history
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="tx in transactions.slice(0, 5)"
              :key="tx.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center">
                <div
                  class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4"
                >
                  <span class="text-primary-600 font-semibold">{{
                    tx.tokenSymbol.slice(0, 2)
                  }}</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">
                    {{ tx.tokenSymbol }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(tx.timestamp) }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900">
                  {{ tx.value }} {{ tx.tokenSymbol }}
                </div>
                <div class="text-sm text-gray-500">{{ tx.type }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useWalletStore } from "~/stores/wallet";
import { usePortfolioStore } from "~/stores/portfolio";

// const walletStore = useWalletStore();
// const portfolioStore = usePortfolioStore();

// const isConnected = computed(() => walletStore.isConnected);
// const address = computed(() => walletStore.address);
// const isLoading = computed(() => portfolioStore.isLoading);
// const error = computed(() => portfolioStore.error);

// const totalValue = computed(() => portfolioStore.totalValue);
// const totalValueChange24h = computed(() => portfolioStore.totalValueChange24h);
// const totalValueChangePercent24h = computed(
//   () => portfolioStore.totalValueChangePercent24h
// );
// const taxFreeValue = computed(() => portfolioStore.taxFreeValue);
// const taxableValue = computed(() => portfolioStore.taxableValue);
// const taxFreeAssets = computed(() => portfolioStore.taxFreeAssets);
// const taxableAssets = computed(() => portfolioStore.taxableAssets);
// const assets = computed(() => portfolioStore.assets);
// const transactions = computed(() => portfolioStore.transactions);

// const shortAddress = computed(() => {
//   if (!address.value) return "";
//   return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
// });

// const formatNumber = (num: number) => {
//   return new Intl.NumberFormat("en-US", {
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 2,
//   }).format(num);
// };

// const formatDate = (timestamp: number) => {
//   return new Date(timestamp * 1000).toLocaleDateString();
// };

// const refreshPortfolio = async () => {
//   if (address.value) {
//     await portfolioStore.refreshPortfolio(address.value);
//   }
// };

// const openAccountModal = () => {
//   walletStore.openAccountModal();
// };

// onMounted(async () => {
//   if (address.value) {
//     await refreshPortfolio();
//   }
// });
</script>
