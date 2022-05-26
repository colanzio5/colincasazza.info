import { IWeightedArray } from "@/lib/util/random";
import {
  backgroundBirdConfigs,
  IBirdConfig,
  MAX_FLOCK_SIZE,
} from "@/views/background/background";
import { createModule, mutation, action } from "vuex-class-component";
import { vxm } from ".";

const VuexModule = createModule({
  namespaced: "background",
  strict: false,
});

export class ControlsState {
  // keyboard state
  right = false;
  left = false;
  up = false;
  down = false;
  space = false;
  // mouse state
  mouseX = 0;
  mouseY = 0;
}

export default class BackgroundStore extends VuexModule {

  maxFlockSize: number = MAX_FLOCK_SIZE;
  birdConfigs: IWeightedArray<IBirdConfig> = backgroundBirdConfigs;
  isDragging = false;
  isLoaded = false;
  updating = false;
  
  $subscribeAction: any;

  @action async removeBirdConfig(configToRemove: IBirdConfig): Promise<void> {
    // console.log("removeing bird config from store");
    // console.log(configToRemove);
  }

  @action async updateBirdConfig(configToUpdate: IBirdConfig): Promise<void> {
    // console.log("`updating bird config in store");
    // console.log(`configToUpdate);
  }
}
