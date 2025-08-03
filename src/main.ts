import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./style.css";

// Reown AppKit setup
import { appKit } from "./config/reown";

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Mount app
app.mount("#app");
