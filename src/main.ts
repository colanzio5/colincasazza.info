import RAPIER from "@dimforge/rapier2d-compat";
import Dat from "dat.gui";
import init from "three-dat.gui";
import VDragged from "v-dragged";
import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import { store } from "./store";
import "./styles/index.css";

RAPIER.init().then(() => {
  init(Dat)
  createApp(App).use(store).use(router).use(VDragged).mount("#app");
});

export { RAPIER };
