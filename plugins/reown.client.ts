import { appKitVue } from "~/config/reown";

export default defineNuxtPlugin(nuxtApp => {
  // Only run on client-side
  if (process.client) {
    nuxtApp.vueApp.use(appKitVue);
  }
});
