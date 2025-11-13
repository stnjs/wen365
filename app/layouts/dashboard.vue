<template>
  <UDashboardGroup class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar />
      </template>
      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>
<script setup lang="ts">
import Sidebar from "~/components/dashboard/Sidebar/Sidebar.vue";
</script>
