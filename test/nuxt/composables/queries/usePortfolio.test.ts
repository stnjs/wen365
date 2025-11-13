import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePortfolio } from "~/composables/queries/usePortfolio";
import { ref } from "vue";

// Mock $fetch
const mockFetch = vi.fn();
global.$fetch = mockFetch as unknown as typeof global.$fetch;

// Mock TanStack Query
const mockUseQuery = vi.fn();
vi.mock("@tanstack/vue-query", () => ({
  useQuery: (options: {
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
    enabled: { value: boolean };
  }) => mockUseQuery(options),
}));

describe("usePortfolio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({});
    mockUseQuery.mockImplementation(options => {
      const result = {
        data: ref<unknown>(null),
        isLoading: ref(false),
        isError: ref(false),
        error: ref<unknown>(null),
        refetch: vi.fn(),
      };

      if (options.enabled?.value && options.queryFn) {
        result.isLoading.value = true;
        Promise.resolve(options.queryFn()).then(
          (data: unknown) => {
            result.data.value = data;
            result.isLoading.value = false;
          },
          (error: unknown) => {
            result.isError.value = true;
            result.error.value = error;
            result.isLoading.value = false;
          },
        );
      }

      return result;
    });
  });

  it("should call useQuery with correct parameters when address is provided", () => {
    const address = ref("0x123");
    usePortfolio(address);

    const call = mockUseQuery.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    if (call) {
      expect(Array.isArray(call.queryKey)).toBe(true);
      expect(typeof call.queryFn).toBe("function");
      expect(call.enabled).toBeDefined();
    }
  });

  it("should disable query when address is null", () => {
    const address = ref<string | null>(null);
    usePortfolio(address);

    const call = mockUseQuery.mock.calls[0]?.[0];
    if (call) {
      expect(call.enabled.value).toBe(false);
    }
  });

  it("should disable query when address is empty string", () => {
    const address = ref("");
    usePortfolio(address);

    const call = mockUseQuery.mock.calls[0]?.[0];
    if (call) {
      expect(call.enabled.value).toBe(false);
    }
  });

  it("should enable query when address is provided", () => {
    const address = ref("0x123");
    usePortfolio(address);

    const call = mockUseQuery.mock.calls[0]?.[0];
    if (call) {
      expect(call.enabled.value).toBe(true);
    }
  });

  it("should call $fetch with correct endpoint in queryFn", async () => {
    const mockPortfolio: PortfolioDto = {
      totalValue: 5000,
      totalValueChange24h: 0,
      totalValueChangePercent24h: 0,
      tokens: [],
    };

    mockFetch.mockResolvedValue(mockPortfolio);

    const address = ref("0x053cba8511f4ec58f175057162a31eb7bd0d812f");
    usePortfolio(address);

    const call = mockUseQuery.mock.calls[0]?.[0];
    if (call && call.queryFn) {
      await call.queryFn();
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/portfolio/0x053cba8511f4ec58f175057162a31eb7bd0d812f",
      );
    }
  });

  it("should handle API errors gracefully", async () => {
    const error = new Error("API Error");
    mockFetch.mockRejectedValue(error);

    const address = ref("0x123");
    usePortfolio(address);

    const call = mockUseQuery.mock.calls[0]?.[0];
    if (call && call.queryFn) {
      await expect(call.queryFn()).rejects.toThrow("API Error");
    }
  });
});
