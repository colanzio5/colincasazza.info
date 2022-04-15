<template>
  <ViewPortComponent :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import useEmitter from "@/emitter";
import { View } from "@/lib/renderer/view";
import {
  IWeightedArray,
  randomFromRange,
  selectRandomFromWeightedArray,
} from "@/lib/util/random";
import themeColors from "@/styles/themeColors";
import { throttle } from "lodash";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ColorRepresentation,
  LineBasicMaterial,
  LineSegments,
  Vector2,
  Vector3,
} from "three";
import { generateUUID, lerp } from "three/src/math/MathUtils";
import { Options, Vue } from "vue-class-component";
import { BirdConfig, Flock } from "wasm-lib";

interface IBirdConfig {
  id: string;
  probability: number;
  neighborDistance: number;
  desiredSeparation: number;
  separationMultiplier: number;
  alignmentMultiplier: number;
  cohesionMultiplier: number;
  maxSpeed: number;
  maxForce: number;
  birdSize: number;
  birdColor: ColorRepresentation;
}

const STARTING_FLOCK_SIZE = 4000;
const MAX_FLOCK_SIZE = 4000;

const birdConfigs: IWeightedArray<IBirdConfig> = [
  {
    id: "default",
    probability: -1,
    neighborDistance: 200,
    desiredSeparation: 75,
    separationMultiplier: 0.5,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.3,
    maxSpeed: 3,
    maxForce: 0.03,
    birdSize: 5,
    birdColor: themeColors.secondary[200],
  },
  {
    id: "black_sheep",
    probability: 1 / 1000,
    neighborDistance: 200,
    desiredSeparation: 75,
    separationMultiplier: 0.5,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.3,
    maxSpeed: 3,
    maxForce: 0.03,
    birdSize: 10,
    birdColor: themeColors.primary[200],
  },
];

@Options({
  components: {
    ViewPortComponent: ViewPortComponent,
  },
})
export default class Background extends Vue {
  isDragging = false;
  view!: View;
  emitter = useEmitter();
  updating: boolean = false;
  // variables for rendering flock
  birdsGeometry: any;
  birdsMaterial: any;
  birdsLine: any;
  // flock variables
  flock!: Flock;
  birdConfigs: IWeightedArray<IBirdConfig> = birdConfigs;

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
    this.flock = Flock.new(MAX_FLOCK_SIZE);
  }

  mounted(): void {
    // add configs for flock
    for (const birdConfig of this.birdConfigs)
      this.addBirdConfig(birdConfig, birdConfig.id);
    // add birds to flock
    for (let i = 0; i < STARTING_FLOCK_SIZE; i++) {
      let config = selectRandomFromWeightedArray(this.birdConfigs);
      this.addBirdToWasmFlock({
        configId: config.id,
      });
    }

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
    this.flock.update(
      this.view.visibleWidthAtZDepth,
      this.view.visibleHeightAtZDepth,
      1.,
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

  addBirdToWasmFlock(props: { configId: string }) {
    const pos_x = randomFromRange(
      -this.view.visibleWidthAtZDepth,
      this.view.visibleHeightAtZDepth
    );
    const pos_y = randomFromRange(
      -this.view.visibleHeightAtZDepth,
      this.view.visibleHeightAtZDepth
    );
    const vel_x = randomFromRange(-0.5, 0.5);
    const vel_y = randomFromRange(-0.5, 0.5);
    const acc_x = randomFromRange(-0.5, 0.5);
    const acc_y = randomFromRange(-0.5, 0.5);
    this.flock.add_bird(
      pos_x,
      pos_y,
      vel_x,
      vel_y,
      acc_x,
      acc_y,
      props.configId
    );
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
    this.addBirdToWasmFlock({ configId: "default" });
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
    this.addBirdToWasmFlock({ configId: "default" });
  }

  dragEnd() {
    this.isDragging = false;
  }
}
</script>
