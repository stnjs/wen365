// Pinia is auto-imported by Nuxt
import { ref, computed } from "vue";

export const usePortfolioStore = defineStore("portfolio", () => {
  // State
  const portfolio = ref<PortfolioResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const totalValue = computed(() => portfolio.value?.totalValue ?? 0);
  const totalValueChange24h = computed(
    () => portfolio.value?.totalValueChange24h ?? 0
  );
  // Actions
  const fetchPortfolio = async (address: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Use $fetch for SPA mode
      const data = await $fetch<PortfolioResponse>(`/api/portfolio/${address}`);
      portfolio.value = data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch portfolio";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  /* 
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
  }; */

  const refreshPortfolio = async (address: string) => {
    await Promise.all([fetchPortfolio(address)]);
  };

  return {
    // State
    portfolio,
    isLoading,
    error,

    // Getters
    totalValue,
    totalValueChange24h,

    // Actions
    fetchPortfolio,
    refreshPortfolio,
  };
});
