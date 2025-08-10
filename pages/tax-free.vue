<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Tax-Free Assets</h1>
        <button @click="refreshPortfolio" class="btn-primary">Refresh</button>
      </div>

      <!-- Tax Settings Info -->
      <div class="card mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Tax Settings</h2>
            <p class="text-gray-600">
              {{ country }} - {{ taxFreePeriodDays }} days to tax-free
            </p>
          </div>
          <router-link to="/settings" class="btn-secondary">
            Settings
          </router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading your tax-free assets...</p>
      </div>

      <!-- Tax-Free Assets Content -->
      <div v-else>
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">
              Already Tax-Free
            </h3>
            <div class="text-2xl font-bold text-crypto-green">
              {{ taxFreeAssets.length }}
            </div>
            <div class="text-sm text-gray-500 mt-2">assets</div>
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
              Becoming Tax-Free Soon
            </h3>
            <div class="text-2xl font-bold text-crypto-yellow">
              {{ becomingTaxFreeSoon.length }}
            </div>
            <div class="text-sm text-gray-500 mt-2">next 30 days</div>
          </div>
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-2">
              Still Taxable
            </h3>
            <div class="text-2xl font-bold text-crypto-red">
              {{ taxableAssets.length }}
            </div>
            <div class="text-sm text-gray-500 mt-2">assets</div>
          </div>
        </div>

        <!-- Tax-Free Assets -->
        <div class="card mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Already Tax-Free Assets
          </h2>

          <div v-if="taxFreeAssets.length === 0" class="text-center py-8">
            <div class="text-4xl mb-4">⏳</div>
            <p class="text-gray-600">No tax-free assets yet</p>
            <p class="text-sm text-gray-500">
              Your assets will appear here once they reach the
              {{ taxFreePeriodDays }}-day holding period
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="asset in taxFreeAssets"
              :key="asset.id"
              class="flex items-center justify-between p-4 bg-crypto-green/10 border border-crypto-green/20 rounded-lg"
            >
              <div class="flex items-center">
                <div
                  class="w-12 h-12 bg-crypto-green/20 rounded-full flex items-center justify-center mr-4"
                >
                  <span class="text-crypto-green font-semibold text-lg">✓</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">
                    {{ asset.tokenSymbol }}
                  </div>
                  <div class="text-sm text-gray-500">{{ asset.tokenName }}</div>
                  <div class="text-sm text-crypto-green font-medium">
                    Tax-free since
                    {{
                      formatDate(
                        asset.acquisitionDate +
                          taxFreePeriodDays * 24 * 60 * 60 * 1000
                      )
                    }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900">
                  {{ formatBalance(asset.quantity) }} {{ asset.tokenSymbol }}
                </div>
                <div class="text-sm text-gray-500">
                  ${{ formatNumber(asset.quantityUsd || 0) }}
                </div>
                <div class="text-sm text-crypto-green font-medium">
                  {{ asset.holdingDays }} days held
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Becoming Tax-Free Soon -->
        <div class="card mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Becoming Tax-Free Soon
          </h2>

          <div v-if="becomingTaxFreeSoon.length === 0" class="text-center py-8">
            <div class="text-4xl mb-4">📅</div>
            <p class="text-gray-600">No assets becoming tax-free soon</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="asset in becomingTaxFreeSoon"
              :key="asset.id"
              class="flex items-center justify-between p-4 bg-crypto-yellow/10 border border-crypto-yellow/20 rounded-lg"
            >
              <div class="flex items-center">
                <div
                  class="w-12 h-12 bg-crypto-yellow/20 rounded-full flex items-center justify-center mr-4"
                >
                  <span class="text-crypto-yellow font-semibold text-lg"
                    >⏳</span
                  >
                </div>
                <div>
                  <div class="font-medium text-gray-900">
                    {{ asset.tokenSymbol }}
                  </div>
                  <div class="text-sm text-gray-500">{{ asset.tokenName }}</div>
                  <div class="text-sm text-crypto-yellow font-medium">
                    {{ asset.daysUntilTaxFree }} days until tax-free
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900">
                  {{ formatBalance(asset.quantity) }} {{ asset.tokenSymbol }}
                </div>
                <div class="text-sm text-gray-500">
                  ${{ formatNumber(asset.quantityUsd || 0) }}
                </div>
                <div class="text-sm text-crypto-yellow font-medium">
                  {{ formatDate(asset.taxFreeDate || 0) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Still Taxable Assets -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Still Taxable Assets
          </h2>

          <div v-if="taxableAssets.length === 0" class="text-center py-8">
            <div class="text-4xl mb-4">🎉</div>
            <p class="text-gray-600">All your assets are tax-free!</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="asset in taxableAssets"
              :key="asset.id"
              class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center">
                <div
                  class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4"
                >
                  <span class="text-gray-600 font-semibold text-lg">{{
                    asset.tokenSymbol.slice(0, 2)
                  }}</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">
                    {{ asset.tokenSymbol }}
                  </div>
                  <div class="text-sm text-gray-500">{{ asset.tokenName }}</div>
                  <div class="text-sm text-gray-600">
                    {{ asset.holdingDays }} days held ({{
                      taxFreePeriodDays - asset.holdingDays
                    }}
                    days remaining)
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900">
                  {{ formatBalance(asset.quantity) }} {{ asset.tokenSymbol }}
                </div>
                <div class="text-sm text-gray-500">
                  ${{ formatNumber(asset.quantityUsd || 0) }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ formatDate(asset.taxFreeDate || 0) }}
                </div>
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
import { useSettingsStore } from "~/stores/settings";
import type { FIFOHolding } from "~/types";

const walletStore = useWalletStore();
const portfolioStore = usePortfolioStore();
const settingsStore = useSettingsStore();

const address = computed(() => walletStore.address);
const isLoading = computed(() => portfolioStore.isLoading);
const taxFreeAssets = computed(() => portfolioStore.taxFreeAssets);
const taxableAssets = computed(() => portfolioStore.taxableAssets);
const taxFreeValue = computed(() => portfolioStore.taxFreeValue);
const country = computed(() => settingsStore.country);
const taxFreePeriodDays = computed(() => settingsStore.taxFreePeriodDays);

const shortAddress = computed(() => {
  if (!address.value) return "";
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
});

const becomingTaxFreeSoon = computed(() => {
  const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
  return taxableAssets.value.filter((asset: any) => {
    const taxFreeDate =
      asset.taxFreeDate ||
      asset.acquisitionDate + taxFreePeriodDays.value * 24 * 60 * 60 * 1000;
    return taxFreeDate <= thirtyDaysFromNow && taxFreeDate > Date.now();
  });
});

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatBalance = (balance: string) => {
  const num = parseFloat(balance);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num);
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString();
};

const refreshPortfolio = async () => {
  if (address.value) {
    await portfolioStore.refreshPortfolio(address.value);
  }
};

const openAccountModal = () => {
  walletStore.openAccountModal();
};

onMounted(async () => {
  await settingsStore.loadSettings();
  if (address.value) {
    await refreshPortfolio();
  }
});
</script>
