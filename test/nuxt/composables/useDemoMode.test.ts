import { describe, it, expect, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h } from "vue";
import { useDemoMode } from "~/composables/useDemoMode";

// `useDemoMode` calls `useState`, which in Nuxt env requires a Nuxt root.
// Mount a tiny harness component that calls the composable so the Nuxt
// runtime is in scope, then assert against the returned refs.
function setup() {
  let api!: ReturnType<typeof useDemoMode>;
  const Harness = defineComponent({
    setup() {
      api = useDemoMode();
      return () => h("div");
    },
  });
  return { Harness, get: () => api };
}

describe("useDemoMode", () => {
  beforeEach(async () => {
    const { Harness, get } = setup();
    await mountSuspended(Harness);
    get().disableDemo();
  });

  it("starts disabled by default", async () => {
    const { Harness, get } = setup();
    await mountSuspended(Harness);
    expect(get().isDemoMode.value).toBe(false);
  });

  it("enableDemo flips the flag on", async () => {
    const { Harness, get } = setup();
    await mountSuspended(Harness);
    get().enableDemo();
    expect(get().isDemoMode.value).toBe(true);
  });

  it("disableDemo flips the flag back off", async () => {
    const { Harness, get } = setup();
    await mountSuspended(Harness);
    get().enableDemo();
    get().disableDemo();
    expect(get().isDemoMode.value).toBe(false);
  });

  it("shares state across consumers (Nuxt useState)", async () => {
    const { Harness: A, get: getA } = setup();
    const { Harness: B, get: getB } = setup();
    await mountSuspended(A);
    await mountSuspended(B);
    getA().enableDemo();
    expect(getB().isDemoMode.value).toBe(true);
  });
});
