import { useQuery } from "@tanstack/vue-query";
import type { PortfolioHistoryDto } from "#shared/types/PortfolioHistoryDto";

export interface UsePortfolioHistoryOptions {
  /** Number of days of history to fetch (default: 30, max: 365) */
  days?: MaybeRef<number>;
}

export const usePortfolioHistory = (
  address: MaybeRef<string | null | undefined>,
  options: UsePortfolioHistoryOptions = {},
) => {
  const walletAddress = computed(() => unref(address) ?? "");
  const days = computed(() => unref(options.days) ?? 30);

  return useQuery<PortfolioHistoryDto>({
    queryKey: ["portfolioHistory", walletAddress, days],
    queryFn: () =>
      $fetch(`/api/portfolio/${walletAddress.value}/history`, {
        query: { days: days.value },
      }),
    enabled: computed(() => !!walletAddress.value),
    staleTime: 5 * 60 * 1000,
  });
};
