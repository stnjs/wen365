// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Enable TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Development tools
  devtools: { enabled: true },

  // CSS and styling
  css: ["~/assets/css/main.css"],

  // PostCSS configuration
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // Modules
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@vueuse/nuxt"],

  // Pinia configuration
  pinia: {
    autoImports: ["defineStore", "acceptHMRUpdate"],
  },

  // Tailwind CSS configuration
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
    configPath: "tailwind.config.ts",
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    reownProjectId: process.env.VITE_REOWN_PROJECT_ID,
    covalentApiKey: process.env.VITE_COVALENT_API_KEY,
    alchemyApiKey: process.env.VITE_ALCHEMY_API_KEY,
    etherscanApiKey: process.env.VITE_ETHERSCAN_API_KEY,
    sendgridApiKey: process.env.VITE_SENDGRID_API_KEY,
    telegramBotToken: process.env.VITE_TELEGRAM_BOT_TOKEN,

    // Public keys (exposed to client-side)
    public: {
      reownProjectId: process.env.VITE_REOWN_PROJECT_ID,
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
    transpile: ["@reown/appkit", "@reown/appkit-adapter-wagmi"],
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
