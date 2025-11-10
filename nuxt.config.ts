import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-11-10",

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
  modules: ["@pinia/nuxt", "@nuxt/ui", "@nuxt/eslint"],

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    reownProjectId: process.env.REOWN_PROJECT_ID,
    alchemyApiKey: process.env.ALCHEMY_API_KEY,

    /*
    alchemyApiKey: process.env.VITE_ALCHEMY_API_KEY,
    etherscanApiKey: process.env.VITE_ETHERSCAN_API_KEY,
    sendgridApiKey: process.env.VITE_SENDGRID_API_KEY,
    telegramBotToken: process.env.VITE_TELEGRAM_BOT_TOKEN, */

    // Public keys (exposed to client-side)
    public: {
      reownProjectId: process.env.REOWN_PROJECT_ID,
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
        { name: "theme-color", content: "#5154da" }, // Perano-600
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

  alias: {
    "@server": resolve(__dirname, "server"),
  },

  // Nitro server configuration
  nitro: {
    preset: "node-server",
  },
});
