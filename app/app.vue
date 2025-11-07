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
import { projectId, wagmiAdapter, networks } from "./config/wagmi";

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
