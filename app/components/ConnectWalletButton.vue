<template>
  <UButton
    v-if="!isConnected"
    v-bind="$attrs"
    :disabled="isConnecting"
    :loading="isConnecting"
    :size="size"
    :class="buttonClass"
    :color="color"
    @click="handleConnect"
  >
    <slot name="label">
      {{ isConnecting ? "Connecting..." : label }}
    </slot>
  </UButton>
  <appkit-account-button v-else-if="showConnected" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppKit, useAppKitAccount } from "@reown/appkit/vue";

interface ConnectWalletButtonProps {
  label?: string;
  connectedLabel?: string;
  showConnected?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
  color?: "primary" | "secondary" | "neutral" | "success" | "warning" | "error";
}

withDefaults(defineProps<ConnectWalletButtonProps>(), {
  label: "Connect Wallet",
  connectedLabel: "Connect Wallet",
  showConnected: true,
  size: "md",
  variant: "soft",
  color: "neutral",
});

const accountData = useAppKitAccount();
const { open } = useAppKit();

const isConnected = computed(() => accountData.value?.isConnected);
const isConnecting = computed(() => accountData.value?.status === "connecting");

const handleConnect = async () => {
  try {
    await open({ view: "Connect", namespace: "eip155" });
  } catch (error) {
    console.error("Failed to connect wallet:", error);
  }
};

const buttonClass = `
    rounded-full
    cursor-pointer
  `.trim();
</script>
