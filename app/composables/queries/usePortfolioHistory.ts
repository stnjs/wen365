import { useQuery } from "@tanstack/vue-query";
import type { PortfolioHistoryDto } from "#shared/types/PortfolioHistoryDto";
import { buildDemoPortfolioHistory } from "~/utils/demoData";

export interface UsePortfolioHistoryOptions {
  /** Number of days of history to fetch (default: 30, max: 365) */
  days?: MaybeRef<number>;
  demo?: MaybeRef<boolean>;
}

export const usePortfolioHistory = (
  address: MaybeRef<string | null | undefined>,
  options: UsePortfolioHistoryOptions = {},
) => {
  const walletAddress = computed<string>(() => unref(address) ?? "");
  const days = computed<number>(() => unref(options.days) ?? 30);
  const isDemo = computed<boolean>(() => unref(options.demo) ?? false);

  return useQuery<PortfolioHistoryDto>({
    queryKey: ["portfolioHistory", isDemo, walletAddress, days],
    queryFn: () => {
      if (isDemo.value) {
        return Promise.resolve(buildDemoPortfolioHistory(days.value));
      }
      return $fetch(`/api/portfolio/${walletAddress.value}/history`, {
        query: { days: days.value },
      });
    },
    enabled: computed<boolean>(() => isDemo.value || !!walletAddress.value),
    staleTime: 5 * 60 * 1000,
  });
};
