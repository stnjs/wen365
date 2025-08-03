import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./style.css";
import { appKitVue } from "./config/reown"; // Initialize Reown AppKit

// Create Vue app
const app = createApp(App);

// Use plugins
app.use(createPinia());
app.use(router);
app.use(appKitVue); // Use Reown AppKit Vue plugin

// Mount app
app.mount("#app");
