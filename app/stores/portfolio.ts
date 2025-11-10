// Pinia is auto-imported by Nuxt
import { ref, computed } from "vue";

export const usePortfolioStore = defineStore("portfolio", () => {
  // State
  const portfolio = ref<PortfolioDto | null>(null);

  // Getters
  const totalValue = computed(() => portfolio.value?.totalValue ?? 0);
  const totalValueChange24h = computed(() => portfolio.value?.totalValueChange24h ?? 0);

  return {
    // State
    portfolio,

    // Getters
    totalValue,
    totalValueChange24h,
  };
});
