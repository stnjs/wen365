<template>
  <UButton
    v-if="!isConnected"
    v-bind="$attrs"
    :disabled="isConnecting"
    :loading="isConnecting"
    :size="size"
    :class="buttonClass"
    @click="handleConnect"
  >
    {{ isConnecting ? "Connecting..." : label }}
  </UButton>
  <UButton v-else-if="showConnected" :size="size" :class="buttonClass" to="/portfolio">
    {{ connectedLabel }}
  </UButton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppKit, useAppKitAccount } from "@reown/appkit/vue";

interface Props {
  label?: string;
  connectedLabel?: string;
  showConnected?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
}

const props = withDefaults(defineProps<Props>(), {
  label: "Get Started",
  connectedLabel: "View Portfolio",
  showConnected: true,
  size: "xl",
  variant: "soft",
});

const accountData = useAppKitAccount();
const { open } = useAppKit();

const isConnected = computed(() => accountData.value?.isConnected);
const isConnecting = computed(() => accountData.value?.status === "connecting");

const handleConnect = async () => {
  try {
    open({ view: "Connect" });
  } catch (error) {
    console.error("Failed to connect wallet:", error);
  }
};

// Glassmorphism button styles using Tailwind - matching original design
const buttonClass = computed(() => {
  const baseClasses = `
    rounded-full
    bg-white/5
    backdrop-blur-md
    border border-accented
    shadow-[0_8px_32px_rgba(0,0,0,0.1),0_0_40px_rgba(139,92,246,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]
    hover:bg-white/20 hover:border-white/30 hover:scale-105
    hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),0_0_60px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
    active:scale-[1.02]
    disabled:opacity-60 disabled:cursor-not-allowed
    transition-all duration-300
    text-default
    font-bold
  `.trim();

  // Size-specific classes
  const sizeClasses =
    props.size === "xl"
      ? "px-10 py-7 text-lg"
      : props.size === "lg"
        ? "px-8 py-6 text-base"
        : props.size === "md"
          ? "px-6 py-4 text-sm"
          : props.size === "sm"
            ? "px-4 py-2 text-sm"
            : "px-3 py-1.5 text-xs";

  return `${baseClasses} ${sizeClasses}`;
});
</script>
