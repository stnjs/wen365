<template>
  <UTooltip :delay-duration="200" :text="copyLabel">
    <UButton
      color="neutral"
      variant="ghost"
      size="xs"
      square
      :icon="isCopied ? 'i-lucide-check' : 'i-lucide-copy'"
      :aria-label="copyLabel"
      class="ml-1 -my-1 align-middle"
      @click.stop="copy(text)"
    />
  </UTooltip>
</template>

<script setup lang="ts">
interface CopyToClipboardButtonProps {
  text: string;
  copiedDuring?: number;
  copyLabel?: string;
  copiedLabel?: string;
}

const props = withDefaults(defineProps<CopyToClipboardButtonProps>(), {
  copiedDuring: 1500,
  copyLabel: "Copy to clipboard",
});

const { copy, copied } = useClipboard({ copiedDuring: props.copiedDuring });

const isCopied = computed<boolean>(() => copied.value);
</script>
