<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist. Maybe you mistyped the URL or
        the page has been moved.
      </p>
      <div class="space-x-4">
        <router-link to="/" class="btn-primary"> Go Home </router-link>
        <button @click="$router.go(-1)" class="btn-secondary">Go Back</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 Not Found page
</script>
