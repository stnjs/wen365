import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-11-10",

  vue: {
    compilerOptions: {
      isCustomElement: tag => {
        // AppKit Web Components
        return tag.startsWith("appkit-") || tag.startsWith("wui-") || tag.startsWith("w3m-");
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
    tsConfig: {
      include: [
        "../tests/**/*.ts",
        "../tests/**/*.spec.ts",
        "../tests/**/*.test.ts",
        "../test/**/*.ts",
        "../test/**/*.spec.ts",
        "../test/**/*.test.ts",
      ],
    },
  },

  // Development tools
  devtools: { enabled: true },

  // SSR disabled for client-side only app
  ssr: false,

  // CSS and styling
  css: ["~/assets/css/main.css"],

  // Modules
  modules: [
    "@pinia/nuxt",
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "nuxt-auth-utils",
    "@nuxtjs/supabase",
  ],

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    reownProjectId: process.env.REOWN_PROJECT_ID,
    alchemyApiKey: process.env.ALCHEMY_API_KEY,
    supportedNetworks: process.env.SUPPORTED_NETWORKS,
    cronSecret: process.env.CRON_SECRET,

    // Public keys (exposed to client-side)
    public: {
      reownProjectId: process.env.REOWN_PROJECT_ID,
    },
  },

  // Supabase configuration
  // By default uses SUPABASE_URL, SUPABASE_KEY (anon), and SUPABASE_SECRET_KEY (service role) from env
  supabase: {
    types: "@server/types/database.ts",
    redirect: false,
  },

  // App configuration
  app: {
    head: {
      title: "Wen365 - Portfolio & Tax Tracking",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "A comprehensive portfolio tracker, tax status tracker for held assets, and asset visualization tool. Track your crypto assets across multiple blockchains.",
        },
        { name: "theme-color", content: "#000000" }, // Black theme
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
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
