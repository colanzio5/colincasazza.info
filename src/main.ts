import mitt from "mitt";
import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import { store } from "./store";
import "./styles/index.css";


// todo: make a vue loader component
// to load/init async dependencies
// when user goes to page that uses them
import RAPIER from "@dimforge/rapier2d-compat";
import init from 'wasm-lib';


await RAPIER.init();
await init()

RAPIER.init().then(() => {
  const emitter = mitt();
  const app = createApp(App);
  app.config.globalProperties.emitter = emitter;
  app.provide("eventBus", emitter);
  app.use(store);
  app.use(router);
  app.mount("#app");
});

export { RAPIER };
