import { useQuery } from "@tanstack/vue-query";

export const usePortfolio = (address: string) => {
  return useQuery({
    queryKey: ["portfolio", address],
    queryFn: () => $fetch(`/api/portfolio/${address}`),
    enabled: !!address,
  });
};
