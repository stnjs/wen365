import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import NetWorthCard from "~/components/portfolio/NetWorthCard.vue";

// Light stubs for Nuxt UI components — they render their slot/attrs as plain
// HTML so we can assert text and class semantics without booting the full UI
// runtime.
const uiStubs = {
  UCard: { template: '<div><slot name="header" /><slot /></div>' },
  UBadge: {
    inheritAttrs: false,
    props: ["color", "variant", "size"],
    template: '<span data-testid="badge" :data-color="color"><slot /></span>',
  },
  UIcon: {
    inheritAttrs: false,
    props: ["name"],
    template: '<i :data-icon="name" />',
  },
};

async function mountCard(props: Record<string, unknown>) {
  return mountSuspended(NetWorthCard, {
    props,
    global: { stubs: uiStubs },
  });
}

describe("NetWorthCard", () => {
  it("splits totalValue into a dollars-and-cents pair", async () => {
    const wrapper = await mountCard({ totalValue: 47832.61 });
    const text = wrapper.text();
    expect(text).toContain("$47,832");
    expect(text).toContain(".61");
  });

  it("pads single-digit cents with a leading zero", async () => {
    const wrapper = await mountCard({ totalValue: 100.05 });
    expect(wrapper.text()).toContain(".05");
  });

  it("renders zero cleanly when totalValue is missing", async () => {
    const wrapper = await mountCard({});
    expect(wrapper.text()).toContain("$0");
    expect(wrapper.text()).toContain(".00");
  });

  it("hides the 24h badge when delta data is absent", async () => {
    const wrapper = await mountCard({ totalValue: 1000 });
    expect(wrapper.find("[data-testid='badge']").exists()).toBe(false);
  });

  it("renders a positive 24h badge in success color", async () => {
    const wrapper = await mountCard({
      totalValue: 1000,
      valueChange24h: 123.45,
      valueChangePercent24h: 5.5,
    });
    const badge = wrapper.find("[data-testid='badge']");
    expect(badge.exists()).toBe(true);
    expect(badge.attributes("data-color")).toBe("success");
    expect(badge.text()).toContain("+");
    expect(badge.text()).toContain("5.50%");
  });

  it("renders a negative 24h badge in error color", async () => {
    const wrapper = await mountCard({
      totalValue: 1000,
      valueChange24h: -42.1,
      valueChangePercent24h: -3.2,
    });
    const badge = wrapper.find("[data-testid='badge']");
    expect(badge.attributes("data-color")).toBe("error");
    expect(badge.text()).not.toContain("+-");
    expect(badge.text()).toContain("3.20%");
  });

  it("treats a zero delta as positive (no minus sign)", async () => {
    const wrapper = await mountCard({
      totalValue: 1000,
      valueChange24h: 0,
      valueChangePercent24h: 0,
    });
    expect(wrapper.find("[data-testid='badge']").attributes("data-color")).toBe("success");
  });
});
