<template>
  <UButton
    v-if="!isConnected"
    v-bind="$attrs"
    :disabled="isConnecting"
    :loading="isConnecting"
    :size="size"
    class="rounded-full cursor-pointer"
    :color="color"
    @click="handleConnect"
  >
    <slot>
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
  showConnected?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
  color?: "primary" | "secondary" | "neutral" | "success" | "warning" | "error";
}

withDefaults(defineProps<ConnectWalletButtonProps>(), {
  label: "Connect Wallet",
  showConnected: true,
  size: "md",
  variant: "soft",
  color: "neutral",
});

const accountData = useAppKitAccount();
const { open } = useAppKit();
const toast = useToast();

const isConnected = computed<boolean>(() => accountData.value?.isConnected ?? false);
const isConnecting = computed<boolean>(() => accountData.value?.status === "connecting");

const handleConnect = async () => {
  try {
    await open({ view: "Connect", namespace: "eip155" });
  } catch {
    toast.add({
      title: "Couldn't open the wallet picker",
      description: "Please try again.",
      color: "error",
      icon: "i-lucide-triangle-alert",
    });
  }
};
</script>
