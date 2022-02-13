<template>
  <ViewPortComponent v-touch:drag="onMouseMove" :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import useEmitter from "@/emitter";
import { Bird, BirdConfig } from "@/lib/flock/bird";
import { Flock, IFlockConfig } from "@/lib/flock/flock";
import { View } from "@/lib/renderer/view";
import {
  randomFromRange,
  selectRandomFromWeightedArray,
} from "@/lib/util/random";
import { throttle } from "lodash";
import { Color, Vector2, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils";
import { Options, Vue } from "vue-class-component";
import { backgroundFlock } from "./background";

@Options({
  components: {
    ViewPortComponent: ViewPortComponent,
  }
})
export default class Background extends Vue {
  isDragging = false;
  view!: View;
  flock!: Flock;
  emitter = useEmitter();
  updating: boolean = false;

  created() {
    this.flock = backgroundFlock;
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
  }

  mounted(): void {
    this.flock.resize(
      this.view.visibleWidthAtZDepth,
      this.view.visibleHeightAtZDepth
    );
    const halfWidth = this.flock.width / 2;
    const halfHeight = this.flock.height / 2;
    for (let i = 0; i < this.flock.flockConfig.maxFlockSize; i++) {
      const position = new Vector2(
        randomFromRange(-halfWidth, halfWidth),
        randomFromRange(-halfHeight, halfHeight)
      );
      this.addBirdToFlock({ position });
    }
    this.emitter.on("apply-flock-config", this.applyFlockConfig);
    window.addEventListener('touchstart', throttle(this.touchDrag, 10), false);
    window.addEventListener('touchmove', throttle(this.touchDrag, 10), false);
    window.addEventListener("mousedown", this.dragStart, false);
    window.addEventListener("mousemove", throttle(this.mouseDrag, 10), false);
    window.addEventListener("mouseup", this.dragEnd, false);
  }

  // event listeners
  dragStart() {
    this.isDragging = true;
  }

  mouseDrag(event: MouseEvent) {
    if (!this.isDragging || this.updating) return;
    const halfWidth = this.flock.width / 2;
    const halfHeight = this.flock.height / 2;
    const normClickX = event.x / this.view.viewPort.width;
    const normClickY = event.y / this.view.viewPort.height;
    const position = new Vector2(
      lerp(-halfWidth, halfWidth, normClickX),
      lerp(-halfHeight, halfHeight, normClickY) * -1
    );
    this.addBirdToFlock({ position });
  }

  touchDrag(event: TouchEvent) {
    const touch = event.touches.item(event.touches.length-1)
    if(!touch) return
    const halfWidth = this.flock.width / 2;
    const halfHeight = this.flock.height / 2;
    const normClickX = touch.clientX / this.view.viewPort.width;
    const normClickY = touch.clientY / this.view.viewPort.height;
    const position = new Vector2(
      lerp(-halfWidth, halfWidth, normClickX),
      lerp(-halfHeight, halfHeight, normClickY) * -1
    );
    this.addBirdToFlock({ position });
  }

  dragEnd() {
    this.isDragging = false
  }

  unmounted() {
    window.addEventListener('touchstart', throttle(this.touchDrag, 10), false);
    window.addEventListener('touchmove', throttle(this.touchDrag, 10), false);
    window.addEventListener("mousedown", this.dragStart, false);
    window.addEventListener("mousemove", throttle(this.mouseDrag, 10), false);
    window.addEventListener("mouseup", this.dragEnd, false);
  }

  renderTickCallback(view: View) {
    this.flock.resize(view.visibleWidthAtZDepth, view.visibleHeightAtZDepth);
    this.flock.birds.forEach((bird) => bird.run(this.flock.birds));
  }

  // applies the new
  applyFlockConfig(flockConfig: IFlockConfig): void {
    this.updating = true;
    const currentBirds = this.flock.birds;
    currentBirds.forEach(this.removeBirdFromView);
    this.flock.birds = [];
    currentBirds.forEach((bird) => {
      const birdConfig = flockConfig.birdConfigs.find(
        (c: BirdConfig) => c.id === bird.birdConfig.id
      );
      if (birdConfig) this.addBirdToFlock({ ...{ ...bird, birdConfig } });
    });
    this.flock.flockConfig = flockConfig;
    this.updating = false;
  }

  addBirdToFlock(params: {
    position?: Vector2;
    velocity?: Vector2;
    acceleration?: Vector2;
    birdConfig?: BirdConfig;
  }): Bird {
    const config =
      params?.birdConfig ||
      selectRandomFromWeightedArray<BirdConfig>(
        this.flock.flockConfig.birdConfigs
      );
    const birdAdded = new Bird(this.flock, config, params);
    if (this.flock.birds.length >= this.flock.flockConfig.maxFlockSize) {
      const birdRemoved = this.flock.birds.shift();
      if (birdRemoved) this.removeBirdFromView(birdRemoved);
    }
    this.flock.birds = this.flock.birds.concat(birdAdded);
    this.view.scene.add(birdAdded.line);
    return birdAdded;
  }

  removeBirdFromView(bird: Bird) {
    this.view.removeEntities(bird.line);
    bird.dispose();
  }
}
</script>
