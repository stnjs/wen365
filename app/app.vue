<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
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
  themeVariables: {
    "--apkt-accent": "#5154da", // Perano-600 - main accent color
    "--apkt-font-family": "Inter, system-ui, sans-serif", // Match your app font
    "--apkt-border-radius-master": "8px", // Match Nuxt UI border radius
  },
});
</script>
