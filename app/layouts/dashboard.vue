<template>
  <UDashboardGroup class="min-h-screen bg-[#0c0c0e]">
    <Sidebar />
    <slot />
  </UDashboardGroup>
</template>
<script setup lang="ts">
import Sidebar from "~/components/dashboard/Sidebar.vue";
</script>
