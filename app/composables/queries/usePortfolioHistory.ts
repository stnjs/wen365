import { useQuery } from "@tanstack/vue-query";
import type { PortfolioHistoryDto } from "#shared/types/PortfolioHistoryDto";

export interface UsePortfolioHistoryOptions {
  /** Number of days of history to fetch (default: 30, max: 365) */
  days?: MaybeRef<number>;
  /** Use the demo endpoint instead of real data */
  demo?: MaybeRef<boolean>;
}

export const usePortfolioHistory = (
  address: MaybeRef<string | null | undefined>,
  options: UsePortfolioHistoryOptions = {},
) => {
  const walletAddress = computed(() => unref(address) ?? "");
  const days = computed(() => unref(options.days) ?? 30);
  const isDemo = computed(() => unref(options.demo) ?? false);

  return useQuery<PortfolioHistoryDto>({
    queryKey: ["portfolioHistory", isDemo, walletAddress, days],
    queryFn: () => {
      if (isDemo.value) {
        return $fetch("/api/portfolio/demo/history", { query: { days: days.value } });
      }
      return $fetch(`/api/portfolio/${walletAddress.value}/history`, {
        query: { days: days.value },
      });
    },
    enabled: computed(() => isDemo.value || !!walletAddress.value),
    staleTime: 5 * 60 * 1000,
  });
};
