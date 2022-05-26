import {
  createModule,
  createProxy,
  createSubModule,
  extractVuexModule,
} from "vuex-class-component";
import ControlsStore from "./renderer/controls.vuex";
import RendererStore from "./renderer/renderer.vuex";
import BackgroundStore from "./background.vuex";
import Vuex from "vuex";

const VuexModule = createModule({
  namespaced: "game",
  strict: false,
});

export default class MainStore extends VuexModule {
  renderer = createSubModule(RendererStore);
  controls = createSubModule(ControlsStore);
  background = createSubModule(BackgroundStore);
}

export const store = new Vuex.Store({
  modules: {
    ...extractVuexModule(MainStore),
  },
});

export const vxm = {
  ...createProxy(store, MainStore),
};
