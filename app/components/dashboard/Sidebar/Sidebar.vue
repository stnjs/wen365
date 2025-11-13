<template>
  <UDashboardSidebar id="default" collapsible resizeable>
    <template #header="{ collapsed }">
      <div v-if="!collapsed" class="logo-v10">wen<span class="accent">365</span></div>
    </template>
    <template #default="{ collapsed }">
      <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />
      <UNavigationMenu :collapsed="collapsed" :items="items[0]" orientation="vertical" />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="items[1]"
        orientation="vertical"
        class="mt-auto"
      />
    </template>
  </UDashboardSidebar>
</template>
<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items = [
  [
    {
      label: "Dashboard",
      icon: "i-lucide-house",
      to: "/dashboard",
    },
    {
      label: "Assets",
      icon: "i-lucide-wallet",
      to: "/assets",
    },

    {
      label: "Settings",
      icon: "i-lucide-settings",
      defaultOpen: true,
      children: [
        {
          label: "General",
        },
        {
          label: "Wallets",
        },
        {
          label: "Notifications",
        },
      ],
    },
  ],
  [
    {
      label: "Feedback",
      icon: "i-lucide-message-circle",
      to: "https://github.com/nuxt-ui-templates/dashboard",
      target: "_blank",
    },
    {
      label: "Help & Support",
      icon: "i-lucide-info",
      to: "https://github.com/nuxt/ui",
      target: "_blank",
    },
  ],
] satisfies NavigationMenuItem[][];
</script>
<style scoped>
.logo-v10 {
  font-size: 50px;
  font-weight: 400;
  color: white;
  letter-spacing: 2px;
}

.logo-v10 .accent {
  color: #666;
  font-weight: 300;
  font-size: 0.6em;
}
</style>
