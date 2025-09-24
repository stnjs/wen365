// Pinia is auto-imported by Nuxt
import { ref, computed } from "vue";
import type {
  Portfolio,
  PortfolioAsset,
  FIFOHolding,
  Transaction,
} from "~/types";

export const usePortfolioStore = defineStore("portfolio", () => {
  // State
  const portfolio = ref<Portfolio | null>(null);
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const totalValue = computed(() => portfolio.value?.totalValue ?? 0);
  const totalValueChange24h = computed(
    () => portfolio.value?.totalValueChange24h ?? 0
  );
  const totalValueChangePercent24h = computed(
    () => portfolio.value?.totalValueChangePercent24h ?? 0
  );

  const taxFreeAssets = computed(() => portfolio.value?.taxFreeAssets ?? []);
  const taxableAssets = computed(() => portfolio.value?.taxableAssets ?? []);
  const assets = computed(() => portfolio.value?.assets ?? []);

  const taxFreeValue = computed(() =>
    taxFreeAssets.value.reduce(
      (sum, asset) => sum + (asset.quantityUsd ?? 0),
      0
    )
  );

  const taxableValue = computed(() =>
    taxableAssets.value.reduce(
      (sum, asset) => sum + (asset.quantityUsd ?? 0),
      0
    )
  );

  // Actions
  const fetchPortfolio = async (address: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Use $fetch for SPA mode
      const data = await $fetch<Portfolio>("/api/portfolio");
      console.log("portfolio", data);
      portfolio.value = data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch portfolio";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPortfolio2 = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Use $fetch for SPA mode
      const data = await $fetch<Portfolio>(
        "/api/portfolio/0x867c61e6f2004f45FabfC9Ca0A31720ED29038bF"
      );
      console.log("portfolio", data);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch portfolio";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchTransactions = async (address: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Use $fetch for SPA mode
      const data = await $fetch<Transaction[]>("/api/transactions");
      transactions.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch transactions";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const calculateFIFOHoldings = (transactions: Transaction[]) => {
    // TODO: Implement FIFO calculation logic
    // This will process transactions and calculate holdings using FIFO method
    const holdings: FIFOHolding[] = [];

    // Group transactions by token
    const tokenTransactions = transactions.reduce(
      (acc, tx) => {
        if (!acc[tx.tokenAddress]) {
          acc[tx.tokenAddress] = [];
        }
        acc[tx.tokenAddress]!.push(tx);
        return acc;
      },
      {} as Record<string, Transaction[]>
    );

    // Calculate FIFO holdings for each token
    Object.entries(tokenTransactions).forEach(([tokenAddress, txs]) => {
      // Sort transactions by timestamp
      const sortedTxs = txs.sort((a, b) => a.timestamp - b.timestamp);

      // TODO: Implement actual FIFO logic
      // For now, create a simple holding
      if (sortedTxs.length > 0) {
        const firstTx = sortedTxs[0]!;
        const totalQuantity = sortedTxs.reduce((sum, tx) => {
          if (tx.type === "receive") {
            return sum + parseFloat(tx.value);
          } else if (tx.type === "send") {
            return sum - parseFloat(tx.value);
          }
          return sum;
        }, 0);

        if (totalQuantity > 0) {
          holdings.push({
            id: `${tokenAddress}-${firstTx.timestamp}`,
            tokenAddress,
            tokenSymbol: firstTx.tokenSymbol,
            tokenName: firstTx.tokenName,
            quantity: totalQuantity.toString(),
            acquisitionDate: firstTx.timestamp,
            holdingDays: Math.floor(
              (Date.now() - firstTx.timestamp) / (1000 * 60 * 60 * 24)
            ),
            isTaxFree: false, // TODO: Calculate based on tax settings
            transactionIds: sortedTxs.map(tx => tx.id),
          });
        }
      }
    });

    return holdings;
  };

  const refreshPortfolio = async (address: string) => {
    await Promise.all([fetchPortfolio(address), fetchTransactions(address)]);
  };

  return {
    // State
    portfolio,
    transactions,
    isLoading,
    error,

    // Getters
    totalValue,
    totalValueChange24h,
    totalValueChangePercent24h,
    taxFreeAssets,
    taxableAssets,
    assets,
    taxFreeValue,
    taxableValue,

    // Actions
    fetchPortfolio,
    fetchPortfolio2,
    fetchTransactions,
    calculateFIFOHoldings,
    refreshPortfolio,
  };
});
