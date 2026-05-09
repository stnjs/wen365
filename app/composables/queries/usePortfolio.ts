import { useQuery } from "@tanstack/vue-query";
import { DEMO_PORTFOLIO } from "~/utils/demoData";

export const usePortfolio = (
  address: MaybeRef<string | null | undefined>,
  options: { demo?: MaybeRef<boolean> } = {},
) => {
  const walletAddress = computed<string>(() => unref(address) ?? "");
  const isDemo = computed<boolean>(() => unref(options.demo) ?? false);

  return useQuery<PortfolioDto>({
    queryKey: ["portfolio", isDemo, walletAddress],
    queryFn: () => {
      if (isDemo.value) return Promise.resolve(DEMO_PORTFOLIO);
      return $fetch(`/api/portfolio/${walletAddress.value}`);
    },
    enabled: computed<boolean>(() => isDemo.value || !!walletAddress.value),
  });
};
