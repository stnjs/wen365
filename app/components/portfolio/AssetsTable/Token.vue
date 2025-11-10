<template>
  <UUser
    :name="props.tokenMetadata.name"
    :avatar="{
      src: props.tokenMetadata.logo,
      icon: 'i-lucide-image',
    }"
    :description="props.tokenMetadata.symbol"
  />
</template>
<script setup lang="ts">
const props = defineProps<{
  tokenMetadata: TokenMetadataDto;
}>();
</script>
