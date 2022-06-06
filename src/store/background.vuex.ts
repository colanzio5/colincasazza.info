import {
  selectRandomFromWeightedArray,
  type IWeightedArray
} from "@/lib/util/random";
import {
  backgroundBirdConfigs,
  MAX_FLOCK_SIZE,
  type IBirdConfig
} from "@/views/background/background";
import { Color } from "three";
import { action, createModule } from "vuex-class-component";
import init, { BirdConfig, Flock } from "wasm-lib";

const VuexModule = createModule({
  namespaced: "background",
  strict: false,
});

export default class BackgroundStore extends VuexModule {
  public birdConfigs: IWeightedArray<IBirdConfig> = [];
  public isDragging = false;
  public isLoaded = false;
  public updating = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public $subscribeAction: any;

  private _maxFlockSize: number = MAX_FLOCK_SIZE;
  private _flock!: Flock;

  get currentFlockSize(): number {
    return this._flock.get_current_flock_size() || 0;
  }

  get maxFlockSize(): number {
    return this._maxFlockSize;
  }

  set maxFlockSize(_maxFlockSize: number) {
    this._flock.set_max_flock_size(_maxFlockSize);
    this._maxFlockSize = _maxFlockSize;
  }

  @action async removeBirdConfig(configIdToRemove: string) {
    this.birdConfigs = this.birdConfigs.filter(
      (config) => config.id != configIdToRemove
    );
    this._flock.remove_bird_config(configIdToRemove);
  }

  @action async addBirdConfig(birdConfig: IBirdConfig): Promise<void> {
    const config = await this.generateWASMBirdConfig(birdConfig);
    this.birdConfigs.push(birdConfig);
    this._flock.add_bird_config(birdConfig.id, config);
  }

  @action async initFlock(): Promise<void> {
    if (this.isLoaded || this.updating) return;
    this.updating = true;
    await init();
    this._flock = Flock.new(
      // todo: determine number birds to add based on screen size and performance
      // const n = (this.view.viewPort.width * this.view.viewPort.height) / 500;
      MAX_FLOCK_SIZE,
      BigInt(new Date().getUTCMilliseconds())
    );
    // add configs for flock
    for (const birdConfig of backgroundBirdConfigs) {
      await this.addBirdConfig(birdConfig);
    }
    this.updating = false;
    this.isLoaded = true;
  }

  @action async updateFlock(props: {
    sceneWidth: number;
    sceneHeight: number;
    timeStep: number;
    updateFlockGeometryCallback: (
      vertices: Float32Array,
      colors: Float32Array
    ) => void;
  }) {
    this._flock.update(
      props.sceneWidth,
      props.sceneHeight,
      props.timeStep,
      props.updateFlockGeometryCallback
    );
  }

  @action async addBirdAtRandomPosition(props: {
    viewWidth: number;
    viewHeight: number;
  }): Promise<void> {
    const config = selectRandomFromWeightedArray(this.birdConfigs);
    this._flock.add_bird_at_random_position(
      config.id,
      props.viewWidth,
      props.viewHeight
    );
  }

  @action async addBrdAtPosition(props: {
    x: number;
    y: number;
  }): Promise<void> {
    const config = selectRandomFromWeightedArray(this.birdConfigs);
    this._flock.add_bird(config.id, props.x, props.y);
  }

  @action async updateBirdConfig(
    updatedBirdConfig: IBirdConfig
  ): Promise<void> {
    const config = await this.generateWASMBirdConfig(updatedBirdConfig);
    this.birdConfigs = this.birdConfigs.filter(
      (birdConfig) => birdConfig.id !== updatedBirdConfig.id
    );
    this.birdConfigs.push(updatedBirdConfig);
    this._flock.update_bird_config(updatedBirdConfig.id, config);
  }

  /** generates the wasm bird config
   * and attaches the wasm object to
   * IBirdConfig object */
  @action async generateWASMBirdConfig(
    birdConfig: IBirdConfig
  ): Promise<BirdConfig> {
    console.log(birdConfig);
    const color = new Color(birdConfig.birdColor);
    const config = BirdConfig.new(
      birdConfig.id,
      birdConfig.probability,
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
}
