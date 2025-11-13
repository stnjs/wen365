<template>
  <UUser
    :name="props.tokenMetadata.name ?? undefined"
    :avatar="{
      src: props.tokenMetadata.logo ?? undefined,
      icon: 'i-lucide-image',
    }"
    :description="props.tokenMetadata.symbol ?? undefined"
  />
</template>
<script setup lang="ts">
const props = defineProps<{
  tokenMetadata: TokenMetadataDto;
}>();
</script>
