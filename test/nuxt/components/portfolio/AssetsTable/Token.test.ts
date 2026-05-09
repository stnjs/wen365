import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Token from "~/components/portfolio/AssetsTable/Token.vue";
import { chainToIconMap } from "~/components/portfolio/AssetsTable/config";

// UUser is the Nuxt UI primitive Token wraps in desktop mode. Stub it so we
// can assert exactly what props get forwarded (name, avatar, description)
// without the full component runtime.
const UUserStub = {
  inheritAttrs: false,
  props: ["name", "avatar", "description"],
  template:
    '<div data-testid="user" :data-name="name" :data-description="description" :data-avatar-src="avatar?.src" :data-avatar-icon="avatar?.icon"><slot name="name" /></div>',
};

const CopyToClipboardButtonStub = {
  inheritAttrs: false,
  props: ["text"],
  template: '<button type="button" data-testid="copy-token-address" :data-text="text" />',
};

// UAvatar / UIcon stubs back the compact (mobile) render path.
const UAvatarStub = {
  inheritAttrs: false,
  props: ["src", "icon", "size"],
  template: '<div data-testid="avatar" :data-src="src" :data-icon="icon" />',
};

const UIconStub = {
  inheritAttrs: false,
  props: ["name"],
  template: '<i data-testid="icon" :data-name="name" />',
};

const STUBS = {
  UUser: UUserStub,
  UAvatar: UAvatarStub,
  UIcon: UIconStub,
  CopyToClipboardButton: CopyToClipboardButtonStub,
};

async function mountToken(
  metadata: TokenMetadataDto,
  options: {
    tokenAddress?: string | null;
    network?: NetworkId;
    compact?: boolean;
  } = {},
) {
  const { tokenAddress = null, network = "eth-mainnet", compact = false } = options;
  return mountSuspended(Token, {
    props: { tokenMetadata: metadata, tokenAddress, network, compact },
    global: { stubs: STUBS },
  });
}

describe("AssetsTable / Token", () => {
  it("forwards full metadata to UUser in desktop mode", async () => {
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

  it("desktop mode: shows copy control wired to the contract address", async () => {
    const addr = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const wrapper = await mountToken(
      {
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        logo: "https://example.com/usdc.png",
      },
      { tokenAddress: addr },
    );
    const copyBtn = wrapper.find("[data-testid='copy-token-address']");
    expect(copyBtn.exists()).toBe(true);
    expect(copyBtn.attributes("data-text")).toBe(addr);
  });

  it("desktop mode: hides copy control for native tokens", async () => {
    const wrapper = await mountToken(
      {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        logo: "https://example.com/eth.png",
      },
      { tokenAddress: null },
    );
    expect(wrapper.find("[data-testid='copy-token-address']").exists()).toBe(false);
  });

  it("compact mode: renders symbol + chain badge and hides the full name", async () => {
    const wrapper = await mountToken(
      {
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        logo: "https://example.com/usdc.png",
      },
      {
        compact: true,
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        network: "eth-mainnet",
      },
    );

    expect(wrapper.find("[data-testid='user']").exists()).toBe(false);

    const avatar = wrapper.find("[data-testid='avatar']");
    expect(avatar.attributes("data-src")).toBe("https://example.com/usdc.png");

    const icon = wrapper.find("[data-testid='icon']");
    expect(icon.attributes("data-name")).toBe(chainToIconMap["eth-mainnet"]);

    expect(wrapper.text()).toContain("USDC");
    expect(wrapper.text()).not.toContain("USD Coin");
  });

  it("compact mode: chain badge icon name reflects the passed network", async () => {
    const wrapper = await mountToken(
      {
        name: "Polygon",
        symbol: "POL",
        decimals: 18,
        logo: null,
      },
      { compact: true, network: "matic-mainnet" },
    );
    const icon = wrapper.find("[data-testid='icon']");
    expect(icon.attributes("data-name")).toBe(chainToIconMap["matic-mainnet"]);
  });
});
