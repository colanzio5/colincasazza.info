import mitt from "mitt";
import Vue3TouchEvents from "vue3-touch-events";
import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import { store } from "./store";
import "./styles/index.css";

import RAPIER from "@dimforge/rapier2d-compat";

RAPIER.init().then(() => {
  const emitter = mitt();
  const app = createApp(App);
  app.config.globalProperties.emitter = emitter;
  app.use(Vue3TouchEvents);
  app.provide("eventBus", emitter);
  app.use(store);
  app.use(router);
  app.mount("#app");
});

export { RAPIER };
