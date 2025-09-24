import { WagmiPlugin, type WagmiPluginOptions } from "@wagmi/vue";
import { defineNuxtPlugin } from "nuxt/app";
import { wagmiAdapter } from "~/config/appkit";

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(WagmiPlugin, {
    config: wagmiAdapter.wagmiConfig,
  } as unknown as WagmiPluginOptions);
});
