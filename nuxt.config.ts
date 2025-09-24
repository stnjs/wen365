// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Compatibility date for Nitro
  compatibilityDate: "2025-08-04",

  // Enable TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Development tools
  devtools: { enabled: true },

  // SSR disabled for client-side only app
  ssr: false,

  // CSS and styling
  css: ["~/assets/css/main.css"],

  // Modules
  modules: ["@nuxt/devtools", "@pinia/nuxt", "@wagmi/vue/nuxt", "@nuxt/ui"],

  // Pinia configuration
  pinia: {
    // Auto-imports are handled by Nuxt automatically
  },

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    reownProjectId: process.env.NUXT_PROJECT_ID,
    covalentApiKey: process.env.VITE_COVALENT_API_KEY,
    alchemyApiKey: process.env.VITE_ALCHEMY_API_KEY,
    etherscanApiKey: process.env.VITE_ETHERSCAN_API_KEY,
    sendgridApiKey: process.env.VITE_SENDGRID_API_KEY,
    telegramBotToken: process.env.VITE_TELEGRAM_BOT_TOKEN,

    // Public keys (exposed to client-side)
    public: {
      projectId: process.env.NUXT_PROJECT_ID,
    },
  },

  // App configuration
  app: {
    head: {
      title: "HODL Tracker - Crypto Tax Tracking",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Crypto-native web app for tracking crypto asset holding periods with FIFO logic for tax exemptions",
        },
        { name: "theme-color", content: "#3b82f6" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
        },
      ],
    },
  },

  // Build configuration
  build: {
    // Simplified build config
  },

  // Nitro server configuration
  nitro: {
    preset: "node-server",
  },

  // Vite configuration (for client-side)
  vite: {
    define: {
      "process.env": {},
    },
  },
});
