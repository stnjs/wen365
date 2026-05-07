<template>
  <UDashboardSidebar id="default" collapsible resizeable>
    <template #header="{ collapsed }">
      <NuxtLink to="/">
        <img
          v-if="collapsed"
          src="~/assets/images/wen365-icon.svg"
          alt="Wen365 Logo"
          class="w-10 h-10"
        />
        <Logo v-else size="md" />
      </NuxtLink>
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
  ],
  [
    {
      label: "Feedback",
      icon: "i-lucide-message-circle",
      to: "https://github.com/mtp721/wen365/issues",
      target: "_blank",
    },
    {
      label: "Help & Support",
      icon: "i-lucide-info",
      to: "https://github.com/mtp721/wen365#readme",
      target: "_blank",
    },
  ],
] satisfies NavigationMenuItem[][];
</script>
