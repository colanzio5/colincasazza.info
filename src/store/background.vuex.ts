import { IWeightedArray } from "@/lib/util/random";
import {
  backgroundBirdConfigs,
  IBirdConfig,
  MAX_FLOCK_SIZE
} from "@/views/background/background";
import init, { BirdConfig, Flock } from "wasm-lib";
import { Color } from "three";
import { action, createModule, mutation } from "vuex-class-component";

const VuexModule = createModule({
  namespaced: "background",
  strict: false,
});

export default class BackgroundStore extends VuexModule {
  public $subscribeAction: any;
  public birdConfigs: IWeightedArray<IBirdConfig> = backgroundBirdConfigs;
  public maxFlockSize: number = MAX_FLOCK_SIZE;
  public isDragging = false;
  public isLoaded = false;
  public updating = false;
  public flock!: Flock;

  @action async initFlock() {
    await init();
    this.flock = Flock.new(
      // todo: determine number birds to add based on screen size and performance
      // const n = (this.view.viewPort.width * this.view.viewPort.height) / 500;
      MAX_FLOCK_SIZE,
      BigInt(new Date().getUTCMilliseconds())
    );
    // add configs for flock
    for (const birdConfig of this.birdConfigs) {
      await this.addBirdConfig(birdConfig);
    }
    this.isLoaded = true;
  }

  @action async addBirdConfig(birdConfig: IBirdConfig) {
    const config = await this.generateWASMBirdConfig(birdConfig);
    this.flock.add_bird_config(birdConfig.id, config);
  }

  @action async updateBirdConfig(updatedBirdConfig: IBirdConfig) {
    const config = await this.generateWASMBirdConfig(updatedBirdConfig);
    this.flock.update_bird_config(updatedBirdConfig.id, config);
  }

  @action async generateWASMBirdConfig(birdConfig: IBirdConfig): Promise<BirdConfig> {
    const color = new Color(birdConfig.birdColor);
    const config = BirdConfig.new(
      birdConfig.neighborDistance,
      birdConfig.desiredSeparation,
      birdConfig.separationMultiplier,
      birdConfig.alignmentMultiplier,
      birdConfig.cohesionMultiplier,
      birdConfig.maxSpeed,
      birdConfig.maxForce,
      birdConfig.birdSize,
      color.r,
      color.g,
      color.b
    );
    return config;
  }

  @mutation removeBirdConfig(configIdToRemove: string) {
    this.flock.remove_bird_config(configIdToRemove);
  }
}
