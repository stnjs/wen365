import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, h, ref } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { usePortfolio } from "~/composables/queries/usePortfolio";
import { DEMO_PORTFOLIO } from "~/utils/demoData";

// $fetch is the process boundary — the only thing this composable talks to
// outside of TanStack. Per testing.mdc §2 we mock $fetch and let the real
// TanStack Query run.
const mockFetch = vi.fn();
global.$fetch = mockFetch as unknown as typeof global.$fetch;

type Address = Parameters<typeof usePortfolio>[0];
type DemoOpt = NonNullable<Parameters<typeof usePortfolio>[1]>["demo"];

async function setupPortfolio(opts: { address: Address; demo?: DemoOpt }) {
  let api!: ReturnType<typeof usePortfolio>;

  const Harness = defineComponent({
    setup() {
      api = usePortfolio(opts.address, opts.demo !== undefined ? { demo: opts.demo } : {});
      return () => h("div");
    },
  });

  // Fresh, retry-disabled client per test so error cases don't trigger
  // exponential backoff and so cached results don't leak between tests.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  await mountSuspended(Harness, {
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  });

  return { api: () => api };
}

describe("usePortfolio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when address is null", async () => {
    const { api } = await setupPortfolio({ address: ref<string | null>(null) });
    await flushPromises();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(api().data.value).toBeUndefined();
  });

  it("does not fetch when address is an empty string", async () => {
    const { api } = await setupPortfolio({ address: ref("") });
    await flushPromises();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(api().data.value).toBeUndefined();
  });

  it("fetches /api/portfolio/:address and exposes the response as data", async () => {
    const portfolio: PortfolioDto = {
      totalValue: 5000,
      totalValueChange24h: 0,
      totalValueChangePercent24h: 0,
      tokens: [],
    };
    mockFetch.mockResolvedValue(portfolio);

    const { api } = await setupPortfolio({
      address: ref("0x053cba8511f4ec58f175057162a31eb7bd0d812f"),
    });
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/portfolio/0x053cba8511f4ec58f175057162a31eb7bd0d812f",
    );
    expect(api().data.value).toEqual(portfolio);
  });

  it("returns the demo portfolio without hitting the network when demo=true", async () => {
    const { api } = await setupPortfolio({
      address: ref<string | null>(null),
      demo: ref(true),
    });
    await flushPromises();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(api().data.value).toEqual(DEMO_PORTFOLIO);
  });

  it("surfaces fetch errors as a query error", async () => {
    mockFetch.mockRejectedValue(new Error("API Error"));

    const { api } = await setupPortfolio({ address: ref("0xabc") });
    await flushPromises();

    expect(api().isError.value).toBe(true);
    expect(api().error.value).toMatchObject({ message: "API Error" });
  });
});
