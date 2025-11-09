<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation -->
    <UHeader class="bg-white shadow-sm border-b border-gray-200">
      <template #title>
        <div
          class="flex items-center space-x-2 text-xl font-bold text-gray-900"
        >
          <div
            class="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">H</span>
          </div>
          <span>HODL Tracker</span>
        </div>
      </template>
      <!-- <div class="flex justify-between items-center h-16"> -->
      <!-- Logo -->

      <!-- Navigation Links -->
      <div class="hidden md:flex items-center space-x-1">
        <UButton to="/" variant="ghost" color="gray"> Home </UButton>
        <UButton to="/dashboard" variant="ghost" color="gray">
          Dashboard
        </UButton>
        <UButton to="/portfolio" variant="ghost" color="gray">
          Portfolio
        </UButton>
        <UButton to="/tax-free" variant="ghost" color="gray">
          Tax Free
        </UButton>
        <UButton to="/export" variant="ghost" color="gray"> Export </UButton>
        <UButton to="/settings" variant="ghost" color="gray">
          Settings
        </UButton>
      </div>
      <template #right>
        <!-- Wallet Connection Status -->
        <appkit-button />
      </template>
      <!-- </div> -->
    </UHeader>

    <!-- Main Content -->
    <UMain>
      <slot />
    </UMain>

    <!-- Footer -->
    <UFooter class="bg-white border-t border-gray-200 mt-auto">
      <UContainer>
        <div class="py-6">
          <div class="text-center text-gray-500 text-sm">
            <p>HODL Tracker - Crypto Tax Tracking with FIFO Logic</p>
            <p class="mt-1">
              For informational purposes only. Consult a tax professional.
            </p>
          </div>
        </div>
      </UContainer>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
// Layout component - no script logic needed
</script>
