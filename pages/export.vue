<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Export Data</h1>
        <button @click="refreshPortfolio" class="btn-primary">Refresh</button>
      </div>

      <!-- Export Options -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Export Configuration -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Export Configuration
          </h2>

          <div class="space-y-6">
            <!-- Format Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Export Format</label
              >
              <select v-model="exportOptions.format" class="input-field">
                <option value="csv">CSV (Excel compatible)</option>
                <option value="json">JSON (Developer friendly)</option>
              </select>
            </div>

            <!-- Date Range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Date Range</label
              >
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    v-model="exportOptions.dateRange.start"
                    type="date"
                    class="input-field"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    v-model="exportOptions.dateRange.end"
                    type="date"
                    class="input-field"
                  />
                </div>
              </div>
            </div>

            <!-- Data Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Include Data</label
              >
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includeTaxFree"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-gray-700"
                    >Tax-free assets</span
                  >
                </label>
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includeTaxable"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Taxable assets</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="exportOptions.includeTransactions"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-gray-700"
                    >Transaction history</span
                  >
                </label>
              </div>
            </div>

            <!-- Export Button -->
            <button
              @click="exportData"
              :disabled="isExporting"
              class="w-full btn-primary"
            >
              <span v-if="isExporting">Exporting...</span>
              <span v-else>Export Data</span>
            </button>
          </div>
        </div>

        <!-- Export Preview -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Export Preview
          </h2>

          <div class="space-y-4">
            <div
              class="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <div class="font-medium text-gray-900">Total Assets</div>
                <div class="text-sm text-gray-500">
                  {{ assets.length }} unique tokens
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900">
                  ${{ formatNumber(totalValue) }}
                </div>
              </div>
            </div>

            <div
              class="flex justify-between items-center p-4 bg-crypto-green/10 rounded-lg"
            >
              <div>
                <div class="font-medium text-gray-900">Tax-Free Assets</div>
                <div class="text-sm text-gray-500">
                  {{ taxFreeAssets.length }} assets
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-crypto-green">
                  ${{ formatNumber(taxFreeValue) }}
                </div>
              </div>
            </div>

            <div
              class="flex justify-between items-center p-4 bg-crypto-red/10 rounded-lg"
            >
              <div>
                <div class="font-medium text-gray-900">Taxable Assets</div>
                <div class="text-sm text-gray-500">
                  {{ taxableAssets.length }} assets
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-crypto-red">
                  ${{ formatNumber(taxableValue) }}
                </div>
              </div>
            </div>

            <div
              class="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <div class="font-medium text-gray-900">Transactions</div>
                <div class="text-sm text-gray-500">
                  {{ transactions.length }} total
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900">
                  {{ transactions.length }}
                </div>
              </div>
            </div>
          </div>

          <!-- Export History -->
          <div class="mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Recent Exports
            </h3>
            <div v-if="exportHistory.length === 0" class="text-center py-4">
              <p class="text-gray-500 text-sm">No recent exports</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="exportItem in exportHistory.slice(0, 3)"
                :key="exportItem.id"
                class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div class="font-medium text-gray-900">
                    {{ exportItem.filename }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(exportItem.timestamp) }}
                  </div>
                </div>
                <button class="text-primary-600 hover:text-primary-900 text-sm">
                  Download
                </button>
              </div>
            </div>
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
import type { ExportOptions } from "~/types";

const walletStore = useWalletStore();
const portfolioStore = usePortfolioStore();

const isExporting = ref(false);
const exportHistory = ref<
  Array<{ id: string; filename: string; timestamp: number }>
>([]);

const address = computed(() => walletStore.address);
const totalValue = computed(() => portfolioStore.totalValue);
const taxFreeValue = computed(() => portfolioStore.taxFreeValue);
const taxableValue = computed(() => portfolioStore.taxableValue);
const taxFreeAssets = computed(() => portfolioStore.taxFreeAssets);
const taxableAssets = computed(() => portfolioStore.taxableAssets);
const assets = computed(() => portfolioStore.assets);
const transactions = computed(() => portfolioStore.transactions);

const shortAddress = computed(() => {
  if (!address.value) return "";
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
});

const exportOptions = ref<ExportOptions>({
  format: "csv",
  dateRange: {
    start: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago
    end: Date.now(),
  },
  includeTaxFree: true,
  includeTaxable: true,
  includeTransactions: false,
});

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString();
};

const exportData = async () => {
  try {
    isExporting.value = true;

    // TODO: Implement actual export logic
    await new Promise(resolve => setTimeout(resolve, 2000));

    const filename = `hodltracker-export-${Date.now()}.${exportOptions.value.format}`;

    // Add to export history
    exportHistory.value.unshift({
      id: Date.now().toString(),
      filename,
      timestamp: Date.now(),
    });

    // Simulate download
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8,export data";
    link.download = filename;
    link.click();
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    isExporting.value = false;
  }
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
