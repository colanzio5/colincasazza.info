
<template>
  <ViewPortComponent :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { View } from "@/lib/renderer/view";
import { selectRandomFromWeightedArray } from "@/lib/util/random";
import { vxm } from "@/store";
import { throttle } from "lodash";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  Vector3,
} from "three";
import { lerp } from "three/src/math/MathUtils";
import { Options, Vue } from "vue-class-component";
import { MAX_FLOCK_SIZE } from "./background";

@Options({
  components: {
    ViewPortComponent: ViewPortComponent,
  },
})
export default class FlockBackground extends Vue {
  addBirdsToFlockInterval!: NodeJS.Timer | number;
  // variables for rendering flock
  view!: View;
  birdsGeometry: any;
  birdsMaterial: any;
  birdsLine: any;

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
    await vxm.background.initFlock();
    window.addEventListener("touchstart", throttle(this.touchDrag, 10), false);
    window.addEventListener("touchmove", throttle(this.touchDrag, 10), false);
    window.addEventListener(
      "mousedown",
      () => (vxm.background.isDragging = true),
      false
    );
    window.addEventListener("mousemove", throttle(this.mouseDrag, 10), false);
    window.addEventListener(
      "mouseup",
      () => (vxm.background.isDragging = false),
      false
    );
    // add all the birds, but throttle it
    let numberBirdsToAdd = MAX_FLOCK_SIZE;
    this.addBirdsToFlockInterval = window.setInterval(() => {
      if (!numberBirdsToAdd--)
        clearInterval(this.addBirdsToFlockInterval as NodeJS.Timer);
      const config = selectRandomFromWeightedArray(vxm.background.birdConfigs);
      vxm.background.flock.add_bird_at_random_position(
        config.id,
        this.view.visibleWidthAtZDepth,
        this.view.visibleHeightAtZDepth
      );
    }, 25);
  }

  unmounted() {
    /** remove all the random event listeners weve added */
    window.addEventListener("touchstart", throttle(this.touchDrag, 10), false);
    window.addEventListener("touchmove", throttle(this.touchDrag, 10), false);
    window.addEventListener(
      "mousedown",
      () => (vxm.background.isDragging = true),
      false
    );
    window.addEventListener("mousemove", throttle(this.mouseDrag, 10), false);
    window.addEventListener(
      "mouseup",
      () => (vxm.background.isDragging = false),
      false
    );
    clearInterval(this.addBirdsToFlockInterval as NodeJS.Timer);
    /** make sure we clean up the wasm resources
    can we write this into the flock free function */
    for (const config of vxm.background.birdConfigs) config.config?.free();
    vxm.background.flock.free();
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
    if (!vxm.background.isLoaded) return;
    vxm.background.flock.update(
      this.view.visibleWidthAtZDepth,
      this.view.visibleHeightAtZDepth,
      3,
      this.updateFlockGeometry
    );
  }

  addBirdFromEvent(x: number, y: number) {
    console.log("event x,y: ", x, y);
    const normClickX = x / this.view.viewPort.width;
    const normClickY = y / this.view.viewPort.height;
    const config = selectRandomFromWeightedArray(vxm.background.birdConfigs);
    const halfSceneWidth = this.view.visibleWidthAtZDepth / 2;
    const halfSceneHeight = this.view.visibleHeightAtZDepth / 2;
    vxm.background.flock.add_bird(
      config.id,
      lerp(-halfSceneWidth, halfSceneWidth, normClickX),
      -lerp(-halfSceneHeight, halfSceneHeight, normClickY)
    );
  }

  mouseDrag(event: MouseEvent) {
    if (!vxm.background.isDragging || vxm.background.updating) return;
    const { x, y } = event;
    this.addBirdFromEvent(x, y);
  }

  touchDrag(event: TouchEvent) {
    const touch = event.touches.item(event.touches.length - 1);
    if (!touch) return;
    const x = touch.clientX;
    const y = touch.clientY;
    this.addBirdFromEvent(x, y);
  }
}
</script>
