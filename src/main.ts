import { createApp } from "vue";
import App from "./App.vue";
import router from "./common/router";
import i18n from "@/locales/i18n";
import "bootstrap";
import "@/assets/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

createApp(App)
  .use(router)
  .use(i18n)
  .mount("#app");
