import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import { store } from "./store";
import "./styles/index.css"

import RAPIER from "@dimforge/rapier2d-compat";
import VueDragResize from 'vue-drag-resize'

RAPIER.init().then(() => {
  const app = createApp(App).component('vue-drag-resize', VueDragResize).use(store).use(router);
  app.mount("#app");
});

export { RAPIER };
