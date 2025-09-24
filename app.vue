<template>
  <div id="app">
    <NuxtLayout>
      <UApp>
        <NuxtPage />
      </UApp>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { createAppKit } from "@reown/appkit/vue";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, base, sepolia } from "wagmi/chains";
const config = useRuntimeConfig();
const projectId = config.public.reownProjectId;

const networks = [mainnet, arbitrum, base, sepolia];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as any,
  projectId,
  metadata: {
    name: "HODL Tracker",
    description: "Crypto Tax Tracking with FIFO Logic",
    url: "https://reown.com/appkit",
    icons: ["https://avatars.githubusercontent.com/u/179229932?s=200&v=4"],
  },
});
</script>

<style>
#app {
  font-family: "Inter", system-ui, sans-serif;
}
</style>
