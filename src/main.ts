import RAPIER from "@dimforge/rapier2d-compat";
import VDragged from "v-dragged";
import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import { store } from "./store";
import "./styles/index.css";

RAPIER.init().then(() => {
  createApp(App).use(store).use(router).use(VDragged).mount("#app");
});

export { RAPIER };
