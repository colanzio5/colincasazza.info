<template>
  <ViewPortComponent :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import useEmitter from "@/emitter";
import { View } from "@/lib/renderer/view";
import {
  IWeightedArray,
  selectRandomFromWeightedArray,
} from "@/lib/util/random";
import { throttle } from "lodash";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  Vector2,
  Vector3,
} from "three";
import { generateUUID, lerp } from "three/src/math/MathUtils";
import { Options, Vue } from "vue-class-component";
import init, { BirdConfig, Flock } from "wasm-lib";
import {
  backgroundBirdConfigs,
  IBirdConfig,
  MAX_FLOCK_SIZE,
} from "./background";

@Options({
  components: {
    ViewPortComponent: ViewPortComponent,
  },
})
export default class FlockBackground extends Vue {
  isDragging = false;
  isLoaded = false;
  updating = false;
  // communicates w/ flock debug component
  // todo: just make the debug component a childbetter
  emitter = useEmitter();
  // variables for rendering flock
  view!: View;
  birdsGeometry: any;
  birdsMaterial: any;
  birdsLine: any;
  // flock variables
  flock!: Flock;
  birdConfigs: IWeightedArray<IBirdConfig> = backgroundBirdConfigs;

  created() {
    this.view = new View({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 1200,
        startingPosition: new Vector3(0, 0, 1000),
      },
      controlsOptions: {
        startDirection: new Vector3(0, 0, 0),
        enabled: false,
      },
      id: "BACKGROUND_VIEW",
      background: new Color("black"),
      renderTickCallback: this.renderTickCallback,
    });
    this.birdsGeometry = new BufferGeometry();
    this.birdsMaterial = new LineBasicMaterial({
      vertexColors: true,
    });
    this.birdsLine = new LineSegments(this.birdsGeometry, this.birdsMaterial);
    this.view.scene.add(this.birdsLine);

  }

  async mounted() {
    await init();
    this.flock = Flock.new(
      // todo: determine number birds to add based on screen size and performance
      // const n = (this.view.viewPort.width * this.view.viewPort.height) / 500;
      MAX_FLOCK_SIZE,
      BigInt(new Date().getUTCMilliseconds())
    );
    // add configs for flock
    for (const birdConfig of this.birdConfigs) {
      this.addBirdConfig(birdConfig, birdConfig.id);
    }
    // add birds to flock
    for (let i = 0; i < MAX_FLOCK_SIZE; i++) {
      const config = selectRandomFromWeightedArray(this.birdConfigs);
      this.flock.add_bird(
        config.id,
        this.view.visibleWidthAtZDepth,
        this.view.visibleHeightAtZDepth
      );
    }
    this.isLoaded = true;
    this.emitter.on("add_bird_config", this.applyFlockConfig);
    this.emitter.on("remove_bird_config", this.removeBirdConfig);
    window.addEventListener("touchstart", throttle(this.touchDrag, 10), false);
    window.addEventListener("touchmove", throttle(this.touchDrag, 10), false);
    window.addEventListener("mousedown", this.dragStart, false);
    window.addEventListener("mousemove", throttle(this.mouseDrag, 10), false);
    window.addEventListener("mouseup", this.dragEnd, false);
  }

  unmounted() {
    window.addEventListener("touchstart", throttle(this.touchDrag, 10), false);
    window.addEventListener("touchmove", throttle(this.touchDrag, 10), false);
    window.addEventListener("mousedown", this.dragStart, false);
    window.addEventListener("mousemove", throttle(this.mouseDrag, 10), false);
    window.addEventListener("mouseup", this.dragEnd, false);

    // make sure we clean up the wasm resources
    // can we write this into the flock free function?
    for (const config of this.birdConfigs) config.config?.free();
    this.flock.free();
  }

  updateFlockGeometry(vertices: Float32Array, colors: Float32Array) {
    this.birdsLine.geometry.setAttribute(
      "position",
      new BufferAttribute(vertices, 3)
    );
    this.birdsLine.geometry.setAttribute(
      "color",
      new BufferAttribute(colors, 3)
    );
  }

  renderTickCallback(_: View) {
    if (!this.isLoaded) return;
    this.flock.update(
      this.view.visibleWidthAtZDepth,
      this.view.visibleHeightAtZDepth,
      3,
      this.updateFlockGeometry
    );
  }

  // applies the new
  applyFlockConfig(flockConfig: any): void {
    this.updating = true;
    this.updating = false;
  }

  addBirdConfig(birdConfig: IBirdConfig, id: string = generateUUID()) {
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
    this.flock.add_bird_config(id, config);
    // birdConfig.config = config;
    // this.birdConfigs.push(birdConfig);
  }

  updateBirdConfig(configId: string, updateBirdConfig: IBirdConfig) {
    const color = new Color(updateBirdConfig.birdColor);
    const config = BirdConfig.new(
      updateBirdConfig.neighborDistance,
      updateBirdConfig.desiredSeparation,
      updateBirdConfig.separationMultiplier,
      updateBirdConfig.alignmentMultiplier,
      updateBirdConfig.cohesionMultiplier,
      updateBirdConfig.maxSpeed,
      updateBirdConfig.maxForce,
      updateBirdConfig.birdSize,
      color.r,
      color.g,
      color.b
    );
    this.flock.update_bird_config(configId, config);
  }

  removeBirdConfig(id: string) {
    this.flock.remove_bird_config(id);
  }

  // event listeners
  dragStart() {
    this.isDragging = true;
  }

  mouseDrag(event: MouseEvent) {
    if (!this.isDragging || this.updating) return;
    const halfWidth = this.view.viewPort.width / 2;
    const halfHeight = this.view.viewPort.height / 2;
    const normClickX = event.x / this.view.viewPort.width;
    const normClickY = event.y / this.view.viewPort.height;
    const position = new Vector2(
      lerp(-halfWidth, halfWidth, normClickX),
      lerp(-halfHeight, halfHeight, normClickY) * -1
    );
    // this.addBirdToWasmFlock({ configId: "default" });
  }

  touchDrag(event: TouchEvent) {
    const touch = event.touches.item(event.touches.length - 1);
    if (!touch) return;
    const halfWidth = this.view.viewPort.width / 2;
    const halfHeight = this.view.viewPort.height / 2;
    const normClickX = touch.clientX / this.view.viewPort.width;
    const normClickY = touch.clientY / this.view.viewPort.height;
    const position = new Vector2(
      lerp(-halfWidth, halfWidth, normClickX),
      lerp(-halfHeight, halfHeight, normClickY) * -1
    );
    // this.addBirdToWasmFlock({ configId: "default" });
  }

  dragEnd() {
    this.isDragging = false;
  }
}
</script>
