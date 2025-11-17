<template>
  <UTooltip :delay-duration="200" :text="networkToNameMap[network]">
    <UButton color="neutral" variant="ghost" size="sm" square>
      <UIcon class="size-8" :name="chainToIconMap[network]" />
    </UButton>
  </UTooltip>
</template>
<script setup lang="ts">
import { chainToIconMap, networkToNameMap } from "./config";

defineProps<{
  network: NetworkId;
}>();
</script>
