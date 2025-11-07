import { useQuery } from "@tanstack/vue-query";

export const usePortfolio = (address: MaybeRef<string | null | undefined>) => {
  const walletAddress = computed(() => unref(address) ?? "");
  console.log(walletAddress.value);
  return useQuery<PortfolioResponse>({
    queryKey: ["portfolio", walletAddress],
    queryFn: () => $fetch(`/api/portfolio/${walletAddress.value}`),
    enabled: computed(() => !!walletAddress.value),
  });
};
