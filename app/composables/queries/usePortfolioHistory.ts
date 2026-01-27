import { useQuery } from "@tanstack/vue-query";
import type { PortfolioHistoryDto } from "#shared/types/PortfolioHistoryDto";

export interface UsePortfolioHistoryOptions {
  /** Number of days of history to fetch (default: 30, max: 90) */
  days?: number;
}

export const usePortfolioHistory = (
  address: MaybeRef<string | null | undefined>,
  options: UsePortfolioHistoryOptions = {},
) => {
  const walletAddress = computed(() => unref(address) ?? "");
  const days = options.days ?? 30;

  return useQuery<PortfolioHistoryDto>({
    queryKey: ["portfolioHistory", walletAddress, days],
    queryFn: () =>
      $fetch(`/api/portfolio/${walletAddress.value}/history`, {
        query: { days },
      }),
    enabled: computed(() => !!walletAddress.value),
    // History data doesn't change frequently, cache for longer
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
