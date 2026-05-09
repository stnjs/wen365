<template>
  <div v-if="compact" class="flex items-center gap-3">
    <div class="relative shrink-0">
      <UAvatar
        :src="props.tokenMetadata.logo ?? undefined"
        :icon="props.tokenMetadata.logo ? undefined : 'i-lucide-image'"
        size="md"
      />
      <UIcon
        :name="chainToIconMap[props.network]"
        class="absolute -bottom-1 -right-1 size-4.5 rounded-full bg-app-card"
      />
    </div>
    <div class="flex flex-col">
      <span class="font-medium text-default">
        {{ props.tokenMetadata.symbol ?? "" }}
      </span>
      <span class="text-xs text-muted">
        {{ formatBalance(props.tokenBalance ?? 0) }}
      </span>
    </div>
  </div>
  <UUser
    v-else
    :name="props.tokenMetadata.name ?? undefined"
    :avatar="{
      src: props.tokenMetadata.logo ?? undefined,
      icon: 'i-lucide-image',
    }"
    :description="props.tokenMetadata.symbol ?? undefined"
  >
    <template #name>
      <span class="inline-flex min-w-0 max-w-full items-center gap-0.5">
        <span class="min-w-0 truncate">{{ props.tokenMetadata.name ?? "" }}</span>
        <span v-if="props.tokenAddress !== null" class="inline-flex shrink-0">
          <CopyToClipboardButton :text="props.tokenAddress" copy-label="Copy contract address" />
        </span>
      </span>
    </template>
  </UUser>
</template>
<script setup lang="ts">
import { chainToIconMap } from "./config";

const props = withDefaults(
  defineProps<{
    tokenMetadata: TokenMetadataDto;
    tokenAddress: string | null;
    tokenBalance?: number;
    network: NetworkId;
    compact?: boolean;
  }>(),
  { compact: false },
);
</script>
