import { WagmiPlugin } from "@wagmi/vue";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { networks } from "../config/wagmi";

export default defineNuxtPlugin(nuxtApp => {
  const {
    public: { reownProjectId },
  } = useRuntimeConfig();

  const wagmiAdapter = new WagmiAdapter({ networks, projectId: reownProjectId });

  nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiAdapter.wagmiConfig });

  return {
    provide: {
      wagmiAdapter,
      reownProjectId,
    },
  };
});
