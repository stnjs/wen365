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
import {
  arbitrum,
  mainnet,
  polygon,
  base,
  type AppKitNetwork,
} from "@reown/appkit/networks";
const config = useRuntimeConfig();
const projectId = config.public.reownProjectId;

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  polygon,
  base,
  arbitrum,
];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: "HODL Tracker",
    description: "Crypto Tax Tracking with FIFO Logic",
    url: "http://localhost:3030",
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  },
  themeMode: "light",
});
</script>

<style>
#app {
  font-family: "Inter", system-ui, sans-serif;
}
</style>
