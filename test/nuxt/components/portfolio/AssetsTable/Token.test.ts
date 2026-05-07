import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Token from "~/components/portfolio/AssetsTable/Token.vue";

// UUser is the Nuxt UI primitive Token wraps. Stub it so we can assert
// exactly what props get forwarded (name, avatar, description) without the
// full component runtime.
const UUserStub = {
  inheritAttrs: false,
  props: ["name", "avatar", "description"],
  template:
    '<div data-testid="user" :data-name="name" :data-description="description" :data-avatar-src="avatar?.src" :data-avatar-icon="avatar?.icon" />',
};

async function mountToken(metadata: TokenMetadataDto) {
  return mountSuspended(Token, {
    props: { tokenMetadata: metadata },
    global: { stubs: { UUser: UUserStub } },
  });
}

describe("AssetsTable / Token", () => {
  it("forwards full metadata to UUser", async () => {
    const wrapper = await mountToken({
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      logo: "https://example.com/eth.png",
    });
    const user = wrapper.find("[data-testid='user']");
    expect(user.attributes("data-name")).toBe("Ethereum");
    expect(user.attributes("data-description")).toBe("ETH");
    expect(user.attributes("data-avatar-src")).toBe("https://example.com/eth.png");
  });

  it("falls back to the lucide-image icon when no logo URL is given", async () => {
    const wrapper = await mountToken({
      name: "Mystery Coin",
      symbol: "MYS",
      decimals: 18,
      logo: null,
    });
    const user = wrapper.find("[data-testid='user']");
    expect(user.attributes("data-avatar-src")).toBeUndefined();
    expect(user.attributes("data-avatar-icon")).toBe("i-lucide-image");
  });

  it("treats null name and symbol as undefined props (UUser hides them)", async () => {
    const wrapper = await mountToken({
      name: null,
      symbol: null,
      decimals: 18,
      logo: "https://example.com/x.png",
    });
    const user = wrapper.find("[data-testid='user']");
    expect(user.attributes("data-name")).toBeUndefined();
    expect(user.attributes("data-description")).toBeUndefined();
  });
});
