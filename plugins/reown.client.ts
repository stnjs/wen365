import { appKitVue } from "~/config/reown";

export default defineNuxtPlugin(nuxtApp => {
  // Only run on client-side
  if (process.client) {
    // @ts-ignore - Reown AppKit plugin type issue
    nuxtApp.vueApp.use(appKitVue);
  }
});
