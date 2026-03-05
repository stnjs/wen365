import { useQuery } from "@tanstack/vue-query";

export const usePortfolio = (
  address: MaybeRef<string | null | undefined>,
  options: { demo?: MaybeRef<boolean> } = {},
) => {
  const walletAddress = computed(() => unref(address) ?? "");
  const isDemo = computed(() => unref(options.demo) ?? false);

  return useQuery<PortfolioDto>({
    queryKey: ["portfolio", isDemo, walletAddress],
    queryFn: () => {
      if (isDemo.value) return $fetch("/api/portfolio/demo");
      return $fetch(`/api/portfolio/${walletAddress.value}`);
    },
    enabled: computed(() => isDemo.value || !!walletAddress.value),
  });
};
